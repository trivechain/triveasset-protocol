var flagMask = 0xe0
var skipFlag = 0x80
var rangeFlag = 0x40
var percentFlag = 0x20
var sffc = require('sffc-encoder')

var padLeadingZeros = function (hex, byteSize) {
  return (hex.length === byteSize * 2) && hex || padLeadingZeros('0' + hex, byteSize)
}

module.exports = {
  encode: function (paymentObject) {
    var skip = paymentObject.skip || false
    var range = paymentObject.range || false
    var percent = paymentObject.percent || false
    if (typeof paymentObject.output === 'undefined') throw new Error('Needs output value')
    var output = paymentObject.output
    if (typeof paymentObject.amount === 'undefined') throw new Error('Needs amount value')
    var amount = paymentObject.amount
    var outputBinaryLength = output.toString(2).length
    if (output < 0) throw new Error('Output Can\'t be negative')
    if ((!range && outputBinaryLength > 5) || (range && outputBinaryLength > 13)) {
      throw new Error('Output value is out of bounds')
    }
    var outputString = padLeadingZeros(output.toString(16), +range + 1)
    var buf = new Buffer(outputString, 'hex')
    if (skip) buf[0] = buf[0] | skipFlag
    if (range) buf[0] = buf[0] | rangeFlag
    if (percent) buf[0] = buf[0] | percentFlag

    return Buffer.concat([buf, sffc.encode(amount)])
  },

  decode: function (consume) {
    var flagsBuffer = consume(1)[0]
    if (typeof flagsBuffer === 'undefined') throw new Error('No flags are found')
    var output = new Buffer([flagsBuffer & (~flagMask)])
    var flags = flagsBuffer & flagMask
    var skip = !!(flags & skipFlag)
    var range = !!(flags & rangeFlag)
    var percent = !!(flags & percentFlag)
    if (range) {
      output = Buffer.concat([output, consume(1)])
    }
    var amount = sffc.decode(consume)
    return {skip: skip, range: range, percent: percent, output: parseInt(output.toString('hex'), 16), amount: amount}
  },

  encodeBulk: function (paymentsArray) {
    var payments = new Buffer(0)
    var amountOfPayments = paymentsArray.length
    for (var i = 0; i < amountOfPayments; i++) {
      var payment = paymentsArray[i]
      var paymentCode = this.encode(payment)
      payments = Buffer.concat([payments, paymentCode])
    }
    return payments
  },

  decodeBulk: function (consume, paymentsArray) {
    paymentsArray = paymentsArray || []
    while (true) {
      try {
        paymentsArray.push(this.decode(consume))
        this.decodeBulk(consume, paymentsArray)
      } catch (e) {
        return paymentsArray
      }
    }
  }
}
