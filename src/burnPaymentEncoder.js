const basePaymentEncoder = require('./paymentEncoder')
const clone = require('clone')

const BURN_OUTPUT = 0x1f

module.exports = {
  // isBurn - is this payment as part of a burn transaction
  encode: function (paymentObject) {
    if (typeof paymentObject.output === 'undefined' && !paymentObject.burn) {
      throw new Error('Needs output value or burn flag')
    }
    if (typeof paymentObject.output !== 'undefined' && paymentObject.burn) {
      throw new Error('Received both burn and output')
    }
    if (typeof paymentObject.range !== 'undefined' && paymentObject.burn) {
      throw new Error('Received both burn and range')
    }
    if (!paymentObject.range && paymentObject.output === BURN_OUTPUT) {
      throw new Error(
        'Received range and output values reserved to represent burn (to indicate burn use burn flag)'
      )
    }

    if (paymentObject.burn) {
      paymentObject = clone(paymentObject)
      paymentObject.output = BURN_OUTPUT
      paymentObject.range = false
      delete paymentObject.burn
    }

    return basePaymentEncoder.encode(paymentObject)
  },

  // isBurn - is this payment as part of a burn transaction
  decode: function (consume) {
    const ans = basePaymentEncoder.decode(consume)
    const burn = !ans.range && ans.output === BURN_OUTPUT
    if (burn) {
      ans.burn = true
      delete ans.output
      delete ans.range
    }
    return ans
  },

  encodeBulk: function (paymentsArray, isBurn) {
    let payments = Buffer.alloc(0)
    const amountOfPayments = paymentsArray.length
    for (let i = 0; i < amountOfPayments; i++) {
      const payment = paymentsArray[i]
      const paymentCode = this.encode(payment, isBurn)
      payments = Buffer.concat([payments, paymentCode])
    }
    return payments
  },

  decodeBulk: function (consume, paymentsArray, isBurn) {
    paymentsArray = paymentsArray || []
    while (true) {
      try {
        paymentsArray.push(this.decode(consume, isBurn))
        this.decodeBulk(consume, paymentsArray)
      } catch (e) {
        return paymentsArray
      }
    }
  },
}
