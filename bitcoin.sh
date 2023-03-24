bitcoind -chain=regtest -conf=/home/jsw/btc/cfg/bitcoin.conf



curl --user wanglu:Wanchain888 --data-binary '{"method": "getbalances", "params":[], "id": 1}' nodes.wandevs.org:26893

curl --user wanglu:Wanchain888 --data-binary '{"method": "getbalances", "params":[], "id": 1}' bitcoind-testnet.wandevs.org:36893

curl --user wanglu:Wanchain888 --data-binary '{"method": "listaddressgroupings", "params":[], "id": 1}' bitcoind-testnet.wandevs.org:36893



bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -named createwallet wallet_name="" disable_private_keys=true descriptors=true blank=true
bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -named createwallet wallet_name=sm descriptors=true
bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -named createwallet wallet_name=old descriptors=false
bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -named createwallet wallet_name="" descriptors=false

bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu listwallets

bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu loadwallet sm
bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu loadwallet old
bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu loadwallet ""

bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=sm getdescriptorinfo '[{ "desc": "tr(713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)" }]'
bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=sm getdescriptorinfo "tr(713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)"

bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu loadwallet bk

bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet="" getbalance
bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=bk getbalance

bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=bk dumpprivkey "bcrt1qm34nrdyht84qjzdr6eyx0f2l5ywfqtnx5ry70g"


bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet="old" importaddress mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh label=jsw
bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=old importmulti '[{ "scriptPubKey": { "address": "mxP3gTG2fcUkgCkg269aBa1hzSxSArZWmZ" }, "timestamp": "now" }]'


bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=""  importdescriptors '[{ "desc": "pkh(02713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#7elw086v", "timestamp": 0}]'

bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=sm2 getdescriptorinfo 'tr(cNUx4bohBTqM41hf2dLDVoCHSexqgj29Q9poCnvT3i8DtMnJATaa)'
{
  "descriptor": "tr(713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#022654vv",
  "checksum": "0t48x5j0",
  "isrange": false,
  "issolvable": true,
  "hasprivatekeys": true
}


bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet="" importdescriptors '[{ "desc": "tr(713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#022654vv", "active": true, "timestamp": "now"}]'
bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=sm3 importdescriptors '[{ "desc": "tr(713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#022654vv", "timestamp": "now"}]'


bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=bk sendtoaddress bcrt1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6pskpqkaj 20
cb2f52ca83094c4031cee0d85f4b065c66fd5c0f1963ab5ccb64f0978a90549d


curl --user wanglu:Wanchain888 --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "listunspent", "params": [0, 9999999, ["bcrt1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6pskpqkaj"]]}' -H 'content-type: text/plain;' http://127.0.0.1:18443/wallet/


bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet="" importdescriptors '[{ "desc": "tr(713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#022654vv", "active": true, "timestamp": "now", "range": [0, 9999999] }]'


bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet="" importdescriptors '[{ "desc": "wpkh([1bb4de7e/0'/0'/0']035a331eac84094f11e7d008e8ff60710cad64db92c6400e19c43dd70ed9872188)#x2kg0qa8", "timestamp": "now"}]'

bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=bk -generate 1


bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=""  importdescriptors '[{ "desc": "rawtr(713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#pu2v43ha", "timestamp": 0}]'

bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet="" importdescriptors '[{"desc":"addr(bcrt1pp375ce9lvxs8l9rlsl78u4szhqa7za748dfhtjj5ht05lufu4dwsshpxl6)#ngm593tu","timestamp":"now"}]'
bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet="" getdescriptorinfo "addr(bcrt1pp375ce9lvxs8l9rlsl78u4szhqa7za748dfhtjj5ht05lufu4dwsshpxl6)#ngm593tu"



curl --user wanglu:Wanchain888 --data-binary '{"jsonrpc": "2.0", "id": "curltest", "method": "importdescriptors", "params": [[{ "desc": "addr(bcrt1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6pskpqkaj)#nragnnxq", "timestamp": "now" }]] }'  -H 'content-type: text/plain;' http://127.0.0.1:18443



bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu -rpcwallet=""  listunspent
[
  {
    "txid": "73483a22b57c7e733b2babafee0ec2fc7087b70f6e2479e862b205a42396b8d9",
    "vout": 0,
    "address": "mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh",
    "label": "",
    "scriptPubKey": "76a914b5b46bf9a9bfa00eeb5d789eacadab4ed16d11f988ac",
    "amount": 5.00000000,
    "confirmations": 2,
    "spendable": true,
    "solvable": true,
    "desc": "pkh([b5b46bf9]02713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#8zheh4tp",
    "parent_descs": [
      "pkh(02713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#7elw086v"
    ],
    "safe": true
  },
  {
    "txid": "a7d3ec414c5979e4413ed14ea4f6011550da397a0c229697bbec53381456c6fc",
    "vout": 1,
    "address": "mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh",
    "label": "",
    "scriptPubKey": "76a914b5b46bf9a9bfa00eeb5d789eacadab4ed16d11f988ac",
    "amount": 10.00000000,
    "confirmations": 13,
    "spendable": true,
    "solvable": true,
    "desc": "pkh([b5b46bf9]02713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#8zheh4tp",
    "parent_descs": [
      "pkh(02713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#7elw086v"
    ],
    "safe": true
  },
  {
    "txid": "cb2f52ca83094c4031cee0d85f4b065c66fd5c0f1963ab5ccb64f0978a90549d",
    "vout": 0,
    "address": "bcrt1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6pskpqkaj",
    "label": "",
    "scriptPubKey": "5120713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83",
    "amount": 20.00000000,
    "confirmations": 14,
    "spendable": true,
    "solvable": true,
    "desc": "rawtr([b5b46bf9]713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#9uxqfu0m",
    "parent_descs": [
      "rawtr(713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#pu2v43ha"
    ],
    "safe": true
  },
  {
    "txid": "fd97e3380d3fc501879acbad2a654d96ecc88b9985aff3fbc87e862866ce9e78",
    "vout": 1,
    "address": "bcrt1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6pskpqkaj",
    "label": "",
    "scriptPubKey": "5120713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83",
    "amount": 30.00000000,
    "confirmations": 12,
    "spendable": true,
    "solvable": true,
    "desc": "rawtr([b5b46bf9]713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#9uxqfu0m",
    "parent_descs": [
      "rawtr(713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83)#pu2v43ha"
    ],
    "safe": true
  }
]
