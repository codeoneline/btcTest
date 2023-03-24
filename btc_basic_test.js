const bitcoin = require('bitcoinjs-lib');
const Client = require('bitcoin-core')
const ECPAIR = require('ecpair')
const axios = require('axios')
const rq = require('request-promise')

/**
 * axios拦截器
 */
axios.interceptors.request.use(function (config) {
  console.log('请求参数：', config);
  return config;
}, error => {
  return Promise.reject(error);
});
axios.interceptors.response.use(function (response) {
  console.log('返回结果：', response);
  return response;
}, error => {
  console.log('返回错误：', error);
  const response = error.response;
  return Promise.reject(error);
});

const options = {
  testnet: {
    network: 'testnet',
    host: "bitcoind-testnet.wandevs.org",
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

const usedNetwork = "testnet"
const network = bitcoin.networks[usedNetwork]
const btcConfig = options[usedNetwork]
const walletPath = "/home/jsw/btc/data/regtest/regtest/wallets/"

process.on('uncaughtException', error => {
  console.log(`uncaughtException ${error}`)
});

process.on('unhandledRejection', error => {
  console.log(`unhandledRejection ${error}`)
});

let ecc = null
let client = null
let ECPair = null
async function init(){
  ecc = await import('tiny-secp256k1');
  bitcoin.initEccLib(ecc)
  ECPair = ECPAIR.ECPairFactory(ecc)
  client = new Client(btcConfig)
}

function  getXBytes(pk){
  let pkTemp = pk;
  if(pk.slice(0,2).toString().toLowerCase() === "0x"){
      pkTemp = pk.slice(2)
  }
  if(pkTemp.length == 64){
      return Buffer.from(pkTemp.slice(0,64),'hex')
  }
  if(pkTemp.length == 66){
      return Buffer.from(pkTemp.slice(2,66),'hex')
  }
  if(pkTemp.length == 128){
      return Buffer.from(pkTemp.slice(0,64),'hex')
  }
  if(pkTemp.length == 130){
      return Buffer.from(pkTemp.slice(2,66),'hex')
  }
  return "";
}

function getP2trKeySpendAddress(storemanPk, network) {
    const xPubKey = getXBytes(storemanPk)
    const p2tr = bitcoin.payments.p2tr({ pubkey: xPubKey, network})
    return p2tr.address
}

// ota tb1px25ern5cte676f8eft679cc4w5hvkmfsmfqr7246tc52rxjy4nys787lcp
const testGetKeySpendP2trAddress = async() => {
  // sm tb1plkyl42e39xfkd7m2megaejuyvf80w66qrzc7rjf64sv4mxz5qmuslpsn69
  const gpk = '0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8'

  const address = getP2trKeySpendAddress(gpk, network)
  console.log(`testGetKeySpendP2trAddress ${address}, ${network}`)
}

const testImportAddress = async() => {
  const address = 'tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e'
  const errors = await client.importAddress(address, '', false)
  console.log(`import address ${JSON.stringify(errors, null, 2)}`)
}

const testImportMulti = async() => {
  const address = 'tb1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6psmc2sgg'
  const errors = await client.importMulti([{ "scriptPubKey": { "address": address }, "timestamp": "now" }])
  console.log(`import multi ${JSON.stringify(errors, null, 2)}`)
}

const testGetUxto = async () => {
  const address = 'tb1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6psmc2sgg'
  const utxos = await client.listUnspent(0, 9000000, [address])
  // const utxos = await client.listUnspent(0, 9000000, ['tb1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6psmc2sgg', 'tb1px25ern5cte676f8eft679cc4w5hvkmfsmfqr7246tc52rxjy4nys787lcp', 'tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e'])
  console.log(`utxo: ${JSON.stringify(utxos, null, 2)}`)
}

const testGetAddressInfo = async (addr) => {
  // getaddressinfo
  const address = addr ? addr : 'mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh'
  const info = await client.getAddressInfo(address)
  console.log(`get address info ${JSON.stringify(info, null, 2)}`)
}

// Classic & SegWit: P2PK, P2PKH, P2WPKH, P2SH, P2WSH, P2MS
// Schnorr & Taproot BIP340/BIP341: P2TR, P2TR-NS, P2TR-MS
const testGetP2trAddress = async () => {
  // pk 02 "713800a4441652b2e3829a3f36ce54e88eb6d780841c54ee7c42a5395ec1fe83"
  const alice = ECPair.fromWIF('cNUx4bohBTqM41hf2dLDVoCHSexqgj29Q9poCnvT3i8DtMnJATaa', network)
  // const alice = ECPair.fromWIF('cSEyS9LEjBWPa71mA4HQzseYDJD9bkvWpVUgk3Dw7SvpVQnx19HH', network)
  // const alice = ECPair.fromWIF('cSQPHDBwXGjVzWRqAHm6zfvQhaTuj1f2bFH58h55ghbjtFwvmeXR', network)

  // pkh(cSQPHDBwXGjVzWRqAHm6zfvQhaTuj1f2bFH58h55ghbjtFwvmeXR) --> mrkwtj5xpYQjHeJe5wsweNjVeTKkvR5fCr                 pkh(wif格式私钥) --> 地址
  // pkh(02e96fe52ef0e22d2f131dd425ce1893073a3c6ad20e8cac36726393dfb4856a4c) --> mrkwtj5xpYQjHeJe5wsweNjVeTKkvR5fCr   pkh(压缩格式公钥) --> 地址
  const pkh = bitcoin.payments.p2pkh({pubkey: alice.publicKey, network})
  console.log(`p2pkh = ${pkh.address}`)

  const sh = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({pubkey: alice.publicKey, network}), network})
  console.log(`p2sh = ${sh.address}`)

  const wpkh = bitcoin.payments.p2wpkh({pubkey: alice.publicKey, network})
  console.log(`p2wpkh = ${wpkh.address}`)

  const wsh = bitcoin.payments.p2wsh({redeem: bitcoin.payments.p2wpkh({pubkey: alice.publicKey, network}), network})
  console.log(`p2wsh = ${wsh.address}`)

  const tr = bitcoin.payments.p2tr({ pubkey: alice.publicKey.slice(1, 33), network})
  console.log(`p2tr key path spend = ${tr.address}`)

  return {pkh, sh, wpkh, wsh, tr}
}

// --host=52.40.34.234  --port=36893
const testDescriptors = async() => {
  const all = await testGetP2trAddress()

  for (let k in all) {
    const pay = all[k]
    const desc = `addr(${pay.address})`
    const info = await client.getDescriptorInfo(desc)
    // console.log(`get descriptor info ${JSON.stringify(info, null, 2)}`)

    /// 1. use axios
    const headers = [
      {'content-type': 'text/plain'}
    ]
    // bitcoin-cli -rpcconnect=52.40.34.234:36893 -rpcpassword=Wanchain888 -rpcuser=wanglu listwallets
    // const url = 'http://127.0.0.1:18443/'
    const url = 'http://52.40.34.234:36893/'
    const params = `[[{"desc": "${info.descriptor}", "timestamp": "now"}]]`
    const methodName = 'importdescriptors'
    const body = `{ "jsonrpc": "1.0", "id": "curltext", "method": "${methodName}", "params": ${params} }`
    const auth = {
      username: 'wanglu',
      password: 'Wanchain888',
    }
    const res = await axios.post(url, body, { auth, headers })

    if (res.status === 200) {
      if (!res.data.error) {
        console.log(`import descriptors info ${JSON.stringify(res.data.result) }`)
      }
    }


    /// 2. use request-promise
    // const headers = [
    //   {'content-type': 'text/plain'}
    // ]

    // const methodName = 'importdescriptors'
    // const params = `[[{"desc": "${info.descriptor}", "timestamp": "now"}]]`

    // const data = `{ "jsonrpc": "1.0", "id": "curltext", "method": "${methodName}", "params": ${params} }`

    // const body =  {
    //   url: `http://wanglu:Wanchain888@127.0.0.1:18443/`,
    //   method: "POST",
    //   headers: headers,
    //   body: data
    // }
    // const res = await rq(body)
    // if (!res.error) {
    //   console.log(`import descriptors info ${JSON.stringify(JSON.parse(res).result)}`)
    // }
  }
}

setTimeout(async ()=> {
  console.log('*** begin')
  await init()
  // const p2 = await testGetP2trAddress()
  // const info = await testGetAddressInfo(p2.pkh)

  await testDescriptors()
  console.log('*** end')
}, 0)