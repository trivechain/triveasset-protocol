const issuanceEncoder = require('../index').IssuanceEncoder
const assert = require('assert')

const consumer = function (buff) {
  let curr = 0
  return function consume(len) {
    return buff.slice(curr, (curr += len))
  }
}

const toBuffer = function (val) {
  val = val.toString(16)
  if (val.length % 2 === 1) {
    val = '0' + val
  }
  return Buffer.from(val, 'hex')
}

describe('80 byte OP_RETURN', function () {
  let code
  let decoded
  const ipfsHash = Buffer.from(
    '1220f1e820d85d82f6d7493b5e4446a1b9c0a4e0321885f1e47293fd6c081affaedf',
    'hex'
  )
  const data = {
    amount: 15,
    divisibility: 2,
    lockStatus: false,
    protocol: 0x5441, // Error when start with 0
    version: 0x03,
    aggregationPolicy: 'aggregatable',
    payments: [],
  }
  data.payments.push({
    skip: false,
    range: false,
    percent: false,
    output: 1,
    amount: 15,
  })

  it('Issuance OP_CODE 0x06 - No Metadata, can add rules', function (done) {
    this.timeout(0)

    code = issuanceEncoder.encode(data, 80)

    // console.log(code);
    // console.log(code.codeBuffer.toString('hex'), code.leftover)
    const consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('5441'), consume(2))
    assert.deepEqual(toBuffer('03'), consume(1)) // version
    assert.deepEqual(toBuffer('06'), consume(1)) // issuance OP_CODE
    assert.deepEqual(toBuffer('0f'), consume(1)) // issue amount
    assert.deepEqual(toBuffer('010f'), consume(2)) // payments
    assert.deepEqual(toBuffer('20'), consume(1)) // divisibility + lockstatus + reserved bits currently 0

    decoded = issuanceEncoder.decode(code.codeBuffer)
    // console.log(decoded)

    assert.strictEqual(decoded.amount, data.amount)
    assert.strictEqual(decoded.divisibility, data.divisibility)
    assert.strictEqual(decoded.lockStatus, data.lockStatus)
    assert.strictEqual(decoded.protocol, data.protocol)
    assert.deepEqual(decoded.payments, data.payments)
    assert.deepEqual(decoded.multiSig, code.leftover)
    assert.strictEqual(decoded.noRules, false)
    done()
  })

  it('Issuance OP_CODE 0x05 - No Metadata, cannot add rules', function (done) {
    this.timeout(0)

    data.noRules = true

    code = issuanceEncoder.encode(data, 80)
    // console.log(code);
    // console.log(code.codeBuffer.toString('hex'), code.leftover)

    const consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('5441'), consume(2))
    assert.deepEqual(toBuffer('03'), consume(1)) // version
    assert.deepEqual(toBuffer('05'), consume(1)) // issuance OP_CODE
    assert.deepEqual(toBuffer('0f'), consume(1)) // issue amount
    assert.deepEqual(toBuffer('010f'), consume(2)) // payments
    assert.deepEqual(toBuffer('20'), consume(1)) // divisibility + lockstatus + reserved bits currently 0

    decoded = issuanceEncoder.decode(code.codeBuffer)
    // console.log(decoded)

    assert.strictEqual(decoded.amount, data.amount)
    assert.strictEqual(decoded.divisibility, data.divisibility)
    assert.strictEqual(decoded.lockStatus, data.lockStatus)
    assert.strictEqual(decoded.protocol, data.protocol)
    assert.deepEqual(decoded.payments, data.payments)
    assert.deepEqual(decoded.multiSig, code.leftover)
    assert.strictEqual(decoded.noRules, true)

    data.ipfsHash = ipfsHash
    done()
  })

  it('Issuance OP_CODE 0x07 - IPFS Hash of metadata in 80 bytes', function (done) {
    this.timeout(0)

    // pushing payments to the limit.
    data.payments = []
    for (let i = 0; i < 11; i++) {
      data.payments.push({
        skip: false,
        range: false,
        percent: false,
        output: 1,
        amount: 1,
      })
    }

    data.ipfsHash = ipfsHash

    code = issuanceEncoder.encode(data, 80)
    // console.log(code);
    // console.log(code.codeBuffer.toString('hex'), code.leftover)

    const consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('5441'), consume(2))
    assert.deepEqual(toBuffer('03'), consume(1)) // version
    assert.deepEqual(toBuffer('07'), consume(1)) // issuance OP_CODE
    assert.deepEqual(
      toBuffer(
        '1220f1e820d85d82f6d7493b5e4446a1b9c0a4e0321885f1e47293fd6c081affaedf'
      ),
      consume(34)
    ) // ipfs hash
    assert.deepEqual(toBuffer('0f'), consume(1)) // issue amount
    for (let i = 0; i < data.payments.length; i++) {
      assert.deepEqual(toBuffer('0101'), consume(2)) // payment
    }
    assert.deepEqual(toBuffer('20'), consume(1)) // divisibility + lockstatus + reserved bits currently 0

    decoded = issuanceEncoder.decode(code.codeBuffer)
    // console.log(decoded)

    assert.strictEqual(decoded.amount, data.amount)
    assert.strictEqual(decoded.divisibility, data.divisibility)
    assert.strictEqual(decoded.lockStatus, data.lockStatus)
    assert.strictEqual(decoded.protocol, data.protocol)
    assert.strictEqual(decoded.lockstatus, data.lockstatus)
    assert.deepEqual(decoded.payments, data.payments)
    assert.deepEqual(decoded.multiSig, code.leftover)
    assert.deepEqual(decoded.ipfsHash, ipfsHash)

    data.ipfsHash = ipfsHash
    done()
  })

  it('Issuance OP_CODE 0x08 - IPFS Hash of metadata in 80 bytes', function (done) {
    this.timeout(0)

    // pushing payments to the limit.
    data.payments = []
    for (let i = 0; i < 30; i++) {
      data.payments.push({
        skip: false,
        range: false,
        percent: false,
        output: 1,
        amount: 1,
      })
    }

    data.ipfsHash = ipfsHash

    code = issuanceEncoder.encode(data, 80)
    // console.log(code);
    // console.log(code.codeBuffer.toString('hex'), code.leftover)

    const consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('5441'), consume(2))
    assert.deepEqual(toBuffer('03'), consume(1)) // version
    assert.deepEqual(toBuffer('08'), consume(1)) // issuance OP_CODE
    assert.deepEqual(toBuffer('0f'), consume(1)) // issue amount
    for (let i = 0; i < data.payments.length; i++) {
      assert.deepEqual(toBuffer('0101'), consume(2)) // payment
    }
    assert.deepEqual(toBuffer('20'), consume(1)) // divisibility + lockstatus + reserved bits currently 0

    decoded = issuanceEncoder.decode(code.codeBuffer)
    // console.log(decoded)

    assert.strictEqual(decoded.amount, data.amount)
    assert.strictEqual(decoded.divisibility, data.divisibility)
    assert.strictEqual(decoded.lockStatus, data.lockStatus)
    assert.strictEqual(decoded.protocol, data.protocol)
    assert.strictEqual(decoded.lockstatus, data.lockstatus)
    assert.deepEqual(decoded.payments, data.payments)
    assert.strictEqual(decoded.multiSig.length, 1)
    assert.strictEqual(decoded.multiSig.length, code.leftover.length)
    assert.deepEqual(decoded.multiSig[0], { hashType: 'ipfsHash', index: 1 })
    assert.deepEqual(code.leftover[0], ipfsHash)

    data.ipfsHash = ipfsHash
    done()
  })
})
