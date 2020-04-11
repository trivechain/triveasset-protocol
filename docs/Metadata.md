# Metadata Handling

The TriveAsset protocol supports adding (potentially arbitrary amounts of) metadata to any asset transaction ([issuance](Embedding-Scheme#issuance-transaction-encoding) or [transfer](Embedding-Scheme#transfer-transaction-encoding)). The metadata is in plain JSON format and it's inclusion is **optional**. 

When metadata is included it is not stored directly on the blockchain but rather using the [IPFS Protocol](IPFS.md) which gives a decentralized way to share and store data.

The IPFS protocol uses a hash to reference the file that stores the actual data. This 34 byte **ipfs_hash** is recorded on the blockchain.

### IPFS and 80 bytes OP_RETURN
Now that the vast majority of the Trivechain network is accepting **80** bytes OP_RETURN, we may include the IPFS hash of the metadata hash after the OP_RETURN if there is enough spaces in the OP_RETURN.

# Metadata Structure
Metadata support is one of the new novelties introduced by the TriveAsset protocol.
There are two basic parts: [Static Data](Static Data) and [Rules](Rules), each discussed in detail in the linked sections.
Generally, the data section consists of various static data fields while the rules section encodes an extra layer of logic supported by our [rule engine](Rules) that unlocks smart contracts functionality to colored coins.

## Syntax

[Static Data](Static Data) goes under the **metadata** key, [Rules](Rules) go under the **Rules** key.
```
{
  metadata: {...Static data goes here...},
  rules: {...Rule definitions go here...}
}
```

The general metadata syntax is the following:
```
{
  metadata: {
    assetId: String,
    assetName: String,
    assetGenesis: String,
    issuer: String,
    description: String,
    urls: [
       {name: String, url: String, mimeType: String, dataHash: String },
       {name: String, url: String, mimeType: String, dataHash: String },
       ...
    ], 
    userData : {
      meta: [
        {key: String, value: String, type: String},
        {key: String, value: String, type: String},
        ...
      ],
      user_key: user_value,
      user_key: user_value,
      ...
     },
    encryptions: [
        {key: "user_key", pubKey: 'RSA Public Key',format:'pem|der',type:'pkcs1|pkcs8' },
        ...
    ]
  },
  rules: {
    fees: [{}],
    expiration: {},
    minters: [{}],
    holders: [{}]    
  }
}
```
All the above keys are optional (except for `assetGenesis` in case of [re-issuance by minters](Rules#Minters)).

Currently, only the hyperlinked keys are recognized by the colored coins code.
However, even though the basic colored coins code will ignore other keys, any one can fork the colored coins [opensource code](https://github.com/colored-coins) and add supporting logic for more keys.

## Example
```
metadata: {
  assetId:'LDJMbzwCBWhrrXpKS7TrCfoAWYgXQhwZg1G6R',
  assetName: "Time Machine",        
  issuer: "Dr. Emmet Brown", 
  description: "The flux capacitor will send us back to the future",
  urls: [
    {
      name: "imdb",
      url: "http://www.imdb.com/title/tt0088763/",
      mimeType: "text/html",
      dataHash: "249e3e3c77d07d8fe8984a47bbbab8c89aeb8b1dadf4e2ff47db42a3e5a1c126"
    }
  ],
  encryptions: [
    {
      key: "Undelrying Physics",
      pubKey: "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEA0hw6PRO9RpHRf/pdpEMfD01odzBTaheuA1JxunVTq+/X1hGSUrpRWMIM/tp8\n9DQod6K+6Bo/2CmoZxkWPOk45tbU9QE4Cb532n+MIkzsmbvmM+i49UXSqC8v44MGKTVLb7X2\nPogItSM3lqH4KpZR3cM/JDarfS1R77U/OMDZ/YECDPbcwKPdSLQHhWJ1c9cX5+0lCSDt1WXY\n4XX+hH64C+L/Ss4dMP2kpyHvbsBYpGdLu7AmcDmHtCOl2rXR1z4E0asYGiojw3PI56ATOndS\n30ABKKgQTAExjPQ24BtJYhfJ+zD5zHhztizPPfOwrID2HTfGwVTwfXinV4bpoFfwhwIDAQAB\n-----END RSA PUBLIC KEY-----\n",
      format: "pem",
      type: "pkcs1"
    }
  ],           
  userData :{
    meta: [
      {key: 'Weight', value: 50000,      type: 'Number'},
      {key: 'Model',  value: "Delorean", type: 'String'},       
    ],
    technology: 'flux capacitor 666',
    "Undelrying Physics": 'This magnetic flux calculator calculates the magnetic flux of an object based on the magnitude of the magnetic field which the object emanates and the area of the object, according to the formula, Φ=BA, if the magnetic field is at a 90° angle (perpendicular) to the area of the object. If the magnetic field is not perpendicular to the object, then use the calculator below, which computes the magnetic flux at non-perpendicular angles. The magnetic flux is directly proportional to the magnitude of the magnetic field emanating from the object and the area of the object. The greater the magnetic field, the greater the magnetic flux. Conversely, the smaller the magnetic field, the smaller the flux. The area of the object has the same direct relationship. The greater the area of an object, the greater the flux. Conversely, the smaller the area, the smaller the magnetic flux.'
  } 
}
```