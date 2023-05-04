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

function idToHash(txid) {
  return Buffer.from(txid, 'hex').reverse();
}

function toUnit(amount, decimals = 8) {
  const unit = Math.pow(10, decimals)
  return Math.floor(amount * unit)
}

function hexAdd0x(hexs) {
  if (0 != hexs.indexOf('0x')) {
    return '0x' + hexs;
  }
  return hexs;
}

function getHash(id, user) {
  const hash = bitcoin.crypto.sha256(hexAdd0x(id) + user)
  return hexTrip0x(hash.toString('hex'))
}

const toXOnly = pubKey => {
  if (!(pubKey instanceof Buffer)) {
    return null
  }

  if (pubKey.length === 32) {
    return pubKey
  }

  if (pubKey.length === 33 || pubKey.length === 65) {
    return pubKey.slice(1, 33)
  }

  if (pubKey.length === 64) {
    return pubKey.slice(0, 32)
  }

  return null
}
function tapTweakHash(pubKey, h) {
  return bitcoin.crypto.taggedHash(
    'TapTweak',
    Buffer.concat(h ? [pubKey, h] : [pubKey]),
  );
}
function tweakSigner(signer, opts) {
  let privateKey= signer.privateKey
  if (!privateKey) {
    throw new Error('Private key is required for tweaking signer!');
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey);
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash),
  );
  if (!tweakedPrivateKey) {
    throw new Error('Invalid tweaked private key!');
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  });
}

function tweakPublicKey(xPublicKey) {
  const tweakedHash = tapTweakHash(xPublicKey)
  const tweakedPublicKey = ecc.xOnlyPointAddTweak(xPublicKey, tweakedHash)
  console.log(`tweaked public key is ${tweakedPublicKey.xOnlyPubkey.toString('hex')}`)
}

function hexTrip0x(hexs) {
  if (0 == hexs.indexOf('0x')) {
      return hexs.slice(2);
  }
  return hexs;
}

function getOtaP2shRedeemScript(randomId, userAccount, MPC_PK) {
  let randomHash = getHash(randomId, userAccount);
  let pkBuffer = MPC_PK instanceof Buffer ? MPC_PK : Buffer.from(MPC_PK, 'hex') 
  if (MPC_PK.length === 64) {
    pkBuffer = Buffer.concat([Buffer(4), pkBuffer])
  } 
  if (MPC_PK.length !== 33 && MPC_PK.length !== 65) {
    throw new Error(`${MPC_PK} is not a valid public key`)
  }
  return bitcoin.script.fromASM(
    `
    ${hexTrip0x(randomHash)}
    OP_DROP
    OP_DUP
    OP_HASH160
    ${bitcoin.crypto.hash160(pkBuffer).toString('hex')}
    OP_EQUALVERIFY
    OP_CHECKSIG
    `.trim()
      .replace(/\s+/g, ' '),
  )
}

function getOtaP2trRedeemScript(randomId, userAccount, MPC_PK) {
  let randomHash = getHash(randomId, userAccount);
  let pkBuffer = MPC_PK instanceof Buffer ? MPC_PK : Buffer.from(MPC_PK, 'hex') 
  let xOnlyMpcPk = toXOnly(pkBuffer)
  return bitcoin.script.fromASM(
    `
  ${hexTrip0x(randomHash)}
  OP_DROP
  OP_DUP
  OP_HASH160
  ${bitcoin.crypto.hash160(Buffer.from(xOnlyMpcPk, 'hex')).toString('hex')}
  OP_EQUALVERIFY
  OP_CHECKSIG
  `.trim()
      .replace(/\s+/g, ' '),
  )
}

function getSmgP2trRedeemScript(MPC_PK) {
  let pkBuffer = MPC_PK instanceof Buffer ? MPC_PK : Buffer.from(MPC_PK, 'hex') 
  let xOnlyMpcPk = toXOnly(pkBuffer)
  return bitcoin.script.fromASM(
    `
  OP_DUP
  OP_HASH160
  ${bitcoin.crypto.hash160(Buffer.from(xOnlyMpcPk, 'hex')).toString('hex')}
  OP_EQUALVERIFY
  OP_CHECKSIG
  `.trim()
      .replace(/\s+/g, ' '),
  )
}

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

const testGetAddress = async (compressed = true) => {
  // const alice = ECPair.fromPrivateKey(Buffer.from('86812cf8897887c7d943d1ce592b8ada8f1869cdd29dc3cd84818cc4ddd988a2', 'hex'), network)
  // const alice = ECPair.fromWIF('cNUx4bohBTqM41hf2dLDVoCHSexqgj29Q9poCnvT3i8DtMnJATaa', network)
  // alice cNUx4bohBTqM41hf2dLDVoCHSexqgj29Q9poCnvT3i8DtMnJATaa
  // aliceUncompressed   91nkjxTthS7RUsTRvqZSwZDXTf48rnKPJ2Yg1rpuaErDSKQffe9
  const alice = ECPair.fromPrivateKey(Buffer.from('1ae0ed26d71c7c5178347edc69f2336388b12e1f1a6d6306754fed8263c8a878', 'hex'), {network, compressed})
  // const alice = ECPair.fromWIF('91nkjxTthS7RUsTRvqZSwZDXTf48rnKPJ2Yg1rpuaErDSKQffe9', network)
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

// const wanAddress = '0x34aABB238177eF195ed90FEa056Edd6648732014'
// const rndId = '0x9096125c5f89d4a29869f526415b6bf0818b6697b34c02f65361a0046d211f1b'
// const gpkP2tr = '0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8'
// p2tr smg script path spend = tb1p97lc6zfzyv9wzahpq6ktykltmpuhta48l9t6rwpa77xf9ch6lwlqn628ap, length = 62
// p2tr ota script path spend = tb1px25ern5cte676f8eft679cc4w5hvkmfsmfqr7246tc52rxjy4nys787lcp, length = 62

const wanAddress = '0x34aABB238177eF195ed90FEa056Edd6648732014'
const rndId = '0x2096125c5f89d4a29869f526415b6bf0818b6697b34c02f65361a0046d211f1b'
const gpkP2pkh = '0x4dd7ac4596dc87a266d559b4b2c53b8b340522ce3d21443f9f3b19ec532571b0d140b91b47a68c3758196614f6d523792dd5c7fd7e25647b5507e8d6a21ffd57'
// p2pkh = mvqKUF6jQhv6JszEJ4QkTtS4h7tgpjVQ89, length = 34 
// p2sh = 2N8spV8DBdAMTKpdVKCSeayMvZUZPQoqaQB, length = 35

const testGetGpkAddress = async () => {
  // const aliceKeyPair = ECPair.fromPrivateKey(Buffer.from('1ae0ed26d71c7c5178347edc69f2336388b12e1f1a6d6306754fed8263c8a878', 'hex'), {network, compressed: false})
  // const publicKey = aliceKeyPair.publicKey.toString('hex')

  // const gpkP2tr = "0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8"
  // console.log(`gpk is ${gpkP2tr}`)
  // const publicKey = "04" + hexTrip0x(gpkP2tr)

  // const gpkP2pkh = "0x4dd7ac4596dc87a266d559b4b2c53b8b340522ce3d21443f9f3b19ec532571b0d140b91b47a68c3758196614f6d523792dd5c7fd7e25647b5507e8d6a21ffd57"
  console.log(`gpk is ${gpkP2pkh}`)
  const publicKey = "04" + hexTrip0x(gpkP2pkh)


  const alice = ECPair.fromPublicKey(Buffer.from(publicKey, 'hex'), {network, compressed: false})

  // p2pkh
  const pkh = bitcoin.payments.p2pkh({pubkey: alice.publicKey, network})
  console.log(`p2pkh = ${pkh.address}, length = ${pkh.address.length} `)

  // p2sh
  const redeemScript = getOtaP2shRedeemScript(rndId, wanAddress, alice.publicKey)
  const sh = bitcoin.payments.p2sh({ redeem: { output: redeemScript, network }, network})
  console.log(`p2sh = ${sh.address}, length = ${sh.address.length}`)

  // p2wpkh 不支持非压缩公钥
  const wpkh = bitcoin.payments.p2wpkh({pubkey: alice.publicKey, network})
  console.log(`p2wpkh = ${wpkh.address}, length = ${wpkh.address.length}`)
  // p2wsh 不支持非压缩公钥
  const wsh = bitcoin.payments.p2wsh({redeem: { output: redeemScript, network }, network})
  console.log(`p2wsh = ${wsh.address}, length = ${wsh.address.length}`)

  // p2pktr
  const xOnlyMpcPk = alice.publicKey.slice(1, 33)
  const tr = bitcoin.payments.p2tr({ internalPubkey: xOnlyMpcPk, network})
  console.log(`p2tr key path spend = ${tr.address}, length = ${tr.address.length}`)

  // p2shtr --- ota
  const otaRedeemScript = getOtaP2trRedeemScript(rndId, wanAddress, alice.publicKey)
  const otaScriptTree = {
    output: otaRedeemScript,
  }
  const ota = bitcoin.payments.p2tr({ internalPubkey: xOnlyMpcPk, scriptTree: otaScriptTree, network})
  console.log(`p2tr ota script path spend = ${ota.address}, length = ${ota.address.length}`)

  // p2shtr --- smg
  const smgRedeemScript = getSmgP2trRedeemScript(alice.publicKey)
  const smgScriptTree = {
    output: smgRedeemScript,
  }
  const smg = bitcoin.payments.p2tr({ internalPubkey: xOnlyMpcPk, scriptTree: smgScriptTree, network})
  console.log(`p2tr smg script path spend = ${smg.address}, length = ${smg.address.length}`)

  return {pkh, sh, wpkh, wsh, tr, ota, smg}
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
  // await testGetAddress(true)
  // await testGetAddress(false)

  await testGetGpkAddress()

  console.log('*** end')
}, 0)