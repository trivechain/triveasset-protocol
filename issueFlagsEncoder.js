var aggregationPolicies = [
  'aggregatable',
  'hybrid',
  'dispersed'
]

var padLeadingZeros = function (hex, byteSize) {
  return (hex.length === byteSize * 2) && hex || padLeadingZeros('0' + hex, byteSize)
}

module.exports = {
  encode: function (flags) {
    var divisibility = flags.divisibility || 0
    var lockStatus = flags.lockStatus || false
    var aggregationPolicy = flags.aggregationPolicy || aggregationPolicies[0]
    if (divisibility < 0 || divisibility > 15) throw new Error('Divisibility not in range')
    if ((aggregationPolicy = aggregationPolicies.indexOf(aggregationPolicy)) < 0) throw new Error('Invalid aggregation policy')
    var result = divisibility << 1
    var lockStatusFlag = 0
    lockStatus && (lockStatusFlag = 1)
    result = result | lockStatusFlag
    result = result << 2
    result = result | aggregationPolicy
    result = result << 1
    result = padLeadingZeros(result.toString(16), 1)
    return new Buffer(result, 'hex')
  },

  decode: function (consume) {
    var number = consume(1)[0]
    number = number >> 1  // least significant 1 bits unused
    var aggregationPolicy = aggregationPolicies[number & 0x3]
    number = number >> 2
    var lockStatus = !!(number & 1)
    number = number >> 1
    var divisibility = (number)
    return {divisibility: divisibility, lockStatus: lockStatus, aggregationPolicy: aggregationPolicy}
  }
}
