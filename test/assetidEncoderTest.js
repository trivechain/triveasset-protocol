/* eslint-env mocha */
var path = require('path')
var assetIdEncoder = require(path.join(__dirname, '/../assetIdEncoder'))
var assert = require('assert')

describe('1st input pubkeyhash', function () {
  describe('locked asset ID', function () {
    var assetId
    var bitcoinTransaction = {
      'ccdata': [{
        'type': 'issuance',
        'lockStatus': true,
        'divisibility': 3
      }],
      'vin': [{
        'txid': '0f45f38a8bcd8331877267e0f3f5f8a4b3c716165e40db4eee34d52759ad954f',
        'vout': 2
      }]
    }

    it('should return correct locked asset ID', function (done) {
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'La8kMVUzB9RT2GGKpkpuWJgp1oTPVheheTjMi6')
      console.log(assetId)
      done()
    })

    it('should return correct locked aggregatable asset ID', function (done) {
      bitcoinTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'La8kMVUzB9RT2GGKpkpuWJgp1oTPVheheTjMi6')
      console.log(assetId)
      done()
    })

    it('should return correct locked hybrid asset ID', function (done) {
      bitcoinTransaction.ccdata[0].aggregationPolicy = 'hybrid'
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'LhANhrERyCPXq5b4ZC92LtYSdJ8Xbsu18G1pHy')
      console.log(assetId)
      done()
    })

    it('should return correct locked dispersed asset ID', function (done) {
      bitcoinTransaction.ccdata[0].aggregationPolicy = 'dispersed'
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'Ld7CtQsq1dSsN54B8i9j1nPtMHCiYKDXDZ6YBq')
      console.log(assetId)
      done()
    })
  })

  describe('unlocked asset ID', function () {
    var assetId
    var bitcoinTransaction = {
      'ccdata': [{
        'type': 'issuance',
        'lockStatus': false,
        'divisibility': 3
      }],
      'vin': [{
        'scriptSig': {
          'asm': '3045022100daf8f8d65ea908a28d90f700dc932ecb3b68f402b04ba92f987e8abd7080fcad02205ce81b698b8013b86813c9edafc9e79997610626c9dd1bfb49f60abee9daa43801 029b622e5f0f87f2be9f23c4d82f818a73e258a11c26f01f73c8b595042507a574'
        }
      }]
    }

    it('should return correct unlocked asset ID', function (done) {
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'Ua3Kt8WJtsx61VC8DUJiRmseQ45NfW2eJXbbE8')
      console.log(assetId)
      done()
    })

    it('should return correct unlocked aggregatable asset ID', function (done) {
      bitcoinTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'Ua3Kt8WJtsx61VC8DUJiRmseQ45NfW2eJXbbE8')
      console.log(assetId)
      done()
    })

    it('should return correct unlocked hybrid asset ID', function (done) {
      bitcoinTransaction.ccdata[0].aggregationPolicy = 'hybrid'
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'Uh4xEVFkgvvApJWrwucqGMjH1YkWmgGwizurnM')
      console.log(assetId)
      done()
    })

    it('should return correct unlocked dispersed asset ID', function (done) {
      bitcoinTransaction.ccdata[0].aggregationPolicy = 'dispersed'
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'Ud9d5N9NVkLfNCCc3ExquxPQUbimDEV3ctXUKS')
      console.log(assetId)
      done()
    })
  })
})

describe('1st input scripthash', function () {
  describe('locked asset ID', function () {
    var assetId
    var bitcoinTransaction = {
      ccdata: [{
        type: 'issuance',
        divisibility: 3,
        lockStatus: true
      }],
      vin: [{
        txid: '0f45f38a8bcd8331877267e0f3f5f8a4b3c716165e40db4eee34d52759ad954f',
        vout: 2
      }]
    }

    it('should return correct locked aggregatable asset ID', function (done) {
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'La8kMVUzB9RT2GGKpkpuWJgp1oTPVheheTjMi6')
      console.log(assetId)
      done()
    })

    it('should return correct locked hybrid asset ID', function (done) {
      bitcoinTransaction.ccdata[0].aggregationPolicy = 'hybrid'
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'LhANhrERyCPXq5b4ZC92LtYSdJ8Xbsu18G1pHy')
      console.log(assetId)
      done()
    })

    it('should return correct locked dispersed asset ID', function (done) {
      bitcoinTransaction.ccdata[0].aggregationPolicy = 'dispersed'
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'Ld7CtQsq1dSsN54B8i9j1nPtMHCiYKDXDZ6YBq')
      console.log(assetId)
      done()
    })
  })

  describe('unlocked asset ID', function () {
    var assetId
    var bitcoinTransaction = {
      ccdata: [{
        type: 'issuance',
        divisibility: 3,
        lockStatus: false
      }],
      vin: [{
        scriptSig: {
          asm: 'OP_0 304402207515cf147d201f411092e6be5a64a6006f9308fad7b2a8fdaab22cd86ce764c202200974b8aca7bf51dbf54150d3884e1ae04f675637b926ec33bf75939446f6ca2801 3045022100ef253c1faa39e65115872519e5f0a33bbecf430c0f35cf562beabbad4da24d8d02201742be8ee49812a73adea3007c9641ce6725c32cd44ddb8e3a3af460015d140501 522102359c6e3f04cefbf089cf1d6670dc47c3fb4df68e2bad1fa5a369f9ce4b42bbd1210395a9d84d47d524548f79f435758c01faec5da2b7e551d3b8c995b7e06326ae4a52ae'
        }
      }]
    }

    it('should return correct unlocked asset ID', function (done) {
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'Ua3gB6zfKRDzNHoQ9V84V7K2zkYmjKnr77D2rk')
      console.log(assetId)
      done()
    })

    it('should return correct unlocked aggregatable asset ID', function (done) {
      bitcoinTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'Ua3gB6zfKRDzNHoQ9V84V7K2zkYmjKnr77D2rk')
      console.log(assetId)
      done()
    })

    it('should return correct unlocked hybrid asset ID', function (done) {
      bitcoinTransaction.ccdata[0].aggregationPolicy = 'hybrid'
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'Uh5JXTk77UC5B788svSBKhAfcFDuqW39Z36n5Z')
      console.log(assetId)
      done()
    })

    it('should return correct unlocked dispersed asset ID', function (done) {
      bitcoinTransaction.ccdata[0].aggregationPolicy = 'dispersed'
      assetId = assetIdEncoder(bitcoinTransaction)
      assert.equal(assetId, 'Ud9yNLdivHcZizosyFnByHpo5JCAH4FFUyFSTo')
      console.log(assetId)
      done()
    })
  })
})

describe('1st input multisig, create asset ID from previousOutput.hex', function () {
  var bitcoinTransaction = {
    ccdata: [{
      type: 'issuance',
      divisibility: 3,
      lockStatus: false
    }],
    vin: [{
      previousOutput: {
        hex: '76a914ee54bdd81113a2a8f02cd0dcdd1fa8b14c523fd988ac'
      }
    }]
  }
  var assetId

  it('should return correct unlocked aggregatable asset ID', function (done) {
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'Ua9CgfGFKCVRdV4aUj4hYz2XtxCg4Smpu8TVAQ')
    console.log(assetId)
    done()
  })

  it('should return correct unlocked hybrid asset ID', function (done) {
    bitcoinTransaction.ccdata[0].aggregationPolicy = 'hybrid'
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'UhAq321h7FTWSJPKDANpPZtAWSspAd28P59scH')
    console.log(assetId)
    done()
  })

  it('should return correct unlocked dispersed asset ID', function (done) {
    bitcoinTransaction.ccdata[0].aggregationPolicy = 'dispersed'
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'UdFVstuJv4szzC54JViq3AYHyVr4cBEEEdCFyB')
    console.log(assetId)
    done()
  })
})

describe('create unlocked assetID from address', function () {
  var assetId
  var bitcoinTransaction = {
    ccdata: [{
      type: 'issuance',
      divisibility: 3,
      lockStatus: false
    }],
    vin: [{
      address: 'mxNTyQ3WdFMQE7SGVpSQGXnSDevGMLq7dg'
    }]
  }

  it('should return correct unlocked asset ID', function (done) {
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'Ua3Kt8WJtsx61VC8DUJiRmseQ45NfW2eJXbbE8')
    console.log(assetId)
    done()
  })

  it('should return correct unlocked aggregatable asset ID', function (done) {
    bitcoinTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'Ua3Kt8WJtsx61VC8DUJiRmseQ45NfW2eJXbbE8')
    console.log(assetId)
    done()
  })

  it('should return correct unlocked hybrid asset ID', function (done) {
    bitcoinTransaction.ccdata[0].aggregationPolicy = 'hybrid'
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'Uh4xEVFkgvvApJWrwucqGMjH1YkWmgGwizurnM')
    console.log(assetId)
    done()
  })

  it('should return correct unlocked dispersed asset ID', function (done) {
    bitcoinTransaction.ccdata[0].aggregationPolicy = 'dispersed'
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'Ud9d5N9NVkLfNCCc3ExquxPQUbimDEV3ctXUKS')
    console.log(assetId)
    done()
  })
})

describe('create unlocked assetID from pay-to-scripthash address', function () {
  var assetId
  var bitcoinTransaction = {
    ccdata: [{
      type: 'issuance',
      divisibility: 3,
      lockStatus: false
    }],
    vin: [{
      address: '3P14159f73E4gFr7JterCCQh9QjiTjiZrG'
    }]
  }

  it('should return correct unlocked asset ID', function (done) {
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'Ua7LQe4WHDZooow4exMVDqGhM47FWnBxbN8j35')
    console.log(assetId)
    done()
  })

  it('should return correct unlocked aggregatable asset ID', function (done) {
    bitcoinTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'Ua7LQe4WHDZooow4exMVDqGhM47FWnBxbN8j35')
    console.log(assetId)
    done()
  })

  it('should return correct unlocked hybrid asset ID', function (done) {
    bitcoinTransaction.ccdata[0].aggregationPolicy = 'hybrid'
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'Uh8xkzox5GXtcdFoPPfc4R8KxYnPcxSFzbdQr1')
    console.log(assetId)
    done()
  })

  it('should return correct unlocked dispersed asset ID', function (done) {
    bitcoinTransaction.ccdata[0].aggregationPolicy = 'dispersed'
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'UdDdbshZt5xPAWwYUj1ci1nTRbke4WeMseyejd')
    console.log(assetId)
    done()
  })
})

describe('create assetID from scriptSig.hex', function () {
  var assetId
  var bitcoinTransaction = {
    'ccdata': [{
      'type': 'issuance',
      'lockStatus': false,
      'divisibility': 2
    }],
    'vin': [{
      'scriptSig': {
        'hex': '483045022100b5aaae72b05c0698ea22e2f4cb3f3a46e5a0a1c1a98772b1c7305476b9ae5e1f02200276a003694eab8d12bc5791624b60b1c68486e4b985f2a672751bb35295202b012102b509613c7e5d9e47347635f872c3aa271d01ac4a9a6445839ce2c5820a0f48a8'
      }
    }]
  }

  it('should return correct unlocked asset ID', function (done) {
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'Ua7aoEMJRW6VK9sBfssGq3ChUox3NdNpNuhFey')
    console.log(assetId)
    done()
  })

  it('should return correct unlocked aggregatable asset ID', function (done) {
    bitcoinTransaction.ccdata[0].aggregationPolicy = 'aggregatable'
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'Ua7aoEMJRW6VK9sBfssGq3ChUox3NdNpNuhFey')
    console.log(assetId)
    done()
  })

  it('should return correct unlocked hybrid asset ID', function (done) {
    bitcoinTransaction.ccdata[0].aggregationPolicy = 'hybrid'
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'Uh9D9b6kDZ4a7yBvQKBPfd4L6JdBUod7isFyfk')
    console.log(assetId)
    done()
  })

  it('should return correct unlocked dispersed asset ID', function (done) {
    bitcoinTransaction.ccdata[0].aggregationPolicy = 'dispersed'
    assetId = assetIdEncoder(bitcoinTransaction)
    assert.equal(assetId, 'UdDszTzN2NV4frsfVeXQKDiTZMbRvMqDfK6KF4')
    console.log(assetId)
    done()
  })
})
