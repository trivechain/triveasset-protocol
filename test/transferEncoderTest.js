const transferEncoder = require('../index').TransferEncoder
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

const ipfsHash = Buffer.from(
  '1220f1e820d85d82f6d7493b5e4446a1b9c0a4e0321885f1e47293fd6c081affaedf',
  'hex'
)

describe('TriveAsset transfer Decoding', function () {
  it('should return the right decoding', function (done) {
    this.timeout(0)
    const data = {
      protocol: 0x5441,
      version: 0x03,
    }

    data.ipfsHash = ipfsHash

    data.payments = []
    data.payments.push({
      skip: false,
      range: false,
      percent: true,
      output: 12,
      amount: 3213213,
    })

    data.payments.push({
      skip: false,
      range: false,
      percent: true,
      output: 1,
      amount: 321321321,
    })

    data.payments.push({
      skip: true,
      range: true,
      percent: true,
      output: 10,
      amount: 1,
    })

    data.payments.push({
      skip: false,
      range: false,
      percent: true,
      output: 20,
      amount: 100000021000,
    })
    data.payments.push({
      skip: false,
      range: false,
      percent: false,
      output: 0,
      amount: 1,
    })
    data.payments.push({
      skip: false,
      range: false,
      percent: false,
      output: 1,
      amount: 2,
    })
    data.payments.push({
      skip: true,
      range: false,
      percent: false,
      output: 2,
      amount: 3,
    })
    data.payments.push({
      skip: false,
      range: false,
      percent: false,
      output: 3,
      amount: 4,
    })
    data.payments.push({
      skip: true,
      range: false,
      percent: false,
      output: 4,
      amount: 5,
    })
    data.payments.push({
      skip: false,
      range: false,
      percent: false,
      output: 5,
      amount: 6,
    })

    // check throws when pushing burn to a default transfer transaction
    assert.throws(
      function () {
        data.payments.push({
          skip: false,
          percent: false,
          amount: 7,
          burn: true,
        })
        transferEncoder.encode(data, 40)
      },
      /Needs output value/,
      'Should Throw Error'
    )

    // now no error
    data.type = 'burn'

    delete data.allowMeta
    data.payments = []
    data.payments.push({
      skip: false,
      range: false,
      percent: true,
      output: 12,
      amount: 3213213,
    })
    done()
  })
})

describe('80 byte OP_RETURN', function () {
  let code
  let decoded
  const data = {
    protocol: 0x5441,
    version: 0x03,
    payments: [],
  }
  data.payments.push({
    skip: false,
    range: false,
    percent: false,
    output: 1,
    amount: 31,
  })

  it('Transfer OP_CODE 0x15 - No Metadata', function (done) {
    this.timeout(0)

    code = transferEncoder.encode(data, 80)

    // console.log(code.codeBuffer.toString('hex'), code.leftover)
    const consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('5441'), consume(2))
    assert.deepEqual(toBuffer('03'), consume(1)) // version
    assert.deepEqual(toBuffer('15'), consume(1)) // trasnfer OP_CODE
    assert.deepEqual(toBuffer('011f'), consume(2)) // payments

    decoded = transferEncoder.decode(code.codeBuffer)
    // console.log(decoded)

    assert.strictEqual(decoded.protocol, data.protocol)
    assert.deepEqual(decoded.payments, data.payments)
    assert.deepEqual(decoded.multiSig, code.leftover)
    done()
  })

  it('Transfer OP_CODE 0x16 - IPFS hash of metadata in OP_RETURN', function (done) {
    this.timeout(0)

    const ipfsHash = Buffer.from(
      '1220f1e820d85d82f6d7493b5e4446a1b9c0a4e0321885f1e47293fd6c081affaedf',
      'hex'
    )

    // pushing payments to the limit.
    data.payments = []
    for (let i = 0; i < 12; i++) {
      data.payments.push({
        skip: false,
        range: false,
        percent: false,
        output: 1,
        amount: 1,
      })
    }

    data.ipfsHash = ipfsHash

    code = transferEncoder.encode(data, 80)

    // console.log(code.codeBuffer.toString('hex'), code.leftover)
    const consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('5441'), consume(2))
    assert.deepEqual(toBuffer('03'), consume(1)) // version
    assert.deepEqual(toBuffer('16'), consume(1)) // trasnfer OP_CODE
    assert.deepEqual(
      toBuffer(
        '1220f1e820d85d82f6d7493b5e4446a1b9c0a4e0321885f1e47293fd6c081affaedf'
      ),
      consume(34)
    ) // ipfs hash
    for (let i = 0; i < data.payments.length; i++) {
      assert.deepEqual(toBuffer('0101'), consume(2)) // payment
    }

    decoded = transferEncoder.decode(code.codeBuffer)
    // console.log(decoded)

    assert.strictEqual(decoded.protocol, data.protocol)
    assert.deepEqual(decoded.payments, data.payments)
    assert.deepEqual(decoded.multiSig, code.leftover)
    assert.deepEqual(decoded.ipfsHash, ipfsHash)
    done()
  })

  it('Transfer OP_CODE 0x17 - IPFS hash of metadata in pay-to-script', function (done) {
    this.timeout(0)

    const ipfsHash = Buffer.from(
      '1220f1e820d85d82f6d7493b5e4446a1b9c0a4e0321885f1e47293fd6c081affaedf',
      'hex'
    )

    // pushing payments to the limit.
    data.payments = []
    for (let i = 0; i < 35; i++) {
      data.payments.push({
        skip: false,
        range: false,
        percent: false,
        output: 1,
        amount: 1,
      })
    }

    data.ipfsHash = ipfsHash

    code = transferEncoder.encode(data, 80)

    // console.log(code.codeBuffer.toString('hex'), code.leftover)
    const consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('5441'), consume(2))
    assert.deepEqual(toBuffer('03'), consume(1)) // version
    assert.deepEqual(toBuffer('17'), consume(1)) // trasnfer OP_CODE
    for (let i = 0; i < data.payments.length; i++) {
      assert.deepEqual(toBuffer('0101'), consume(2)) // payment
    }

    decoded = transferEncoder.decode(code.codeBuffer)
    // console.log(decoded)

    assert.strictEqual(decoded.protocol, data.protocol)
    assert.deepEqual(decoded.payments, data.payments)
    assert.strictEqual(decoded.multiSig.length, 1)
    assert.strictEqual(decoded.multiSig.length, code.leftover.length)
    assert.deepEqual(decoded.multiSig[0], { hashType: 'ipfsHash', index: 1 })
    assert.deepEqual(code.leftover[0], ipfsHash)
    done()
  })
})
