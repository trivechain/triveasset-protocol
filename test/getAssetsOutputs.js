/* eslint-env mocha */
const getAssetsOutputs = require('../src/getAssetsOutputs')
const assert = require('assert')

let issuanceTx = {
  vin: [
    {
      assets: [],
    },
    {
      assets: [],
    },
  ],
  vout: [{}, {}, {}],
  ccdata: [
    {
      payments: [
        {
          input: 0,
          amount: 10,
          output: 0,
          range: false,
          percent: false,
        },
        {
          input: 0,
          amount: 6,
          output: 0,
          range: false,
          percent: false,
        },
        {
          input: 0,
          amount: 7,
          output: 1,
          range: false,
          percent: false,
        },
      ],
      protocol: 0x5441,
      version: 2,
      type: 'issuance',
      lockStatus: false,
      aggregationPolicy: 'dispersed',
      amount: 25,
      multiSig: [],
    },
  ],
}

let transferTx = {
  vin: [
    {
      assets: [
        {
          assetId: 'A',
          amount: 10,
          issueTxid: 'aaa',
          divisibility: 0,
          lockStatus: false,
          aggregationPolicy: 'aggregatable',
        },
        {
          assetId: 'A',
          amount: 5,
          issueTxid: 'aaa',
          divisibility: 0,
          lockStatus: false,
          aggregationPolicy: 'aggregatable',
        },
      ],
    },
    {
      assets: [
        {
          assetId: 'A',
          amount: 6,
          issueTxid: 'aaa',
          divisibility: 0,
          lockStatus: false,
          aggregationPolicy: 'aggregatable',
        },
      ],
    },
  ],
  vout: [{}, {}, {}],
  ccdata: [
    {
      payments: [
        {
          input: 0,
          amount: 10,
          output: 0,
          range: false,
          percent: false,
        },
        {
          input: 0,
          amount: 5,
          output: 0,
          range: false,
          percent: false,
        },
        {
          input: 1,
          amount: 4,
          output: 2,
          range: false,
          percent: false,
        },
      ],
      protocol: 0x5441,
      version: 1,
      type: 'transfer',
      multiSig: [],
    },
  ],
}

it('Issuance - should transfer the correct amounts, split according to payments', function (done) {
  let res = getAssetsOutputs(issuanceTx)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(Array.isArray(res[0]), true)
  assert.equal(res[0].length, 2)
  assert.equal(res[0][0].amount, 10)
  assert.equal(res[0][1].amount, 6)
  assert.equal(Array.isArray(res[1]), true)
  assert.equal(res[1].length, 1)
  assert.equal(res[1][0].amount, 7)
  assert.equal(Array.isArray(res[2]), true)
  assert.equal(res[2].length, 1)
  assert.equal(res[2][0].amount, 2)
  done()
})

it('Issuance - should transfer entire amount to last output when overflow in total amount in payments', function (done) {
  issuanceTx.ccdata[0].payments = [
    {
      input: 0,
      amount: 100,
      output: 0,
      range: false,
      percent: false,
    },
  ]
  let res = getAssetsOutputs(issuanceTx)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(res[2].length, 1)
  assert.equal(res[2][0].amount, 25)
  assert.equal(issuanceTx.overflow, true)
  done()
})

it('Issuance - should transfer entire amount to last output there is overflow in total amount, even when first payments can be satisfied', function (done) {
  issuanceTx.ccdata[0].payments = [
    {
      input: 0,
      amount: 10,
      output: 0,
      range: false,
      percent: false,
    },
    {
      input: 0,
      amount: 90,
      output: 0,
      range: false,
      percent: false,
    },
  ]
  let res = getAssetsOutputs(issuanceTx)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(res[0], null)
  assert.equal(res[1], null)
  assert.equal(res[2].length, 1)
  assert.equal(res[2][0].amount, 25)
  done()
})

it('Transfer - should transfer the correct amounts, split according to payments (even when asset is aggregatable)', function (done) {
  let res = getAssetsOutputs(transferTx)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(res[0].length, 2)
  assert.equal(res[0][0].amount, 10)
  assert.equal(res[0][1].amount, 5)
  assert.equal(res[2].length, 2)
  assert.equal(res[2][0].amount, 4)
  assert.equal(res[2][1].amount, 2)
  done()
})

it('Transfer - should transfer the entire amount to last output, when there is an overflow in total amount. If assets are aggregatable - should aggregate them together.', function (done) {
  transferTx.ccdata[0].payments = [
    {
      input: 0,
      amount: 100,
      output: 0,
      range: false,
      percent: false,
    },
  ]
  let res = getAssetsOutputs(transferTx)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(Array.isArray(res[2]), true)
  assert.equal(res[2].length, 1)
  assert.equal(res[2][0].amount, 21)
  assert.equal(issuanceTx.overflow, true)
  done()
})

it('Transfer - should transfer correct amounts, when there is an overflow to the same aggregatable assetId asset with a different input', function (done) {
  transferTx.ccdata[0].payments = [
    {
      input: 0,
      amount: 10,
      output: 0,
      range: false,
      percent: false,
    },
    {
      input: 0,
      amount: 10, // that's an overflow, but to the same aggregatable asset-id within the next input
      output: 2,
      range: false,
      percent: false,
    },
  ]
  let res = getAssetsOutputs(transferTx)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(Array.isArray(res[0]), true)
  assert.equal(res[0].length, 1)
  assert.equal(res[0][0].amount, 10)
  assert.equal(Array.isArray(res[2]), true)
  assert.equal(res[2].length, 2)
  assert.equal(res[2][0].amount, 10) // aggregate
  assert.equal(res[2][1].amount, 1) // change - we keep it separated because we respect the payment
  done()
})

it('Transfer - should transfer correct amounts, when there is an overflow to the same aggregatable assetId asset within the same input', function (done) {
  transferTx.ccdata[0].payments = [
    {
      input: 0,
      amount: 13, // that's an overflow, but to the same aggregatable asset-id within the same input
      output: 0,
      range: false,
      percent: false,
    },
    {
      input: 0,
      amount: 2,
      output: 2,
      range: false,
      percent: false,
    },
    {
      input: 1,
      amount: 5,
      output: 2,
      range: false,
      percent: false,
    },
  ]
  let res = getAssetsOutputs(transferTx)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(Array.isArray(res[0]), true)
  assert.equal(res[0].length, 1)
  assert.equal(res[0][0].amount, 13)
  assert.equal(Array.isArray(res[2]), true)
  assert.equal(res[2].length, 3)
  assert.equal(res[2][0].amount, 2)
  assert.equal(res[2][1].amount, 5)
  assert.equal(res[2][2].amount, 1) // change - we keep it separated because we respect the payment
  done()
})

it('Transfer - should transfer the entire amount to last output, when there is an overflow in total amount. If assets are NOT aggregatable - should keep them separated.', function (done) {
  transferTx.ccdata[0].payments = [
    {
      input: 0,
      amount: 100,
      output: 0,
      range: false,
      percent: false,
    },
  ]
  transferTx.vin.forEach(function (vin) {
    vin.assets.forEach(function (asset) {
      asset.aggregationPolicy = 'dispersed'
    })
  })
  let res = getAssetsOutputs(transferTx)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(Array.isArray(res[2]), true)
  assert.equal(res[2].length, 3)
  assert.equal(res[2][0].amount, 10)
  assert.equal(res[2][1].amount, 5)
  assert.equal(res[2][2].amount, 6)
  done()
})

it('Transfer - should transfer the entire amount to last output, when there is an overflow to another asset which is not aggregatable with the previous asset.', function (done) {
  transferTx.ccdata[0].payments = [
    {
      input: 0,
      amount: 13, // that's an overflow
      output: 0,
      range: false,
      percent: false,
    },
    {
      input: 0,
      amount: 2,
      output: 2,
      range: false,
      percent: false,
    },
    {
      input: 1,
      amount: 6,
      output: 2,
      range: false,
      percent: false,
    },
  ]
  let res = getAssetsOutputs(transferTx)
  assert.equal(transferTx.overflow, true)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(Array.isArray(res[2]), true)
  assert.equal(res[2].length, 3)
  assert.equal(res[2][0].amount, 10)
  assert.equal(res[2][1].amount, 5)
  assert.equal(res[2][2].amount, 6)
  done()
})

it('Transfer - should not have overflow with payment with amount 0', function (done) {
  transferTx.ccdata[0].payments = [
    {
      input: 0,
      amount: 10,
      output: 0,
      range: false,
      percent: false,
    },
    {
      input: 0,
      amount: 5,
      output: 2,
      range: false,
      percent: false,
    },
    {
      input: 1,
      amount: 6,
      output: 2,
      range: false,
      percent: false,
    },
    {
      input: 1,
      amount: 0,
      output: 2,
      range: false,
      percent: false,
    },
  ]
  let res = getAssetsOutputs(transferTx)
  assert.equal(transferTx.overflow, false)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(Array.isArray(res[0]), true)
  assert.equal(res[0].length, 1)
  assert.equal(res[0][0].amount, 10)
  assert.equal(Array.isArray(res[2]), true)
  assert.equal(res[2].length, 2)
  assert.equal(res[2][0].amount, 5)
  assert.equal(res[2][1].amount, 6)
  done()
})

it('Transfer - should transfer entire amount to last output when there is a payment to a non existing output', function (done) {
  transferTx.ccdata[0].payments = [
    {
      input: 0,
      amount: 10,
      output: 0,
      range: false,
      percent: false,
    },
    {
      input: 0,
      amount: 5,
      output: 2,
      range: false,
      percent: false,
    },
    {
      input: 1,
      amount: 6,
      output: 2,
      range: false,
      percent: false,
    },
    {
      input: 1,
      amount: 0,
      output: 3,
      range: false,
      percent: false,
    },
  ]
  let res = getAssetsOutputs(transferTx)
  assert.equal(transferTx.overflow, true)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(Array.isArray(res[2]), true)
  assert.equal(res[2].length, 3)
  assert.equal(res[2][0].amount, 10)
  assert.equal(res[2][1].amount, 5)
  assert.equal(res[2][2].amount, 6)
  done()
})

it('Transfer - should transfer remaining amounts to last output', function (done) {
  let tx = {
    vin: [
      {
        assets: [
          {
            assetId: 'A',
            amount: 10,
            issueTxid: 'aaa',
            divisibility: 0,
            lockStatus: false,
            aggregationPolicy: 'aggregatable',
          },
        ],
      },
      {
        assets: [
          {
            assetId: 'B',
            amount: 5,
            issueTxid: 'bbb',
            divisibility: 0,
            lockStatus: false,
            aggregationPolicy: 'aggregatable',
          },
        ],
      },
      {
        assets: [
          {
            assetId: 'C',
            amount: 6,
            issueTxid: 'ccc',
            divisibility: 0,
            lockStatus: false,
            aggregationPolicy: 'aggregatable',
          },
        ],
      },
    ],
    vout: [{}, {}, {}],
    ccdata: [
      {
        payments: [
          {
            input: 0,
            amount: 0,
            output: 0,
            range: false,
            percent: false,
          },
          {
            input: 1,
            amount: 0,
            output: 0,
            range: false,
            percent: false,
          },
          {
            input: 2,
            amount: 4,
            output: 0,
            range: false,
            percent: false,
          },
        ],
        protocol: 0x5441,
        version: 1,
        type: 'transfer',
        multiSig: [],
      },
    ],
  }
  let res = getAssetsOutputs(tx)
  assert.equal(tx.overflow, false)
  assert.equal(Array.isArray(res), true)
  assert.equal(res.length, 3)
  assert.equal(Array.isArray(res[0]), true)
  assert.equal(res[0].length, 1)
  assert.equal(res[0][0].amount, 4)
  assert.equal(Array.isArray(res[2]), true)
  assert.equal(res[2].length, 3)
  assert.equal(res[2][0].amount, 10)
  assert.equal(res[2][0].assetId, 'A')
  assert.equal(res[2][1].amount, 5)
  assert.equal(res[2][1].assetId, 'B')
  assert.equal(res[2][2].amount, 2)
  assert.equal(res[2][2].assetId, 'C')
  done()
})

it('Burn - should transfer and burn assets', function (done) {
  let burnTx = {
    vin: [
      {
        assets: [
          {
            assetId: 'A',
            amount: 6,
            issueTxid: 'aaa',
            divisibility: 0,
            lockStatus: false,
            aggregationPolicy: 'aggregatable',
          },
        ],
      },
      {
        assets: [
          {
            assetId: 'B',
            amount: 6,
            issueTxid: 'bbb',
            divisibility: 0,
            lockStatus: false,
            aggregationPolicy: 'aggregatable',
          },
        ],
      },
      {
        assets: [
          {
            assetId: 'C',
            amount: 6,
            issueTxid: 'ccc',
            divisibility: 0,
            lockStatus: false,
            aggregationPolicy: 'aggregatable',
          },
        ],
      },
    ],
    vout: [{}, {}, {}],
    ccdata: [
      {
        payments: [
          {
            input: 0,
            amount: 3,
            output: 1,
            range: false,
            percent: false,
          },
          {
            input: 0,
            amount: 2,
            percent: false,
            burn: true,
          },
          {
            input: 1,
            amount: 3,
            output: 0,
            range: false,
            percent: false,
          },
          {
            input: 1,
            amount: 2,
            burn: true,
            percent: false,
          },
        ],
        protocol: 0x5441,
        version: 1,
        type: 'burn',
        multiSig: [],
      },
    ],
  }

  let res = getAssetsOutputs(burnTx)
  assert.deepEqual(res, [
    [
      {
        assetId: 'B',
        amount: 3,
        issueTxid: 'bbb',
        divisibility: 0,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
    ],
    [
      {
        assetId: 'A',
        amount: 3,
        issueTxid: 'aaa',
        divisibility: 0,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
    ],
    [
      {
        assetId: 'A',
        amount: 1,
        issueTxid: 'aaa',
        divisibility: 0,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
      {
        assetId: 'B',
        amount: 1,
        issueTxid: 'bbb',
        divisibility: 0,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
      {
        assetId: 'C',
        amount: 6,
        issueTxid: 'ccc',
        divisibility: 0,
        lockStatus: false,
        aggregationPolicy: 'aggregatable',
      },
    ],
  ])
  done()
})

it('Burn - should transfer all assets to last output when there is an overflow', function (done) {
  let burnTx = {
    vin: [
      {
        assets: [
          {
            assetId: 'A',
            amount: 6,
            issueTxid: 'aaa',
            divisibility: 0,
            lockStatus: false,
            aggregationPolicy: 'aggregatable',
          },
        ],
      },
      {
        assets: [
          {
            assetId: 'B',
            amount: 6,
            issueTxid: 'bbb',
            divisibility: 0,
            lockStatus: false,
            aggregationPolicy: 'aggregatable',
          },
        ],
      },
    ],
    vout: [{}, {}, {}],
    ccdata: [
      {
        payments: [
          {
            input: 0,
            amount: 3,
            output: 1,
            range: false,
            percent: false,
          },
          {
            input: 0,
            amount: 2,
            percent: false,
            burn: true,
          },
          {
            input: 0,
            amount: 2,
            output: 0,
            range: false,
            percent: false,
          },
        ],
        protocol: 0x5441,
        version: 1,
        type: 'burn',
        multiSig: [],
      },
    ],
  }

  let res = getAssetsOutputs(burnTx)
  assert.equal(burnTx.overflow, true)
  assert.deepEqual(res[0], undefined)
  assert.deepEqual(res[1], undefined)
  assert.deepEqual(res[2], [
    {
      assetId: 'A',
      amount: 6,
      issueTxid: 'aaa',
      divisibility: 0,
      lockStatus: false,
      aggregationPolicy: 'aggregatable',
    },
    {
      assetId: 'B',
      amount: 6,
      issueTxid: 'bbb',
      divisibility: 0,
      lockStatus: false,
      aggregationPolicy: 'aggregatable',
    },
  ])
  done()
})
