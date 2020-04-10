/* eslint-env mocha */
const TransactionBuilder = require('../index').TransactionBuilder
const TA = require('../index').Transaction
const transactionBuilder = new TransactionBuilder({ network: 'testnet' })
const assert = require('assert')
const clone = require('clone')
const bitcoinjs = require('bitcoinjs-lib')
const Transaction = bitcoinjs.Transaction
const script = bitcoinjs.script
const _ = require('lodash')

const issueArgs = {
  utxos: [
    {
      index: 2,
      txid: '26879b80504ae1251f401ecfd3c5e50ee467d994ae0b656ef321957d5e8310e7',
      blocktime: 1584795444000,
      blockheight: 564183,
      value: 999976677,
      used: false,
      scriptPubKey: {
        asm:
          'OP_DUP OP_HASH160 cc9e2fae9f7c83254c79e0fc5fff047fc04fbea7 OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a914cc9e2fae9f7c83254c79e0fc5fff047fc04fbea788ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['tRaXPu5bovE5bXx7fgZ5ANsmACdra86PPm'],
      },
      assets: [],
    },
  ],
  issueAddress: 'tAgiixzqW2bAjWTqNyn3kSNhBNY6ozCFDm',
  amount: 3600,
  fee: 5000,
}

describe('builder.buildIssueTransaction(args)', function () {
  it('throws: Must have "utxos"', function (done) {
    const args = clone(issueArgs)
    delete args.utxos
    assert.throws(function () {
      transactionBuilder.buildIssueTransaction(args)
    }, /Must have "utxos"/)
    done()
  })

  it('throws: Must have "issueAddress"', function (done) {
    const args = clone(issueArgs)
    delete args.issueAddress
    assert.throws(function () {
      transactionBuilder.buildIssueTransaction(args)
    }, /Must have "issueAddress"/)
    done()
  })

  it('throws: Must have "amount"', function (done) {
    const args = clone(issueArgs)
    delete args.amount
    assert.throws(function () {
      transactionBuilder.buildIssueTransaction(args)
    }, /Must have "amount"/)
    done()
  })

  it('returns valid response with default values', function (done) {
    const result = transactionBuilder.buildIssueTransaction(issueArgs)
    assert(result.txHex)
    const tx = Transaction.fromHex(result.txHex)
    assert.strictEqual(tx.ins.length, 1)
    assert.strictEqual(tx.outs.length, 3) // OP_RETURN + 2 changes
    assert(result.assetId)
    assert.deepEqual(result.coloredOutputIndexes, [2])
    const sumValueInputs = issueArgs.utxos[0].value
    const sumValueOutputs = _.sumBy(tx.outs, function (output) {
      return output.value
    })
    assert.strictEqual(sumValueInputs - sumValueOutputs, issueArgs.fee)
    const opReturnScriptBuffer = script.decompile(tx.outs[0].script)[1]
    const taTransaction = TA.fromHex(opReturnScriptBuffer)
    assert.strictEqual(taTransaction.type, 'issuance')
    assert.strictEqual(taTransaction.amount, issueArgs.amount)
    // default values
    assert.strictEqual(taTransaction.lockStatus, true)
    assert.strictEqual(taTransaction.divisibility, 0)
    assert.strictEqual(taTransaction.aggregationPolicy, 'aggregatable')
    done()
  })

  it('flags.injectPreviousOutput === true: return previous output hex in inputs', function (done) {
    const args = clone(issueArgs)
    args.flags = { injectPreviousOutput: true }
    const result = transactionBuilder.buildIssueTransaction(args)
    assert(result.txHex)
    const tx = Transaction.fromHex(result.txHex)
    assert.strictEqual(tx.ins.length, 1)
    assert.strictEqual(
      tx.ins[0].script.toString('hex'),
      args.utxos[0].scriptPubKey.hex
    )
    done()
  })

  it('should split change', function (done) {
    const args = clone(issueArgs)
    args.financeChangeAddress = false
    const result = transactionBuilder.buildIssueTransaction(args)
    assert(result.txHex)
    const tx = Transaction.fromHex(result.txHex)
    assert.strictEqual(tx.ins.length, 1)
    assert.strictEqual(tx.outs.length, 2) // OP_RETURN + 1 change
    assert.deepEqual(result.coloredOutputIndexes, [1])
    done()
  })

  it('should encode ipfsHash', function (done) {
    const args = clone(issueArgs)
    args.ipfsHash =
      '12207fd9423c0301a82e7116483cbc194d7c3818b2e11a77c5e021b2c5d04cb48852'
    const result = transactionBuilder.buildIssueTransaction(args)
    const tx = Transaction.fromHex(result.txHex)
    const opReturnScriptBuffer = script.decompile(tx.outs[0].script)[1]
    const taTransaction = TA.fromHex(opReturnScriptBuffer)
    assert.strictEqual(taTransaction.ipfsHash.toString('hex'), args.ipfsHash)
    done()
  })
})

const sendArgs = {
  utxos: [
    {
      index: 2,
      txid: '13eb8adcf7c0c7657739df9d24d7917eb27f0e50316df75cb8d208e793134423',
      blocktime: 1575532788000,
      blockheight: 204359,
      value: 5441,
      used: false,
      scriptPubKey: {
        asm:
          'OP_DUP OP_HASH160 cc9e2fae9f7c83254c79e0fc5fff047fc04fbea7 OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a914cc9e2fae9f7c83254c79e0fc5fff047fc04fbea788ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['tRaXPu5bovE5bXx7fgZ5ANsmACdra86PPm'],
      },
      assets: [
        {
          assetId: 'La9Sa9wWN5MpAFLtRwS1jwTFsRzdRqhtpeVcya',
          amount: 100000000000000,
          issueTxid:
            '13eb8adcf7c0c7657739df9d24d7917eb27f0e50316df75cb8d208e793134423',
          divisibility: 8,
          lockStatus: true,
          aggregationPolicy: 'aggregatable',
        },
      ],
    },
    {
      index: 2,
      txid: '26879b80504ae1251f401ecfd3c5e50ee467d994ae0b656ef321957d5e8310e7',
      blocktime: 1584795444000,
      blockheight: 564183,
      value: 999976677,
      used: false,
      scriptPubKey: {
        asm:
          'OP_DUP OP_HASH160 cc9e2fae9f7c83254c79e0fc5fff047fc04fbea7 OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a914cc9e2fae9f7c83254c79e0fc5fff047fc04fbea788ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['tRaXPu5bovE5bXx7fgZ5ANsmACdra86PPm'],
      },
      assets: [],
    },
  ],
  to: [
    {
      address: 'tAgiixzqW2bAjWTqNyn3kSNhBNY6ozCFDm',
      amount: 20,
      assetId: 'La9Sa9wWN5MpAFLtRwS1jwTFsRzdRqhtpeVcya',
    },
  ],
  fee: 5000,
}

describe('builder.buildSendTransaction(args)', function () {
  it('throws: Must have "utxos"', function (done) {
    const args = clone(sendArgs)
    delete args.utxos
    assert.throws(function () {
      transactionBuilder.buildSendTransaction(args)
    }, /Must have "utxos"/)
    done()
  })

  it('throws: Must have "to"', function (done) {
    const args = clone(sendArgs)
    delete args.to
    assert.throws(function () {
      transactionBuilder.buildSendTransaction(args)
    }, /Must have "to"/)
    done()
  })

  it('returns valid response with default values', function (done) {
    sendArgs.fee = 5000
    const result = transactionBuilder.buildSendTransaction(sendArgs)
    assert(result.txHex)
    const tx = Transaction.fromHex(result.txHex)
    assert.strictEqual(tx.ins.length, 2)
    assert.strictEqual(tx.outs.length, 4) // transfer + OP_RETURN + 2 changes
    assert.deepEqual(result.coloredOutputIndexes, [0, 3])
    const sumValueInputs = sendArgs.utxos[0].value + sendArgs.utxos[1].value
    const sumValueOutputs = _.sumBy(tx.outs, function (output) {
      return output.value
    })
    assert.strictEqual(sumValueInputs - sumValueOutputs, sendArgs.fee)
    const opReturnScriptBuffer = script.decompile(tx.outs[1].script)[1]
    const taTransaction = TA.fromHex(opReturnScriptBuffer)
    assert.strictEqual(taTransaction.type, 'transfer')
    assert.strictEqual(taTransaction.payments[0].range, false)
    assert.strictEqual(taTransaction.payments[0].output, 0)
    assert.strictEqual(taTransaction.payments[0].input, 0)
    assert.strictEqual(taTransaction.payments[0].percent, false)
    assert.strictEqual(taTransaction.payments[0].amount, sendArgs.to[0].amount)
    done()
  })

  it('returns valid response with default values', function (done) {
    const addresses = [
      'tQsErC77qB5X1oUbkkWeVWoCm4J7xbfays',
      't8PezUK91pug8uY7M4piDRYj5QHLkyxC8J',
      'tGjioXYFLLxF8caMQdwcAXiXcLBZj5Xh4Q',
      'tNc7YX6hzMrd5HXfHMEPSkgRxTeFwNUfUp',
      'tHLJScKjfi8c2ntrxr41WdFK9aJPMyQmV7',
      'tMgRnGCE6JQKtWAYgwbQ12dhps2RpzyD6Y',
      'tTnG8XvR6ps6eWBZnFPCAii47n3DgSznxE',
      'tEjizw2dPnYXxfjfTWmUf6keEft5n1oak3',
      'tJ3ec9RRn7MQmJ5vMCk8HNFmfRfv333gah',
      'tGWeDgsHRSpmZf2BFZvThcy2b66YfFf3VA',
      'tH14kK6qsm2tXGfZ6gBPyZ6sJESDPUPBvW',
      'tVCTQzPURiBqWdRYyGwq2ahNLLPqwTHHzG',
      'tMDjq56q5WtAURvq1SDNRiyCKism1Z1WMh',
      'tKeRoxknf4MaWoYmqC5ExQgFfCKk9dNiJp',
      'tNZFPR8cX97LYRVveu8tGvqnmFXhFASAjj',
      'tAe7kgaY7LuUycaWdYkUjB1xRwDCAyAKtg',
      't9RnjhUpBFRJ28XjTsQ6BSeUbxWWMsbGS5',
      'tGzCUCvrK3LWcxgdoJbStbs3yKYNkwxvG3',
      'tEsqntmm4YsriSY7JiKsKK5RaC8zBC2JFs',
      'tARUgLr2NJsXhH63Jwvp1EdjxjJLpmCdQa',
      't9cDKrneLkqNWJfYWQUxbweSEXA1TNivRr',
      'tE4zdhKF83XYaGKE2HGkwrfDWQcfuiuWa7',
      'tBLDv4JmjoTUxism3E3gr1qU53nrj41T17',
      'tFm2EnfdHehaqJAJaHwnnQnz778UocQ1Re',
      'tLG2RpK7bU8ouF8crY9s9fmzxQdPHLF6w3',
      'tVCH32qqKYQX4UFE15zZAmUXnQhqs5kW4i',
      'tNrbLTwjanrvnGJYtueL2z6Y9ALnqpghEu',
      'tGpxRwQsNugHP6fPNqnYm2bBGdkMQuZX1Y',
      'tE5BBJizdH6tax625VH35dGXEHqknaKTjU',
      'tDuwND9abYovDHbdTT7HP1eHPsAfxofSPj',
    ]

    const args = clone(sendArgs)
    args.ipfsHash =
      '122098ed210c6291c25ae9cd40a85aeced620ef2c4c169e0cdc2be2091ddf3a352e3'
    for (const address of addresses) {
      args.to.push({
        address: address,
        amount: 1,
        assetId: 'La9Sa9wWN5MpAFLtRwS1jwTFsRzdRqhtpeVcya',
      })
    }
    const result = transactionBuilder.buildSendTransaction(args)
    assert(result.txHex)
    const tx = Transaction.fromHex(result.txHex)
    const opReturnScriptBuffer = script.decompile(
      tx.outs[tx.outs.length - 3].script
    )[1]
    const taTransaction = TA.fromHex(opReturnScriptBuffer)
    assert.strictEqual(taTransaction.multiSig[0].hashType, 'ipfsHash')
    done()
  })

  it('should encode ipfsHash', function (done) {
    const args = clone(sendArgs)
    args.ipfsHash =
      '122098ed210c6291c25ae9cd40a85aeced620ef2c4c169e0cdc2be2091ddf3a352e3'
    const result = transactionBuilder.buildSendTransaction(args)
    const tx = Transaction.fromHex(result.txHex)
    const opReturnScriptBuffer = script.decompile(tx.outs[1].script)[1]
    const taTransaction = TA.fromHex(opReturnScriptBuffer)
    assert.strictEqual(taTransaction.ipfsHash.toString('hex'), args.ipfsHash)
    done()
  })

  it('flags.injectPreviousOutput === true: return previous output hex in inputs', function (done) {
    const args = clone(sendArgs)
    args.flags = { injectPreviousOutput: true }
    const result = transactionBuilder.buildSendTransaction(args)
    assert(result.txHex)
    const tx = Transaction.fromHex(result.txHex)
    assert.strictEqual(tx.ins.length, 2)
    assert.strictEqual(
      tx.ins[0].script.toString('hex'),
      args.utxos[0].scriptPubKey.hex
    )
    done()
  })

  it('should not have finance change', function (done) {
    const args = clone(sendArgs)
    args.utxos[1].value = 10441
    args.fee = 5000
    const result = transactionBuilder.buildSendTransaction(args)
    assert(result.txHex)
    const tx = Transaction.fromHex(result.txHex)
    assert.strictEqual(tx.ins.length, 2)
    assert.strictEqual(tx.outs.length, 3) // transfer + OP_RETURN + 1 change
    assert.deepEqual(result.coloredOutputIndexes, [0, 2])
    done()
  })

  it('should not have colored change', function (done) {
    const args = clone(sendArgs)
    args.to[0].amount = args.utxos[0].assets[0].amount
    args.fee = 5000
    const result = transactionBuilder.buildSendTransaction(args)
    assert(result.txHex)
    const tx = Transaction.fromHex(result.txHex)
    assert.strictEqual(tx.ins.length, 2)
    assert.strictEqual(tx.outs.length, 3) // transfer + OP_RETURN + 1 change
    assert.deepEqual(result.coloredOutputIndexes, [0])
    done()
  })
})

const burnArgs = {
  utxos: [
    {
      index: 2,
      txid: '13eb8adcf7c0c7657739df9d24d7917eb27f0e50316df75cb8d208e793134423',
      blocktime: 1575532788000,
      blockheight: 204359,
      value: 5441,
      used: false,
      scriptPubKey: {
        asm:
          'OP_DUP OP_HASH160 cc9e2fae9f7c83254c79e0fc5fff047fc04fbea7 OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a914cc9e2fae9f7c83254c79e0fc5fff047fc04fbea788ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['tRaXPu5bovE5bXx7fgZ5ANsmACdra86PPm'],
      },
      assets: [
        {
          assetId: 'La9Sa9wWN5MpAFLtRwS1jwTFsRzdRqhtpeVcya',
          amount: 100000000000000,
          issueTxid:
            '13eb8adcf7c0c7657739df9d24d7917eb27f0e50316df75cb8d208e793134423',
          divisibility: 8,
          lockStatus: true,
          aggregationPolicy: 'aggregatable',
        },
      ],
    },
    {
      index: 2,
      txid: '26879b80504ae1251f401ecfd3c5e50ee467d994ae0b656ef321957d5e8310e7',
      blocktime: 1584795444000,
      blockheight: 564183,
      value: 999976677,
      used: false,
      scriptPubKey: {
        asm:
          'OP_DUP OP_HASH160 cc9e2fae9f7c83254c79e0fc5fff047fc04fbea7 OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a914cc9e2fae9f7c83254c79e0fc5fff047fc04fbea788ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['tRaXPu5bovE5bXx7fgZ5ANsmACdra86PPm'],
      },
      assets: [],
    },
  ],
  burn: [
    { amount: 100000000000, assetId: 'La9Sa9wWN5MpAFLtRwS1jwTFsRzdRqhtpeVcya' },
  ],
  fee: 5000,
}

describe('builder.buildBurnTransaction(args)', function () {
  it('returns valid response when burn completely', function (done) {
    const result = transactionBuilder.buildBurnTransaction(burnArgs)
    assert(result.txHex)
    const tx = Transaction.fromHex(result.txHex)
    assert.strictEqual(tx.ins.length, 2)
    assert.strictEqual(tx.outs.length, 3) // OP_RETURN + 2 changes
    assert.deepEqual(result.coloredOutputIndexes, [2])
    const sumValueInputs = burnArgs.utxos[0].value + burnArgs.utxos[1].value
    const sumValueOutputs = _.sumBy(tx.outs, function (output) {
      return output.value
    })
    assert.strictEqual(sumValueInputs - sumValueOutputs, burnArgs.fee)
    const opReturnScriptBuffer = script.decompile(tx.outs[0].script)[1]
    const taTransaction = TA.fromHex(opReturnScriptBuffer)
    assert.strictEqual(taTransaction.type, 'burn')
    assert.strictEqual(taTransaction.payments[0].burn, true)
    assert.strictEqual(taTransaction.payments[0].input, 0)
    assert.strictEqual(
      taTransaction.payments[0].amount,
      burnArgs.burn[0].amount
    )
    done()
  })

  it('returns valid response when burn partially', function (done) {
    burnArgs.burn[0].amount = 100
    const result = transactionBuilder.buildBurnTransaction(burnArgs)
    assert(result.txHex)
    const tx = Transaction.fromHex(result.txHex)
    assert.strictEqual(tx.ins.length, 2)
    assert.strictEqual(tx.outs.length, 3) // OP_RETURN + 2 changes
    assert.deepEqual(result.coloredOutputIndexes, [2])
    const sumValueInputs = burnArgs.utxos[0].value + burnArgs.utxos[1].value
    const sumValueOutputs = _.sumBy(tx.outs, function (output) {
      return output.value
    })
    assert.strictEqual(sumValueInputs - sumValueOutputs, burnArgs.fee)
    const opReturnScriptBuffer = script.decompile(tx.outs[0].script)[1]
    const taTransaction = TA.fromHex(opReturnScriptBuffer)
    assert.strictEqual(taTransaction.type, 'burn')
    assert.strictEqual(taTransaction.payments[0].burn, true)
    assert.strictEqual(taTransaction.payments[0].input, 0)
    assert.strictEqual(
      taTransaction.payments[0].amount,
      burnArgs.burn[0].amount
    )
    done()
  })
})
