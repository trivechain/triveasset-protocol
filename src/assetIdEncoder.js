const bitcoin = require('bitcoinjs-lib')
const bs58check = require('bs58check')
const hash = require('crypto-hashing')
const debug = require('debug')('assetIdEncoder')
const UNLOCKEPADDING = {
  aggregatable: 0x2e37,
  dispersed: 0x2e4e,
}
const LOCKEPADDING = {
  aggregatable: 0x20ce,
  dispersed: 0x20e4,
}
const TRVC_P2PKH = 0x41
const TRVC_TESTNET_P2PKH = 0x7f
const TRVC_P2SH = 0x12
const TRVC_TESTNET_P2SH = 0x7d
const NETWORKVERSIONS = [
  TRVC_P2PKH,
  TRVC_TESTNET_P2PKH,
  TRVC_P2SH,
  TRVC_TESTNET_P2SH,
]
const POSTFIXBYTELENGTH = 2

const padLeadingZeros = function (hex, byteSize) {
  if (!byteSize) {
    byteSize = Math.ceil(hex.length / 2)
  }
  return hex.length === byteSize * 2
    ? hex
    : padLeadingZeros('0' + hex, byteSize)
}

const createIdFromTxidIndex = function (txid, index, padding, divisibility) {
  debug('createIdFromTxidIndex')
  debug('txid = ', txid, ', index = ', index)
  const str = txid + ':' + index
  return hashAndBase58CheckEncode(str, padding, divisibility)
}

const createIdFromPreviousOutputScriptPubKey = function (
  previousOutputHex,
  padding,
  divisibility
) {
  const buffer = Buffer.from(previousOutputHex, 'hex')
  debug('buffer = ', buffer)
  return hashAndBase58CheckEncode(buffer, padding, divisibility)
}

const createIdFromPubKeyHashInput = function (
  scriptSig,
  padding,
  divisibility
) {
  debug('createIdFromPubKeyHashInput')
  if (!scriptSig.asm) {
    const buffer = Buffer.from(scriptSig.hex, 'hex')
    scriptSig.asm = bitcoin.script.toASM(buffer)
  }
  let publicKey = scriptSig.asm.split(' ')[1]
  debug('publicKey = ', publicKey)
  publicKey = Buffer.from(publicKey, 'hex')
  const hash256 = hash.sha256(publicKey)
  const pubKeyHash = hash.ripemd160(hash256)
  debug('pubKeyHash = ', pubKeyHash)
  const pubKeyHashOutput = bitcoin.script.pubKeyHashOutput(pubKeyHash)
  debug('pubKeyHashOutput = ', pubKeyHashOutput)
  return hashAndBase58CheckEncode(pubKeyHashOutput, padding, divisibility)
}

const createIdFromScriptHashInput = function (
  scriptSig,
  padding,
  divisibility
) {
  debug('createIdFromScriptHashInput')
  const buffer = scriptSig.hex
    ? Buffer.from(scriptSig.hex, 'hex')
    : bitcoin.script.fromASM(scriptSig.asm)
  debug('buffer = ', buffer)
  const chunks = bitcoin.script.decompile(buffer)
  const lastChunk = chunks[chunks.length - 1]
  debug('lastChunk = ', lastChunk)
  let redeemScriptChunks = bitcoin.script.decompile(lastChunk)
  redeemScriptChunks = redeemScriptChunks.map(function (chunk) {
    return Buffer.isBuffer(chunk)
      ? chunk
      : Buffer.from(chunk.toString(16), 'hex')
  })
  const redeemScript = Buffer.concat(redeemScriptChunks)
  debug('redeemScript = ', redeemScript)
  const hash256 = hash.sha256(redeemScript)
  const scriptHash = hash.ripemd160(hash256)
  const scriptHashOutput = bitcoin.script.scriptHashOutput(scriptHash)
  return hashAndBase58CheckEncode(scriptHashOutput, padding, divisibility)
}

const createIdFromAddress = function (address, padding, divisibility) {
  debug('createIdFromAddress')
  const addressBuffer = bs58check.decode(address)
  const versionBuffer = addressBuffer.slice(0, 1)
  const version = parseInt(versionBuffer.toString('hex'), 16)
  debug('version = ', version)
  if (NETWORKVERSIONS.indexOf(version) === -1) {
    throw new Error('Unrecognized address network')
  }
  if (version === TRVC_P2SH || version === TRVC_TESTNET_P2SH) {
    const scriptHash = addressBuffer.slice(versionBuffer.length, 21)
    const scriptHashOutput = bitcoin.script.scriptHashOutput(scriptHash)
    debug('scriptHashOutput = ', scriptHashOutput)
    return hashAndBase58CheckEncode(scriptHashOutput, padding, divisibility)
  }
  if (version === TRVC_P2PKH || version === TRVC_TESTNET_P2PKH) {
    const pubKeyHash = addressBuffer.slice(versionBuffer.length, 21)
    const pubKeyHashOutput = bitcoin.script.pubKeyHashOutput(pubKeyHash)
    debug('pubKeyHashOutput = ', pubKeyHashOutput)
    return hashAndBase58CheckEncode(pubKeyHashOutput, padding, divisibility)
  }
}

const hashAndBase58CheckEncode = function (
  payloadToHash,
  padding,
  divisibility
) {
  debug('hashAndBase58CheckEncode')
  debug(
    'padding and divisibility = ' + padding.toString(16) + ', ' + divisibility
  )
  const hash256 = hash.sha256(payloadToHash)
  const hash160 = hash.ripemd160(hash256)
  debug('hash160 = ', hash160)
  padding = Buffer.from(padLeadingZeros(padding.toString(16)), 'hex')
  divisibility = Buffer.from(
    padLeadingZeros(divisibility.toString(16), POSTFIXBYTELENGTH),
    'hex'
  )
  const concatenation = Buffer.concat([padding, hash160, divisibility])
  return bs58check.encode(concatenation)
}

module.exports = function (trivechainTransaction) {
  debug('trivechainTransaction.txid = ', trivechainTransaction.txid)
  if (!trivechainTransaction.ccdata) {
    throw new Error('Missing Colored Coin Metadata')
  }
  if (trivechainTransaction.ccdata[0].type !== 'issuance') {
    throw new Error('Not An issuance transaction')
  }
  if (typeof trivechainTransaction.ccdata[0].lockStatus === 'undefined') {
    throw new Error('Missing Lock Status data')
  }
  const lockStatus = trivechainTransaction.ccdata[0].lockStatus
  const aggregationPolicy =
    trivechainTransaction.ccdata[0].aggregationPolicy || 'aggregatable'
  const divisibility =
    aggregationPolicy === 'aggregatable' &&
    trivechainTransaction.ccdata[0].divisibility
      ? trivechainTransaction.ccdata[0].divisibility
      : 0
  const firstInput = trivechainTransaction.vin[0]
  let padding
  if (lockStatus) {
    padding = LOCKEPADDING[aggregationPolicy]
    return createIdFromTxidIndex(
      firstInput.txid,
      firstInput.vout,
      padding,
      divisibility
    )
  }

  padding = UNLOCKEPADDING[aggregationPolicy]
  if (firstInput.previousOutput && firstInput.previousOutput.hex) {
    return createIdFromPreviousOutputScriptPubKey(
      firstInput.previousOutput.hex,
      padding,
      divisibility
    )
  }

  if (
    firstInput.scriptSig &&
    (firstInput.scriptSig.hex || firstInput.scriptSig.asm)
  ) {
    const scriptSig = firstInput.scriptSig
    scriptSig.hex =
      scriptSig.hex || bitcoin.script.fromASM(scriptSig.asm).toString('hex')
    debug('scriptSig.hex = ', scriptSig.hex)
    const buffer = Buffer.from(scriptSig.hex, 'hex')
    const type = bitcoin.script.classifyInput(buffer)
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
