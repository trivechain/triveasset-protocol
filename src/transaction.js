'use strict'

var PROTOCOL = 0x5441
var VERSION = 0x03
var MAXBYTESIZE = 80
var OP_CODES = {
  'issuance': {
    'start': 0x00,
    'end': 0x0f,
    'encoder': require('./issuanceEncoder')
  },
  'transfer': {
    'start': 0x10,
    'end': 0x1f,
    'encoder': require('./transferEncoder')
  },
  'burn': {
    'start': 0x20,
    'end': 0x2f,
    'encoder': require('./burnPaymentEncoder')
  }
}

var encodingLookup = {}

for (var transactionType in OP_CODES) {
  for (var j = OP_CODES[transactionType].start; j <= OP_CODES[transactionType].end; j++) {
    encodingLookup[j] = {}
    encodingLookup[j].encode = OP_CODES[transactionType].encoder.encode
    encodingLookup[j].decode = OP_CODES[transactionType].encoder.decode
    encodingLookup[j].type = transactionType
  }
}

var paymentsInputToSkip = function (payments) {
  var result = JSON.parse(JSON.stringify(payments))
  result.sort(function (a, b) {
    return a.input - b.input
  })
  for (var i = 0; i < result.length; i++) {
    var skip = false
    if (result[i + 1] && result[i + 1].input > result[i].input) {
      skip = true
    }
    delete result[i].input
    result[i].skip = skip
  }
  return result
}

var paymentsSkipToInput = function (payments) {
  var paymentsDecoded = []
  var input = 0
  for (var i = 0; i < payments.length; i++) {
    var paymentDecoded = payments[i].burn ? {burn: true} : {range: payments[i].range, output: payments[i].output}
    paymentDecoded.input = input
    paymentDecoded.percent = payments[i].percent
    paymentDecoded.amount = payments[i].amount
    paymentsDecoded.push(paymentDecoded)
    if (payments[i].skip) input = input + 1
  }
  return paymentsDecoded
}

function Transaction (data) {
  data = data || {}
  this.type = data.type || 'transfer'
  this.noRules = data.noRules || true
  this.payments = data.payments || []
  this.protocol = data.protocol || PROTOCOL
  this.version = data.version || VERSION
  this.lockStatus = data.lockStatus
  this.aggregationPolicy = data.aggregationPolicy || 'aggregatable'
  this.divisibility = data.divisibility
  this.multiSig = data.multiSig || []
  this.amount = data.amount
  this.ipfsHash = data.ipfsHash
}

Transaction.fromHex = function (op_return) {
  if (!Buffer.isBuffer(op_return)) {
    op_return = new Buffer(op_return, 'hex')
  }
  var decoder = encodingLookup[op_return[3]]
  var rawData = decoder.decode(op_return)
  rawData.type = decoder.type
  rawData.payments = paymentsSkipToInput(rawData.payments)
  return new Transaction(rawData)
}

Transaction.newTransaction = function (protocol, version) {
  return new Transaction({protocol: protocol, version: version})
}

Transaction.prototype.addPayment = function (input, amount, output, range, percent) {
  range = range || false
  percent = percent || false
  this.payments.push({input: input, amount: amount, output: output, range: range, percent: percent})
}

Transaction.prototype.addBurn = function (input, amount, percent) {
  if (this.type === 'issuance') {
    throw new Error('Can\'t add burn payment to an issuance transaction')
  }
  this.payments.push({input: input, amount: amount, percent: percent, burn: true})
  this.type = 'burn'
}

/**
 * @param {Number=} amount - the amount of units of the asset to issue. Integer.
 * @param {Number=} divisibility - the divisibility of the asset to issue - how many decimal points can an asset unit have. Integer.
 */
Transaction.prototype.setAmount = function (amount, divisibility) {
  if (typeof amount === 'undefined') throw new Error('Amount has to be defined')
  this.type = 'issuance'
  this.divisibility = divisibility || 0
  this.amount = amount
}

Transaction.prototype.setLockStatus = function (lockStatus) {
  this.lockStatus = lockStatus
  this.type = 'issuance'
}

Transaction.prototype.setAggregationPolicy = function (aggregationPolicy) {
  this.aggregationPolicy = aggregationPolicy || 'aggregatable'
  this.type = 'issuance'
}

Transaction.prototype.allowRules = function () {
  this.noRules = false
}

Transaction.prototype.shiftOutputs = function (shiftAmount) {
  shiftAmount = shiftAmount || 1
  this.payments.forEach(function (payment) {
    payment.output += shiftAmount
  })
}

Transaction.prototype.setHash = function (ipfsHash) {
  if (!ipfsHash) throw new Error('Can\'t set hashes without the ipfs hash')
  if (!Buffer.isBuffer(ipfsHash)) ipfsHash = new Buffer(ipfsHash, 'hex')
  this.ipfsHash = ipfsHash
}

Transaction.prototype.encode = function () {
  var encoder = OP_CODES[this.type].encoder
  this.payments = paymentsInputToSkip(this.payments)
  var result = encoder.encode(this, MAXBYTESIZE)
  this.payments = paymentsSkipToInput(this.payments)
  return result
}

Transaction.prototype.toJson = function () {
  var data = {}
  data.payments = this.payments
  data.protocol = this.protocol
  data.version = this.version
  data.type = this.type
  if (this.type === 'issuance') {
    data.lockStatus = this.lockStatus
    data.aggregationPolicy = this.aggregationPolicy
    data.divisibility = this.divisibility
    data.amount = this.amount
  }
  data.multiSig = this.multiSig
  if (this.ipfsHash) {
    data.ipfsHash = this.ipfsHash.toString('hex')
  }
  return data
}

module.exports = Transaction
