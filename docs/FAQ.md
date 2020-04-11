In this section we discuss some of the potential problem that we will face with the current implementation of triveasset protocol.

# Pruning OP_RETURN

A possible concern about relying on OP_RETURN outputs is [blockchain pruning](https://en.bitcoin.it/wiki/Scalability#Storage). Since the data after an OP_RETURN command is basically ignored by the Bitcoin scripting language, OP_RETURN outputs may safely be dropped (pruned) in future attempts to save blockcahin space. We believe that this is not a problem in practice. In fact, embedding metadata on the Bitcoin blockchain is only finding more [use cases](http://www.coindesk.com/bitcoin-core-dev-update-5-transaction-fees-embedded-data/) and getting [more traction](http://www.slideshare.net/coinspark/bitcoin-2-and-opreturns-the-blockchain-as-tcpip/30) as time goes by. We thus believe that practical future attempts to reduce blockchain size will not remove OP_RETURN outputs. Furthermore, we have masternode(s) as part of the trivechain protocol enabler, those nodes will definitely not prune OP_RETURN outputs.

# Securing Issuance Private Keys
[Unlocked assets](Triveasset#coherent-issuance-policy) create a special risk fundamental to the concept of triveassets. 
If someone steals the private keys of a standard Trivechain address, all you can loose is the coins in that address. However, if someone steals the private keys that control an issuing address it is much worse. For example, if I have issued 100 units of an asset and commit to pay 1 bitcoin for each unit, someone who steals my key can issue 1 million additional units, sell them, and leave me in debt of a million bitcoins.

The triveasset protocol gives the option of issuing [Locked assets](Triveasset#coherent-issuance-policy) which circumvent this issue by sacrificing some flexibility. Issuers of unlocked assets should be aware of that risk and mitigate it with real world measures such as insurance or an explicit clause in the contract that limits their liability in such cases.

# Coloring Satoshis
The idea of TriveAsset Embedding came from Colored Coins of Bitcoin protocol.

The colored coins idea has evolved over time. Initially the idea was to ["color satoshis"](http://bitcoin.stackexchange.com/a/117), meaning that actual satoshis were labeled and represented value, hence "colored". As the protocol evolved it was realized that the essence of the colored coins protocol was not attaching values to satoshis but rather encoding a logical data layer that supports the issuance and transfer of digital assets on top of the Bitcoin blockchain. The Bitcoin blockchain provides the underlying security and transferability layer upon which digital assets are created and moved around. 

In the modern implementation of the colored coins protocol actual satoshis indeed move around, but only in order to pay for the use of the Bitcoin blockchain. All the data necessary for asset manipulation is [encoded](Embedding-Scheme) and there is no longer any 1:1 correspondence between assets and satoshis.

However, while not coloring satoshis, one can still say that the the colored coins protocol "colored UTXOs". 

# Coloring UTXOS
The Bitcoin protocol keeps track of bitcoins in an unorthodox way. Unlike traditional bank accounts where the basic entity is an **account** and balance moves from account to account. In Bitcoin, the basic entity is a [UTXO](https://bitcoin.org/en/glossary/unspent-transaction-output) which is short for Unspent Transaction Output. 

A UTXO can be thought of as an IOU note, or a check, authorizing the right person (e.g. holder of the private key to an address) to release bitcoins that can be used in a new transaction. Just like IOUs, UTXOs cannot be partially used, you can either use it all or not (deposit the check or not). From the perspective of the Bitcoin protocol, the balance in an address is a derived concept, equivalent to the sum of bitcoins credited in UTXOs to that address. In the bank analogy, think of a situation where there are no accounts, just many checks. Your "balance" is then the sum of values in valid checks that where written for you as a recipient. In order to use your money, you can no longer withdraw an arbitrary amount from your account, instead, you pick a subset of checks credited to you whose total value exceeds that sum you want to "withdraw" and cache them. 

A UTXO is uniquely determined by two pieces of data: 
* The transaction id 
* The index of the output in that transaction

The triveasset protocol uses the same perspective. Asset UTXOs authorize the right person to transfer an Asset (or Assets) in a asset transaction. The triveasset protocol uses the data in the OP_RETURN output to encode asset values in Trivechain UTXOs. Asset UTXOs can be used as inputs in asset transaction, facilitating asset issuance and transfer. Similarly to the way that a Trivechain UTXO can be traced back all the way to a [coinbase transaction](https://bitcoin.org/en/glossary/coinbase), a asset UTXO can be traced all the way back to an [issuance transaction](Embedding-Scheme#issuance-and-transfer-transactions).

# How many assets can be issued under one Address?
The answer to that depends on the asset type.
If the asset is [Locked](Triveasset#coherent-issuance-policy) we can have an unlimited number of assets in one address. On the other hand, there can be **at most one** [Unlocked](Triveasset#coherent-issuance-policy) asset in an address. The reason is that [Unlocked AssetIDs](Asset-ID#unlocked-asset-ids) are tied to the address and thus issuing again is considered to be a **reissuing** of the same asset.