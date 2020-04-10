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

// describe('1st input scripthash', function () {
//   describe('locked asset ID', function () {
//     let assetId
//     let trivechainTransaction = {
//       ccdata: [{
//         type: 'issuance',
//         divisibility: 3,
//         lockStatus: true
//       }],
//       vin: [{
//         txid: '12999ab38cffe40c99430931384ba31a14715bed76be176c873083e088de7930',
//         vout: 1
//       }]
//     }

//     it('should return correct locked aggregatable asset ID', function (done) {
//       assetId = assetIdEncoder(trivechainTransaction)
//       console.log(assetId)
//       assert.strictEqual(assetId, 'La6QE251sQAT9GaMTWhYejJn5cNKPVNpG5dGMy')
//       done()
//     })

//     it('should return correct locked dispersed asset ID', function (done) {
//       trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
//       assetId = assetIdEncoder(trivechainTransaction)
//       console.log(assetId)
//       assert.strictEqual(assetId, 'Ld4rkwTrhtBsV5NCmU2NAD1rR67eS6wdQDh44n')
//       console.log(assetId)
//       done()
//     })

//     it('should return correct locked dispersed asset ID with 0 divisibility', function (done) {
//       trivechainTransaction.ccdata[0].divisibility = 10
//       trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
//       assetId = assetIdEncoder(trivechainTransaction)
//       console.log(assetId)
//       assert.strictEqual(assetId, 'Ld4rkwTrhtBsV5NCmU2NAD1rR67eS6wdQDh44n')
//       done()
//     })
//   })

//   describe('unlocked asset ID', function () {
//     let assetId
//     let trivechainTransaction = {
//       ccdata: [{
//         type: 'issuance',
//         divisibility: 3,
//         lockStatus: false
//       }],
//       vin: [{
//         scriptSig: {
//           asm: 'OP_0 304402207515cf147d201f411092e6be5a64a6006f9308fad7b2a8fdaab22cd86ce764c202200974b8aca7bf51dbf54150d3884e1ae04f675637b926ec33bf75939446f6ca2801 3045022100ef253c1faa39e65115872519e5f0a33bbecf430c0f35cf562beabbad4da24d8d02201742be8ee49812a73adea3007c9641ce6725c32cd44ddb8e3a3af460015d140501 522102359c6e3f04cefbf089cf1d6670dc47c3fb4df68e2bad1fa5a369f9ce4b42bbd1210395a9d84d47d524548f79f435758c01faec5da2b7e551d3b8c995b7e06326ae4a52ae'
//         }
//       }]
//     }

//     it('should return correct unlocked asset ID', function (done) {
//       assetId = assetIdEncoder(trivechainTransaction)
//       assert.strictEqual(assetId, 'Ua3gB6zfKRDzNHoQ9V84V7K2zkYmjKnr77D2rk')
//       console.log(assetId)
//       done()
//     })

//     it('should return correct unlocked aggregatable asset ID', function (done) {
//       trivechainTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
//       assetId = assetIdEncoder(trivechainTransaction)
//       assert.strictEqual(assetId, 'Ua3gB6zfKRDzNHoQ9V84V7K2zkYmjKnr77D2rk')
//       console.log(assetId)
//       done()
//     })

//     it('should return correct unlocked dispersed asset ID', function (done) {
//       trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
//       assetId = assetIdEncoder(trivechainTransaction)
//       assert.strictEqual(assetId, 'Ud9yNLdivHcZizosyFnByHpo5JCAH4FFUyFSTo')
//       console.log(assetId)
//       done()
//     })
//   })
// })

// describe('1st input multisig, create asset ID from previousOutput.hex', function () {
//   let trivechainTransaction = {
//     ccdata: [{
//       type: 'issuance',
//       divisibility: 3,
//       lockStatus: false
//     }],
//     vin: [{
//       previousOutput: {
//         hex: '76a914ee54bdd81113a2a8f02cd0dcdd1fa8b14c523fd988ac'
//       }
//     }]
//   }
//   let assetId

//   it('should return correct unlocked aggregatable asset ID', function (done) {
//     assetId = assetIdEncoder(trivechainTransaction)
//     assert.strictEqual(assetId, 'Ua9CgfGFKCVRdV4aUj4hYz2XtxCg4Smpu8TVAQ')
//     console.log(assetId)
//     done()
//   })

//   it('should return correct unlocked dispersed asset ID', function (done) {
//     trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
//     assetId = assetIdEncoder(trivechainTransaction)
//     assert.strictEqual(assetId, 'UdFVstuJv4szzC54JViq3AYHyVr4cBEEEdCFyB')
//     console.log(assetId)
//     done()
//   })
// })

// describe('create unlocked assetID from address', function () {
//   let assetId
//   let trivechainTransaction = {
//     ccdata: [{
//       type: 'issuance',
//       divisibility: 3,
//       lockStatus: false
//     }],
//     vin: [{
//       address: 'mxNTyQ3WdFMQE7SGVpSQGXnSDevGMLq7dg'
//     }]
//   }

//   it('should return correct unlocked asset ID', function (done) {
//     assetId = assetIdEncoder(trivechainTransaction)
//     assert.strictEqual(assetId, 'Ua3Kt8WJtsx61VC8DUJiRmseQ45NfW2eJXbbE8')
//     console.log(assetId)
//     done()
//   })

//   it('should return correct unlocked aggregatable asset ID', function (done) {
//     trivechainTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
//     assetId = assetIdEncoder(trivechainTransaction)
//     assert.strictEqual(assetId, 'Ua3Kt8WJtsx61VC8DUJiRmseQ45NfW2eJXbbE8')
//     console.log(assetId)
//     done()
//   })

//   it('should return correct unlocked dispersed asset ID', function (done) {
//     trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
//     assetId = assetIdEncoder(trivechainTransaction)
//     assert.strictEqual(assetId, 'Ud9d5N9NVkLfNCCc3ExquxPQUbimDEV3ctXUKS')
//     console.log(assetId)
//     done()
//   })
// })

// describe('create unlocked assetID from pay-to-scripthash address', function () {
//   let assetId
//   let trivechainTransaction = {
//     ccdata: [{
//       type: 'issuance',
//       divisibility: 3,
//       lockStatus: false
//     }],
//     vin: [{
//       address: '3P14159f73E4gFr7JterCCQh9QjiTjiZrG'
//     }]
//   }

//   it('should return correct unlocked asset ID', function (done) {
//     assetId = assetIdEncoder(trivechainTransaction)
//     assert.strictEqual(assetId, 'Ua7LQe4WHDZooow4exMVDqGhM47FWnBxbN8j35')
//     console.log(assetId)
//     done()
//   })

//   it('should return correct unlocked aggregatable asset ID', function (done) {
//     trivechainTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
//     assetId = assetIdEncoder(trivechainTransaction)
//     assert.strictEqual(assetId, 'Ua7LQe4WHDZooow4exMVDqGhM47FWnBxbN8j35')
//     console.log(assetId)
//     done()
//   })

//   it('should return correct unlocked dispersed asset ID', function (done) {
//     trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
//     assetId = assetIdEncoder(trivechainTransaction)
//     assert.strictEqual(assetId, 'UdDdbshZt5xPAWwYUj1ci1nTRbke4WeMseyejd')
//     console.log(assetId)
//     done()
//   })
// })

// describe('create assetID from scriptSig.hex', function () {
//   let assetId
//   let trivechainTransaction = {
//     'ccdata': [{
//       'type': 'issuance',
//       'lockStatus': false,
//       'divisibility': 2
//     }],
//     'vin': [{
//       'scriptSig': {
//         'hex': '483045022100b5aaae72b05c0698ea22e2f4cb3f3a46e5a0a1c1a98772b1c7305476b9ae5e1f02200276a003694eab8d12bc5791624b60b1c68486e4b985f2a672751bb35295202b012102b509613c7e5d9e47347635f872c3aa271d01ac4a9a6445839ce2c5820a0f48a8'
//       }
//     }]
//   }

//   it('should return correct unlocked asset ID', function (done) {
//     assetId = assetIdEncoder(trivechainTransaction)
//     assert.strictEqual(assetId, 'Ua7aoEMJRW6VK9sBfssGq3ChUox3NdNpNuhFey')
//     console.log(assetId)
//     done()
//   })

//   it('should return correct unlocked aggregatable asset ID', function (done) {
//     trivechainTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
//     assetId = assetIdEncoder(trivechainTransaction)
//     assert.strictEqual(assetId, 'Ua7aoEMJRW6VK9sBfssGq3ChUox3NdNpNuhFey')
//     console.log(assetId)
//     done()
//   })

//   it('should return correct unlocked dispersed asset ID', function (done) {
//     trivechainTransaction.ccdata[0].aggregationPolicy = 'dispersed'
//     assetId = assetIdEncoder(trivechainTransaction)
//     assert.strictEqual(assetId, 'UdDszTzN2NV4frsfVeXQKDiTZMbRvMqDfK6KF4')
//     console.log(assetId)
//     done()
//   })
// })
