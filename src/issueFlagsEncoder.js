const aggregationPolicies = ['aggregatable', 'hybrid', 'dispersed']

const padLeadingZeros = function (hex, byteSize) {
  return (
    (hex.length === byteSize * 2 && hex) || padLeadingZeros('0' + hex, byteSize)
  )
}

module.exports = {
  encode: function (flags) {
    let divisibility = flags.divisibility || 0
    const lockStatus = flags.lockStatus || false
    let aggregationPolicy = flags.aggregationPolicy || aggregationPolicies[0]
    if (divisibility < 0 || divisibility > 15) {
      throw new Error('Divisibility not in range')
    }
    if (
      (aggregationPolicy = aggregationPolicies.indexOf(aggregationPolicy)) < 0
    ) {
      throw new Error('Invalid aggregation policy')
    }
    if (aggregationPolicy === 2) divisibility = 0
    let result = divisibility << 1
    let lockStatusFlag = 0
    lockStatus && (lockStatusFlag = 1)
    result = result | lockStatusFlag
    result = result << 2
    result = result | aggregationPolicy
    result = result << 1
    result = padLeadingZeros(result.toString(16), 1)
    return Buffer.from(result, 'hex')
  },

  decode: function (consume) {
    let number = consume(1)[0]
    number = number >> 1 // least significant 1 bits unused
    const aggregationPolicy = aggregationPolicies[number & 0x3]
    number = number >> 2
    const lockStatus = !!(number & 1)
    number = number >> 1
    const divisibility = number
    return {
      divisibility: divisibility,
      lockStatus: lockStatus,
      aggregationPolicy: aggregationPolicy,
    }
  },
}
