const flagMask = 0xe0
const skipFlag = 0x80
const rangeFlag = 0x40
const percentFlag = 0x20
const sffc = require('sffc-encoder')

const padLeadingZeros = function (hex, byteSize) {
  return (
    (hex.length === byteSize * 2 && hex) || padLeadingZeros('0' + hex, byteSize)
  )
}

module.exports = {
  encode: function (paymentObject) {
    const skip = paymentObject.skip || false
    const range = paymentObject.range || false
    const percent = paymentObject.percent || false
    if (typeof paymentObject.output === 'undefined') {
      throw new Error('Needs output value')
    }
    const output = paymentObject.output
    if (typeof paymentObject.amount === 'undefined') {
      throw new Error('Needs amount value')
    }
    const amount = paymentObject.amount
    const outputBinaryLength = output.toString(2).length
    if (output < 0) throw new Error("Output Can't be negative")
    if (
      (!range && outputBinaryLength > 5) ||
      (range && outputBinaryLength > 13)
    ) {
      throw new Error('Output value is out of bounds')
    }
    const outputString = padLeadingZeros(output.toString(16), +range + 1)
    const buf = Buffer.from(outputString, 'hex')
    if (skip) buf[0] = buf[0] | skipFlag
    if (range) buf[0] = buf[0] | rangeFlag
    if (percent) buf[0] = buf[0] | percentFlag

    return Buffer.concat([buf, sffc.encode(amount)])
  },

  decode: function (consume) {
    const flagsBuffer = consume(1)[0]
    if (typeof flagsBuffer === 'undefined') {
      throw new Error('No flags are found')
    }
    let output = Buffer.from([flagsBuffer & ~flagMask])
    const flags = flagsBuffer & flagMask
    const skip = !!(flags & skipFlag)
    const range = !!(flags & rangeFlag)
    const percent = !!(flags & percentFlag)
    if (range) {
      output = Buffer.concat([output, consume(1)])
    }
    const amount = sffc.decode(consume)
    return {
      skip: skip,
      range: range,
      percent: percent,
      output: parseInt(output.toString('hex'), 16),
      amount: amount,
    }
  },

  encodeBulk: function (paymentsArray) {
    let payments = Buffer.alloc(0)
    const amountOfPayments = paymentsArray.length
    for (let i = 0; i < amountOfPayments; i++) {
      const payment = paymentsArray[i]
      const paymentCode = this.encode(payment)
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
  },
}
