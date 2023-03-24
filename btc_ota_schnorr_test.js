const bitcoin = require('bitcoinjs-lib')
const psbtUtils = require('bitcoinjs-lib/src/psbt/psbtutils')

const Client = require('bitcoin-core');

const crypto = require('crypto');

const ecpair = require('ecpair')
const secp256k1 = require('tiny-secp256k1')
bitcoin.initEccLib(secp256k1)
const ECPair = ecpair.ECPairFactory(secp256k1)
bitcoin.ECPair = ECPair

const network = bitcoin.networks.testnet;

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
    port: 18445,
    username: 'wanglu',
    password: 'Wanchain888'
  }
}

const client = new Client(options.testnet)

// https://live.blockcypher.com/btc-testnet/address/
function Private2Address() {
  // // private key from mnemonic
  // const bip39 = require('bip39')
  // const BIP32 = require('bip32');
  // const bip32 = BIP32.BIP32Factory(secp256k1);
  // const mnemonic = "whale weasel funny tool dinner kid shield enrich build address wasp rent"
  // let seed = bip39.mnemonicToSeedSync(mnemonic)
  // const root = bip32.fromSeed(seed, network);
  // const myKey = root.derivePath("m/44'/0'/0'/0/0");

  // // private key from random
  // const crypto = require('crypto');
  // const privateKey = crypto.randomBytes(32)
  // console.log(`private key is ${privateKey.toString('hex')}`)
  // const myKey = bitcoin.ECPair.fromPrivateKey(privateKey, {network, compressed: true})
  

  // // private key from random
  let myKey = null
  for(let i = 0; i< 1000; i++) {
    myKey = bitcoin.ECPair.makeRandom({network})
    const pk = myKey.publicKey
    if (pk[0] === 3) {
      console.log(pk.toString('hex'))
      break
    }
  }
  // const myKey = bitcoin.ECPair.makeRandom();

  // // private key from hex
  // const privateKey = Buffer.from('1ae0ed26d71c7c5178347edc69f2336388b12e1f1a6d6306754fed8263c8a878', 'hex')
  // const privateKey = Buffer.from('8b09ca077dbc21f0e8130f19c56d688ed416d87e5d9479c36c7bb4185ea2690a', 'hex')
  // const myKey = bitcoin.ECPair.fromPrivateKey(privateKey, {network, compressed: true})

  // // private key from wif
  // const myKey = bitcoin.ECPair.fromWIF('cSEyS9LEjBWPa71mA4HQzseYDJD9bkvWpVUgk3Dw7SvpVQnx19HH', network)

  console.log(`private key wif is ${myKey.toWIF()}`)
  console.log(`private key hex is ${myKey.privateKey.toString('hex')}`)

  // base58check 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz 
  // 对 version(1B) + hash160(20B) + checksum(4B)的结果做base58映射
  // mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh, 0.00007607 BTC, tx 1cf9816a07f500d29c9807e5a1d89dc63f64478675c675ed94a2777b44015ca9
  let myPkh = bitcoin.payments.p2pkh({pubkey: myKey.publicKey, network})
  let myPkhAddress = myPkh.address
  console.log(`my p2pkh address is ${myPkhAddress}`)

  // bench qpzry9x8gf2tvdw0s3jn54khce6mua7l 对hash160的结果做bench映射
  // tb1-qkk6xh7dfh7sqa66a0z02etdtfmgk6y0e-q7k34e
  // tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e, 0.01327878  btc, tx 76690a446d84c85bf384bd92076aca1f28fcabe84d13c65ec2dda900fda7df6d
  let myWit = bitcoin.payments.p2wpkh({pubkey: myKey.publicKey, network})
  let myWitAddress = myWit.address
  console.log(`my p2wpkh address is ${myWitAddress}`)
  

  // 2NFer9f5uZzTMttb6aeYvCyGJeAR3YsNued, pay to wif addr
  let mySh = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({pubkey: myKey.publicKey, network})
  })
  let myShAddress = mySh.address
  console.log(`my p2sh address is ${myShAddress}`)


}

const validator = (pubKey, msgHash, signature) => {
  bitcoin.ECPair.fromPublicKey(pubKey).verify(msgHash, signature)
}


/// bitcoin v1-v4 
// 1. TransactionBuilder
async function spendByTxb(unspent, signer, spenderWit, toRest, to, amount = 1000, fee = 300, txType = 'p2pkh') {
  // 最原始交易类型
  if (txType === 'p2pkh') {
    // Builder
    const txb = new bitcoin.TransactionBuilder(network)
    txb.setVersion(1)
    
    // Add input
    txb.addInput(unspent.txId, unspent.vout)
  
    // Add output
    txb.addOutput(toRest, unspent.value - amount - fee)
    txb.addOutput(to, amount)
  
    txb.sign(0, signer)
    const txHex = txb.build().toHex()
  
    let txRet = await client.sendRawTransaction(txHex)
    console.log("broad tx:", txRet)
  } else if (txType === 'segwit-bench') {
    // SegWit-Bech32  save 35%

  } else if (txType === 'segwit-p2sh') {
    // SegWit-P2SH save 26%
    const p2shAlice = bitcoin.payments.p2sh({
      redeem: spenderWit,
      network
    })

    // redeem script = 00 + 20B = (version) + (hash160 alice public key)
    const redeemScript = p2shAlice.redeem.output.toString('hex')
    console.log(`Redeem script: ${redeemScript}`)

    /// tx
    const psbt = new bitcoin.Psbt({network})
    const h160Alice = Buffer.from('0014' + signer.pubKeyHash, 'hex')

    // add input
    psbt.addInput({
      hash: unspent.txId,
      index: unspent.vout,
      witnessUtxo: {
        // OP_HASH160 OP_14 + hash160() +  OP_EQUAL
        script: Buffer.from('a914' + h160Alice + '87', 'hex'),
        value: 1e3,
      },
      redeemScript: Buffer.from(redeemScript, 'hex')
    })

    // add output
    psbt.addOutput({
      address: toRest,
      value: value - amount - fee
    })
    psbt.addOutput({
      address: to,
      value: amount
    })

    psbt.signInput(0, signer)
    psbt.validateSignaturesOfInput(0)

    psbt.finalizeAllInputs()

    console.log('Transaction hexadecimal:')
    console.log(psbt.extractTransaction().toHex())
  }
}

function getHash(id, user) {
  console.log("getHash id = %s",id)
  console.log("getHash user = %s", user)
  if (!id.startsWith('0x')) {
      id = '0x' + id;
  }
  if (!user.startsWith('0x')) {
      user = '0x' + user;
  }
  const hash = crypto.createHash('sha256');
  hash.update(id + user);
  let ret = hash.digest('hex');
  console.log('getHash id = %s user=%s hash(id,user)', id, user, ret);
  if (ret.startsWith('0x')) {
      ret = ret.slice(2);
  }
  return ret;
}

function tapTweakHash(pubKey, h) {
  return bitcoin.crypto.taggedHash(
    'TapTweak',
    Buffer.concat(h ? [pubKey, h] : [pubKey]),
  );
}

/// bitcoin v5-v6
// 2. Psbt
async function spendByPsbt(opt) {
  if (opt.txType === 'p2pkh') {
    const tx = await client.getTransaction(opt.txid)
    const pAlice = bitcoin.payments.p2wpkh({ pubkey: opt.alice.publicKey, network})
    // const pBob = bitcoin.payments.p2wpkh({ pubkey: opt.bob.publicKey, network})
    const psbt = new bitcoin.Psbt({network})
      .addInput({
        hash: opt.txid,
        index: opt.vout,
        nonWitnessUtxo: Buffer.from(tx.hex, 'hex')
      }) 
      .addOutput({
        address: pAlice.address,
        value: opt.value - opt.amount - opt.fee,
      })
      .addOutput({
        // address: pBob.address, // '2N7WfHK1ftrTdhWej8rnFNR7guhvhfGWwFR',
        address: opt.bob.address ,
        value: opt.amount,
      })

    psbt.signInput(0, opt.alice)
    // psbt.validateSignaturesOfInput(0)

    psbt.finalizeAllInputs()
    const txHex = psbt.extractTransaction().toHex()

    console.log('Transaction hexadecimal:')
    console.log(txHex)

    const txRet = await client.sendRawTransaction(txHex)
    console.log("psbt p2pkh broad tx:", txRet)
  } else if (opt.txType === 'p2sh-p2wpkh') {
    const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: opt.alice.publicKey, network}) 
    const pBob = bitcoin.payments.p2wpkh({ pubkey: opt.bob.publicKey, network})
    const p2shAlice1 = bitcoin.payments.p2sh({redeem: p2wpkhAlice1, network}) 
    const redeemScript = p2shAlice1.redeem.output.toString('hex')
    console.log('Redeem script:')
    console.log(redeemScript)
    console.log(`p2shAlice1 address is ${p2shAlice1.address}`)
    const b20 = p2shAlice1.redeem.output
    const b20Wit = bitcoin.crypto.hash160(b20)
    const oAddress = bitcoin.address.toBase58Check(b20Wit, 0xc4)
    console.log(`p2sh-p2wpkh address2 is ${oAddress}`)
    const psbt = new bitcoin.Psbt({network})
      .addInput({
        hash: opt.txid,
        index: opt.vout,
        witnessUtxo: {
          script: Buffer.from('a914' +
          // bitcoin.crypto.hash160(Buffer.from('0014' + alice[1].pubKeyHash, 'hex')).toString('hex') +
          bitcoin.crypto.hash160(p2shAlice1.redeem.output).toString('hex') +
            '87', 'hex'), 
          value: opt.value,
        },
        redeemScript: Buffer.from(redeemScript, 'hex')
      })
      .addOutput({
        address: p2wpkhAlice1.address,
        value: opt.value - opt.amount - opt.fee,
      }) 
      .addOutput({
        address: pBob.address,
        value: opt.amount,
      })
      psbt.signInput(0, opt.alice)
      psbt.validateSignaturesOfInput(0)

      psbt.finalizeAllInputs()

      const txHex = psbt.extractTransaction().toHex()
      console.log('Transaction hexadecimal:')
      console.log(txHex)

      const txRet = await client.sendRawTransaction(txHex)
      console.log("psbt p2pkh broad tx:", txRet)
  } else if (opt.txType === 'native-p2wpkh') {
    // 貌似只能花费来自tb1q的钱
    console.log(`public key is ${opt.alice.publicKey.toString('hex')}`)
    console.log(`hash160 is ${bitcoin.crypto.hash160(opt.alice.publicKey).toString('hex')}`)
    const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: opt.alice.publicKey, network})
    const pAlice = bitcoin.payments.p2pkh({ pubkey: opt.alice.publicKey, network})
    const pBob = bitcoin.payments.p2pkh({ pubkey: opt.bob.publicKey, network})
    console.log('Previous output script:')
    // 00 version + OP_14 + public key hash (witness program)
    // 00 14 b5b46bf9a9bfa00eeb5d789eacadab4ed16d11f9 <=> 00 + op_14 + hash160(public key)
    console.log(p2wpkhAlice1.output.toString('hex'))
    const psbt = new bitcoin.Psbt({network})
      .addInput({
        hash: opt.txid,
        index: opt.vout,
        witnessUtxo: {
          script: p2wpkhAlice1.output,
          value: opt.value,
        }
      })
      // .addOutput({
      //   address: pAlice.address,
      //   value: opt.value - opt.amount - opt.fee,
      // })
      // .addOutput({
      //   address: pBob.address,
      //   value: opt.amount,
      // })

      .addOutput({
        address: p2wpkhAlice1.address,
        value: opt.value - opt.amount - opt.fee,
      })
      .addOutput({
        address: 'tb1pq7ugf7g662f2y9n9nuvmk8r4q88lwhyk6agcmyr8mjc3crl2w7lsp7xcuj',
        value: opt.amount,
      })

      psbt.signInput(0, opt.alice)
      // psbt.validateSignaturesOfInput(0)
  
      psbt.finalizeAllInputs()
      const txHex = psbt.extractTransaction().toHex()
  
      console.log('Transaction hexadecimal:')
      console.log(txHex)

      const txRet = await client.sendRawTransaction(txHex)
      console.log("psbt p2pkh broad tx:", txRet)
  } else if (opt.txType === 'p2sh') {
    const redeemScript = bitcoin.script.compile([
      bitcoin.opcodes.OP_ADD,
      bitcoin.opcodes.OP_5,
      bitcoin.opcodes.OP_EQUAL])
    
    console.log('Redeem script:')
    console.log(redeemScript.toString('hex'))
    const p2sh = bitcoin.payments.p2sh({redeem: {output: redeemScript, network}, network})
    console.log('P2SH address:')
    console.log(p2sh.address)

    const txId = '4e86d5c5d4a22b58eee8b530d7725927809b50ac2076a439da2e722ab1aadddd'
    const tx = await client.getTransaction(txId)
    const psbt = new bitcoin.Psbt({network})
      .addInput({
        hash: txId,
        index: 1,
        nonWitnessUtxo: Buffer.from(tx.hex, 'hex'),
        redeemScript: Buffer.from(redeemScript, 'hex')
      }) 
      .addOutput({
        address: 'tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e',
        value: 400,
      })
      .addOutput({
        address: '2N7WfHK1ftrTdhWej8rnFNR7guhvhfGWwFR',
        value: 1300,
      })
  
    // Creating the unlocking script
    const getFinalScripts = (inputIndex, input, script) => {
      // Step 1: Check to make sure the meaningful locking script matches what you expect.
      const decompiled = bitcoin.script.decompile(script)
      if (!decompiled || decompiled[0] !== bitcoin.opcodes.OP_ADD) {
        throw new Error(`Can not finalize input #${inputIndex}`)
      }
    
      // Step 2: Create final scripts
      const payment = bitcoin.payments.p2sh({
        redeem: {
          output: script,
          input: bitcoin.script.compile([bitcoin.opcodes.OP_2, bitcoin.opcodes.OP_3]), 
        },
      })
    
      return {
        finalScriptSig: payment.input
      }
    }
    
    psbt.finalizeInput(0, getFinalScripts)
    console.log('Transaction hexadecimal:')

    const txHex = psbt.extractTransaction().toHex()
    console.log(txHex)

    const txRet = await client.sendRawTransaction(txHex)
    console.log("p2sh broad tx:", txRet)
  } else if (opt.txType === 'p2tr') {
    /// get gpk
    // const { getChain } = require("../src/lib/web3_chains")
    // const wanChain = getChain('wanchain', 'testnet');
    // const groupId = '0x000000000000000000000000000000000000000000000000006a73775f303033'
    // const sgaWan = wanChain.loadContractAbiAt('StoremanGroupDelegate', '0x6FaDc9De8fba636Db627dD7DeEA4e7149ccfB838')
    // const gpkWan = wanChain.loadContractAbiAt('GpkDelegateV2', "0x75615eb788eBA08985FC8Bcf513B9805Fd09F27a")

    // // const (
    // //   SK256Curve = iota + 0
    // //   BN256Curve
    // // )
    
    // // const (
    // //   ALGECDSA = iota + 0
    // //   ALGSCHNORR
    // //   ALGSCHNORR340
    // // )
    // const CurveId = {
    //   secp256k1: 0, bn256: 1, 
    // }
    // const AlgoId = {
    //   ecdsa: 0,
    //   schnorr: 1,
    //   schnorr340:2
    // }
    // // curve=1 algo=1 gpk1 "0x258b8e8350086792f3adf797c50390760ac8722df6ab3ebfd26de846db7e1e7004bc427ae9568758db8daba80b5266f6f6e266e5253cb8ce98a4ba73e6619af1"
    // // curve=0 algo=0 gpk2 "0x4dd7ac4596dc87a266d559b4b2c53b8b340522ce3d21443f9f3b19ec532571b0d140b91b47a68c3758196614f6d523792dd5c7fd7e25647b5507e8d6a21ffd57"
    // // curve=0 algo=2 gpk3 "0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8"

    // const sInfo = await sgaWan.call('getStoremanGroupInfo', groupId)
    // console.log(JSON.stringify(sInfo, null, 2))
    const gpkCount = await gpkWan.call('getGpkCount', groupId)
    const gpkInfos = []
    for(let i=0; i<gpkCount; i++) {
      const cfg = await gpkWan.call('getGpkCfgbyGroup', groupId, i)
      const gpk = await gpkWan.call('getGpkbyIndex', groupId, i)
      gpkInfos.push({
        curve: cfg.curveIndex,
        algo: cfg.algoIndex,
        gpk,
        index: i
      })
    }
    // console.log(JSON.stringify(gpkInfos, null, 2))

    // btc curve 0 secp256k1, algo 2 schnorr340
    const gpkPubKey = '0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8'
    // get p2tr address
    const wanAddress = '0x34aABB238177eF195ed90FEa056Edd6648732014'
    const rndId = '0x9096125c5f89d4a29869f526415b6bf0818b6697b34c02f65361a0046d211f1b'
    const xOnlyMpcPk = Buffer.from(gpkPubKey.slice(2, 66), 'hex')
    console.log(`xOnlyMpcPk is ${xOnlyMpcPk.toString('hex')}`)
    const id = getHash(rndId, wanAddress)
    console.log(`id is ${id}`)
    const redeemScript = bitcoin.script.fromASM(
      `
      ${id}
      OP_DROP
      OP_DUP
      OP_HASH160
      ${bitcoin.crypto.hash160(Buffer.from(xOnlyMpcPk, 'hex')).toString('hex')}
      OP_EQUALVERIFY
      OP_CHECKSIG
      `.trim().replace(/\s+/g, ' '),
    )
    console.log("redeemscript is 0xc0 - ",redeemScript.toString('hex'))

    const cUint = require('compact-uint');
    const ver = Buffer.from('c0', 'hex')
    const len = cUint.encode(redeemScript.length)
    const buf = Buffer.concat([ver, len, redeemScript])
    console.log("hex(h) before taggedHash TapLeaf", buf.toString('hex'))
    const leafHash = bitcoin.crypto.taggedHash('TapLeaf', buf)
    const commitHash = bitcoin.crypto.taggedHash('TapTweak', Buffer.concat([xOnlyMpcPk, leafHash]))
    const ecc = await import('tiny-secp256k1');
    const tweakResult = ecc.xOnlyPointAddTweak(xOnlyMpcPk, commitHash)
    const {parity: par, xOnlyPubkey: tweaked} = tweakResult;
    const o = {
      isEven: !!!par,
      output: Buffer.concat([
          // witness v1, OP_TRUE PUSH_DATA 32 bytes
          Buffer.from([0x51, 0x20]),
          // x-only tweaked pubkey
          tweaked,
      ])
    }
    console.log(o.isEven);
    console.log(o.output.toString('hex'));

    // tb1pjgu5q0xp804ju7x97qpw7gdms3ufzrdv6fnnnjtn8f2fwp6ecfcq9udfju
    const p2trAddr = bitcoin.address.fromOutputScript(o.output, network)
    console.log(`p2tr addr is ${p2trAddr}`)
    // bitcoin.payments.p2tr
  } else if (opt.txType === 'p2tr2') {
    // btc curve 0 secp256k1, algo 2 schnorr340
    // const gpkPubKey = '0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8'

    // const privateKey = crypto.randomBytes(32)
    // console.log(`private key is ${privateKey.toString('hex')}`)
    // const myKey = bitcoin.ECPair.fromPrivateKey(privateKey, {network, compressed: true})

    // const pk = myKey.publicKey
    // // secp256k1.
    // console.log(`${pk.toString('hex')}`)

    // const gpkPubKey = '04eba73b696713608526facf4fbe14b2ce110c1341e63bd00fe4ea5fe4b9e9b97c58bc218a11a3447c32243e57e7dad167d15c35ac2fb4e40979e97cc021a3ce45'
    const gpkPubKey = opt.gpk.publicKey.toString('hex')
    console.log(`gpkPubKey ${gpkPubKey}`)
    // get p2tr address
    const wanAddress = '0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8'
    const rndId = '1234'
    const xOnlyMpcPk = Buffer.from(gpkPubKey.slice(2, 66), 'hex')
    console.log(`xOnlyMpcPk is ${xOnlyMpcPk.toString('hex')}`)
    const id = getHash(rndId, wanAddress)
    console.log(`id is ${id}`)
    const redeemScript = bitcoin.script.fromASM(
      `
      ${id}
      OP_DROP
      OP_DUP
      OP_HASH160
      ${bitcoin.crypto.hash160(xOnlyMpcPk).toString('hex')}
      OP_EQUALVERIFY
      OP_CHECKSIG
      `.trim().replace(/\s+/g, ' '),
    )
    console.log("redeemscript is 0xc0 - ",redeemScript.toString('hex'))
    const scriptTree = {
      output: redeemScript,
      version: 0xc0
    }
    
    const a = 2
    if (a === 1) {
      /// createScriptSpendOutput(internalPubkey, scriptTree)
      const cUint = require('compact-uint');
      const ver = Buffer.from([scriptTree.version])
      const len = cUint.encode(scriptTree.output.length)
      const buf = Buffer.concat([ver, len, scriptTree.output])
      console.log("hex(h) before taggedHash TapLeaf", buf.toString('hex'))
      const leafHash = bitcoin.crypto.taggedHash('TapLeaf', buf)
      console.log(`leaf hash is ${leafHash.toString('hex')}`)
      const commitHash = bitcoin.crypto.taggedHash('TapTweak', Buffer.concat([xOnlyMpcPk, leafHash]))
      const tweakResult = secp256k1.xOnlyPointAddTweak(xOnlyMpcPk, commitHash)
      const {parity: par, xOnlyPubkey: tweaked} = tweakResult;
      const o = {
        isEven: !!!par,
        output: Buffer.concat([
            // witness v1, OP_TRUE PUSH_DATA 32 bytes
            Buffer.from([0x51, 0x20]),
            // x-only tweaked pubkey, the witness program
            tweaked,
        ])
      }
      console.log(o.isEven);
      console.log(o.output.toString('hex'));

      /// get p2tr address
      // tb1pjgu5q0xp804ju7x97qpw7gdms3ufzrdv6fnnnjtn8f2fwp6ecfcq9udfju
      const p2trAddr = bitcoin.address.fromOutputScript(o.output, network)
      console.log(`p2tr addr is ${p2trAddr}`)

      /// p2tr path spend

      /// scriptPathSpend
      let preTx = opt.txid
      let preVout = opt.vout
      let preAmount = opt.value
      const pubScript = bitcoin.address.toOutputScript(opt.bob.address, network)
      const preOutScript = bitcoin.address.toOutputScript(p2trAddr, network)

      const tx = new bitcoin.Transaction()
      tx.version = 1
      tx.addInput(Buffer.from(preTx, 'hex').reverse(), preVout)
      tx.addOutput(pubScript, opt.amount)
      tx.addOutput(preOutScript, preAmount - opt.fee - opt.amount)

      const msgHash = tx.hashForWitnessV1(0, [preOutScript], [preAmount], bitcoin.Transaction.SIGHASH_DEFAULT, leafHash)
      console.log("hash for script path spend  transaction", msgHash.toString('hex'))

      // get sig from gpk.......
      // const sig = Buffer.from('921350bfcd0798dd8a67a786a1cfa626fa91b15d96ae017994a93667bc693c39627201fa99a69d7d1e605bea6711a84fd5ddefe19d3b0614b34af275bfdcab98', 'hex')
      const gpkPrivateKey = opt.gpk

      const sig = Buffer.from(gpkPrivateKey.signSchnorr(msgHash))

      /// set witness
      const parity = o.isEven ? 0xc0 : 0xc1
      const c = Buffer.concat([Buffer.from([parity]), xOnlyMpcPk])
      
      // 第一步验证脚本, q 成为  taproot output key, p 成为 taproot internal key
      // q = witness program = tweaked
      // p = xOnlyMpcPk, s = redeemScript, k0 = hashTapLeaf(v || compact_size(size of s) || s)
      // => t = hashTapTweak(p || k0)     P = lift_x(int(p))
      // => Q = P + int(t)G
      // 验证 q == x(Q) == tweaked, c[0] & 1 == y(Q) mod 2 == par  脚本验证通过
      // 第二步执行脚本 [sig, xOnlyMpcPk, redeemScript]
      // sig, xOnlyMpcPk, id, drop, dup, hash160, xx, equalVerify, checksig
      const wits = [sig, xOnlyMpcPk, redeemScript, c]
      for(let i=0;i<wits.length;i++){
        console.log("witness[%d]",i, wits[i].toString('hex'))
      }

      tx.setWitness(0, wits)
      let txSerialized = tx.toHex();
      console.log("tx=",txSerialized)
      
      // const txRet = await client.sendRawTransaction(txSerialized)
      // console.log("p2tr broad tx:", txRet)
    } else if (a === 2) {
      // tb1pjgu5q0xp804ju7x97qpw7gdms3ufzrdv6fnnnjtn8f2fwp6ecfcq9udfju
      const myOta = bitcoin.payments.p2tr({ 
        internalPubkey: xOnlyMpcPk,
        scriptTree: scriptTree,
        redeem: scriptTree,
        network 
      })

      const p2trAddr = myOta.address
      console.log(`p2tr addr is ${p2trAddr}`)

      console.log(`p2tr output is ${myOta.output.toString('hex')}`)
      // const buf = Buffer.concat([Buffer.from([scriptTree.version]), scriptTree.output.length, scriptTree.output])
      const leafHash = myOta.hash
      console.log(`leaf hash is ${leafHash.toString('hex')}`)

      console.log(`witness[2] is ${myOta.witness[0].toString('hex')}`)

      console.log(`witness[3] is ${myOta.witness[1].toString('hex')}`)

      /// p2tr path spend

      /// scriptPathSpend
      let preTx = opt.txid
      let preVout = opt.vout
      let preAmount = opt.value
      const pubScript = bitcoin.address.toOutputScript(opt.bob.address, network)
      const preOutScript = bitcoin.address.toOutputScript(p2trAddr, network)
      const tapLeafScript = [
        {
          leafVersion: 0xc0,
          script: redeemScript,
          controlBlock: myOta.witness[myOta.witness.length - 1],
        }
      ]
      
      const psbt = new bitcoin.Psbt({network})
      psbt.addInput({
        hash: preTx,
        index: preVout,
        witnessUtxo: { value: preAmount, script: myOta.output },
      })
      psbt.addOutput({
        script: pubScript,
        value: opt.amount,
      })
      psbt.addOutput({
        script: preOutScript,
        value: preAmount - opt.fee - opt.amount,
      })
      
      // 返回函数 (inputIndex, _input, _tapLeafHashToFinalize ) => return { finalScriptWitness }
      const buildLeafIndexFinalizer = (xOnlyMpcPk, myOta, key) =>{
        return (inputIndex, input, _tapLeafHashToFinalize) => {
          // const msgHash = psbt.getTaprootHashesForSig(inputIndex, _input, opt.gpk)
          const msgHash = psbt.__CACHE.__TX.hashForWitnessV1(inputIndex, [input.witnessUtxo.script], [input.witnessUtxo.value], bitcoin.Transaction.SIGHASH_DEFAULT, myOta.hash)
          const sig = Buffer.from(key.signSchnorr(msgHash))
          const witness = [sig, xOnlyMpcPk, myOta.witness[0], myOta.witness[1]]
          
          return { finalScriptWitness: psbtUtils.witnessStackToScriptWitness(witness) }
        }
      }
      const leafIndexFinalizerFn = buildLeafIndexFinalizer(xOnlyMpcPk, myOta, opt.gpk);
      psbt.finalizeInput(0, leafIndexFinalizerFn)

      // psbt.signInput(0, opt.gpk)
      const txHex = psbt.extractTransaction().toHex()
      console.log("tx=",txHex)
      
      const txRet = await client.sendRawTransaction(txHex)
      console.log("p2tr broad tx:", txRet)
    }
  } else if (opt.txType === 'p2pktr') {
    // key spend p2tr
    //
    // const tx = await client.getTransactionByHash(opt.txid)
    const utxo = await client.getUnspentTransactionOutputs({
      id : opt.txid,
      index: opt.vout
    })
    const xOnlyMpcPk = Buffer.from(gpkPubKey.slice(2, 66), 'hex')
    const gpk = bitcoin.payments.p2tr({ pubkey: xOnlyMpcPk, network})
    console.log(`gpk p2tr address is ${gpk.address}`)

    const pubScript = bitcoin.address.toOutputScript(opt.bob.address, network)
    const preOutScript = bitcoin.address.toOutputScript(p2trAddr, network)

    const psbt = new bitcoin.Psbt({ network });
    psbt.addInput({
      hash: opt.txid,
      index: opt.vout,
      witnessUtxo: {
        script: Buffer.from(),
        value: opt.value,
      },
    })
    psbt.addOutput({
      script: pubScript,
      value: opt.amount,
    })
    psbt.addOutput({
      script: preOutScript,
      value: preAmount - opt.fee - opt.amount,
    })
  } 
}

const spends = {
  'mockGpk': [
    {
      txId: '6547992f303582114e6cd8864a9a0c1fb1c119beae6f244b3b97b1caa15285ed',
      vout: 1,
      value: 300000,
    },
    {
      txId: '291f2cd63e898e0c225ae73d35c9fc3b8c69904830f805106d88290e2cd41686',
      vout: 1,
      value: 298700,
    },
    {
      txId: '54b282c7a2610d83ab603e39c2dba5c56af927e7cb691988c2241da2d1aedcbd',
      vout: 1,
      value: 297400,
    },
  ],
  'mockGpk2': [
    {
      // p2tr tb1pq7ugf7g662f2y9n9nuvmk8r4q88lwhyk6agcmyr8mjc3crl2w7lsp7xcuj
      txId: '74891ab927fd451ab1cb865306f22e6193d11bb1c96478bb8d8b71d1d816ad8c',
      vout: 1,
      value: 100000,
    }
  ],
  'p2sh': [
    {
      // 2N7WfHK1ftrTdhWej8rnFNR7guhvhfGWwFR
      txId: '4e86d5c5d4a22b58eee8b530d7725927809b50ac2076a439da2e722ab1aadddd',
      vout: 1,
      value: 2000,
    },
  ],
  'alice': [
    {
      // tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: '6547992f303582114e6cd8864a9a0c1fb1c119beae6f244b3b97b1caa15285ed',
      vout: 0,
      value: 724678,
    },
    {
      // mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh
      txId: '1b7657e4f160da4d2814b0dd080dbb267f64c1e0fb2c973904f5056e7a58cf91',
      vout: 0,
      value: 1024978,
    },
    {
      // mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh
      txId: '1b7657e4f160da4d2814b0dd080dbb267f64c1e0fb2c973904f5056e7a58cf91',
      vout: 0,
      value: 1024978,
    },
    {
      txId: '1cf9816a07f500d29c9807e5a1d89dc63f64478675c675ed94a2777b44015ca9',
      vout: 1,
      value: 7607,
    },
    {
      txId: '24dbe4742f4f36f563f090de9b86a3d7f138f588bace33371529fe583e5c756b',
      vout: 1,
      value: 100,
    },
    {
      txId: '7fb02fd7534e27b760bdc5687083cbd3334509673a9e48fd689077efb8fd47de',
      vout: 0,
      value: 6307,
    },
    {
      // wit
      txId: '76690a446d84c85bf384bd92076aca1f28fcabe84d13c65ec2dda900fda7df6d',
      vout: 1,
      value: 1327878,
    },
    {
      txId: '678e63a323c81593e0f633873ea9b461942270b23c2e3f8fc5040f8f0e7ec27f',
      vout: 0,
      value: 1326578,
    },
    {
      // p2sh-p2wpkh, , 2NFer9f5uZzTMttb6aeYvCyGJeAR3YsNued
      txId: 'a51f9da7c1f9ddb027cd2f20b690e7c33ee421c409c7086ddcc3bb695a33f438',
      vout: 1,
      value: 1386387,
    },
    {
      // wit tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: 'bde39b6d6508a8d7953455c638be3028466c1ef8ce719143e7f43c2d74c502e7',
      vout: 0,
      value: 1325278,
    },
    {
      txId: '836f9387d0386a49971d7d5403ec98da0df12c5104c4d6c691fde3c3b0920e24',
      vout: 0,
      value: 5007,
    },
  ],
  'bob': [
    {
      txId: '7fb02fd7534e27b760bdc5687083cbd3334509673a9e48fd689077efb8fd47de',
      vout: 1,
      value: 1000,
    },
  ]
}

const unSpends = {
  'gpk': [
    {
      pub: "0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8",
      // p2tr address : tb1pjgu5q0xp804ju7x97qpw7gdms3ufzrdv6fnnnjtn8f2fwp6ecfcq9udfju
      txId: '1b7657e4f160da4d2814b0dd080dbb267f64c1e0fb2c973904f5056e7a58cf91',
      vout: 1,
      value: 300000,
    },
  ],
  'mockGpk': [
    // priv: 86812cf8897887c7d943d1ce592b8ada8f1869cdd29dc3cd84818cc4ddd988a2
    // pub: 02f3bc8e29df706043d8e207083e1172aa57fcbdda91f35102b14f7e425d64145a
    // p2tr address : tb1pchgd94xrkymx7rxte5276t45u4cj5qp5ldrmh2tdejm0fe7elk7s2fhg9c
    // wit address: tb1ql3c8emstnczhydeujkqq3zw4g0zx0hzpp3k9e8
    // address: n4XjLCVsKDmoQztgbRNwFnYeb56mwJJqKS
    {
      txId: '0bf37594925083ade7a909ac193620836f6754a9541151c3303a065e80af2710',
      vout: 1,
      value: 296100,
    },
  ],
  'mockGpk2': [
    // priv: deaf4d729a8489976321fbefecdc0739969542bea6572e8a94f6f20a8b569e8f
    // pub: 03e7d74a860779ebe4ea0ba7b56fc95cb6f8346e88ee2e3a5e6082b2eb26574395
    // wif: cV3a7bw5J16NvQard1odepRwGq5YJPE6DNafW9L1Cj7JdqJNNZwY
    // p2pkh address: mwvAeyu3dUEJz4Z66Wu5oaa87ijuqActGP
    // p2wpkh address: tb1qk0j7tcyw69yy6erlxhqgreykaelawrrr90jpxh
    // p2sh address: 2NEXVMamnYagALhEZAXdTL6KyeYnVfjBDqm
    // p2tr: tb1pq7ugf7g662f2y9n9nuvmk8r4q88lwhyk6agcmyr8mjc3crl2w7lsp7xcuj
    {
      // p2tr tb1pq7ugf7g662f2y9n9nuvmk8r4q88lwhyk6agcmyr8mjc3crl2w7lsp7xcuj
      txId: '29ad89739fc36b117f8b5f181299709300ede578af4b6a39c53754d69ad5ac8d',
      vout: 1,
      value: 98700,
    }
  ],
  'p2sh': [
    {
      // 2N7WfHK1ftrTdhWej8rnFNR7guhvhfGWwFR
      txId: '129fd92a6296a99416d36ee2d8d9b851c75fa09aee49b070c14127c49095571b',
      vout: 1,
      value: 1300,
    },
  ],
  'alice': [
    {
      // tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: '74891ab927fd451ab1cb865306f22e6193d11bb1c96478bb8d8b71d1d816ad8c',
      vout: 0,
      value: 624378,
    },
    {
      // p2sh-p2wpkh, from 2NFer9f5uZzTMttb6aeYvCyGJeAR3YsNued, to tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: 'c93a92ec3fef6e7c0c9d1b896405616dd82065b3b02c542a3fa38b2e16cadb83',
      vout: 0,
      value: 1385087,
    }
  ],
  'bob': [
    {
      txId: '24dbe4742f4f36f563f090de9b86a3d7f138f588bace33371529fe583e5c756b',
      vout: 0,
      value: 600,
    },
  ],
}

const importAddress = async (address) => {
  const rt = await client.importAddress(address, '', false)
  console.log("utxo:", rt)
}

const getUxtos = async (addresses) => {
  const utxos = await client.listUnspent(0, 9000000, [...addresses])
  console.log(`utxo: ${JSON.stringify(utxos, null, 2)}`)
}

setTimeout(async () => {
  const alice = bitcoin.ECPair.fromWIF('cNUx4bohBTqM41hf2dLDVoCHSexqgj29Q9poCnvT3i8DtMnJATaa', network)
  // Signer
  const aliceWit = bitcoin.payments.p2wpkh({ pubkey: alice.publicKey, network})
  console.log(`alice wit address is ${aliceWit.address}`)
  const aliceOld = bitcoin.payments.p2pkh({ pubkey: alice.publicKey, network})
  console.log(`alice old address is ${aliceOld.address}`)
  
  // Receiver
  const bob = bitcoin.ECPair.fromWIF('cSEyS9LEjBWPa71mA4HQzseYDJD9bkvWpVUgk3Dw7SvpVQnx19HH', network)
  const bobWit = bitcoin.payments.p2wpkh({ pubkey: bob.publicKey, network})
  console.log(`bob wit address is ${bobWit.address}`)
  const bobOld = bitcoin.payments.p2pkh({ pubkey: bob.publicKey, network})
  console.log(`bob old address is ${bobOld.address}`)

  // mockGpk
  const mockGpk = bitcoin.ECPair.fromPrivateKey(Buffer.from('86812cf8897887c7d943d1ce592b8ada8f1869cdd29dc3cd84818cc4ddd988a2', 'hex'), network)
  const mockGpkWit = bitcoin.payments.p2wpkh({ pubkey: mockGpk.publicKey, network})
  console.log(`mockGpk wit address is ${mockGpkWit.address}`)
  const mockGpkOld = bitcoin.payments.p2pkh({ pubkey: mockGpk.publicKey, network})
  console.log(`gpk old address is ${mockGpkOld.address}`)

  // mockGpk--odd
  const mockGpk2 = bitcoin.ECPair.fromWIF('cV3a7bw5J16NvQard1odepRwGq5YJPE6DNafW9L1Cj7JdqJNNZwY', network)
  const mockGpk2Wit = bitcoin.payments.p2wpkh({ pubkey: mockGpk2.publicKey, network})
  console.log(`mockGpk2 wit address is ${mockGpk2Wit.address}`)
  const mockGpk2Old = bitcoin.payments.p2pkh({ pubkey: mockGpk.publicKey, network})
  console.log(`gpk2 old address is ${mockGpk2Old.address}`)

  const publicKey = Buffer.from(unSpends.gpk[0].pub.slice(2, 66), 'hex')
  const gpk = bitcoin.payments.p2tr({ pubkey: publicKey, network})
  console.log(`gpk p2tr address is ${gpk.address}`)

  // await spendByTxb(unSpends.alice[0], alice, null, aliceOld.address, bobOld.address, 1000, 300)
  // await spendByTxb(unSpends.bob[0], bob, null, bobOld.address, aliceOld.address, 100, 300)
  // importAddress: address, label = '', reScan = false

  // await importAddress(aliceWit.address)
  // await importAddress(bobWit.address)

  // await spendByTxb(unSpends.alice[0], alice, aliceWit, aliceOld.address, bobOld.address, 1000, 300, 'segwit-p2sh')
  // await spendByPsbt({
  //   txid: unSpends.alice[0].txId,
  //   vout: unSpends.alice[0].vout,
  //   value: unSpends.alice[0].value,
  //   alice,
  //   bob,
  //   amount: 1000,
  //   fee: 300,
  //   txType: 'p2pkh',
  // })

  // 从wit地址 花钱 打钱
  // await spendByPsbt({
  //   txid: unSpends.alice[0].txId,
  //   vout: unSpends.alice[0].vout,
  //   value: unSpends.alice[0].value,
  //   alice,
  //   bob,
  //   amount: 100000,
  //   fee: 300,
  //   txType: 'native-p2wpkh',
  // })
  // 从wit地址 花钱 打钱

  // await spendByPsbt({
  //   txid: unSpends.alice[2].txId,
  //   vout: unSpends.alice[2].vout,
  //   value: unSpends.alice[2].value,
  //   alice,
  //   bob,
  //   amount: 1000,
  //   fee: 300,
  //   txType: 'p2sh-p2wpkh',
  // })

  // await spendByPsbt({
  //   txid: unSpends.alice[0].txId,
  //   vout: unSpends.alice[0].vout,
  //   value: unSpends.alice[0].value,
  //   alice,
  //   bob: {
  //     address: "tb1pchgd94xrkymx7rxte5276t45u4cj5qp5ldrmh2tdejm0fe7elk7s2fhg9c"
  //   },
  //   amount: 300000,
  //   fee: 300,
  //   txType: 'p2pkh',
  // })

  // await spendByPsbt({
  //   txid: unSpends.alice[0].txId,
  //   vout: unSpends.alice[0].vout,
  //   value: unSpends.alice[0].value,
  //   alice,
  //   bob,
  //   amount: 1000,
  //   fee: 300,
  //   txType: 'p2sh',
  // })

  // await spendByPsbt({
  //   txid: unSpends.mockGpk[0].txId,
  //   vout: unSpends.mockGpk[0].vout,
  //   value: unSpends.mockGpk[0].value,
  //   gpk: mockGpk,
  //   bob: {
  //     address: "mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh",
  //   },
  //   amount: 1000,
  //   fee: 300,
  //   txType: 'p2pktr',
  // })

  await spendByPsbt({
    txid: unSpends.mockGpk[0].txId,
    vout: unSpends.mockGpk[0].vout,
    value: unSpends.mockGpk[0].value,
    gpk: mockGpk,
    bob: {
      address: "mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh",
    },
    amount: 1000,
    fee: 300,
    txType: 'p2shtr',
  })


  // await spendByPsbt({
  //   txid: unSpends.mockGpk[0].txId,
  //   vout: unSpends.mockGpk[0].vout,
  //   value: unSpends.mockGpk[0].value,
  //   gpk: mockGpk,
  //   bob: {
  //     address: "mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh",
  //   },
  //   amount: 1000,
  //   fee: 300,
  //   txType: 'p2tr',
  // })
  // Private2Address()

  // await spendByPsbt({
  //   txid: unSpends.alice[2].txId,
  //   vout: unSpends.alice[2].vout,
  //   value: unSpends.alice[2].value,
  //   alice,
  //   bob,
  //   amount: 1000,
  //   fee: 300,
  //   txType: 'p2tr2',
  // })

  // // spend p2tr
  // await spendByPsbt({
  //   txid: unSpends.alice[2].txId,
  //   vout: unSpends.alice[2].vout,
  //   value: unSpends.alice[2].value,
  //   alice,
  //   bob,
  //   amount: 2000,
  //   fee: 300,
  //   txType: 'p2tr2',
  // })


  /// send to p2tr
  // await spendByPsbt({
  //   txid: unSpends.alice[1].txId,
  //   vout: unSpends.alice[1].vout,
  //   value: unSpends.alice[1].value,
  //   alice,
  //   bob,
  //   amount: 300000,
  //   fee: 300,
  //   txType: 'native-p2wpkh',
  // })
})
