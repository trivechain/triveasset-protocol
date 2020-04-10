const issuanceFlagsEncoder = require('../index').IssuanceFlagsEncoder
const assert = require('assert')

const consumer = function (buff) {
  let curr = 0
  return function consume(len) {
    return buff.slice(curr, (curr += len))
  }
}

describe('Test issue flags encoder', function () {
  it('should return the right decoding', function (done) {
    this.timeout(0)
    const testCase = [
      { divisibility: 0, lockStatus: false, aggregationPolicy: 'aggregatable' },
      { divisibility: 1, lockStatus: false, aggregationPolicy: 'aggregatable' },
      { divisibility: 2, lockStatus: false, aggregationPolicy: 'aggregatable' },
      { divisibility: 3, lockStatus: false, aggregationPolicy: 'aggregatable' },
      { divisibility: 4, lockStatus: false, aggregationPolicy: 'aggregatable' },
      { divisibility: 5, lockStatus: false, aggregationPolicy: 'aggregatable' },
      { divisibility: 6, lockStatus: false, aggregationPolicy: 'aggregatable' },
      { divisibility: 7, lockStatus: false, aggregationPolicy: 'aggregatable' },
      { divisibility: 8, lockStatus: false, aggregationPolicy: 'aggregatable' },
      { divisibility: 9, lockStatus: false, aggregationPolicy: 'aggregatable' },
      {
        divisibility: 10,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
      {
        divisibility: 11,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
      {
        divisibility: 12,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
      {
        divisibility: 13,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
      {
        divisibility: 14,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
      {
        divisibility: 15,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
      { divisibility: 0, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 1, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 2, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 3, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 4, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 5, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 6, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 7, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 8, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 9, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 10, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 11, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 12, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 13, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 14, lockStatus: true, aggregationPolicy: 'aggregatable' },
      { divisibility: 15, lockStatus: true, aggregationPolicy: 'aggregatable' },

      { divisibility: 0, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 0, lockStatus: true, aggregationPolicy: 'dispersed' },
    ]

    for (let i = 0; i < testCase.length; i++) {
      const code = issuanceFlagsEncoder.encode(testCase[i])
      const decode = issuanceFlagsEncoder.decode(consumer(code))
      assert.strictEqual(
        decode.divisibility,
        testCase[i].divisibility,
        'Divisibility encode has problems'
      )
      assert.strictEqual(
        decode.lockStatus,
        testCase[i].lockStatus,
        'LockStatus encode has problems'
      )
      assert.strictEqual(
        decode.aggregationPolicy,
        testCase[i].aggregationPolicy,
        'Aggregate policy has problems'
      )
    }

    done()
  })

  it('should use aggregatable for policy if not defined', function (done) {
    const code = issuanceFlagsEncoder.encode({
      divisibility: 0,
      lockStatus: false,
    })
    const decode = issuanceFlagsEncoder.decode(consumer(code))
    assert.strictEqual(
      decode.aggregationPolicy,
      'aggregatable',
      'Aggregate policy has problems'
    )

    done()
  })

  it('should restrict the divisibility to 0 if aggregationPolicy is dispersed', function (done) {
    this.timeout(0)
    const testCase = [
      { divisibility: 1, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 2, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 3, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 4, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 5, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 6, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 7, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 8, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 9, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 10, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 11, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 12, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 13, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 14, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 15, lockStatus: false, aggregationPolicy: 'dispersed' },
      { divisibility: 1, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 2, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 3, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 4, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 5, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 6, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 7, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 8, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 9, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 10, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 11, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 12, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 13, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 14, lockStatus: true, aggregationPolicy: 'dispersed' },
      { divisibility: 15, lockStatus: true, aggregationPolicy: 'dispersed' },
    ]

    for (let i = 0; i < testCase.length; i++) {
      const code = issuanceFlagsEncoder.encode(testCase[i])
      const decode = issuanceFlagsEncoder.decode(consumer(code))
      assert.strictEqual(
        decode.divisibility,
        0,
        'Divisibility encode has problems'
      )
      assert.strictEqual(
        decode.lockStatus,
        testCase[i].lockStatus,
        'LockStatus encode has problems'
      )
      assert.strictEqual(
        decode.aggregationPolicy,
        testCase[i].aggregationPolicy,
        'Aggregate policy has problems'
      )
    }

    done()
  })

  it('should fail for wrong divisibility', function (done) {
    this.timeout(0)
    const testCase = [
      { divisibility: 82, lockStatus: true, aggregationPolicy: 'aggregatable' },
      {
        divisibility: 21,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
      { divisibility: -8, lockStatus: true, aggregationPolicy: 'aggregatable' },
      {
        divisibility: 0xff,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
      {
        divisibility: 1000,
        lockStatus: true,
        aggregationPolicy: 'aggregatable',
      },
      {
        divisibility: -1,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
      {
        divisibility: 16,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
    ]

    for (let i = 0; i < testCase.length; i++) {
      assert.throws(
        function () {
          issuanceFlagsEncoder.encode(testCase[i])
        },
        /Divisibility not in range/,
        'Wrong fail'
      )
    }

    done()
  })

  it('should fail for invalid aggregation policy', function (done) {
    this.timeout(0)
    const testCase = [
      // aggregatable typos are on purpose...
      { divisibility: 2, lockStatus: false, aggregationPolicy: 1 },
      { divisibility: 3, lockStatus: true, aggregationPolicy: 2 },
      { divisibility: 4, lockStatus: false, aggregationPolicy: 'AGGREGATABL' },
      { divisibility: 5, lockStatus: true, aggregationPolicy: 'aggregat' },
    ]

    for (let i = 0; i < testCase.length; i++) {
      assert.throws(
        function () {
          issuanceFlagsEncoder.encode(testCase[i])
        },
        /Invalid aggregation policy/,
        'Wrong fail'
      )
    }

    done()
  })
})
