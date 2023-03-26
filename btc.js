const bitcoin = require('bitcoinjs-lib');
const Client = require('bitcoin-core')
const ECPAIR = require('ecpair')
const psbtUtils = require('bitcoinjs-lib/src/psbt/psbtutils')
const bscript = require('bitcoinjs-lib/src/script')

const crypto = require('crypto');
const BigNumber = require('bignumber.js')

const { unSpends } = require('./utxo')

const curNet = "testnet"
let network = bitcoin.networks[curNet]
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

let ecc = null
let client = null
let ECPair = null
async function init(){
  ecc = await import('tiny-secp256k1');
  bitcoin.initEccLib(ecc)
  ECPair = ECPAIR.ECPairFactory(ecc)
  client = new Client(options.testnet)
}

function idToHash(txid) {
  return Buffer.from(txid, 'hex').reverse();
}

function toUnit(amount, decimals = 8) {
  const unit = Math.pow(10, decimals)
  return Math.floor(amount * unit)
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

/// bitcoinjs-lib v5-v6
// 1. Psbt
async function spendByPsbt(opt) {
  const rawTx = await client.getRawTransaction(opt.txid, 1)
  const unspent = await client.getUnspentTransactionOutputs({
    id : opt.txid,
    index: opt.vout
  })
  const utxo = unspent.utxos[0]
  const fromOutScript = bitcoin.address.toOutputScript(utxo.scriptPubKey.address, network)
  const toOutScript = bitcoin.address.toOutputScript(opt.receiver.address, network)
  const from = utxo.scriptPubKey.address
  const to = opt.receiver.address
  const preAmount = toUnit(utxo.value)

  const wanAddress = '0x34aABB238177eF195ed90FEa056Edd6648732014'
  const rndId = '0x9096125c5f89d4a29869f526415b6bf0818b6697b34c02f65361a0046d211f1b'

  const hashType = bitcoin.Transaction.SIGHASH_ALL;
  const sequence = bitcoin.Transaction.DEFAULT_SEQUENCE

  if (opt.txType === 'p2pkh') {
    // good
    const psbt = new bitcoin.Psbt({network})
      .addInput({
        hash: opt.txid,
        index: opt.vout,
        nonWitnessUtxo: Buffer.from(rawTx.hex, 'hex')
      }) 
      .addOutput({
        address: from,
        value: preAmount - opt.amount - opt.fee,
      })
      .addOutput({
        address: to ,
        value: opt.amount,
      })

    psbt.signInput(0, opt.sender)
    // psbt.validateSignaturesOfInput(0)

    psbt.finalizeAllInputs()
    const txHex = psbt.extractTransaction().toHex()

    console.log('Transaction hexadecimal:')
    console.log(txHex)

    // const txRet = await client.sendRawTransaction(txHex)
    // console.log("psbt p2pkh broad tx:", txRet)
  } else if (opt.txType === 'p2sh-p2wpkh') {
    // good
    const p2wpkhAlice1 = bitcoin.payments.p2wpkh({pubkey: opt.sender.publicKey, network}) 
    const pBob = bitcoin.payments.p2wpkh({ pubkey: opt.receiver.publicKey, network})
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
          // bitcoin.crypto.hash160(Buffer.from('0014' + sender[1].pubKeyHash, 'hex')).toString('hex') +
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
      psbt.signInput(0, opt.sender)
      psbt.validateSignaturesOfInput(0)

      psbt.finalizeAllInputs()

      const txHex = psbt.extractTransaction().toHex()
      console.log('Transaction hexadecimal:')
      console.log(txHex)

      const txRet = await client.sendRawTransaction(txHex)
      console.log("psbt p2pkh broad tx:", txRet)
  } else if (opt.txType === 'p2wpkh') {
    // good
    const psbt = new bitcoin.Psbt({network})
      .addInput({
        hash: opt.txid,
        index: opt.vout,
        witnessUtxo: {
          // fromOutScript = Buffer.from('0014' + opt.sender.pubKeyHash, 'hex')
          script: fromOutScript,
          value: preAmount,
        }
      })
      .addOutput({
        address: from,
        // script: fromOutScript,
        value: preAmount - opt.amount - opt.fee,
      })
      .addOutput({
        address: to,
        // script: toOutScript,
        value: opt.amount,
      })

      psbt.signInput(0, opt.sender)
      psbt.validateSignaturesOfInput(0)
  
      psbt.finalizeAllInputs()
      const txHex = psbt.extractTransaction().toHex()
  
      console.log('Transaction hexadecimal:')
      console.log(txHex)

      const txRet = await client.sendRawTransaction(txHex)
      console.log("psbt p2pkh broad tx:", txRet)
  } else if (opt.txType === 'p2wsh') {
    // good
    const witnessScript = getOtaP2shRedeemScript(rndId, wanAddress, opt.sender.publicKey)
    const realTo = bitcoin.payments.p2wsh( { redeem: {output: witnessScript, network}, network})
    console.log(`will send to ${realTo.address}`)
    const os = bitcoin.address.toOutputScript(realTo.address, network)

    const witnessProgram = Buffer.from("0020" + bitcoin.crypto.sha256(witnessScript).toString('hex'), 'hex')
    const psbt = new bitcoin.Psbt({network})
    .addInput({
      hash: opt.txid,
      index: opt.vout,
      witnessUtxo: {
        script: witnessProgram,
        value: preAmount,
      },
      witnessScript: Buffer.from(witnessScript, 'hex')
    })
    .addOutput({
      address: from,
      value: preAmount - opt.amount - opt.fee,
    })
    .addOutput({
      address: opt.receiver.address,
      value: opt.amount,
    })

    const isMpc = true
    if (isMpc) {
      // good
      const getFinalScripts = (inputIndex, input, script) => {
        const sigHash = psbt.__CACHE.__TX.hashForWitnessV0(inputIndex, script, preAmount, hashType);
        const signature = opt.sender.sign(sigHash, hashType)
        const sig = bitcoin.script.signature.encode(signature, hashType)

        const payment = bitcoin.payments.p2wsh({
          redeem: {
            output: script,
            input: bitcoin.script.compile([sig, opt.sender.publicKey]),
            network,
          },
          network
        })

        return {
          finalScriptWitness: psbtUtils.witnessStackToScriptWitness(payment.witness)
        }
      }

      psbt.finalizeInput(0, getFinalScripts)
    } else {
      const getFinalScripts = (inputIndex, input, script) => {
        const signature = input.partialSig[inputIndex].signature
        const publicKey = input.partialSig[inputIndex].pubkey
        const payment = bitcoin.payments.p2wsh({
          redeem: {
            output: script,
            input: bitcoin.script.compile([signature, publicKey]),
            network,
          },
          network
        })
        return {
          finalScriptWitness: psbtUtils.witnessStackToScriptWitness(payment.witness)
        }
      }
      psbt.signInput(0, opt.sender)
      psbt.finalizeInput(0, getFinalScripts)
    }
    console.log('Transaction hexadecimal:')

    const txHex = psbt.extractTransaction().toHex()
    console.log(txHex)

    const txRet = await client.sendRawTransaction(txHex)
    console.log("p2sh broad tx:", txRet)
  } else if (opt.txType === 'p2sh') {
    // good
    // print p2sh address
    const redeemScript = getOtaP2shRedeemScript(rndId, wanAddress, opt.sender.publicKey)
    const realTo = bitcoin.payments.p2sh( { redeem: {output: redeemScript, network}, network})
    console.log(`will send to ${realTo.address}`)

    const psbt = new bitcoin.Psbt({network})
      .addInput({
        hash: opt.txid,
        index: opt.vout,
        nonWitnessUtxo: Buffer.from(rawTx.hex, 'hex'),
        redeemScript: redeemScript
      })
      .addOutput({
        address: from,
        value: preAmount - opt.amount - opt.fee,
      })
      .addOutput({
        address: opt.receiver.address,
        value: opt.amount,
      })
  
    // Creating the unlocking script
    const isMpc = true
    if (isMpc) {
      // good
      const getFinalScripts = (inputIndex, input, script) => {
        const sigHash = psbt.__CACHE.__TX.hashForSignature(inputIndex, script, hashType);
        const signature = opt.sender.sign(sigHash, hashType)
        const sig = bitcoin.script.signature.encode(signature, hashType)

        const payment = bitcoin.payments.p2sh({
          redeem: {
            input: bitcoin.script.compile([sig, opt.sender.publicKey]), 
            output: script,
          },
        })
      
        return {
          finalScriptSig: payment.input
        }
      }
      
      psbt.finalizeInput(0, getFinalScripts)
    } else {
      const getFinalScripts = (inputIndex, input, script) => {
        const signature = input.partialSig[inputIndex].signature
        const publicKey = input.partialSig[inputIndex].pubkey
        const payment = bitcoin.payments.p2sh({
          redeem: {
            input: bitcoin.script.compile([signature, publicKey]), 
            output: script,
          },
        })
      
        return {
          finalScriptSig: payment.input
        }
      }
      psbt.signInput(0, opt.sender)
      psbt.finalizeInput(0, getFinalScripts)
    }
    console.log('Transaction hexadecimal:')

    const txHex = psbt.extractTransaction().toHex()
    console.log(txHex)

    const txRet = await client.sendRawTransaction(txHex)
    console.log("p2sh broad tx:", txRet)
  } else if (opt.txType === 'p2tr') {
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
    // good
    // btc curve 0 secp256k1, algo 2 schnorr340
    // const gpkPubKey = '0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8'

    // const privateKey = crypto.randomBytes(32)
    // console.log(`private key is ${privateKey.toString('hex')}`)
    // const myKey = ECPair.fromPrivateKey(privateKey, {network, compressed: true})

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
    
    const a = false
    if (a) {
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
      const pubScript = bitcoin.address.toOutputScript(opt.receiver.address, network)
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
    } else {
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
      const pubScript = bitcoin.address.toOutputScript(opt.receiver.address, network)
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
    // good
    const psbt = new bitcoin.Psbt({ network });

    const preAmount = Math.floor(utxo.value * 100000000)
    const xOnlyMpcPk = opt.sender.publicKey.slice(1, 33)

    const tweakedSigner = tweakSigner(opt.sender, { network });

    // TODO: remove only for test
    const xPk = toXOnly(opt.sender.publicKey)
    tweakPublicKey(xPk)

    const p2trGood = bitcoin.payments.p2tr({
      internalPubkey: toXOnly(opt.sender.publicKey),
      network
    })
    const p2trGood_addr = p2trGood.address;
    console.log(p2trGood_addr);
    const output = p2trGood.output
    console.log(`${output.toString('hex')}`)

    psbt.addInput({
      hash: opt.txid,
      index: opt.vout,
      // witnessUtxo for witness
      witnessUtxo: {
        // utxo.scriptPubKey.hex === p2pktr.output
        script: fromOutScript,
        value: preAmount,
      },
      // tapInternalKey for key path spending
      tapInternalKey: toXOnly(opt.sender.publicKey)
    })
    psbt.addOutput({
      script: toOutScript,
      value: opt.amount,
    })
    psbt.addOutput({
      script: fromOutScript,
      value: preAmount - opt.fee - opt.amount,
      internalPubkey: xOnlyMpcPk
    })

    const isMpc = true
    if (isMpc) {
      const input = psbt.data.inputs[0]
      const keyPair = ECPair.fromPublicKey(tweakedSigner.publicKey, { network })
      const msgHash = psbt.checkTaprootHashesForSig(0, input, keyPair, undefined, bitcoin.Transaction.SIGHASH_DEFAULT)
      console.log(`msgHash  ${msgHash[0].hash.toString('hex')}`)

      const tapKeyHash = msgHash[0].hash
      const sig = tweakedSigner.signSchnorr(tapKeyHash)

      const customFinalizer = (_inputIndex, input) => {
        const scriptSolution = [
          sig,
        ];
        const witness = scriptSolution
  
        return {
          finalScriptWitness: psbtUtils.witnessStackToScriptWitness(witness)
        }
      }

      psbt.finalizeInput(0, customFinalizer);
    } else {
      await psbt.signInputAsync(0, tweakedSigner)
      psbt.finalizeAllInputs()
    }

    const tx = psbt.extractTransaction();
    const rawTx = tx.toBuffer();

    const hex = rawTx.toString('hex');

    console.log(`tx hex is ${hex}`);

    const txRet = await client.sendRawTransaction(hex)
    console.log("p2tr broad tx:", txRet)
  } else if (opt.txType === 'p2shtr') {
    // good
    const wanAddress = '0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8'
    const rndId = '1234'
    const xOnlyMpcPk = toXOnly(opt.sender.publicKey)
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

    /// 1. 创建我们的 Taptree 和 p2tr 地址
    const scriptTree = {
      output: redeemScript,
    }
    const ota = bitcoin.payments.p2tr({ 
      internalPubkey: xOnlyMpcPk,
      scriptTree,
      network 
    })

    const p2trAddr = ota.address
    console.log(`p2shtr addr is ${p2trAddr}`)

    /// 2. 创建叶脚本上的花费, 必须提供叶脚本的叶版本、脚本和控制块, 控制块是证明叶脚本存在于脚本树中所需的数据（默克尔证明
    // 2.1 叶版本、叶脚本
    const hashx_redeem = {
      output: redeemScript,
      redeemVersion: 0xc0
    }

    // 2.2 生成控制块
    const hashx_p2tr = bitcoin.payments.p2tr({
      internalPubkey: xOnlyMpcPk,
      scriptTree,
      redeem: hashx_redeem,
      network
    });
    console.log(`hashx_p2tr addr is ${hashx_p2tr.address}`)

    // 2.3 生成叶脚本上的花费
    const tapLeafScript = {
      leafVersion: hashx_redeem.redeemVersion,
      script: hashx_redeem.output,
      controlBlock: hashx_p2tr.witness[hashx_p2tr.witness.length - 1] // extract control block from witness data
    }
    const hashx_psbt = new bitcoin.Psbt({ network });
    hashx_psbt.addInput({
      hash: opt.txid,
      index: opt.vout,
      witnessUtxo: { value: preAmount, script: hashx_p2tr.output },
      tapLeafScript: [
        tapLeafScript
      ],
      // tapInternalKey: xOnlyMpcPk,
    });

    hashx_psbt.addOutput({
      script: toOutScript,
      value: opt.amount,
    })
    hashx_psbt.addOutput({
      script: toOutScript,
      value: preAmount - opt.fee - opt.amount,
      internalPubkey: xOnlyMpcPk
    })

    // test mpc
    const isMpc = true
    if (isMpc) {
      const input = hashx_psbt.data.inputs[0]
      // const sighashTypes = bitcoin.Transaction.SIGHASH_DEFAULT
      const keyPair = ECPair.fromPublicKey(opt.sender.publicKey, { network })
      const msgHash = hashx_psbt.checkTaprootHashesForSig(0, input, keyPair, undefined, bitcoin.Transaction.SIGHASH_DEFAULT)
      console.log(`msgHash  ${msgHash[0].hash.toString('hex')}`)

      const tapKeyHash = msgHash[0].hash
      const sig = opt.sender.signSchnorr(tapKeyHash)

      const customFinalizer = (_inputIndex, input) => {
        const witness = [
          sig,
          xOnlyMpcPk,
        ].concat(tapLeafScript.script)
        .concat(tapLeafScript.controlBlock)

        return {
          finalScriptWitness: psbtUtils.witnessStackToScriptWitness(witness)
        }
      }

      hashx_psbt.finalizeInput(0, customFinalizer);
    } else {
      hashx_psbt.signInput(0, opt.sender);
      const customFinalizer = (_inputIndex, input) => {
        const scriptSolution = [
          input.tapScriptSig[0].signature,
          xOnlyMpcPk,
        ];
        const witness = scriptSolution
          .concat(tapLeafScript.script)
          .concat(tapLeafScript.controlBlock);
  
        return {
          finalScriptWitness: psbtUtils.witnessStackToScriptWitness(witness)
        }
      }
  
      hashx_psbt.finalizeInput(0, customFinalizer);
    }

    let tx = hashx_psbt.extractTransaction();
    console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);

    const txRet = await client.sendRawTransaction(tx.toHex())
    console.log("p2shtr broad tx:", txRet)
  } else if (opt.txType === 'unknown') {
    const unspent = await client.getUnspentTransactionOutputs({
      id : opt.txid,
      index: opt.vout
    })
    const utxo = unspent.utxos[0]
    
    const restOutScript = bitcoin.address.toOutputScript(utxo.scriptPubKey.address, network)
    const toOutScript = bitcoin.address.toOutputScript(opt.receiver.address, network)

    const preAmount = Math.floor(utxo.value * 100000000)
    const xOnlyMpcPk = opt.sender.publicKey.slice(1, 33)

    const psbt = new bitcoin.Psbt({ network });
    psbt.addInput({
      hash: opt.txid,
      index: opt.vout,
      witnessUtxo: {
        // utxo.scriptPubKey.hex === p2pktr.output
        script: Buffer.from(utxo.scriptPubKey.hex, 'hex'),
        value: preAmount,
      },
      // tapInternalKey: toXOnly(opt.sender.publicKey)
    })
    psbt.addOutput({
      script: toOutScript,
      value: opt.amount,
    })
    psbt.addOutput({
      script: restOutScript,
      value: preAmount - opt.fee - opt.amount,
      internalPubkey: xOnlyMpcPk
    })

    await psbt.signInputAsync(0, opt.sender)
    psbt.finalizeAllInputs()

    const tx = psbt.extractTransaction();
    const rawTx = tx.toBuffer();

    const hex = rawTx.toString('hex');

    console.log(`tx hex is ${hex}`);

    const txRet = await client.sendRawTransaction(hex)
    console.log("p2tr broad tx:", txRet)
  }
}

const wanAddress = '0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8'
const rndId = '1234'

/// bitcoinjs-lib v1-v5, removed in v6, TransactionBuilder
async function spendByTxb(opt) {
  // 最原始交易类型
  if (opt.txType === 'p2pkh') {
    // Builder
    const txb = new bitcoin.TransactionBuilder(network)
    txb.setVersion(1)
    
    // Add input
    txb.addInput(opt.txid, opt.vout)
  
    // Add output
    txb.addOutput(opt.sender.address, opt.value - opt.amount - opt.fee)
    txb.addOutput(opt.receiver.address, opt.amount)
  
    // txb.sign(0, opt.sender)
    let signatureBuf = Buffer.from(hexTrip0x(signature), "hex")
    scriptSig = bitcoin.script.compile([signatureBuf, storemanPkBuf])
    
    const txHex = txb.build().toHex()
  
    let txRet = await client.sendRawTransaction(txHex)
    console.log("broad tx:", txRet)
  } else if (opt.txType === 'p2sh') {
    // not checked
    let txb = new bitcoin.TransactionBuilder(network)
    txb.setVersion(1)
    const DEFAULT_SEQUENCE = 0xffffffff
    if (isBridge) {
      // p2sh
      let otaRedeemScript = getOtaP2shRedeemScript(rndId, wanAddress, opt.storemanPk);
      txb.addInput(input.txid, input.vout, DEFAULT_SEQUENCE, otaRedeemScript)
    } else {
      // p2pkh
      let scriptPubkey = bitcoin.address.toOutputScript(opt.storemanAddress, network)
      txb.addInput(input.txid, input.vout, DEFAULT_SEQUENCE, scriptPubkey)
    }

    // add value
    txb.addOutput(address, output.value)

    // add info
    let op_return_data = Buffer.from(this.trans.txParams.op_return, "hex");
    let embed = bitcoin.payments.embed({ data: [op_return_data] })
    txb.addOutput(embed.output, 0)

    let tx = txb.buildIncomplete()
    
    const sigHash = tx.hashForSignature(0, otaRedeemScript, bitcoin.Transaction.SIGHASH_ALL)
    const signature = opt.sender.sign(sigHash, bitcoin.Transaction.SIGHASH_ALL)
    const sig = bitcoin.script.signature.encode(signature, hashType)
    // const sig = await mpc.signMpcUniTransaction(mpcTx)
    let scriptSig = null
    if (isBridge) {
      scriptSig = bitcoin.payments.p2sh({
        redeem: {
            input: bitcoin.script.compile([ sig, opt.sender.publicKey ]),
            output: otaRedeemScript,
            network: this.network
        },
      }).input;
    } else {
      scriptSig = bitcoin.script.compile([signature, opt.sender.publicKey])
    }

    tx.setInputScript(0, scriptSig)

    const txHex = txb.build().toHex()

    let txRet = await client.sendRawTransaction(txHex)
    console.log("broad tx:", txRet)
  } else if (opt.txType === 'p2wpkh') {
  } else if (opt.txType === 'p2wsh') {
  } else if (opt.txType === 'p2pktr') {
  } else if (opt.txType === 'p2shtr') {
  }
}

/// bitcoinjs-lib v1-v6 Transaction
async function spendByTransaction(opt) {
  const rawTx = await client.getRawTransaction(opt.txid, 1)
  const unspent = await client.getUnspentTransactionOutputs({
    id : opt.txid,
    index: opt.vout
  })
  const utxo = unspent.utxos[0]
  // utxo.scriptPubKey.hex === fromOutScript
  const fromOutScript = bitcoin.address.toOutputScript(utxo.scriptPubKey.address, network)
  const toOutScript = bitcoin.address.toOutputScript(opt.receiver.address, network)
  const from = utxo.scriptPubKey.address
  const to = opt.receiver.address
  const preAmount = toUnit(utxo.value)
  const hashType = bitcoin.Transaction.SIGHASH_ALL;
  const hashP2tr = bitcoin.Transaction.SIGHASH_DEFAULT;
  const sequence = bitcoin.Transaction.DEFAULT_SEQUENCE;

  const tx = new bitcoin.Transaction()
  console.log(`tx version = ${tx.version}`)
  console.log(`tx locktime = ${tx.locktime}`)

  // tx: sender -> receiver, 
  if (opt.txType === 'p2pkh') {
    // good
    const realTo = bitcoin.payments.p2pkh( { pubkey: opt.sender.publicKey, network})
    console.log(`will send to ${realTo.address}`)

    tx.addInput(idToHash(opt.txid), opt.vout, sequence, fromOutScript)
    tx.addOutput(toOutScript, opt.amount)
    tx.addOutput(fromOutScript, preAmount - opt.amount - opt.fee)

    const sigHash = tx.hashForSignature(0, fromOutScript, hashType);
    const signature = opt.sender.sign(sigHash)
    const sig = bscript.signature.encode(signature, hashType)
    const sigWithPubkey = bitcoin.payments.p2pkh( { pubkey: opt.sender.publicKey, signature: sig, network })

    tx.setInputScript(0, sigWithPubkey.input)
    
    let txSerialized = tx.toHex();
    console.log("tx=",txSerialized)

    const txRet = await client.sendRawTransaction(txSerialized)
    console.log("p2tr broad tx:", txRet)
  } else if (opt.txType === 'p2sh') {
    // good
    // print p2sh address
    const redeemScript = getOtaP2shRedeemScript(rndId, wanAddress, opt.sender.publicKey)
    const realTo = bitcoin.payments.p2sh({
      redeem: { output: redeemScript, network },
      network
    })
    console.log(`will send to ${realTo.address}`)

    // build transaction
    tx.addInput(idToHash(opt.txid), opt.vout, sequence, fromOutScript)
    tx.addOutput(toOutScript, opt.amount)
    tx.addOutput(fromOutScript, preAmount - opt.amount - opt.fee)

    const inputIndex = 0
    const sigHash = tx.hashForSignature(inputIndex, redeemScript, hashType);
    const signature = opt.sender.sign(sigHash, hashType)
    const sig = bitcoin.script.signature.encode(signature, hashType)
    const sigWithPubkey = bitcoin.payments.p2sh({ 
      redeem: { 
        input: bitcoin.script.compile([ sig, opt.sender.publicKey ]),
        output: redeemScript,
        network,
      },
      network
    })

    tx.setInputScript(0, sigWithPubkey.input)
    tx.setWitness(0, sigWithPubkey.witness)
    
    let txSerialized = tx.toHex();
    console.log("tx=",txSerialized)

    // send coin
    const txRet = await client.sendRawTransaction(txSerialized)
    console.log("p2sh broad tx:", txRet)
  } else if (opt.txType === 'p2wpkh') {
    // good
    const realTo = bitcoin.payments.p2wpkh( { pubkey: opt.sender.publicKey, network})
    console.log(`will send to ${realTo.address}`)

    tx.addInput(idToHash(opt.txid), opt.vout, sequence, fromOutScript)
    tx.addOutput(toOutScript, opt.amount)
    tx.addOutput(fromOutScript, preAmount - opt.amount - opt.fee)

    // NODE: p2wpkh use p2pkh out script for hash
    const signingScript = bitcoin.payments.p2pkh({ hash: fromOutScript.slice(2)}).output;
    const sigHash = tx.hashForWitnessV0(0, signingScript, preAmount, hashType);
    const signature = opt.sender.sign(sigHash)
    const sig = bscript.signature.encode(signature, hashType)
    const sigWithPubkey = bitcoin.payments.p2wpkh( { pubkey: opt.sender.publicKey, signature: sig })

    tx.setInputScript(0, sigWithPubkey.input)
    tx.setWitness(0, sigWithPubkey.witness)
    
    let txSerialized = tx.toHex();
    console.log("tx=",txSerialized)

    const txRet = await client.sendRawTransaction(txSerialized)
    console.log("p2wpkh broad tx:", txRet)
  } else if (opt.txType === 'p2wsh') {
    // good
    // print p2wsh address
    const redeemScript = getOtaP2shRedeemScript(rndId, wanAddress, opt.sender.publicKey)
    const realTo = bitcoin.payments.p2wsh({ 
      redeem: { output: redeemScript, network },
      network
    })
    console.log(`will send to ${realTo.address}`)

    // build transaction
    tx.addInput(idToHash(opt.txid), opt.vout, sequence, fromOutScript)
    tx.addOutput(toOutScript, opt.amount)
    tx.addOutput(fromOutScript, preAmount - opt.amount - opt.fee)

    const inputIndex = 0
    const sigHash = tx.hashForWitnessV0(inputIndex, redeemScript, preAmount, hashType);
    const signature = opt.sender.sign(sigHash, hashType)
    const sig = bitcoin.script.signature.encode(signature, hashType)
    const sigWithPubkey = bitcoin.payments.p2wsh({
      redeem: {
        input: bitcoin.script.compile([ sig, opt.sender.publicKey ]),
        output: redeemScript,
        network,
      },
      network
    })

    tx.setInputScript(0, sigWithPubkey.input)
    tx.setWitness(0, sigWithPubkey.witness)
    
    let txSerialized = tx.toHex();
    console.log("tx=",txSerialized)

    // send coin
    const txRet = await client.sendRawTransaction(txSerialized)
    console.log("p2wsh broad tx:", txRet)
  } else if (opt.txType === 'p2pktr') {
    // good
    const realTo = bitcoin.payments.p2tr( { 
      internalPubkey: toXOnly(opt.sender.publicKey), 
      network
    })
    console.log(`will send to ${realTo.address}`)
    tx.version = 2

    const tweakedSigner = tweakSigner(opt.sender, { network });

    tx.addInput(idToHash(opt.txid), opt.vout, sequence, null)
    tx.addOutput(toOutScript, opt.amount)
    tx.addOutput(fromOutScript, preAmount - opt.amount - opt.fee)

    const prevOutScripts = fromOutScript
    console.log(`pre out script ${fromOutScript.toString('hex')}`)
    const msgHash = tx.hashForWitnessV1(0, [prevOutScripts], [preAmount], hashP2tr)
    console.log(`msgHash  ${msgHash.toString('hex')}`)

    const tapKeyHash = msgHash
    const sig = tweakedSigner.signSchnorr(tapKeyHash)
    const wits = [sig]

    tx.setWitness(0, wits)
    
    let txSerialized = tx.toHex();
    console.log("tx=",txSerialized)

    // send coin
    const txRet = await client.sendRawTransaction(txSerialized)
    console.log("p2shtr broad tx:", txRet)
  } else if (opt.txType === 'p2shtr') {
    const xOnlyMpcPk = toXOnly(opt.sender.publicKey)
    const redeemScript = getOtaP2trRedeemScript(rndId, wanAddress, opt.sender.publicKey)
    const scriptTree = {
      output: redeemScript,
    }
    const realTo = bitcoin.payments.p2tr( {
      internalPubkey: xOnlyMpcPk,
      scriptTree,
      network,
    })
    console.log(`will send to ${realTo.address}`)

    const redeem = {
      output: redeemScript,
      redeemVersion: 0xc0
    }

    // 2.2 生成控制块
    const p2tr = bitcoin.payments.p2tr({
      internalPubkey: xOnlyMpcPk,
      scriptTree,
      redeem,
      network,
    });
    const tapLeafScript = {
      leafVersion: redeem.redeemVersion,
      script: redeem.output,
      controlBlock: p2tr.witness[p2tr.witness.length - 1] // extract control block from witness data
    }

    const tx = new bitcoin.Transaction()
    tx.addInput(idToHash(opt.txid), opt.vout, sequence)
    tx.addOutput(toOutScript, opt.amount)
    tx.addOutput(fromOutScript, preAmount - opt.amount - opt.fee)

    const msgHash = tx.hashForWitnessV1(0, [fromOutScript], [preAmount], hashP2tr, p2tr.hash)
    console.log("hash for script path spend  transaction", msgHash.toString('hex'))
    const sig = opt.sender.signSchnorr(msgHash)
    const wits = [sig, xOnlyMpcPk, redeemScript, tapLeafScript.controlBlock]
    tx.setWitness(0, wits)
    let txSerialized = tx.toHex();
    console.log("tx=",txSerialized)
    
    const txRet = await client.sendRawTransaction(txSerialized)
    console.log("p2shtr broad tx:", txRet)
  } 
}

const sendBtcByPsbt = async () => {
  let alice = ECPair.fromWIF('cNUx4bohBTqM41hf2dLDVoCHSexqgj29Q9poCnvT3i8DtMnJATaa', network)
  // let alice = ECPair.fromWIF('91nkjxTthS7RUsTRvqZSwZDXTf48rnKPJ2Yg1rpuaErDSKQffe9', network)

  console.log(`alice compress is ${alice.compressed}`)

  const utxo = unSpends.alice[0]
  await spendByPsbt(
    {
      txid: utxo.txId,
      vout: utxo.vout,
      value: utxo.value,
      sender: alice,
      receiver: {
        address: "tb1p76h0uyjxvca9g4qmnvs6zv29lucjfnpqr0crg2uvwtjnfsklleqsf0rjcc",
      },
      amount: 1,
      fee: 190,
      txType: 'p2shtr',
    }
  )
}

const sendBtcByTransaction = async () => {
  const alice = ECPair.fromWIF('cNUx4bohBTqM41hf2dLDVoCHSexqgj29Q9poCnvT3i8DtMnJATaa', network)
  // let alice = ECPair.fromWIF('91nkjxTthS7RUsTRvqZSwZDXTf48rnKPJ2Yg1rpuaErDSKQffe9', network)

  console.log(`alice compress is ${alice.compressed}`)

  const utxo = unSpends.alice[0]
  await spendByTransaction(
    {
      txid: utxo.txId,
      vout: utxo.vout,
      value: utxo.value,
      sender: alice,
      receiver: {
        address: "tb1p76h0uyjxvca9g4qmnvs6zv29lucjfnpqr0crg2uvwtjnfsklleqsf0rjcc",
      },
      amount: 1,
      fee: 190,
      txType: 'p2shtr',
    }
  )
}

setTimeout(async() => {
  await init()
  // await sendBtc()
  // await sendBtcByPsbt()
  await sendBtcByTransaction()
}, 0)

process.on('uncaughtException', error => {
  console.log(`uncaughtException ${error}`)
});

process.on('unhandledRejection', error => {
  console.log(`unhandledRejection ${error}`)
});
