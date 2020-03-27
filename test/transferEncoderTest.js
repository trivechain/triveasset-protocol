// var transferEncoder = require('../index').TransferEncoder
// var assert = require('assert')

// var consumer = function (buff) {
//   var curr = 0
//   return function consume (len) {
//     return buff.slice(curr, curr += len)
//   }
// }

// var toBuffer = function (val) {
//   val = val.toString(16)
//   if (val.length % 2 == 1) {
//     val = '0'+val
//   }
//   return new Buffer(val, 'hex')
// }

// describe('Colored-Coins transfer Decoding', function () {
//   it('should return the right decoding', function (done) {
//     this.timeout(0)
//     var torrentHash = new Buffer(20)
//     torrentHash.fill(0)
//     torrentHash[3] = 0x23
//     torrentHash[4] = 0x2f
//     torrentHash[2] = 0xd3
//     torrentHash[12] = 0xe3
//     torrentHash[19] = 0xa3
//     torrentHash[11] = 0x21
//     var sha2 = new Buffer(32)
//     sha2.fill(0)
//     sha2[0] = 0xf3
//     sha2[1] = 0x2f
//     sha2[12] = 0x23
//     sha2[16] = 0xf3
//     sha2[30] = 0x2f
//     sha2[21] = 0x23
//     sha2[11] = 0x2f
//     var ipfsHash = new Buffer('1220f1e820d85d82f6d7493b5e4446a1b9c0a4e0321885f1e47293fd6c081affaedf', 'hex')
//     var data = {
//       protocol: 0x0302, // Error when start with 0
//       version: 0x03
//     }

//     data.sha2 = sha2
//     data.torrentHash = torrentHash

//     data.payments = []
//     data.payments.push({skip: false, range: false, percent: true, output: 12, amount: 3213213})
//     var result = transferEncoder.encode(data, 40)
//     // console.log(result.codeBuffer.toString('hex'), result.leftover)
//     // console.log(transferEncoder.decode(result.codeBuffer))

//     data.payments.push({skip: false, range: false, percent: true, output: 1, amount: 321321321})
//     result = transferEncoder.encode(data, 40)
//     // console.log(result.codeBuffer.toString('hex'), result.leftover)
//     // console.log(transferEncoder.decode(result.codeBuffer))

//     data.payments.push({skip: true, range: true, percent: true, output: 10, amount: 1})
//     result = transferEncoder.encode(data, 40)
//     // console.log(result.codeBuffer.toString('hex'), result.leftover)
//     // console.log(transferEncoder.decode(result.codeBuffer))

//     data.payments.push({skip: false, range: false, percent: true, output: 20, amount: 100000021000})
//     result = transferEncoder.encode(data, 40)
//     // console.log(result.codeBuffer.toString('hex'), result.leftover)
//     // console.log(transferEncoder.decode(result.codeBuffer))

//     data.payments.push({skip: false, range: false, percent: false, output: 0, amount: 1})
//     data.payments.push({skip: false, range: false, percent: false, output: 1, amount: 2})
//     data.payments.push({skip: true, range: false, percent: false, output: 2, amount: 3})
//     data.payments.push({skip: false, range: false, percent: false, output: 3, amount: 4})
//     data.payments.push({skip: true, range: false, percent: false, output: 4, amount: 5})
//     data.payments.push({skip: false, range: false, percent: false, output: 5, amount: 6})

//     result = transferEncoder.encode(data, 40)
//     // console.log(result.codeBuffer.toString('hex'), result.leftover)
//     // console.log(transferEncoder.decode(result.codeBuffer))

//     // check throws when pushing burn to a default transfer transaction
//     assert.throws(function () {
//       data.payments.push({skip: false, percent: false, amount: 7, burn: true})
//       transferEncoder.encode(data, 40)
//     }, /Needs output value/,
//     'Should Throw Error')

//     // now no error
//     data.type = 'burn'
//     result = transferEncoder.encode(data, 40)

//     delete data.allowMeta
//     data.payments = []
//     data.payments.push({skip: false, range: false, percent: true, output: 12, amount: 3213213})
//     result = transferEncoder.encode(data, 40)
//     // console.log(result.codeBuffer.toString('hex'), result.leftover)
//     // console.log(transferEncoder.decode(result.codeBuffer))
//     done()
//   })
// })

// describe('80 byte OP_RETURN', function () {
//   var code
//   var decoded
//   var torrentHash = new Buffer('46b7e0d000d69330ac1caa48c6559763828762e1', 'hex')
//   var sha2 = new Buffer('03ffdf3d6790a21c5fc97a62fe1abc5f66922d7dee3725261ce02e86f078d190', 'hex')
//   var data = {
//     protocol: 0x5441,
//     version: 0x03,
//     payments: []
//   }
//   data.payments.push({skip: false, range: false, percent: false, output: 1, amount: 31})

//   it('Transfer OP_CODE 0x15 - No Metadata', function (done) {
//     this.timeout(0)

//     code = transferEncoder.encode(data, 80)

//     // console.log(code.codeBuffer.toString('hex'), code.leftover)
//     var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
//     assert.deepEqual(toBuffer('5441'), consume(2))
//     assert.deepEqual(toBuffer('03'), consume(1))  //version
//     assert.deepEqual(toBuffer('15'), consume(1))  //trasnfer OP_CODE
//     assert.deepEqual(toBuffer('011f'), consume(2))  //payments

//     decoded = transferEncoder.decode(code.codeBuffer)
//     // console.log(decoded)

//     assert.equal(decoded.protocol, data.protocol)
//     assert.deepEqual(decoded.payments, data.payments)
//     assert.deepEqual(decoded.multiSig, code.leftover)
//     done()
//   })

//   it('Transfer OP_CODE 0x14 - SHA1 Torrent hash in OP_RETURN, no SHA256 of metadata, no rules in metadata', function (done) {
//     this.timeout(0)

//     data.torrentHash = torrentHash
//     data.noRules = true

//     code = transferEncoder.encode(data, 80)

//     // console.log(code.codeBuffer.toString('hex'), code.leftover)
//     var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
//     assert.deepEqual(toBuffer('5441'), consume(2))
//     assert.deepEqual(toBuffer('03'), consume(1))  //version
//     assert.deepEqual(toBuffer('14'), consume(1))  //trasnfer OP_CODE
//     assert.deepEqual(toBuffer('46b7e0d000d69330ac1caa48c6559763828762e1'), consume(20))   //torrent hash
//     assert.deepEqual(toBuffer('011f'), consume(2))  //payments

//     decoded = transferEncoder.decode(code.codeBuffer)
//     // console.log(decoded)

//     assert.equal(decoded.protocol, data.protocol)
//     assert.deepEqual(decoded.payments, data.payments)
//     assert.deepEqual(decoded.multiSig, code.leftover)
//     assert.deepEqual(decoded.torrentHash, torrentHash)
//     done()
//   })

//   it('Transfer OP_CODE 0x13 - SHA1 Torrent hash in OP_RETURN, no SHA256 of metadata', function (done) {
//     this.timeout(0)

//     data.torrentHash = torrentHash
//     delete data.noRules

//     code = transferEncoder.encode(data, 80)

//     // console.log(code.codeBuffer.toString('hex'), code.leftover)
//     var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
//     assert.deepEqual(toBuffer('5441'), consume(2))
//     assert.deepEqual(toBuffer('03'), consume(1))  //version
//     assert.deepEqual(toBuffer('13'), consume(1))  //trasnfer OP_CODE
//     assert.deepEqual(toBuffer('46b7e0d000d69330ac1caa48c6559763828762e1'), consume(20))   //torrent hash
//     assert.deepEqual(toBuffer('011f'), consume(2))  //payments

//     decoded = transferEncoder.decode(code.codeBuffer)
//     // console.log(decoded)

//     assert.equal(decoded.protocol, data.protocol)
//     assert.deepEqual(decoded.payments, data.payments)
//     assert.deepEqual(decoded.multiSig, code.leftover)
//     assert.deepEqual(decoded.torrentHash, torrentHash)
//     done()
//   })

//   it('Transfer OP_CODE 0x10 - SHA1 Torrent hash + SHA256 of metadata in OP_RETURN', function (done) {
//     this.timeout(0)

//     //pushing payments to the limit.
//     data.payments = []
//     for (var i = 0 ; i < 12 ; i++) {
//       data.payments.push({skip: false, range: false, percent: false, output: 1, amount: 1})
//     }

//     data.torrentHash = torrentHash
//     data.sha2 = sha2

//     code = transferEncoder.encode(data, 80)

//     // console.log(code.codeBuffer.toString('hex'), code.leftover)
//     var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
//     assert.deepEqual(toBuffer('5441'), consume(2))
//     assert.deepEqual(toBuffer('03'), consume(1))  //version
//     assert.deepEqual(toBuffer('10'), consume(1))  //trasnfer OP_CODE
//     assert.deepEqual(toBuffer('46b7e0d000d69330ac1caa48c6559763828762e1'), consume(20))   //torrent hash
//     assert.deepEqual(toBuffer('03ffdf3d6790a21c5fc97a62fe1abc5f66922d7dee3725261ce02e86f078d190'), consume(32))   //metadata sha2
//     for (var i = 0 ; i < data.payments.length ; i++) {
//       assert.deepEqual(toBuffer('0101'), consume(2))    //payment
//     }

//     decoded = transferEncoder.decode(code.codeBuffer)
//     // console.log(decoded)

//     assert.equal(decoded.protocol, data.protocol)
//     assert.deepEqual(decoded.payments, data.payments)
//     assert.deepEqual(decoded.multiSig, code.leftover)
//     assert.deepEqual(decoded.torrentHash, torrentHash)
//     assert.deepEqual(decoded.sha2, sha2)
//     done()
//   })

//   it('Transfer OP_CODE 0x11 - SHA1 Torrent hash in OP_RETURN, SHA256 in 1(2) multisig', function (done) {
//     this.timeout(0)

//     //1 more transfer instruction (2 bytes in this case) should push torrent hash out
//     data.payments.push({skip: false, range: false, percent: false, output: 1, amount: 1})

//     code = transferEncoder.encode(data, 80)

//     // console.log(code.codeBuffer.toString('hex'), code.leftover)
//     var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
//     assert.deepEqual(toBuffer('5441'), consume(2))
//     assert.deepEqual(toBuffer('03'), consume(1))  //version
//     assert.deepEqual(toBuffer('11'), consume(1))  //trasnfer OP_CODE
//     assert.deepEqual(toBuffer('46b7e0d000d69330ac1caa48c6559763828762e1'), consume(20))   //torrent hash
//     assert.deepEqual(toBuffer('0101'), consume(2))  //payments

//     decoded = transferEncoder.decode(code.codeBuffer)
//     // console.log(decoded)

//     assert.equal(decoded.protocol, data.protocol)
//     assert.deepEqual(decoded.payments, data.payments)
//     assert.equal(decoded.multiSig.length, 1)
//     assert.equal(decoded.multiSig.length, code.leftover.length)
//     assert.deepEqual(decoded.multiSig[0], { hashType: 'sha2', index: 1 })
//     assert.deepEqual(code.leftover[0], sha2)
//     assert.deepEqual(decoded.torrentHash, torrentHash)
//     done()
//   })

//   it('Transfer OP_CODE 0x12 - SHA1 Torrent hash + SHA256 in 1(3) multisig', function (done) {
//     this.timeout(0)

//     //32 more bytes (16 of 2 bytes each in this case) should push torrent hash out
//     for (var i = 0 ; i < 16 ; i++) {
//       data.payments.push({skip: false, range: false, percent: false, output: 1, amount: 1})
//     }

//     code = transferEncoder.encode(data, 80)

//     // console.log(code.codeBuffer.toString('hex'), code.leftover)
//     var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
//     assert.deepEqual(toBuffer('5441'), consume(2))
//     assert.deepEqual(toBuffer('03'), consume(1))  //version
//     assert.deepEqual(toBuffer('12'), consume(1))  //trasnfer OP_CODE
//     for (var i = 0 ; i < data.payments.length ; i++) {
//       assert.deepEqual(toBuffer('0101'), consume(2))    //payment
//     }

//     decoded = transferEncoder.decode(code.codeBuffer)
//     // console.log(decoded)

//     assert.equal(decoded.protocol, data.protocol)
//     assert.deepEqual(decoded.payments, data.payments)
//     assert.equal(decoded.multiSig.length, 2)
//     assert.equal(decoded.multiSig.length, code.leftover.length)
//     assert.deepEqual(decoded.multiSig[0], { hashType: 'sha2', index: 1 })
//     assert.deepEqual(decoded.multiSig[1], { hashType: 'torrentHash', index: 2 })
//     assert.deepEqual(code.leftover[1], sha2)
//     assert.deepEqual(code.leftover[0], torrentHash)
//     done()
//   })

//   it('Transfer OP_CODE 0x16 - IPFS hash of metadata in OP_RETURN', function (done) {
//     this.timeout(0)

//     var ipfsHash = new Buffer('1220f1e820d85d82f6d7493b5e4446a1b9c0a4e0321885f1e47293fd6c081affaedf', 'hex')

//     //pushing payments to the limit.
//     data.payments = []
//     for (var i = 0 ; i < 12 ; i++) {
//       data.payments.push({skip: false, range: false, percent: false, output: 1, amount: 1})
//     }

//     data.ipfsHash = ipfsHash

//     code = transferEncoder.encode(data, 80)

//     // console.log(code.codeBuffer.toString('hex'), code.leftover)
//     var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
//     assert.deepEqual(toBuffer('5441'), consume(2))
//     assert.deepEqual(toBuffer('03'), consume(1))  //version
//     assert.deepEqual(toBuffer('16'), consume(1))  //trasnfer OP_CODE
//     assert.deepEqual(toBuffer('1220f1e820d85d82f6d7493b5e4446a1b9c0a4e0321885f1e47293fd6c081affaedf'), consume(34))   //ipfs hash
//     for (var i = 0 ; i < data.payments.length ; i++) {
//       assert.deepEqual(toBuffer('0101'), consume(2))    //payment
//     }

//     decoded = transferEncoder.decode(code.codeBuffer)
//     // console.log(decoded)

//     assert.equal(decoded.protocol, data.protocol)
//     assert.deepEqual(decoded.payments, data.payments)
//     assert.deepEqual(decoded.multiSig, code.leftover)
//     assert.deepEqual(decoded.ipfsHash, ipfsHash)
//     done()
//   })

//   it('Transfer OP_CODE 0x17 - IPFS hash of metadata in pay-to-script', function (done) {
//     this.timeout(0)

//     var ipfsHash = new Buffer('1220f1e820d85d82f6d7493b5e4446a1b9c0a4e0321885f1e47293fd6c081affaedf', 'hex')

//     //pushing payments to the limit.
//     data.payments = []
//     for (var i = 0 ; i < 35 ; i++) {
//       data.payments.push({skip: false, range: false, percent: false, output: 1, amount: 1})
//     }

//     data.ipfsHash = ipfsHash

//     code = transferEncoder.encode(data, 80)

//     // console.log(code.codeBuffer.toString('hex'), code.leftover)
//     var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
//     assert.deepEqual(toBuffer('5441'), consume(2))
//     assert.deepEqual(toBuffer('03'), consume(1))  //version
//     assert.deepEqual(toBuffer('17'), consume(1))  //trasnfer OP_CODE
//     for (var i = 0 ; i < data.payments.length ; i++) {
//       assert.deepEqual(toBuffer('0101'), consume(2))    //payment
//     }

//     decoded = transferEncoder.decode(code.codeBuffer)
//     // console.log(decoded)

//     assert.equal(decoded.protocol, data.protocol)
//     assert.deepEqual(decoded.payments, data.payments)
//     assert.equal(decoded.multiSig.length, 1)
//     assert.equal(decoded.multiSig.length, code.leftover.length)
//     assert.deepEqual(decoded.multiSig[0], { hashType: 'ipfsHash', index: 1 })
//     assert.deepEqual(code.leftover[0], ipfsHash)
//     done()
//   })
// })
