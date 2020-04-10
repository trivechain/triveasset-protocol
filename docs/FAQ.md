In this section we provide answers to some frequently asked questions about the colored coins protocol.

# Colored Micropayment Channels?
A [Micropayment channel](https://bitcoin.org/en/developer-guide#micropayment-channel) is a mechanism that allows two parties to be engaged in a contract that gets updated every so often without continuously transmitting (relatively) costly transactions to the Bitcoin network. Micropayment channels are established using a deposit to a [2 of 2 multisignature](Coloring%20Scheme#multisignature-addresses-multisig) address (and making use of the the Bitcoin [NLockTime](https://en.bitcoin.it/wiki/NLockTime) parameter). Basically there are:
* A time delayed **refund** transaction: returning all the funds back to the client after a set time (say 1 day) if the service provider fails to respond.
* A continuous exchange of signed standard (i.e. non-delayed) transactions which send incrementally more to the service provider at the expense of the client. 

The primary use case is for transacting small amount of money for continuous services like video or music streaming or an internet connection.
 
Because colored coins run on top of the Bitcoin network, colored micropayment channels can be implemented in exactly the same way if the transactions (i.e. the delayed refund transaction and the continuously updated payment transactions) are colored transactions transferring units of an asset instead of bitcoins.

Note also that using our [rule engine](Rules) and particularly the [expiration](Rules#expiration) feature we can also implement micropayments without relying on the [standard technology](https://bitcoinj.github.io/working-with-micropayments) described above.

# Pruning OP_RETURN?

A possible concern about relying on OP_RETURN outputs is [blockchain pruning](https://en.bitcoin.it/wiki/Scalability#Storage). Since the data after an OP_RETURN command is basically ignored by the Bitcoin scripting language, OP_RETURN outputs may safely be dropped (pruned) in future attempts to save blockcahin space. We believe that this is not a problem in practice. In fact, embedding metadata on the Bitcoin blockchain is only finding more [use cases](http://www.coindesk.com/bitcoin-core-dev-update-5-transaction-fees-embedded-data/) and getting [more traction](http://www.slideshare.net/coinspark/bitcoin-2-and-opreturns-the-blockchain-as-tcpip/30) as time goes by. We thus believe that practical future attempts to reduce blockchain size will not remove OP_RETURN outputs. Furthermore, we plan on hosting our own custom colored coin node(s) in the near future, those nodes will definitely not prune OP_RETURN outputs.

# Securing Issuance Private Keys?
[Unlocked assets](Benefits#unlocked-assets) create a special risk fundamental to the concept of colored coins. 
If someone steals the private keys of a standard Bitcoin address, all you can loose is the coins in that address. However, if someone steals the private keys that control an issuing address it is much worse. For example, if I have issued 100 units of an asset and commit to pay 1 bitcoin for each unit, someone who steals my key can issue 1 million additional units, sell them, and leave me in debt of a million bitcoins.

The colored coins protocol gives the option of issuing [Locked assets](Benefits#locked-assets) which circumvent this issue by sacrificing some flexibility. Issuers of unlocked assets should be aware of that risk and mitigate it with real world measures such as insurance or an explicit clause in the contract that limits their liability in such cases.  

# Coloring [Satoshis](http://bitcoin.stackexchange.com/a/117)?
The colored coins idea has evolved over time. Initially the idea was to "color satoshis", meaning that actual satoshis were labeled and represented value, hence "colored". As the protocol evolved it was realized that the essence of the colored coins protocol was not attaching values to satoshis but rather encoding a logical data layer that supports the issuance and transfer of digital assets on top of the Bitcoin blockchain. The Bitcoin blockchain provides the underlying security and transferability layer upon which digital assets are created and moved around. 

In the modern implementation of the colored coins protocol actual satoshis indeed move around, but only in order to pay for the use of the Bitcoin blockchain. All the data necessary for asset manipulation is [encoded](Coloring Scheme) and there is no longer any 1:1 correspondence between assets and satoshis.

However, while not coloring satoshis, one can still say that the the colored coins protocol "colors UTXOs". 

## Coloring UTXOS
The Bitcoin protocol keeps track of bitcoins in an unorthodox way. Unlike traditional bank accounts where the basic entity is an **account** and balance moves from account to account. In Bitcoin, the basic entity is a [UTXO](https://bitcoin.org/en/glossary/unspent-transaction-output) which is short for Unspent Transaction Output. 

A UTXO can be thought of as an IOU note, or a check, authorizing the right person (e.g. holder of the private key to an address) to release bitcoins that can be used in a new transaction. Just like IOUs, UTXOs cannot be partially used, you can either use it all or not (deposit the check or not). From the perspective of the Bitcoin protocol, the balance in an address is a derived concept, equivalent to the sum of bitcoins credited in UTXOs to that address. In the bank analogy, think of a situation where there are no accounts, just many checks. Your "balance" is then the sum of values in valid checks that where written for you as a recipient. In order to use your money, you can no longer withdraw an arbitrary amount from your account, instead, you pick a subset of checks credited to you whose total value exceeds that sum you want to "withdraw" and cache them. 

A UTXO is uniquely determined by two pieces of data: 
* The transaction id 
* The index of the output in that transaction

The colored coins protocol uses the same perspective. Colored coins UTXOs authorize the right person to transfer an Asset (or Assets) in a colored transaction. The colored coins protocol uses the data in the OP_RETURN output to encode asset values in Bitcoin UTXOs. Colored UTXOs can be used as inputs in colored transaction, facilitating asset issuance and transfer. Similarly to the way that a Bitcoin UTXO can be traced back all the way to a [coinbase transaction](https://bitcoin.org/en/glossary/coinbase), a colored UTXO can be traced all the way back to an [issuance transaction](Embedding-Scheme#issuance-and-transfer-transactions).

# How many assets can be in one Address?
The answer to that depends on the asset type.
If the asset is [Locked](https://github.com/Colored-Coins/Colored-Coins-Protocol-Specification/wiki/Benefits#locked-assets) we can have an unlimited number of assets in one address. On the other hand, there can be **at most one** [Unlocked](https://github.com/Colored-Coins/Colored-Coins-Protocol-Specification/wiki/Benefits#unlocked-assets) asset in an address. The reason is that [Unlocked AssetIDs](https://github.com/Colored-Coins/Colored-Coins-Protocol-Specification/wiki/Asset%20ID#unlocked-asset-ids) are tied to the address and thus issuing again is considered to be a **reissuing** of the same asset.