const paymentEncoder = require('../index').PaymentEncoder
const assert = require('assert')

const consumer = function (buff) {
  let curr = 0
  return function consume(len) {
    return buff.slice(curr, (curr += len))
  }
}

describe('Payment Decode Encode', function () {
  it('should return the right decoding', function (done) {
    this.timeout(0)
    const testCase = [
      { skip: false, range: false, percent: true, output: 12, amount: 3213213 },
      { skip: true, range: false, percent: false, output: 14, amount: 321321 },
      { skip: false, range: false, percent: false, output: 2, amount: 321321 },
      { skip: true, range: true, percent: false, output: 0, amount: 1000000 },
      {
        skip: false,
        range: false,
        percent: true,
        output: 1,
        amount: 321321321,
      },
      {
        skip: true,
        range: true,
        percent: false,
        output: 5,
        amount: 10000003321,
      },
      {
        skip: false,
        range: false,
        percent: true,
        output: 20,
        amount: 100000021000,
      },
      {
        skip: true,
        range: false,
        percent: false,
        output: 22,
        amount: 1000000210002,
      },
      { skip: false, range: false, percent: true, output: 11, amount: 321 },
      { skip: true, range: true, percent: true, output: 10, amount: 1 },
      {
        skip: true,
        range: true,
        percent: true,
        output: 10,
        amount: 1323004030000,
      },
    ]

    for (let i = 0; i < testCase.length; i++) {
      const code = paymentEncoder.encode(testCase[i])
      const decode = paymentEncoder.decode(consumer(code))
      assert.strictEqual(
        testCase[i].skip,
        decode.skip,
        'skip encode has problems'
      )
      assert.strictEqual(
        testCase[i].range,
        decode.range,
        'range encode has problems'
      )
      assert.strictEqual(
        testCase[i].percent,
        decode.percent,
        'percent encode has problems'
      )
      assert.strictEqual(
        testCase[i].output,
        decode.output,
        'output encode has problems'
      )
      assert.strictEqual(
        testCase[i].amount,
        decode.amount,
        'amount encode has problems'
      )
    }
    done()
  })

  it('should return the right decoding for bulk operations', function (done) {
    this.timeout(0)
    const testCase = [
      { skip: false, range: false, percent: true, output: 12, amount: 3213213 },
      { skip: true, range: false, percent: false, output: 14, amount: 321321 },
      { skip: false, range: false, percent: false, output: 2, amount: 321321 },
      { skip: true, range: true, percent: false, output: 0, amount: 1000000 },
      {
        skip: false,
        range: false,
        percent: true,
        output: 1,
        amount: 321321321,
      },
      {
        skip: true,
        range: true,
        percent: false,
        output: 5,
        amount: 10000003321,
      },
      {
        skip: false,
        range: false,
        percent: true,
        output: 20,
        amount: 100000021000,
      },
      {
        skip: true,
        range: false,
        percent: false,
        output: 22,
        amount: 1000000210002,
      },
      { skip: false, range: false, percent: true, output: 11, amount: 321 },
      { skip: true, range: true, percent: true, output: 10, amount: 1 },
      {
        skip: true,
        range: true,
        percent: true,
        output: 10,
        amount: 1323004030000,
      },
    ]

    const code = paymentEncoder.encodeBulk(testCase)
    const decode = paymentEncoder.decodeBulk(consumer(code))

    for (let i = 0; i < testCase.length; i++) {
      assert.strictEqual(
        testCase[i].skip,
        decode[i].skip,
        'skip encode has problems'
      )
      assert.strictEqual(
        testCase[i].range,
        decode[i].range,
        'range encode has problems'
      )
      assert.strictEqual(
        testCase[i].percent,
        decode[i].percent,
        'percent encode has problems'
      )
      assert.strictEqual(
        testCase[i].output,
        decode[i].output,
        'output encode has problems'
      )
      assert.strictEqual(
        testCase[i].amount,
        decode[i].amount,
        'amount encode has problems'
      )
    }
    done()
  })

  it('should throw out of bounds error', function (done) {
    this.timeout(0)
    const testCase = [
      { skip: false, range: false, percent: true, output: 32, amount: 3213213 },
      { skip: true, range: true, percent: false, output: 8192, amount: 321321 },
    ]

    for (let i = 0; i < testCase.length; i++) {
      assert.throws(
        function () {
          paymentEncoder.encode(testCase[i])
        },
        /Output value is out of bounds/,
        'Should Throw Error'
      )
    }
    done()
  })

  it('should throw negative error', function (done) {
    const testCase = {
      skip: true,
      range: true,
      percent: false,
      output: -1,
      amount: 321321,
    }
    assert.throws(
      function () {
        paymentEncoder.encode(testCase)
      },
      /Output Can't be negative/,
      'Should Throw Error'
    )
    done()
  })

  it('should throw not output error', function (done) {
    const testCase = {
      skip: true,
      range: true,
      percent: true,
      amount: 1323004030000,
    }
    assert.throws(
      function () {
        paymentEncoder.encode(testCase)
      },
      /Needs output value/,
      'Should Throw Error'
    )
    done()
  })

  it('should throw not output error', function (done) {
    const testCase = { skip: true, range: true, percent: true, output: 12 }
    assert.throws(
      function () {
        paymentEncoder.encode(testCase)
      },
      /Needs amount value/,
      'Should Throw Error'
    )
    done()
  })
})
