const bitcoin = require('bitcoinjs-lib');
const Client = require('bitcoin-core')
const ECPAIR = require('ecpair');
const { testnet } = require('bitcoinjs-lib/src/networks');

const options = {
  testnet: {
    network: 'testnet',
    host: "bitcoind-testnet.wandevs.org",
    port: 36893,
    username: 'wanglu',
    password: 'Wanchain888'
  },
  bitcoin: {
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

const addressExamples = {
  "regtest": {
    "p2pkh": "mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh",                                // 34
    "p2sh": "2NFer9f5uZzTMttb6aeYvCyGJeAR3YsNued",                                // 35
    "p2wpkh": "bcrt1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0ezh0uzs",                     // 44
    "p2wsh": "bcrt1qansjcula52f0ee0fhkk4n2lzpf876r336vdxyfv70vtfsn7hfacqne7ag7",  // 64
    "p2tr": "bcrt1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6pskpqkaj",   // 64
  },
  "testnet": {
    "p2pkh": "mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh",                                // 34
    "p2sh": "2NFer9f5uZzTMttb6aeYvCyGJeAR3YsNued",                                // 35
    "p2wpkh": "tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e",                       // 42
    "p2wsh": "tb1qansjcula52f0ee0fhkk4n2lzpf876r336vdxyfv70vtfsn7hfacq7q5may",    // 62
    // "p2tr": "tb1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6psmc2sgg",     // 62
    "p2tr": "tb1pd07zgv8jchdr0h76032yux02znsscawt0yakwnw7yykewt3c6ynsekjyqe",
  },
  "mainnet": {
    "p2pkh": "1Q1n39QtWCLYdtR4srQZRsLKj5W4zaEf3k",                                // 34
    "p2sh": "34rmZhyozVTVU3jojsdTxzsZCnur5Qvc2b",                                 // 34
    "p2wpkh": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",                       // 42
    "p2wsh": "bc1qcl2873zltthy6lytknk4htzz5jsyp3p7l3kdtddszzqxnxyr2zasg300hx",    // 62
    "p2tr": "bc1p7w7gu2wlwpsy8k8zquyruytj4ftle0w6j8e4zq43falyyhtyz3dq2apcdz",     // 62
  },
}

const testGetAddress = async () => {
  // const alice = ECPair.fromPrivateKey(Buffer.from('86812cf8897887c7d943d1ce592b8ada8f1869cdd29dc3cd84818cc4ddd988a2', 'hex'), network)
  // const alice = ECPair.fromWIF('cNUx4bohBTqM41hf2dLDVoCHSexqgj29Q9poCnvT3i8DtMnJATaa', network)
  // alice cNUx4bohBTqM41hf2dLDVoCHSexqgj29Q9poCnvT3i8DtMnJATaa
  // aliceUncompressed   91nkjxTthS7RUsTRvqZSwZDXTf48rnKPJ2Yg1rpuaErDSKQffe9
  const alice = ECPair.fromWIF('91nkjxTthS7RUsTRvqZSwZDXTf48rnKPJ2Yg1rpuaErDSKQffe9', network)
  console.log(`public key isCompressed = ${alice.compressed}`)
  
  // const pk = bitcoin.payments.p2pk({pubkey: alice.publicKey, network})
  // const pkAddr = ECPair.fromPublicKey(alice.publicKey, {network}).getAddress()
  // console.log(`p2pk = ${pkAddr}, length = ${pk.address.length} `)

  const pkh = bitcoin.payments.p2pkh({pubkey: alice.publicKey, network})
  console.log(`p2pkh = ${pkh.address}, length = ${pkh.address.length} `)

  const sh = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2pkh({pubkey: alice.publicKey, network}), network})
  console.log(`p2sh = ${sh.address}, length = ${sh.address.length}`)

  // 本来p2wpkh不支持
  const wpkh = bitcoin.payments.p2wpkh({pubkey: alice.publicKey, network})
  console.log(`p2wpkh = ${wpkh.address}, length = ${wpkh.address.length}`)

  const wsh = bitcoin.payments.p2wsh({redeem: bitcoin.payments.p2pkh({pubkey: alice.publicKey, network}), network})
  console.log(`p2wsh = ${wsh.address}, length = ${wsh.address.length}`)

  // 要用internalPubkey
  const tr = bitcoin.payments.p2tr({ internalPubkey: alice.publicKey.slice(1, 33), network})
  console.log(`p2tr key path spend = ${tr.address}, length = ${tr.address.length}`)

  // trWrong
  const trWrong = bitcoin.payments.p2tr({ pubkey: alice.publicKey.slice(1, 33), network})
  console.log(`p2tr wrong key path spend = ${trWrong.address}, length = ${trWrong.address.length}`)

  // const ms = bitcoin.payments.p2ms({ pubkey: alice.publicKey, network})
  // console.log(`p2ms = ${ms.address}, length = ${ms.address.length}`)

  return {pkh, sh, wpkh, wsh, tr}
}

const getAddressType = (address, network) => {
  if (address.length > 40) {
    const lock = bitcoin.address.fromBech32(address)
    if (lock.prefix === network.bech32) {
      if (lock.version === 1) {
        if (lock.data.length === 32) {
          return "p2tr"
        }
      } else if (lock.version === 0) {
        if (lock.data.length === 20) {
          return "p2wpkh"
        } else if (lock.data.length === 32) {
          return "p2wsh"
        }
      }
    }
  } else {
    const lock = bitcoin.address.fromBase58Check(address)
    if (lock.version === network.pubKeyHash) {
      if (lock.hash.length === 20) {
        return "p2pkh"
      }
    } else if (lock.version === network.scriptHash) {
      if (lock.hash.length === 20) {
        return "p2sh"
      }
    }
  }

  return "unknown"
}


function addressToLockHash(address, addressType, network) {
  if (address.length > 40) {
    const lock = bitcoin.address.fromBech32(address)
    if (lock.prefix === network.bech32) {
      if (lock.version === 1) {
        return lock.data.toString('hex')
      } else if (lock.version === 0) {
        if (lock.data.length === 20) {
          return lock.data.toString('hex')
        } else if (lock.data.length === 32) {
          return lock.data.toString('hex')
        }
      }
    }
  } else {
    const lock = bitcoin.address.fromBase58Check(address)
    if (lock.version === network.pubKeyHash) {
      if (lock.hash.length === 20) {
        return lock.hash.toString('hex')
      }
    } else if (lock.version === network.scriptHash) {
      if (lock.hash.length === 20) {
        return lock.hash.toString('hex')
      }
    }
  }

  return null
}

const testGetAddressLock = async() => {
  for (let type in addressExamples[usedNetwork]) {
    const address = addressExamples[usedNetwork][type]
    const addressType = getAddressType(address, network)
    console.log(`${address} is ${addressType} address`)
  }
}

// addressToLockHash
// addressToHash160
// hash160ToAddress
const testAddressToLockHash = async() => {
  const ota = 'tb1px25ern5cte676f8eft679cc4w5hvkmfsmfqr7246tc52rxjy4nys787lcp'
  const otaHash = '32a991ce985e75ed24f94af5e2e315752ecb6d30da403f2aba5e28a19a44acc9'
  const hash = addressToLockHash(ota, "", network)

  if (hash == otaHash) {
    console.log('good')
  }
}

setTimeout(async ()=> {
  console.log('*** begin')
  await init()

  // await testGetAddressLock()
  // await testAddressToLockHash()
  // addressToLockHash("tb1px25ern5cte676f8eft679cc4w5hvkmfsmfqr7246tc52rxjy4nys787lcp", network)
  await testGetAddress()


  console.log('*** end')
}, 0)