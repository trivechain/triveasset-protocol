const Transaction = require('../index').Transaction
const assert = require('assert')

describe('Create Transaction from raw data', function () {
  this.timeout(0)
  const torrentHash = Buffer.alloc(20)
  const sha2 = Buffer.alloc(32)
  const data = {
    type: 'issuance',
    amount: 13232,
    divisibility: 2,
    lockStatus: false,
    protocol: 0x5441,
    version: 0x03,
    sha2: sha2,
    torrentHash: torrentHash,
    payments: [
      { input: 0, range: false, percent: false, output: 0, amount: 1 },
      { input: 0, range: false, percent: false, output: 1, amount: 2 },
      { input: 1, range: false, percent: false, output: 2, amount: 3 },
      { input: 2, range: false, percent: false, output: 3, amount: 4 },
      { input: 2, range: false, percent: false, output: 4, amount: 5 },
      { input: 3, range: false, percent: false, output: 5, amount: 6 },
    ],
  }
  let transaction = new Transaction(data)
  let transactionJson1, transactionJson2, code, multiSig

  it('should return the right encoding/decoding for raw created transaction', function (done) {
    transactionJson1 = transaction.toJson()
    // // console.log('First transaction Object: ', transactionJson1)
    code = transaction.encode()
    // // console.log('First transaction code: ', code)
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    // // console.log('transactionJson3', Transaction.fromHex(hex3).toJson())
    // // console.log('First transaction decoded back: ', transactionJson2)
    multiSig = transactionJson2.multiSig
    transactionJson2.multiSig = []
    delete transactionJson1.sha2
    delete transactionJson1.torrentHash
    delete transactionJson2.sha2
    delete transactionJson2.torrentHash
    assert.deepEqual(multiSig, [], 'Not Equal')
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

  it('should return the right encoding/decoding for changed amount', function (done) {
    transaction.setAmount(123, 4)
    transactionJson1 = transaction.toJson()
    // // console.log('Second transaction Object: ', transactionJson1)
    code = transaction.encode()
    // // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    // // console.log('second transaction decoded back: ', transactionJson2)
    multiSig = transactionJson2.multiSig
    transactionJson2.multiSig = []
    delete transactionJson1.sha2
    delete transactionJson1.torrentHash
    delete transactionJson2.sha2
    delete transactionJson2.torrentHash
    assert.deepEqual(multiSig, [], 'Not Equal')
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    assert.strictEqual(
      transactionJson2.amount,
      123,
      'Wrong total amount of units'
    )
    assert.strictEqual(
      transactionJson1.amount,
      123,
      'Wrong total amount of units'
    )

    done()
  })

  it('should encode an empty transfer transaction', function (done) {
    transaction = Transaction.newTransaction()
    transactionJson1 = transaction.toJson()
    // // console.log('Second transaction Object: ', transaction)
    code = transaction.encode()
    // // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    // // console.log('second transaction decoded back: ', transactionJson2)
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

  it('should return the right encoding/decoding for newly created transaction', function (done) {
    transaction.addPayment(0, 12, 3)
    transaction.addPayment(0, 12, 3, true)
    transaction.addPayment(1, 132, 1, false, true)
    transactionJson1 = transaction.toJson()
    // // console.log('Second transaction Object: ', transaction)
    code = transaction.encode()
    // // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    // // console.log('second transaction decoded back: ', transactionJson2)
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

  it('should return the right encoding/decoding for newly created issuance transaction', function (done) {
    transaction.setAmount(123, 4)
    transaction.setLockStatus(false)
    transaction.addPayment(2, 132, 4)
    transactionJson1 = transaction.toJson()
    // // console.log('Second transaction Object: ', transaction)
    code = transaction.encode()
    // // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    // // console.log('second transaction decoded back: ', transactionJson2)
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

  it('should encode an empty issuance transaction', function (done) {
    transaction = Transaction.newTransaction(0x5441, 0x03)
    const a = {}
    assert.throws(
      function () {
        transaction.setAmount(a.c, a.d)
      },
      /Amount has to be defined/,
      'Amount has to be defined'
    )
    transaction.setLockStatus(false)
    transaction.setAmount(10, 3)
    transactionJson1 = transaction.toJson()
    code = transaction.encode()
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

  it('should encode a burn transaction', function (done) {
    transaction = Transaction.newTransaction(0x5441, 0x03)
    transaction.addPayment(0, 7, 2)
    transaction.addBurn(1, 5, false)
    transactionJson1 = transaction.toJson()
    // console.log('Second transaction Object: ', transactionJson1)
    code = transaction.encode()
    // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    // console.log('second transaction decoded back: ', transactionJson2)
    assert.strictEqual(transactionJson1.type, 'burn')
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })
})
