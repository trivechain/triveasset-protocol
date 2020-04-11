This part of the metadata includes optional static data fields. Currently the colored coins implementation recognizes the following keys:

## assetId
Including the [assetId](Asset ID) in the metadata during asset [transfer](Coloring%20Scheme#transfer-only-transactions), while optional, can expedite processing.
Note that one cannot include the Asset ID during [issuance](Coloring%20Scheme#issuance-and-transfer-transactions) because the Asset ID was not yet determined. 
## assetName
Asset Name as a free string
## assetGenesis
This field is required only upon re-issuance of an asset by a [minter](Rules#minters), regardless of whether the asset is [locked or unlocked](Benefits#coherent-issuance-policy). 
The genesis field stores the block and transaction ids of the issuance transaction.
## issuer
A free string describing the Asset's issuer
## description
A free string describing the Asset
## urls
An array of JSON objects, each containing a link to a file (hosted on some remote server) containing data about the asset.
```js 
{
    name: String,
    url: String,
    mimeType: String, // mime type of data in that url
    dataHash: String // SHA-256 hash of the data (to allow data verification)
}
```

the following are predefined names for use with the coloredcoins explorer:  
```icon``` - this will be the icon of the asset on asset pages and lists

```large_icon``` - a larger version of the icon to be displayed on larger screens

Other examples:

consider a legal contract describing the issuer's promise to redeem each unit for goods or services in the real world. 
That legal document file can be hosted on the issuer's company website and linked using the URL data field. A hash of the document can be stored as well to ensure that the issuer (or otherwise host of the data) did not alter it.
Both issuers and holders of an asset can thus refer unambiguously to the original contract against which the asset was issued.

## userData
A list of free JSON objects.
### meta 
A special key named `meta` is used to allow the [colored coins explorer](http://coloredcoins.org/explore) and client side applications to display said data.
The value of the `meta` key should be an array of `{key,value,type}` objects that will be displayed by the explorer.
```
{key: String, value: String, type: String}
```  
Data Types that are currently parsed by the explorer:  
```
String, Number, Boolean, Date, URL, Email, Array
```  

the ```Array``` type expects an array of ```{key: String, value: String, type: String}``` objects, this allows building hierarchical data formation.

if a Type is not specified the parser defaults to the JSON datatype (String, Number or Boolean)

Examples:

```
{key: "user name", value: "username", type: "String"}
{key: "birthday", value: "01/01/1970", type: "Date"}

{
    key: "company", 
    value: [
        {key: String, value: String, type: String},
        {key: String, value: String, type: String}
    ],
    type: "Array"
}
```

### free JSON
On top of the **meta** key, whose values are parsed and displayed in the [colored coins explorer](http://coloredcoins.org/explore), you can add arbitrary key value pairs.

The general syntax of the **userData** key is thus

```
userData : {
      meta: [
              {key: String, value: String, type: String},
              {key: String, value: String, type: String},
               .......
            ],
      user_key: user_value,
      user_key: user_value,
      ...
     },
```

## Metadata Encryption

The colored coins protocol supports the use of [RSA public keys](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) for metadata encryption.
Any (or all) of the [free JSON user data](Static-Data#free-json) **values** can be encrypted by specifying 
* The JSON **key** whose value is to be encrypted  
* The [format](https://tls.mbed.org/kb/cryptography/asn1-key-structures-in-der-and-pem): `pem` or `der` 
* The [padding scheme](https://en.wikipedia.org/wiki/RSA_(cryptosystem)#Padding_schemes): `pkcs1` or `pkcs8`

To encrypt user metadata add an **encryptions** key whose value is an array
<pre>
<b>encryptions</b>: 
 [
   {key: "user_key", pubKey: 'RSA Public Key',format:'pem|der',type:'pkcs1|pkcs8' },
   {key: "user_key", pubKey: 'RSA Public Key',format:'pem|der',type:'pkcs1|pkcs8' },
   .......
 ]
</pre>
each element of the array is a JSON of the form
<pre>
 {
   <b>key</b>:String, 
   <b>pubKey</b>:String, 
   <b>format</b>:String, 
   <b>type</b>:String
  }
</pre>
Where
* **key**: The [free JSON user data](Static-Data#free-json) key whose value is to be encrypted
* **pubKey**: An RSA public key
* **format**: The RSA public key [format](https://tls.mbed.org/kb/cryptography/asn1-key-structures-in-der-and-pem) (`pem` or `der`)
* **type**: The RSA [padding scheme](https://en.wikipedia.org/wiki/RSA_(cryptosystem)#Padding_schemes) ( `pkcs1` or `pkcs8`)

Here is [an example](Metadata#example).