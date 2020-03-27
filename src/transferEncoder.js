var TYPE_MASK = 0xf0
var TRANSFER_MASK = 0x10
var BURN_MASK = 0x20
var TRANSFER_OP_CODES = [
  Buffer.from([0x10]), // All Hashes in OP_RETURN
  Buffer.from([0x11]), // SHA2 in Pay-to-Script-Hash multi-sig output (1 out of 2)
  Buffer.from([0x12]), // All Hashes in Pay-to-Script-Hash multi-sig outputs (1 out of 3)
  Buffer.from([0x13]), // Low security transaction no SHA2 for torrent data. SHA1 is always inside OP_RETURN in this case.
  Buffer.from([0x14]), // Low security transaction no SHA2 for torrent data. SHA1 is always inside OP_RETURN in this case. also no rules inside the metadata (if there are any they will be in ignored)
  Buffer.from([0x15]), // No metadata or rules (no SHA1 or SHA2)
  Buffer.from([0x16]), // All Hashes with IPFS in OP_RETURN
  Buffer.from([0x17]), // IPFS Hashes in Pay-to-Script-Hash multi-sig output (1 out of 2)
]
var BURN_OP_CODES = [
  Buffer.from([0x20]), // All Hashes in OP_RETURN
  Buffer.from([0x21]), // SHA2 in Pay-to-Script-Hash multi-sig output (1 out of 2)
  Buffer.from([0x22]), // All Hashes in Pay-to-Script-Hash multi-sig outputs (1 out of 3)
  Buffer.from([0x23]), // Low security transaction no SHA2 for torrent data. SHA1 is always inside OP_RETURN in this case.
  Buffer.from([0x24]), // Low security transaction no SHA2 for torrent data. SHA1 is always inside OP_RETURN in this case. also no rules inside the metadata (if there are any they will be in ignored)
  Buffer.from([0x25]), // No metadata or rules (no SHA1 or SHA2)
  Buffer.from([0x26]), // All Hashes with IPFS in OP_RETURN
  Buffer.from([0x27]), // IPFS Hashes in Pay-to-Script-Hash multi-sig output (1 out of 2)
]

var transferPaymentEncoder = require('./paymentEncoder')
var burnPaymentEncoder = require('./burnPaymentEncoder')

var consumer = function (buff) {
  var curr = 0
  return function consume(len) {
    return buff.slice(curr, (curr += len))
  }
}

var padLeadingZeros = function (hex, byteSize) {
  return hex.length === byteSize * 2
    ? hex
    : padLeadingZeros('0' + hex, byteSize)
}

module.exports = {
  encode: function (data, byteSize) {
    if (!data || typeof data.payments === 'undefined') {
      throw new Error('Missing Data')
    }
    var opcode
    var OP_CODES = data.type === 'burn' ? BURN_OP_CODES : TRANSFER_OP_CODES
    var paymentEncoder =
      data.type === 'burn' ? burnPaymentEncoder : transferPaymentEncoder
    var hash = Buffer.from(0)
    var protocol = Buffer.from(
      padLeadingZeros(data.protocol.toString(16), 2),
      'hex'
    )
    var version = Buffer.from([data.version])
    var transferHeader = Buffer.concat([protocol, version])
    var payments = paymentEncoder.encodeBulk(data.payments)
    var issueByteSize = transferHeader.length + payments.length + 1

    if (issueByteSize > byteSize) {
      throw new Error('Data code is bigger then the allowed byte size')
    }
    var leftover = []
    if (data.ipfsHash) {
      leftover = [data.ipfsHash]

      opcode = OP_CODES[7]
      issueByteSize = issueByteSize + data.ipfsHash.length

      if (issueByteSize <= byteSize) {
        hash = Buffer.concat([hash, leftover.shift()])
        opcode = OP_CODES[6]
      }

      return {
        codeBuffer: Buffer.concat([transferHeader, opcode, hash, payments]),
        leftover: leftover,
      }
    }
    if (!data.sha2) {
      if (data.torrentHash) {
        opcode = data.noRules ? OP_CODES[4] : OP_CODES[3]
        if (issueByteSize + data.torrentHash.length > byteSize) {
          throw new Error("Can't fit Torrent Hash in byte size")
        }
        return {
          codeBuffer: Buffer.concat([
            transferHeader,
            opcode,
            data.torrentHash,
            payments,
          ]),
          leftover: [],
        }
      }
      return {
        codeBuffer: Buffer.concat([
          transferHeader,
          OP_CODES[5],
          hash,
          payments,
        ]),
        leftover: [],
      }
    }
    if (!data.torrentHash) throw new Error('Torrent Hash is missing')
    leftover = [data.torrentHash, data.sha2]

    opcode = OP_CODES[2]
    issueByteSize = issueByteSize + data.torrentHash.length

    if (issueByteSize <= byteSize) {
      hash = Buffer.concat([hash, leftover.shift()])
      opcode = OP_CODES[1]
      issueByteSize = issueByteSize + data.sha2.length
    }
    if (issueByteSize <= byteSize) {
      hash = Buffer.concat([hash, leftover.shift()])
      opcode = OP_CODES[0]
    }

    return {
      codeBuffer: Buffer.concat([transferHeader, opcode, hash, payments]),
      leftover: leftover,
    }
  },

  decode: function (opCodeBuffer) {
    var data = {}
    var consume = consumer(opCodeBuffer)
    data.protocol = parseInt(consume(2).toString('hex'), 16)
    data.version = parseInt(consume(1).toString('hex'), 16)
    data.multiSig = []
    var opcode = consume(1)
    var paymentEncoder
    if ((opcode[0] & TYPE_MASK) === TRANSFER_MASK) {
      paymentEncoder = transferPaymentEncoder
    } else if ((opcode[0] & TYPE_MASK) === BURN_MASK) {
      paymentEncoder = burnPaymentEncoder
    } else {
      throw new Error('Unrecognized Code')
    }

    if (
      opcode[0] === TRANSFER_OP_CODES[0][0] ||
      opcode[0] === BURN_OP_CODES[0][0]
    ) {
      data.torrentHash = consume(20)
      data.sha2 = consume(32)
    } else if (
      opcode[0] === TRANSFER_OP_CODES[1][0] ||
      opcode[0] === BURN_OP_CODES[1][0]
    ) {
      data.torrentHash = consume(20)
      data.multiSig.push({ index: 1, hashType: 'sha2' })
    } else if (
      opcode[0] === TRANSFER_OP_CODES[2][0] ||
      opcode[0] === BURN_OP_CODES[2][0]
    ) {
      data.multiSig.push({ index: 1, hashType: 'sha2' })
      data.multiSig.push({ index: 2, hashType: 'torrentHash' })
    } else if (
      opcode[0] === TRANSFER_OP_CODES[3][0] ||
      opcode[0] === BURN_OP_CODES[3][0]
    ) {
      data.torrentHash = consume(20)
      data.noRules = false
    } else if (
      opcode[0] === TRANSFER_OP_CODES[4][0] ||
      opcode[0] === BURN_OP_CODES[4][0]
    ) {
      data.torrentHash = consume(20)
      data.noRules = true
    } else if (
      opcode[0] === TRANSFER_OP_CODES[5][0] ||
      opcode[0] === BURN_OP_CODES[5][0]
    ) {
    } else if (
      opcode[0] === TRANSFER_OP_CODES[6][0] ||
      opcode[0] === BURN_OP_CODES[6][0]
    ) {
      data.ipfsHash = consume(34)
    } else if (
      opcode[0] === TRANSFER_OP_CODES[7][0] ||
      opcode[0] === BURN_OP_CODES[7][0]
    ) {
      data.multiSig.push({ index: 1, hashType: 'ipfsHash' })
    } else {
      throw new Error('Unrecognized Code')
    }
    data.payments = paymentEncoder.decodeBulk(consume)

    return data
  },
}
