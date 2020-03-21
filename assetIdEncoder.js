var bitcoin = require('bitcoinjs-lib')
var bs58check = require('bs58check')
var hash = require('crypto-hashing')
var debug = require('debug')('assetIdEncoder')
var UNLOCKEPADDING = {
  aggregatable: 0x2e37,
  hybrid: 0x2e6b,
  dispersed: 0x2e4e
}
var LOCKEPADDING = {
  aggregatable: 0x20ce,
  hybrid: 0x2102,
  dispersed: 0x20e4
}
var BTC_P2PKH = 0x41
var BTC_TESTNET_P2PKH = 0x8c
var BTC_P2SH = 0x12
var BTC_TESTNET_P2SH = 0x13
var NETWORKVERSIONS = [BTC_P2PKH, BTC_TESTNET_P2PKH, BTC_P2SH, BTC_TESTNET_P2SH]
var POSTFIXBYTELENGTH = 2

var padLeadingZeros = function (hex, byteSize) {
  if (!byteSize) {
    byteSize = Math.ceil(hex.length / 2)
  }
  return (hex.length === byteSize * 2) ? hex : padLeadingZeros('0' + hex, byteSize)
}

var createIdFromTxidIndex = function (txid, index, padding, divisibility) {
  debug('createIdFromTxidIndex')
  debug('txid = ', txid, ', index = ', index)
  var str = txid + ':' + index
  return hashAndBase58CheckEncode(str, padding, divisibility)
}

var createIdFromPreviousOutputScriptPubKey = function (previousOutputHex, padding, divisibility) {
  var buffer = new Buffer(previousOutputHex, 'hex')
  debug('buffer = ', buffer)
  return hashAndBase58CheckEncode(buffer, padding, divisibility)
}

var createIdFromPubKeyHashInput = function (scriptSig, padding, divisibility) {
  debug('createIdFromPubKeyHashInput')
  if (!scriptSig.asm) {
    var buffer = new Buffer(scriptSig.hex, 'hex')
    scriptSig.asm = bitcoin.script.toASM(buffer)
  }
  var publicKey = scriptSig.asm.split(' ')[1]
  debug('publicKey = ', publicKey)
  publicKey = new Buffer(publicKey, 'hex')
  var hash256 = hash.sha256(publicKey)
  var pubKeyHash = hash.ripemd160(hash256)
  debug('pubKeyHash = ', pubKeyHash)
  var pubKeyHashOutput = bitcoin.script.pubKeyHashOutput(pubKeyHash)
  debug('pubKeyHashOutput = ', pubKeyHashOutput)
  return hashAndBase58CheckEncode(pubKeyHashOutput, padding, divisibility)
}

var createIdFromScriptHashInput = function (scriptSig, padding, divisibility) {
  debug('createIdFromScriptHashInput')
  var buffer = scriptSig.hex ? new Buffer(scriptSig.hex, 'hex') : bitcoin.script.fromASM(scriptSig.asm)
  debug('buffer = ', buffer)
  var chunks = bitcoin.script.decompile(buffer)
  var lastChunk = chunks[chunks.length - 1]
  debug('lastChunk = ', lastChunk)
  var redeemScriptChunks = bitcoin.script.decompile(lastChunk)
  redeemScriptChunks = redeemScriptChunks.map(function (chunk) { return Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk.toString(16), 'hex') })
  var redeemScript = Buffer.concat(redeemScriptChunks)
  debug('redeemScript = ', redeemScript)
  var hash256 = hash.sha256(redeemScript)
  var scriptHash = hash.ripemd160(hash256)
  var scriptHashOutput = bitcoin.script.scriptHashOutput(scriptHash)
  return hashAndBase58CheckEncode(scriptHashOutput, padding, divisibility)
}

var createIdFromAddress = function (address, padding, divisibility) {
  debug('createIdFromAddress')
  var addressBuffer = bs58check.decode(address)
  var versionBuffer = addressBuffer.slice(0, 1)
  var version = parseInt(versionBuffer.toString('hex'), 16)
  debug('version = ', version)
  if (NETWORKVERSIONS.indexOf(version) === -1) throw new Error('Unrecognized address network')
  if (version === BTC_P2SH || version === BTC_TESTNET_P2SH) {
    var scriptHash = addressBuffer.slice(versionBuffer.length, 21)
    var scriptHashOutput = bitcoin.script.scriptHashOutput(scriptHash)
    debug('scriptHashOutput = ', scriptHashOutput)
    return hashAndBase58CheckEncode(scriptHashOutput, padding, divisibility)
  }
  if (version === BTC_P2PKH || version === BTC_TESTNET_P2PKH) {
    var pubKeyHash = addressBuffer.slice(versionBuffer.length, 21)
    var pubKeyHashOutput = bitcoin.script.pubKeyHashOutput(pubKeyHash)
    debug('pubKeyHashOutput = ', pubKeyHashOutput)
    return hashAndBase58CheckEncode(pubKeyHashOutput, padding, divisibility)
  }
}

var hashAndBase58CheckEncode = function (payloadToHash, padding, divisibility) {
  debug('hashAndBase58CheckEncode')
  debug('padding and divisibility = ' + padding.toString(16) + ', ' + divisibility)
  var hash256 = hash.sha256(payloadToHash)
  var hash160 = hash.ripemd160(hash256)
  debug('hash160 = ', hash160)
  padding = new Buffer(padLeadingZeros(padding.toString(16)), 'hex')
  divisibility = new Buffer(padLeadingZeros(divisibility.toString(16), POSTFIXBYTELENGTH), 'hex')
  var concatenation = Buffer.concat([padding, hash160, divisibility])
  return bs58check.encode(concatenation)
}

module.exports = function (bitcoinTransaction) {
  debug('bitcoinTransaction.txid = ', bitcoinTransaction.txid)
  if (!bitcoinTransaction.ccdata) throw new Error('Missing Colored Coin Metadata')
  if (bitcoinTransaction.ccdata[0].type !== 'issuance') throw new Error('Not An issuance transaction')
  if (typeof bitcoinTransaction.ccdata[0].lockStatus === 'undefined') throw new Error('Missing Lock Status data')
  var lockStatus = bitcoinTransaction.ccdata[0].lockStatus
  var aggregationPolicy = bitcoinTransaction.ccdata[0].aggregationPolicy || 'aggregatable'
  var divisibility = bitcoinTransaction.ccdata[0].divisibility || 0
  var firstInput = bitcoinTransaction.vin[0]
  var padding
  if (lockStatus) {
    padding = LOCKEPADDING[aggregationPolicy]
    return createIdFromTxidIndex(firstInput.txid, firstInput.vout, padding, divisibility)
  }

  padding = UNLOCKEPADDING[aggregationPolicy]
  if (firstInput.previousOutput && firstInput.previousOutput.hex) {
    return createIdFromPreviousOutputScriptPubKey(firstInput.previousOutput.hex, padding, divisibility)
  }

  if (firstInput.scriptSig && (firstInput.scriptSig.hex || firstInput.scriptSig.asm)) {
    var scriptSig = firstInput.scriptSig
    scriptSig.hex = scriptSig.hex || bitcoin.script.fromASM(scriptSig.asm).toString('hex')
    debug('scriptSig.hex = ', scriptSig.hex)
    var buffer = new Buffer(scriptSig.hex, 'hex')
    var type = bitcoin.script.classifyInput(buffer)
    if (type === 'pubkeyhash') {
      return createIdFromPubKeyHashInput(scriptSig, padding, divisibility)
    }
    if (type === 'scripthash') {
      return createIdFromScriptHashInput(scriptSig, padding, divisibility)
    }
  }

  if (firstInput.address) {
    return createIdFromAddress(firstInput.address, padding, divisibility)
  }
}