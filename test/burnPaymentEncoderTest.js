/* eslint-env mocha */
var paymentEncode = require(__dirname + '/../burnPaymentEncoder')
var assert = require('assert')

var consumer = function (buff) {
  var curr = 0
  return function consume (len) {
    return buff.slice(curr, curr += len)
  }
}

describe('Payment Decode Encode', function () {
  it('should return the right decoding', function (done) {
    var testCase = [
      {skip: false, range: false, percent: true, output: 12, amount: 3213213},
      {skip: true, range: false, percent: false, output: 14, amount: 321321},
      {skip: false, range: false, percent: false, output: 2, amount: 321321},
      {skip: true, range: true, percent: false, output: 0, amount: 1000000},
      {skip: false, range: false, percent: true, output: 1, amount: 321321321},
      {skip: true, range: true, percent: false, output: 5, amount: 10000003321},
      {skip: false, range: false, percent: true, output: 20, amount: 100000021000},
      {skip: true, range: false, percent: false, output: 22, amount: 1000000210002},
      {skip: false, range: false, percent: true, output: 11, amount: 321},
      {skip: true, range: true, percent: true, output: 10, amount: 1},
      {skip: true, range: true, percent: true, output: 10, amount: 1323004030000}
    ]

    for (var i = 0; i < testCase.length; i++) {
      var code = paymentEncode.encode(testCase[i])
      var decode = paymentEncode.decode(consumer(code))
      assert.equal(testCase[i].skip, decode.skip)
      assert.equal(testCase[i].range, decode.range)
      assert.equal(testCase[i].percent, decode.percent)
      assert.equal(testCase[i].output, decode.output)
      assert.equal(testCase[i].amount, decode.amount)
    }
    done()
  })

  it('should return the right encoding for burn', function (done) {
    var testCase1 = paymentEncode.encode({skip: false, percent: false, amount: 13, burn: true})
    var testCase2 = paymentEncode.encode({skip: true, percent: false, amount: 123, burn: true})
    var testCase3 = paymentEncode.encode({skip: false, percent: true, amount: 25, burn: true})
    var testCase4 = paymentEncode.encode({skip: true, percent: true, amount: 10, burn: true})

    assert.deepEqual(testCase1, new Buffer([0x1f, 0x0d]))
    assert.deepEqual(testCase2, new Buffer([0x9f, 0x27, 0xb0]))
    assert.deepEqual(testCase3, new Buffer([0x3f, 0x19]))
    assert.deepEqual(testCase4, new Buffer([0xbf, 0x0a]))
    done()
  })

  it('should return the right decoding for burn', function (done) {
    var testCases = [
      {skip: false, percent: false, amount: 3213213, burn: true},
      {skip: true, percent: false, amount: 3213213, burn: true},
      {skip: false, percent: true, amount: 50, burn: true},
      {skip: true, percent: true, amount: 13, burn: true}
    ]

    for (var i = 0; i < testCases.length; i++) {
      var code = paymentEncode.encode(testCases[i])
      var decode = paymentEncode.decode(consumer(code))
      assert.equal(testCases[i].skip, decode.skip)
      assert.equal(testCases[i].percent, decode.percent)
      assert.equal(testCases[i].burn, decode.burn)
      assert.equal(testCases[i].amount, decode.amount)
    }
    done()
  })

  it('should return the right decoding for bulk operations', function (done) {
    var testCase = [
      {skip: false, range: false, percent: true, output: 12, amount: 3213213},
      {skip: true, range: false, percent: false, output: 14, amount: 321321},
      {skip: false, range: false, percent: false, output: 2, amount: 321321},
      {skip: true, range: true, percent: false, output: 0, amount: 1000000},
      {skip: false, range: false, percent: true, output: 1, amount: 321321321},
      {skip: true, range: true, percent: false, output: 5, amount: 10000003321},
      {skip: false, range: false, percent: true, output: 20, amount: 100000021000},
      {skip: true, range: false, percent: false, output: 22, amount: 1000000210002},
      {skip: false, range: false, percent: true, output: 11, amount: 321},
      {skip: true, range: true, percent: true, output: 10, amount: 1},
      {skip: true, range: true, percent: true, output: 10, amount: 1323004030000}
    ]

    var code = paymentEncode.encodeBulk(testCase)
    var decode = paymentEncode.decodeBulk(consumer(code))

    for (var i = 0; i < testCase.length; i++) {
      assert.equal(testCase[i].skip, decode[i].skip)
      assert.equal(testCase[i].range, decode[i].range)
      assert.equal(testCase[i].percent, decode[i].percent)
      assert.equal(testCase[i].output, decode[i].output)
      assert.equal(testCase[i].amount, decode[i].amount)
    }
    done()
  })

  it('should throw output value out of bounds error', function (done) {
    var testCases = [
      {skip: false, range: false, percent: true, output: 32, amount: 3213213},
      {skip: true, range: true, percent: false, output: 8192, amount: 321321}
    ]

    for (var i = 0; i < testCases.length; i++) {
      assert.throws(function () {
        paymentEncode.encode(testCases[i])
      }, /Output value is out of bounds/
      , 'Should Throw Error')
    }
    done()
  })

  it('should throw output value out of bounds for burn case', function (done) {
    var testCase = {skip: false, range: false, percent: false, output: 31, amount: 123192}

    assert.throws(function () {
      paymentEncode.encode(testCase, true)
    }, /Received range and output values reserved to represent burn/
    , 'Should Throw Error')

    done()
  })

  it('should throw output value negative error', function (done) {
    var testCase = {skip: true, range: true, percent: false, output: -1, amount: 321321}
    assert.throws(function () {
      paymentEncode.encode(testCase)
    }, /Output Can\'t be negative/
    , 'Should Throw Error')
    done()
  })

  it('should throw no output error', function (done) {
    var testCases = [
      {skip: true, range: true, percent: true, amount: 1323004030000},
      {skip: true, range: true, percent: true, amount: 1323004030000, burn: false}
    ]

    for (var i = 0; i < testCases.length; i++) {
      assert.throws(function () {
        paymentEncode.encode(testCases[i])
      }, /Needs output value/
      , 'Should Throw Error')
    }
    done()
  })

  it('should throw both burn and output value are specified', function (done) {
    var testCase = {skip: true, percent: true, output: 12, amount: 1323004030000, burn: true}

    assert.throws(function () {
      paymentEncode.encode(testCase)
    }, /Received both burn and output/
    , 'Should Throw Error')
    done()
  })

  it('should throw both burn and range are specified', function (done) {
    var testCase = {skip: true, range: true, percent: true, amount: 1323004030000, burn: true}

    assert.throws(function () {
      paymentEncode.encode(testCase)
    }, /Received both burn and range/
    , 'Should Throw Error')
    done()
  })

  it('should throw no amount error', function (done) {
    var testCase = {skip: true, range: true, percent: true, output: 12}
    assert.throws(function () {
      paymentEncode.encode(testCase)
    }, /Needs amount value/
    , 'Should Throw Error')
    done()
  })
})
