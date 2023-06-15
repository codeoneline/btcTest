// bitcoind -chain=regtest -conf=/home/jsw/btc/cfg/bitcoin.conf
// bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu

const bitcoin = require('bitcoinjs-lib');
const Client = require('bitcoin-core')
const ECPAIR = require('ecpair')
const ecc = require('tiny-secp256k1');
bitcoin.initEccLib(ecc)
const ECPair = ECPAIR.ECPairFactory(ecc)

process.on('uncaughtException', error => {
  console.log(`uncaughtException ${error}`)
});

process.on('unhandledRejection', error => {
  console.log(`unhandledRejection ${error}`)
});

const oldOptions = {
  testnet: {
    network: 'testnet',
    host: "35.164.78.133",
    port: 36893,
    username: 'wanglu',
    password: 'Wanchain888'
  },
  mainnet: {
    network: 'mainnet',
    host: 'nodes.wandevs.org',
    port: 26893,
    username: 'wanglu',
    password: 'Wanchain888'
  },
  regtest: {
    network: 'regtest',
    host: "127.0.0.1",
    port: 18443,
    username: 'wanglu',
    password: 'Wanchain888'
  }
}

const newOptions = {
  testnet: {
    network: 'testnet',
    host: "52.40.34.234",
    port: 36893,
    username: 'wanglu',
    password: 'Wanchain888'
  }
}

const usedNetwork = "testnet"
const network = bitcoin.networks[usedNetwork]
const oldClient = new Client(oldOptions[usedNetwork])
const newClient = new Client(newOptions[usedNetwork])

const importDescriptorByFetch = async(infos, fromTime) => {
  const fetch = require('node-fetch')

  const headers = {
    'content-type': 'text/plain',
    'Authorization': 'Basic ' + Buffer.from('wanglu:Wanchain888').toString('base64'),
  }

  const methodName = 'importdescriptors'
  
  let params = "[["
  infos.forEach(info => {
    if (params.length > 2) {
      params += ','
    }
    const param = fromTime === "now" ?  `{"desc": "${info.descriptor}", "timestamp": "now", "label": "${info.label}"}` : `{"desc": "${info.descriptor}", "timestamp": ${fromTime}, "label": "${info.label}"}`
    params += param
  }) 
  params += "]]"
   
  const data = `{ "jsonrpc": "1.0", "id": "curltext", "method": "${methodName}", "params": ${params} }`

  // const url = 'http://127.0.0.1:18443/'
  const url = `http://${newOptions[usedNetwork].host}:${newOptions[usedNetwork].port}/`
  const options =  {
    method: "POST",
    headers: headers,
    body: data,
  }
  const response = await fetch(url, options)
  const res = JSON.parse(await response.text())
  if (!res.error) {
    console.log(`import descriptors info ${JSON.stringify(res.result)}`)
    return res.result
  }

}

const importAllToNewWallet = async() => {
  const all = await oldClient.listAddressGroupings()
  // const fromTime = 'now'
  const fromTime = Math.round(new Date().getTime() / 1000) - 30 * 24 * 3600
  const infos = []
  for (let k in all) {
    for (let j in all[k]) {
      const pay = all[k][j]
      console.log(`try import ${pay}`)
      const desc = `addr(${pay[0]})`
      const label = pay[2]
      const info = await newClient.getDescriptorInfo(desc)
      info.label = label
      infos.push(info)
    }
  }

  await importDescriptorByFetch(infos, fromTime)
}

function hexTrip0x(hexs) {
  if (0 == hexs.indexOf('0x')) {
      return hexs.slice(2);
  }
  return hexs;
}

const importSomeToNewWallet = async() => {
  // gpkDetails.push({ index: 0, curve: '1', alg: '1', gpk: storemanConfig.gpk1})
  // gpkDetails.push({ index: 1, curve: '0', alg: '0', gpk: storemanConfig.gpk2})
  // 注意， 选gpk2
  const allStoreMan = [
    "0xc81f6bb5f8142bb4b27be46176fc1206321c7a6b78c29766e78b394bdfd4b110c25a531d339b9516381e8a10f1f1736ce741bde9c110b164b8c1a008011c58ac",
    "0x0ee694c18938358e9751ce529bec588acbedd75d43830661c2aa33f3c34a340705ea9a01964f39f5b085447bab3f49609b7165659aa674e1f17a88f14f2d82ae",
    "0x16d5b0180a2344bd36aa2c972fb5947b2be7e1fc6832007e4fabeea224de5b5a7a5f8409620447f7ef21e4da0111b9e839fa597902e79169ec6d2db528e511d4",
    "0x5e1c5cdc75df6a1842a8bd957deeb8ebf84ab4239cc7a421619683f5c056ebe5f89554bc6195fec6962996da3ea67ce7c6f0a013105fa6d55c99724434946868"
  ]

  // const fromTime = 'now'
  const fromTime = Math.round(new Date().getTime() / 1000) - 30 * 24 * 3600
  const infos = []
  for (let k in allStoreMan) {
    const gpk = allStoreMan[k]
    const publicKey = "04" + hexTrip0x(gpk)
    const alice = ECPair.fromPublicKey(Buffer.from(publicKey, 'hex'), {network, compressed: false})
    const p2pkh = bitcoin.payments.p2pkh({pubkey: alice.publicKey, network})
    console.log(`try import ${p2pkh.address}`)
    const desc = `addr(${p2pkh.address})`
    const info = await newClient.getDescriptorInfo(desc)
    info.label = ""
    infos.push(info)
  }
  await importDescriptorByFetch(infos, fromTime)
}

setTimeout(async ()=> {
  console.log('*** begin')

  await importSomeToNewWallet()
  console.log('*** end')
}, 0)