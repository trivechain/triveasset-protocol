const sffc = require('sffc-encoder')
const issueFlagsCodex = require('./issueFlagsEncoder.js')
const paymentCodex = require('./paymentEncoder.js')

const OP_CODES = [
  Buffer.from([0x00]), // wild-card to be defined
  Buffer.from([0x01]), // All Hashes in OP_RETURN - Pay-to-PubkeyHash
  Buffer.from([0x02]), // SHA2 in Pay-to-Script-Hash multi-sig output (1 out of 2)
  Buffer.from([0x03]), // All Hashes in Pay-to-Script-Hash multi-sig outputs (1 out of 3)
  Buffer.from([0x04]), // Low security issue no SHA2 for torrent data. SHA1 is always inside OP_RETURN in this case.
  Buffer.from([0x05]), // No rules, no torrent, no meta data ( no one may add rules in the future, anyone can add metadata )
  Buffer.from([0x06]), // No meta data (anyone can add rules and/or metadata  in the future)
  Buffer.from([0x07]), // All Hashes with IPFS in OP_RETURN - Pay-to-PubkeyHash
  Buffer.from([0x08]), // IPFS Hash in Pay-to-Script-Hash multi-sig output (1 out of 2)
]

const consumer = function (buff) {
  let curr = 0
  return function consume(len) {
    return buff.slice(curr, (curr += len))
  }
}

const padLeadingZeros = function (hex, byteSize) {
  return hex.length === byteSize * 2
    ? hex
    : padLeadingZeros('0' + hex, byteSize)
}

const decodeAmountByVersion = function (version, consume, divisibility) {
  const decodedAmount = sffc.decode(consume)
  return version === 0x01
    ? decodedAmount / Math.pow(10, divisibility)
    : decodedAmount
}

module.exports = {
  encode: function (data, byteSize) {
    if (!data) throw new Error('Missing Data')
    if (typeof data.amount === 'undefined') throw new Error('Missing amount')
    if (typeof data.lockStatus === 'undefined') {
      throw new Error('Missing lockStatus')
    }
    if (typeof data.divisibility === 'undefined') {
      throw new Error('Missing divisibility')
    }
    if (typeof data.aggregationPolicy === 'undefined') {
      throw new Error('Missing aggregationPolicy')
    }
    if (typeof data.protocol === 'undefined') {
      throw new Error('Missing protocol')
    }
    if (typeof data.version === 'undefined') throw new Error('Missing version')
    let opcode
    let hash = Buffer.alloc(0)
    const protocol = Buffer.from(
      padLeadingZeros(data.protocol.toString(16), 2),
      'hex'
    )
    const version = Buffer.from([data.version])
    const issueHeader = Buffer.concat([protocol, version])
    const amount = sffc.encode(data.amount)
    let payments = Buffer.alloc(0)
    if (data.payments) payments = paymentCodex.encodeBulk(data.payments)
    const issueFlagsByte = issueFlagsCodex.encode({
      divisibility: data.divisibility,
      lockStatus: data.lockStatus,
      aggregationPolicy: data.aggregationPolicy,
    })
    const issueTail = Buffer.concat([amount, payments, issueFlagsByte])
    let issueByteSize = issueHeader.length + issueTail.length + 1

    if (issueByteSize > byteSize) {
      throw new Error('Data code is bigger then the allowed byte size')
    }

    let leftover = []
    if (data.ipfsHash) {
      leftover = [data.ipfsHash]

      opcode = OP_CODES[8]
      issueByteSize = issueByteSize + data.ipfsHash.length

      if (issueByteSize <= byteSize) {
        hash = Buffer.concat([hash, leftover.shift()])
        opcode = OP_CODES[7]
      }

      return {
        codeBuffer: Buffer.concat([issueHeader, opcode, hash, issueTail]),
        leftover: leftover,
      }
    }

    if (!data.sha2) {
      if (data.torrentHash) {
        if (issueByteSize + data.torrentHash.length > byteSize) {
          throw new Error("Can't fit Torrent Hash in byte size")
        }
        return {
          codeBuffer: Buffer.concat([
            issueHeader,
            OP_CODES[4],
            data.torrentHash,
            issueTail,
          ]),
          leftover: [],
        }
      }
      opcode = data.noRules ? OP_CODES[5] : OP_CODES[6]
      return {
        codeBuffer: Buffer.concat([issueHeader, opcode, hash, issueTail]),
        leftover: [],
      }
    }

    if (!data.torrentHash) {
      throw new Error('Torrent Hash is missing')
    } else {
      leftover = [data.torrentHash, data.sha2]

      opcode = OP_CODES[3]
      issueByteSize = issueByteSize + data.torrentHash.length

      if (issueByteSize <= byteSize) {
        hash = Buffer.concat([hash, leftover.shift()])
        opcode = OP_CODES[2]
        issueByteSize = issueByteSize + data.sha2.length
      }
      if (issueByteSize <= byteSize) {
        hash = Buffer.concat([hash, leftover.shift()])
        opcode = OP_CODES[1]
      }
    }

    return {
      codeBuffer: Buffer.concat([issueHeader, opcode, hash, issueTail]),
      leftover: leftover,
    }
  },

  decode: function (opCodeBuffer) {
    const data = {}
    if (!Buffer.isBuffer(opCodeBuffer)) {
      opCodeBuffer = Buffer.from(opCodeBuffer, 'hex')
    }
    const byteSize = opCodeBuffer.length
    const lastByte = opCodeBuffer.slice(-1)
    const issueTail = issueFlagsCodex.decode(consumer(lastByte))
    data.divisibility = issueTail.divisibility
    data.lockStatus = issueTail.lockStatus
    data.aggregationPolicy = issueTail.aggregationPolicy
    const consume = consumer(opCodeBuffer.slice(0, byteSize - 1))
    data.protocol = parseInt(consume(2).toString('hex'), 16)
    data.version = parseInt(consume(1).toString('hex'), 16)
    data.multiSig = []
    const opcode = consume(1)
    if (opcode[0] === OP_CODES[1][0]) {
      data.torrentHash = consume(20)
      data.sha2 = consume(32)
    } else if (opcode[0] === OP_CODES[2][0]) {
      data.torrentHash = consume(20)
      data.multiSig.push({ index: 1, hashType: 'sha2' })
    } else if (opcode[0] === OP_CODES[3][0]) {
      data.multiSig.push({ index: 1, hashType: 'sha2' })
      data.multiSig.push({ index: 2, hashType: 'torrentHash' })
    } else if (opcode[0] === OP_CODES[4][0]) {
      data.torrentHash = consume(20)
    } else if (opcode[0] === OP_CODES[5][0]) {
      data.noRules = true
    } else if (opcode[0] === OP_CODES[6][0]) {
      data.noRules = false
    } else if (opcode[0] === OP_CODES[7][0]) {
      data.ipfsHash = consume(34)
    } else if (opcode[0] === OP_CODES[8][0]) {
      data.multiSig.push({ index: 1, hashType: 'ipfsHash' })
    } else {
      throw new Error('Unrecognized Code')
    }

    data.amount = decodeAmountByVersion(
      data.version,
      consume,
      data.divisibility
    )
    data.payments = paymentCodex.decodeBulk(consume)

    return data
  },
}
