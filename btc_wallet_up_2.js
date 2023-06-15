// bitcoind -chain=regtest -conf=/home/jsw/btc/cfg/bitcoin.conf
// bitcoin-cli -rpcconnect=127.0.0.1:18443 -rpcpassword=Wanchain888 -rpcuser=wanglu

const bitcoin = require('bitcoinjs-lib');
const Client = require('bitcoin-core')
const ECPAIR = require('ecpair')
const axios = require('axios')

process.on('uncaughtException', error => {
  console.log(`uncaughtException ${error}`)
});

process.on('unhandledRejection', error => {
  console.log(`unhandledRejection ${error}`)
});

const options = {
  testnet: {
    network: 'testnet',
    host: "52.40.34.234",
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
const btcConfig = options[usedNetwork]


let ecc = null
let client = null
let ECPair = null
async function init(){
  ecc = await import('tiny-secp256k1');
  bitcoin.initEccLib(ecc)
  ECPair = ECPAIR.ECPairFactory(ecc)
  client = new Client(btcConfig)
}

const initAxios = () => {
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
}

const importDescriptorByAxios = async(info) => {
  const headers = {
    'content-type': 'text/plain',
  }
  const url = 'http://52.40.34.234:36893/'
  const methodName = 'importdescriptors'
  const params = `[[{"desc": "${info.descriptor}", "timestamp": ${pay.time} }]]`
  const body = `{ "jsonrpc": "1.0", "id": "curltext", "method": "${methodName}", "params": ${params} }`
  const auth = {
    username: 'wanglu',
    password: 'Wanchain888',
  }
  const res = await axios.post(url, body, { auth, headers })

  if (res.status === 200) {
    if (!res.data.error) {
      console.log(`import descriptors info ${JSON.stringify(res.data.result) }`)
      return res.data.result
    }
  }
}

const importDescriptorByFetch = async(info) => {
  const fetch = require('node-fetch')

  const headers = {
    'content-type': 'text/plain',
    'Authorization': 'Basic ' + Buffer.from('wanglu:Wanchain888').toString('base64'),
  }

  const methodName = 'importdescriptors'
  const params = `[[{"desc": "${info.descriptor}", "timestamp": "now"}]]`
  const data = `{ "jsonrpc": "1.0", "id": "curltext", "method": "${methodName}", "params": ${params} }`

  const url = 'http://127.0.0.1:18443/'
  // const url = 'http://wanglu:Wanchain888@127.0.0.1:18443/'
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

const importDescriptorByRequestPromise = async(info) => {
  const rq = require('request-promise')
  const headers = {
    'content-type': 'text/plain',
    'Authorization': 'Basic ' + Buffer.from('wanglu:Wanchain888').toString('base64'),
  }

  const methodName = 'importdescriptors'
  const params = `[[{"desc": "${info.descriptor}", "timestamp": "now"}]]`

  const data = `{ "jsonrpc": "1.0", "id": "curltext", "method": "${methodName}", "params": ${params} }`

  const body =  {
    // url: `http://wanglu:Wanchain888@127.0.0.1:18443/`,
    url: `http://127.0.0.1:18443/`,
    method: "POST",
    headers: headers,
    body: data
  }
  const res = await rq(body)
  if (!res.error) {
    console.log(`import descriptors info ${JSON.stringify(JSON.parse(res).result)}`)
    return JSON.parse(res).result
  }
}

const importDescriptorByRequest = async(info) => {
  const rq = require('request')
  const headers = {
    'content-type': 'text/plain',
    'Authorization': 'Basic ' + Buffer.from('wanglu:Wanchain888').toString('base64'),
  }

  const methodName = 'importdescriptors'
  const params = `[[{"desc": "${info.descriptor}#1", "timestamp": "now"}]]`

  const data = `{ "jsonrpc": "1.0", "id": "curltext", "method": "${methodName}", "params": ${params} }`

  const body =  {
    // url: `http://wanglu:Wanchain888@127.0.0.1:18443/`,
    url: `http://127.0.0.1:18443/`,
    method: "POST",
    headers: headers,
    body: data
  }
  rq(body, function(error, res, body) {
    if (!error && body.length > 0) {
      console.log(`import descriptors info ${JSON.stringify(JSON.parse(body).result)}`)
      const rt = JSON.parse(body)
      if (!rt.error) {
        const results = rt.result
        for (let i = 0; i < results.length; i ++) {
          const rs = results[i]
          if (rs.success) {
            // 成功
            console.log(`success ${JSON.stringify(rs.success)}`)
            // success [{"success":true}]
            return rs.success
          } else {
            // error [{"success":false,"error":{"code":-5,"message":"Address is not valid"}}]
            return rs.error
          }
        }
      }
    }
  })
}

const upToDescriptors = async() => {
  // const all = await oldClient.listAddressGroupings()
  const all = [
    // {
    //   address: 'tb1qhra5az5e0eukh4lhwxx8lz5v6x8gl890s2q3u7', // testnet
    //   time: 'now',
    // },
    // {
    //   address: 'tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e',
    //   time: 'now',
    // },
    {
      // address: 'n4E7xShkNG71GZg5b5PHPpWYuGHN4kggR1', // testnet
      address: '2NFer9f5uZzTMttb6aeYvCyGJeAR3YsNued', // regtest
      time: 'now',
    },
  ]

  for (let k in all) {
    const pay = all[k]
    const desc = `addr(${pay.address})`
    const info = await client.getDescriptorInfo(desc)
    // console.log(`get descriptor info ${JSON.stringify(info, null, 2)}`)

    // await importDescriptorByRequest(info)
    await importDescriptorByFetch(info)
  }
}

setTimeout(async ()=> {
  console.log('*** begin')
  await init()

  const auth = client.auth
  await upToDescriptors()
  console.log('*** end')
}, 0)