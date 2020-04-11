This set of OP_CODES are only recognized by the trive asset software and should not be confused with [Bitcoin OP_CODES](https://en.bitcoin.it/wiki/Script) (such as OP_RETURN).

TriveAsset OP_CODES are encoded using a single byte. Half of the values represented by that byte are reserved for Core TriveAsset protocol OP_CODES, the other half is left open for custom OP_CODES that may be added by users (e.g. in forks of the TriveAsset opensource software).

In particular
* The first 128 values `0x00-0x7F` are reserved for TriveAsset OP_CODES
 * `0x01-0x0F` represent **Issuance** OP_CODES
 * `0x10-0x1F` represent **Transfer** OP_CODES
 * `0x20-0x2F` represent **Burn** OP_CODES
* The last 128 values `0x80-0xFF` can be used for referring to new OP_CODES used by custom extensions (plugins) 

The table below lists the (currently available) TriveAsset OP_CODES 
* The **I**/**T**/**B** column refers to whether this is an [Issuance](Embedding-Scheme#issuance-transaction-encoding), a [Transfer](Embedding-Scheme#transfer-transaction-encoding) or a [Burn](Embedding-Scheme#burn-transaction-encoding) OP_CODE.
* The **M** column designates whether any [Metadata](Metadata) was stored at all 
* The **1(2)** column designates whether a (1\|**2**) multisignature address was used in addition to OP_RETURN

| Hex   |Meaning|I/T/B|M|1(2)|Comment|
| :---: |-------|---|:------:|:----:|-------|
| `0x00`            | Undefined
| `0x05`            | No Metadata, cannot add [rules](Rules)| I|&#10005;|&#10005;|Locked
| `0x06`            | No Metadata, can add [rules](Rules)| I|&#10005;|&#10005;|Unlocked
| `0x07`            | IPFS Hash of Metadata in **80** bytes OP_RETURN | I|&#10004;|&#10005;|
| `0x08`            | IPFS Hash of metadata in 1(**2**) multisig| I|&#10004;|&#10004;|
| `0x15`            | Transaction Instruction in **80** bytes OP_RETURN|T|&#10005;|&#10005;|
| `0x16`            | Transaction Instruction + IPFS Hash of Metadata in **80** bytes OP_RETURN|T|&#10004;|&#10005;|
| `0x17`            | Transaction Instruction in **80** bytes OP_RETURN & IPFS Hash of metadata in 1(**2**) multisig|T|&#10004;|&#10004;|
| `0x25`            | Burn Instruction in **80** bytes OP_RETURN|B|&#10005;|&#10005;|
| `0x26`            | Burn Instruction + IPFS Hash of Metadata in **80** bytes OP_RETURN|B|&#10004;|&#10004;|