$ gettransaction_MP bf57b06d9f2abd1c4ee51701b131b7ce87e9432901c6903b348439ad85b63986
{
  "txid": "bf57b06d9f2abd1c4ee51701b131b7ce87e9432901c6903b348439ad85b63986",
  "sendingaddress": "mwLDFYukA8WxvJ6UyjZ6wgvqzLsGSeoiJD",
  "ismine": true,
  "confirmations": 1,
  "fee": 0.00011092,
  "blocktime": 1428698286,
  "version": 0,
  "type_int": 50,
  "type": "Create Property - Fixed",
  "propertyid": 2147483652,
  "propertyname": "Quantum Miner",
  "divisible": false,
  "amount": "1000000",
  "valid": true
}


$ getrawtransaction bf57b06d9f2abd1c4ee51701b131b7ce87e9432901c6903b348439ad85b63986 1
{
  "hex": "0100000001269c22527910b6be25bf6cd72efc01ca5dbb59f832c42d89a6b87f7ac7525898020000006a47304402203ecb252f03651b004a039b5a8028d204f0c0d16f0bc6766f4f1699eabe44007e02204136325cfb6d7a8a5972256acd6964b3d03c372339bb5b338f7d3feeea853029012102e3cb2b3590f02c5a339f2b98f7601e86c8407a19d67a1496afb28ceb12e201c4ffffffff0322020000000000001976a914643ce12b1590633077b8620316f43a9362ef18e588ac4404000000000000cf512102e3cb2b3590f02c5a339f2b98f7601e86c8407a19d67a1496afb28ceb12e201c42102b907ea0d73504e65c97847d3697d97899041c808cd77a5f9bdcb85084ac3c2232102a72fc372423fc2be4f79924ffca17ddd5b2e8706c77b533f8c8d42a1b4b8059e2102c8d8a20697a52f56c6379c28101b6874188252400506814f49c06ff87de3ecd521020df3f7ceee6dcccd0922614bb0a99b104293cefa1214b23762b1d60148eab9f721033801182f60434ee1b07b870067c37ff03c6eda12ad6041bfe081878b7b720c1a56ae586d052a010000001976a914ad79ec1c35c48d570815c92ac6a0f9e47be7b37888ac00000000",
  "txid": "bf57b06d9f2abd1c4ee51701b131b7ce87e9432901c6903b348439ad85b63986",
  "version": 1,
  "locktime": 0,
  "vin": [{
    "txid": "985852c77a7fb8a6892dc432f859bb5dca01fc2ed76cbf25beb6107952229c26",
    "vout": 2,
    "scriptSig": {
      "asm": "304402203ecb252f03651b004a039b5a8028d204f0c0d16f0bc6766f4f1699eabe44007e02204136325cfb6d7a8a5972256acd6964b3d03c372339bb5b338f7d3feeea85302901 02e3cb2b3590f02c5a339f2b98f7601e86c8407a19d67a1496afb28ceb12e201c4",
      "hex": "47304402203ecb252f03651b004a039b5a8028d204f0c0d16f0bc6766f4f1699eabe44007e02204136325cfb6d7a8a5972256acd6964b3d03c372339bb5b338f7d3feeea853029012102e3cb2b3590f02c5a339f2b98f7601e86c8407a19d67a1496afb28ceb12e201c4"
    },
    "sequence": 4294967295
  }],
  "vout": [{
    "value": 0.00000546,
    "n": 0,
    "scriptPubKey": {
      "asm": "OP_DUP OP_HASH160 643ce12b1590633077b8620316f43a9362ef18e5 OP_EQUALVERIFY OP_CHECKSIG",
      "hex": "76a914643ce12b1590633077b8620316f43a9362ef18e588ac",
      "reqSigs": 1,
      "type": "pubkeyhash",
      "addresses": [
        "mpexoDuSkGGqvqrkrjiFng38QPkJQVFyqv"
      ]
    }
  }, {
    "value": 0.00001092,
    "n": 1,
    "scriptPubKey": {
      "asm": "1 02e3cb2b3590f02c5a339f2b98f7601e86c8407a19d67a1496afb28ceb12e201c4 02b907ea0d73504e65c97847d3697d97899041c808cd77a5f9bdcb85084ac3c223 02a72fc372423fc2be4f79924ffca17ddd5b2e8706c77b533f8c8d42a1b4b8059e 02c8d8a20697a52f56c6379c28101b6874188252400506814f49c06ff87de3ecd5 020df3f7ceee6dcccd0922614bb0a99b104293cefa1214b23762b1d60148eab9f7 033801182f60434ee1b07b870067c37ff03c6eda12ad6041bfe081878b7b720c1a 6 OP_CHECKMULTISIG",
      "hex": "512102e3cb2b3590f02c5a339f2b98f7601e86c8407a19d67a1496afb28ceb12e201c42102b907ea0d73504e65c97847d3697d97899041c808cd77a5f9bdcb85084ac3c2232102a72fc372423fc2be4f79924ffca17ddd5b2e8706c77b533f8c8d42a1b4b8059e2102c8d8a20697a52f56c6379c28101b6874188252400506814f49c06ff87de3ecd521020df3f7ceee6dcccd0922614bb0a99b104293cefa1214b23762b1d60148eab9f721033801182f60434ee1b07b870067c37ff03c6eda12ad6041bfe081878b7b720c1a56ae",
      "reqSigs": 1,
      "type": "multisig",
      "addresses": [
        "mwLDFYukA8WxvJ6UyjZ6wgvqzLsGSeoiJD",
        "mreXwzseJfSrNBDsqsvUg2Ssmj9bxfKQZV",
        "mr1TTwnxJz7P7i6ETzddNTGb37JUZqfgV4",
        "muK2DwG93LPzS6zuJ7r848zeLnejAuVHvw",
        "myYQZAJgBjXHdxC6i9GkYUM5x5tt4StqFa",
        "mksjkjToNuzyoD35fWViErfJe7wFSHCCvW"
      ]
    }
  }, {
    "value": 49.99966040,
    "n": 2,
    "scriptPubKey": {
      "asm": "OP_DUP OP_HASH160 ad79ec1c35c48d570815c92ac6a0f9e47be7b378 OP_EQUALVERIFY OP_CHECKSIG",
      "hex": "76a914ad79ec1c35c48d570815c92ac6a0f9e47be7b37888ac",
      "reqSigs": 1,
      "type": "pubkeyhash",
      "addresses": [
        "mwLDFYukA8WxvJ6UyjZ6wgvqzLsGSeoiJD"
      ]
    }
  }],
  "blockhash": "698cefb0f41bd5a0dcf66f4e51aa81aae06c99af9cc95faafd7f1c46f41c578b",
  "confirmations": 1,
  "time": 1428698286,
  "blocktime": 1428698286
}