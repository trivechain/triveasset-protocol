var assetIdencoder = require('./assetIdEncoder')
var debug = require('debug')('getAssetsOutputs')
var _ = require('lodash')

module.exports = function (rawTransaction) {
  var transactionData = JSON.parse(JSON.stringify(rawTransaction))
  var ccdata = transactionData.ccdata[0]
  var assets = []
  if (ccdata.type === 'issuance') {
    transactionData.vin[0].assets = transactionData.vin[0].assets || []
    transactionData.vin[0].assets.unshift({
      assetId: assetIdencoder(transactionData),
      amount: ccdata.amount,
      issueTxid: transactionData.txid,
      divisibility: ccdata.divisibility,
      lockStatus: ccdata.lockStatus,
      aggregationPolicy: ccdata.aggregationPolicy,
    })
  }

  var payments = ccdata.payments
  var overflow = !transfer(assets, payments, transactionData)
  if (overflow) {
    // transfer failed. transfer all assets in inputs to last output, aggregate those possible
    assets.length = 0
    transferToLastOutput(
      assets,
      transactionData.vin,
      transactionData.vout.length - 1
    )
  }

  rawTransaction.overflow = overflow

  return assets
}

// returns true if succeeds to apply payments to the given assets array, false if runs into an invalid payment
function transfer(assets, payments, transactionData) {
  debug('transfer')
  var _payments = _.cloneDeep(payments)
  var _inputs = _.cloneDeep(transactionData.vin)
  var currentInputIndex = 0
  var currentAssetIndex = 0
  var payment
  var currentAsset
  var currentAmount
  var lastPaymentIndex // aggregate only if paying the same payment
  for (var i = 0; i < _payments.length; i++) {
    payment = _payments[i]
    debug('payment = ', payment)
    if (!isPaymentSimple(payment)) {
      return false
    }

    if (payment.input >= transactionData.vin.length) {
      return false
    }

    if (payment.output >= transactionData.vout.length) {
      return false
    }

    if (!payment.amount) {
      debug('payment.amount === 0 before paying it, continue')
      continue
    }

    if (currentInputIndex < payment.input) {
      currentInputIndex = payment.input
      currentAssetIndex = 0
    }

    if (
      currentInputIndex >= _inputs.length ||
      !_inputs[currentInputIndex].assets ||
      currentAssetIndex >= _inputs[currentInputIndex].assets.length ||
      !_inputs[currentInputIndex].assets[currentAssetIndex]
    ) {
      debug(
        'no asset in input #' +
          currentInputIndex +
          ' asset #' +
          currentAssetIndex +
          ', overflow'
      )
      return false
    }

    currentAsset = _inputs[currentInputIndex].assets[currentAssetIndex]
    currentAmount = Math.min(payment.amount, currentAsset.amount)
    debug(
      'paying ' +
        currentAmount +
        ' ' +
        currentAsset.assetId +
        ' from input #' +
        currentInputIndex +
        ' asset #' +
        currentAssetIndex +
        ' to output #' +
        payment.output
    )

    if (!payment.burn) {
      assets[payment.output] = assets[payment.output] || []
      debug('assets[' + payment.output + '] = ', assets[payment.output])
      if (lastPaymentIndex === i) {
        if (
          !assets[payment.output].length ||
          assets[payment.output][assets[payment.output].length - 1].assetId !==
            currentAsset.assetId ||
          currentAsset.aggregationPolicy !== 'aggregatable'
        ) {
          debug('tried to pay same payment with a separate asset, overflow')
          return false
        }
        debug(
          'aggregating ' +
            currentAmount +
            ' of asset ' +
            currentAsset.assetId +
            ' from input #' +
            currentInputIndex +
            ' asset #' +
            currentAssetIndex +
            ' to output #' +
            payment.output
        )
        assets[payment.output][
          assets[payment.output].length - 1
        ].amount += currentAmount
      } else {
        assets[payment.output].push({
          assetId: currentAsset.assetId,
          amount: currentAmount,
          issueTxid: currentAsset.issueTxid,
          divisibility: currentAsset.divisibility,
          lockStatus: currentAsset.lockStatus,
          aggregationPolicy: currentAsset.aggregationPolicy,
        })
      }
    }
    currentAsset.amount -= currentAmount
    payment.amount -= currentAmount
    if (currentAsset.amount === 0) {
      currentAssetIndex++
      while (
        currentInputIndex < _inputs.length &&
        currentAssetIndex > _inputs[currentInputIndex].assets.length - 1
      ) {
        currentAssetIndex = 0
        currentInputIndex++
      }
    }

    debug('input #' + currentInputIndex + ', asset # ' + currentAssetIndex)

    lastPaymentIndex = i
    if (payment.amount) {
      debug('payment not completed, stay on current payment')
      i--
    }
  }

  // finished paying explicit payments, transfer all assets with remaining amount from inputs to last output. aggregate if possible.
  transferToLastOutput(assets, _inputs, transactionData.vout.length - 1)

  return true
}

// transfer all positive amount assets from inputs to last output. aggregate if possible.
function transferToLastOutput(assets, inputs, lastOutputIndex) {
  var assetsToTransfer = []
  inputs.forEach(function (input) {
    assetsToTransfer = _.concat(assetsToTransfer, input.assets)
  })
  var assetsIndexes = {}
  var lastOutputAssets = []
  assetsToTransfer.forEach(function (asset, index) {
    if (
      asset.aggregationPolicy === 'aggregatable' &&
      typeof assetsIndexes[asset.assetId] !== 'undefined'
    ) {
      lastOutputAssets[assetsIndexes[asset.assetId]].amount += asset.amount
    } else if (asset.amount > 0) {
      if (typeof assetsIndexes[asset.assetId] === 'undefined') {
        assetsIndexes[asset.assetId] = lastOutputAssets.length
      }
      lastOutputAssets.push({
        assetId: asset.assetId,
        amount: asset.amount,
        issueTxid: asset.issueTxid,
        divisibility: asset.divisibility,
        lockStatus: asset.lockStatus,
        aggregationPolicy: asset.aggregationPolicy,
      })
    }
  })

  assets[lastOutputIndex] = _.concat(
    assets[lastOutputIndex] || [],
    lastOutputAssets
  )
}

function isPaymentSimple(payment) {
  return !payment.range && !payment.percent
}
