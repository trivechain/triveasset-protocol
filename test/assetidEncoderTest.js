/* eslint-env mocha */
const assetIdEncoder = require('../index').AssetIdEncoder
const assert = require('assert')

describe('1st input pubkeyhash', function () {
  describe('locked asset ID', function () {
    let assetId
    const trivechainTransaction = {
      ccdata: [
        {
          type: 'issuance',
          lockStatus: true,
          divisibility: 8,
        },
      ],
      vin: [
        {
          txid:
            '12999ab38cffe40c99430931384ba31a14715bed76be176c873083e088de7930',
          vout: 1,
        },
      ],
    }

    it('should return correct locked asset ID', function (done) {
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'La6QE251sQAT9GaMTWhYejJn5cNKPVNpoe7jW9')
      done()
    })

    it('should return correct locked aggregatable asset ID', function (done) {
      trivechainTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'La6QE251sQAT9GaMTWhYejJn5cNKPVNpoe7jW9')
      done()
    })

    it('should return correct locked dispersed asset ID', function (done) {
      trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'Ld4rkwTrhtBsV5NCmU2NAD1rR67eS6wdQDh44n')
      done()
    })
  })

  describe('unlocked asset ID', function () {
    let assetId
    const trivechainTransaction = {
      ccdata: [
        {
          type: 'issuance',
          lockStatus: false,
          divisibility: 8,
        },
      ],
      vin: [
        {
          scriptSig: {
            asm:
              '3045022100c8f4b7b3909f74472055df75fbb951020841446addebe1163f969752dc1fc3ba02206e727f15a5d9929f7df7f7411c7173a6159d91e730e3fe458d3c3d7731dc56e201 02aa4f9b75ac09f14a464f7168e4a98d1476cc702720203cb19a340f32d5239666',
          },
        },
      ],
    }

    it('should return correct unlocked asset ID', function (done) {
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'Ua4eb6vgVFhRdLk1qmyCN1X6aa99w8YsevFZY9')
      done()
    })

    it('should return correct unlocked aggregatable asset ID', function (done) {
      trivechainTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'Ua4eb6vgVFhRdLk1qmyCN1X6aa99w8YsevFZY9')
      done()
    })

    it('should return correct unlocked dispersed asset ID', function (done) {
      trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'UdAwnLZk685zz3kVfYdKrC2rf7nYUs1G33dTLL')
      done()
    })
  })
})

describe('1st input scripthash', function () {
  describe('locked asset ID', function () {
    let assetId
    const trivechainTransaction = {
      ccdata: [
        {
          type: 'issuance',
          divisibility: 3,
          lockStatus: true,
        },
      ],
      vin: [
        {
          txid:
            '12999ab38cffe40c99430931384ba31a14715bed76be176c873083e088de7930',
          vout: 1,
        },
      ],
    }

    it('should return correct locked aggregatable asset ID', function (done) {
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'La6QE251sQAT9GaMTWhYejJn5cNKPVNpG5dGMy')
      done()
    })

    it('should return correct locked dispersed asset ID', function (done) {
      trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'Ld4rkwTrhtBsV5NCmU2NAD1rR67eS6wdQDh44n')
      done()
    })

    it('should return correct locked dispersed asset ID with 0 divisibility', function (done) {
      trivechainTransaction.ccdata[0].divisibility = 10
      trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'Ld4rkwTrhtBsV5NCmU2NAD1rR67eS6wdQDh44n')
      done()
    })
  })

  describe('unlocked asset ID', function () {
    let assetId
    const trivechainTransaction = {
      ccdata: [
        {
          type: 'issuance',
          divisibility: 3,
          lockStatus: false,
        },
      ],
      vin: [
        {
          scriptSig: {
            asm:
              'OP_0 304402207515cf147d201f411092e6be5a64a6006f9308fad7b2a8fdaab22cd86ce764c202200974b8aca7bf51dbf54150d3884e1ae04f675637b926ec33bf75939446f6ca2801 3045022100ef253c1faa39e65115872519e5f0a33bbecf430c0f35cf562beabbad4da24d8d02201742be8ee49812a73adea3007c9641ce6725c32cd44ddb8e3a3af460015d140501 522102359c6e3f04cefbf089cf1d6670dc47c3fb4df68e2bad1fa5a369f9ce4b42bbd1210395a9d84d47d524548f79f435758c01faec5da2b7e551d3b8c995b7e06326ae4a52ae',
          },
        },
      ],
    }

    it('should return correct unlocked asset ID', function (done) {
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'Ua3gB6zfKRDzNHoQ9V84V7K2zkYmjKnr77D2rk')
      done()
    })

    it('should return correct unlocked aggregatable asset ID', function (done) {
      trivechainTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'Ua3gB6zfKRDzNHoQ9V84V7K2zkYmjKnr77D2rk')
      done()
    })

    it('should return correct unlocked dispersed asset ID', function (done) {
      trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
      assetId = assetIdEncoder(trivechainTransaction)
      assert.strictEqual(assetId, 'Ud9yNLdivHcZizosyFnByHpo5JCAH4FF7vHG6i')
      done()
    })
  })
})

describe('1st input multisig, create asset ID from previousOutput.hex', function () {
  const trivechainTransaction = {
    ccdata: [
      {
        type: 'issuance',
        divisibility: 3,
        lockStatus: false,
      },
    ],
    vin: [
      {
        previousOutput: {
          hex: '76a914ee54bdd81113a2a8f02cd0dcdd1fa8b14c523fd988ac',
        },
      },
    ],
  }
  let assetId

  it('should return correct unlocked aggregatable asset ID', function (done) {
    assetId = assetIdEncoder(trivechainTransaction)
    assert.strictEqual(assetId, 'Ua9CgfGFKCVRdV4aUj4hYz2XtxCg4Smpu8TVAQ')
    done()
  })

  it('should return correct unlocked dispersed asset ID', function (done) {
    trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
    assetId = assetIdEncoder(trivechainTransaction)
    assert.strictEqual(assetId, 'UdFVstuJv4szzC54JViq3AYHyVr4cBEDuyPTya')
    done()
  })
})

describe('create unlocked assetID from address', function () {
  let assetId
  const trivechainTransaction = {
    ccdata: [
      {
        type: 'issuance',
        divisibility: 3,
        lockStatus: false,
      },
    ],
    vin: [
      {
        address: 'tRaXPu5bovE5bXx7fgZ5ANsmACdra86PPm',
      },
    ],
  }

  it('should return correct unlocked asset ID', function (done) {
    assetId = assetIdEncoder(trivechainTransaction)
    assert.strictEqual(assetId, 'Ua2Pq1hcWdiWaAAYpW6LTQCYPv8yFC7nxaD3c6')
    done()
  })

  it('should return correct unlocked aggregatable asset ID', function (done) {
    trivechainTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
    assetId = assetIdEncoder(trivechainTransaction)
    assert.strictEqual(assetId, 'Ua2Pq1hcWdiWaAAYpW6LTQCYPv8yFC7nxaD3c6')
    done()
  })

  it('should return correct unlocked dispersed asset ID', function (done) {
    trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
    assetId = assetIdEncoder(trivechainTransaction)
    assert.strictEqual(assetId, 'Ud8h2FLg7W75vsB2eGkTwaiJUTnMnvaBuMQmsM')
    done()
  })
})

describe('create unlocked assetID from pay-to-scripthash address', function () {
  let assetId
  const trivechainTransaction = {
    ccdata: [
      {
        type: 'issuance',
        divisibility: 3,
        lockStatus: false,
      },
    ],
    vin: [
      {
        address: '8agjVTaTBGEvWj8v8a9rhfWyj35rXNhjH7',
      },
    ],
  }

  it('should return correct unlocked asset ID', function (done) {
    assetId = assetIdEncoder(trivechainTransaction)
    assert.strictEqual(assetId, 'Ua2KDeww2ZDDTNZ3QtUKtRq3z8d5gCjNT4xDP5')
    done()
  })

  it('should return correct unlocked aggregatable asset ID', function (done) {
    trivechainTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
    assetId = assetIdEncoder(trivechainTransaction)
    assert.strictEqual(assetId, 'Ua2KDeww2ZDDTNZ3QtUKtRq3z8d5gCjNT4xDP5')
    done()
  })

  it('should return correct unlocked dispersed asset ID', function (done) {
    trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
    assetId = assetIdEncoder(trivechainTransaction)
    assert.strictEqual(assetId, 'Ud8cQtazdRbnp5ZXEf8TNcLp4gGUDwBmLhW6dA')
    done()
  })
})

describe('create assetID from scriptSig.hex', function () {
  let assetId
  const trivechainTransaction = {
    ccdata: [
      {
        type: 'issuance',
        lockStatus: false,
        divisibility: 2,
      },
    ],
    vin: [
      {
        scriptSig: {
          hex:
            '473044022039bb86ef2dde08c671c5e6aac6c81aa2f7e958dba7aad68bbe57d6741d282b74022064578532ceb0722244fcea662c3182e4c85ca9e02c4a713b27a04d2bfe570b7001210317331a4e7ca70370b8f2c17348c9b32efdc5bb59e658e07eb7380e58e7bf8cae',
        },
      },
    ],
  }

  it('should return correct unlocked asset ID', function (done) {
    assetId = assetIdEncoder(trivechainTransaction)
    assert.strictEqual(assetId, 'Ua6bHz8q16iQHorHJ3P5oojx6TqkcKS4BHG3mV')
    done()
  })

  it('should return correct unlocked aggregatable asset ID', function (done) {
    trivechainTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
    assetId = assetIdEncoder(trivechainTransaction)
    assert.strictEqual(assetId, 'Ua6bHz8q16iQHorHJ3P5oojx6TqkcKS4BHG3mV')
    done()
  })

  it('should return correct unlocked dispersed asset ID', function (done) {
    trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
    assetId = assetIdEncoder(trivechainTransaction)
    assert.strictEqual(assetId, 'UdCtVDmtby6yeWrm7p3DHzFiB1V9A3tTEHdj1z')
    done()
  })
})
