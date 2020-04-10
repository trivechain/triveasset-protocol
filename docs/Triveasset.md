# Introduction - TriveAsset

While originally designed to be a currency, Trivechain supports a limited scripting language that can be used to store metadata on the blockchain. TriveAsset is a concept that allows attaching metadata to Trivechain transactions and leveraging the Trivechain infrastructure for issuing and trading immutable digital assets that can represent real world value. The value of such digital assets is tied to a real-world promise by the asset issuers that they are willing to redeem those digital tokens for something of value in the real world. 

Digital assets on top of the Trivechain Blockchain can be used to issue Financial assets (securities like shares, commodities like Gold or new currencies), prove ownership (A digital key to a house or a car, a concert ticket), store information (Documents, Certificates).

The advantage given by using the blockchain as the backbone for such asset manipulation is that one can rely on the blockchain’s transparency, immutability, ease of transfer and non-counterfeitability to transfer and trade such digital tokens with unprecedented security and ease.

# The TriveAsset Protocol
This document describes the TriveAsset protocol specification for issuing and transacting digital assets on top of the Trivechain Blockchain.

This Document consists of two main parts:
### 1. [The Embedding Scheme](Embedding-Scheme.md)
The embedding scheme describes the encoding used to encode/decode the TriveAsset data that is stored in a Trivechain transaction after the OP_RETURN operator (and sometimes in one additional multisignature output). This embedding scheme is optimized for robust functionality by inserting the most data within the current size constraints of the OP_RETURN operator (80 Bytes).

### 2. [Asset Metadata](Metadata.md)
This document introduces the first specification for handling metadata for digital assets.
Because of the 80 Bytes limit of the OP_RETURN field, any metadata that is attached to a transaction is hashed and stored in IPFS to allow decentralized access to the information.

### 3. [The Rule engine](Rules.md)
By hashing the metadata for every transaction, TriveAsset actually expands dramatically the basic Trivechain functionality by allowing to insert rules that exist outside the blockchain and can be publicly accessed via IPFS and verified against a specific transaction thus creating a rule engine with basic smart contract functionality.

# Benefits

In this section we list some of the benefits of the new implementation of the triveasset protocol proposed by Colu.

- [Better metadata handling](#better-metadata-handling)
- [Coherent issuance policy](#coherent-issuance-policy)
- [Better Performance & efficiency](#better-performance-and-efficiency)
- [Rules capabilities](#rules-capabilities)

## Better metadata handling
This protocol specifies a clear method of creating and storing the metadata for triveasset transaction:

**Using IPFS**
Until now, smart assets that were built on the Bitcoin Blockchain, used other Blockchains to hold the metadata or stored it in a centralized DB. TriveAsset will automatically store the metadata in IPFS, where they can be freely accessed and verified.
There are important advantages to this approach:
* **Decentralization**:
    * **Robustness**: There are many IPFS nodes out there that are holding the metadata, even if our servers go down, the data is not lost
    * **Ownership**: No one *owns* the data officially
* **Provable immutability**: The metadata are uploaded to IPFS network while the hash of the metadata is [stored on the blockchain](Embedding-Scheme#data-storage). This allows our code to verify that the data loaded using IPFS is indeed the correct data.

**Metadata on every asset transaction**
The new triveasset protocol implementation allows for adding asset metadata on every transaction if required, not only during issuance, which is very useful when relevant data needs to be present for the transaction.

For example, a movie theater has 500 seats. The theater can issue 500 units of a *mission-impossible-10-premiere* asset representing a ticket to the premiere of the new blockbuster in town. During the buy process of a ticket on the theater's website a client selects a seating position. Each single unit of the *mission-impossible-10-premiere* asset sent to a client's trivechain wallet already contains the metadata of the selected seat.

Another example would be adding metadata for a game asset transaction to describe what is happening to the transaction which is very important when the asset is used for gaming or trading.

## Coherent issuance policy
The triveasset protocol implementation enforces a coherent issuance policy by supporting two types of Assets, locked supply and unlocked supply:

**Locked Supply Assets**
Locked assets have a fixed amount set at the moment of issuance. Even the asset issuer [cannot issue more units](Asset-ID#locked) of his own locked asset.

*Example: non-diluteable shares*
For example, owning a fixed percentage of a company can be represented with locked assets. For example, a Venture Capital firm is interested in investing 2.5 million dollars in a startup, provided that it receives 25% control, even in face of future dilution of shares. The company can issue a locked *startup-x-to-the-moon* asset with an amount of, say, 10 million units and send 25% of the issued units to the VC firm upon receiving their investment. The VC can be completely confident that no dilution of it's shares is possible.

**Unlocked Assets**
Issuers of unlocked assets can [keep issuing](Asset-ID#unlocked) more units of their asset.

*Examples*
For example, let's return to the company from our [previous example](Triveasset.md#example-non-diluteable-shares). The company can issue 7,500,000 units of a new *unlocked* asset, call it *startup-x-round-B*. This time each unit is redeemable for its proportion in the total amount of the new asset out of the existing 7,500,000 locked *startup-x-to-the-moon*. Initially each unit of the new asset is redeemable for exactly one unit of the old asset, but in case of a new round of funding the new asset can be diluted by issuing more units.

As another example, a coffee shop brand issues each month 1000 units of a free-cup-of-coffee asset, each redeemable for a free cup of coffee. Each month, a 1000 new units of the same asset are issued. 

## Better Performance and Efficiency

**Processing many assets in one transaction**
The triveasset [protocol implementation](Embedding-Scheme#asset-manipulating-transactions) uses a novel encoding for [asset transfer instructions](TransferInstructions). This encoding allows us to process many assets together in a [single transaction](Embedding-Scheme#asset-processing-capacity-per-transaction) (in some cases up to 18 assets, or more).

**Low Prices & minimal bloat**
The TriveAsset protocol implementation achieves a high level of data compression using the way [asset transfer instructions](TransferInstructions) and [transfer and issuance amounts](NumberEncoding) are encoded. This leads to lowering the price in TRVC needed to support each asset manipulating transaction as well as reducing blockchain bloat.

**Support for zero confirmation transactions**
Trivechain normal transaction are confirmed every 15 minutes (on average). Waiting for confirmations gives a poor user experience, especially considering current standards of responsiveness expected from web and mobile applications.

The architecture of the TriveAsset protocol implementation allows us to support asset issuance and transfer in **zero confirmations** (and in fact even within the [same transaction](Embedding-Scheme#issuance-transaction-encoding)), because the [Asset ID](AssetID) only references the first UTXO in the transaction and makes no reference to a block.

While it is true that each confirmation of a Trivechain transaction increases our confidence in it, for many real world cases involving small amounts of money (a cup of coffee, a movie ticket, etc..) most users and merchants accept zero confirmation transactions. The fact that the TriveAsset protocol implementations lends support to [manipulating assets in zero confirmation](AssetID#asset-ids-and-bitcoin-confirmations) is a big boon for user experience. And with the implementation of LLMQ Direct Send, the asset that is embedded on top of the direct send utxo are confirmed immediately as soon as masternodes confirm the transaction.

As with standard Trivechain transactions, certain users may decide to consider an asset as *valid for their business purpose* only if it has at least some number of confirmations. The triveasset protocol itself does not enforce that restriction.

**Support for thin wallets**
In order to allow trivechain wallets to run on mobile devices, the protocol must be able to verify embedded transactions without the need to run a full Trivechain node. 

Thin Trivechain wallets, a.k.a [SPV clients](https://en.bitcoin.it/wiki/Scalability#Simplified_payment_verification) are nodes in the Trivechain network that do not keep all the blockchain data but instead keep only the block headers and verify that those connect correctly and that the difficulty is high enough so that the chain can be reasonably trusted.
Full data (and Merkle branch linking to blocks) are only requested for transactions relevant to the addresses in the wallet, thus using the Merkle tree structure to prove inclusion in a block without needing the full contents of the block.
In particular, the thin client does not *verify* transaction validity but instead *deduces* that validity from the inclusion in valid blocks of the longest chain.

This general type of SPV clients **cannot**, in principle, support the triveasset protocol. The reason is that Trivechain miners does not verify the embedding thus treat asset transactions as standard Trivechain transactions and ignore the entire asset meta structure that can only be parsed and understood by nodes running the triveasset software.

In particular, miners **do not verify the asset aspects of transactions**. Therefore, any triveasset client **must verify asset transactions on its own**, and to that effect must keep extra relevant data about the history of transactions.

Thus, SPV support for triveasset is subtle and the differences between asset aware SPV clients depend on how much extra data must be kept, and how it is handled by the client in order to process and verify asset transactions. 

There are a few possibilities:
* The worst case scenario is keeping the full history of all transactions supported by the triveasset protocol, regardless of whether or not those transactions have anything to do with the assets in your wallet.
* Next is the option of keeping the full history of transactions relevant to assets in the wallet, regardless of whether those transactions involve addresses owned by the wallet. For example, say 100 units of an asset are issued. 50 units are sent to an address owned by the wallet and 50 to an address that is not owned by the wallet. In the case at hand the wallet will keep full data about the subgraph of transactions originating from the 50 units sent to the *other* address. 
* The least expensive option, and the one used by the triveasset implementation is that of keeping full history only about transactions involving addresses owned by the wallet. The thin client will backtrack through blocks all the way to each asset issuance and keep only that data. In other words, the wallet just needs to know the subgraph of transactions that lead directly to the assets in the wallet.

## Rules capabilities

The TriveAsset protocol implementation includes a **[Rule Engine](Rules)** that operates on rules specified in the [metadata](Metadata) of an asset.
Rules may be [Open or Locked](Rules#inheritance), when Open any one issuing or transferring the asset may add to the rule-set, when Locked the rule becomes immutable.