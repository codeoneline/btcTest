const crypto = require('crypto')
const bitcoin = require('bitcoinjs-lib')
const bip341 = require('bitcoinjs-lib/src/payments/bip341')
const varUint = require('varuint-bitcoin')
const ECPAIR = require('ecpair')

let gInit = false
let ECPair = null
let ecc = null

async function init(){
  if (!gInit) {
    gInit = true
    // tiny-secp256k1 v2 is an ESM module, so we can't "require", and must import async
    ecc = await import('tiny-secp256k1');
    bitcoin.initEccLib(ecc)
    ECPair = ECPAIR.ECPairFactory(ecc)
  }
}

function getP2TRAddr(scriptOut, network) {
  return bitcoin.address.fromOutputScript(scriptOut, network);
}

function hexAdd0x(hexs) {
  if (0 != hexs.indexOf('0x')) {
    return '0x' + hexs;
  }
  return hexs;
}

function hexTrip0x(hexs) {
    if (0 == hexs.indexOf('0x')) {
        return hexs.slice(2);
    }
    return hexs;
}

function getHash(randomId, userAccount) {
    const hash = crypto.createHash('sha256');
    hash.update(hexAdd0x(randomId) + userAccount);
    let ret = hash.digest('hex');
    console.log('getHash randomId = %s userAccount=%s hash(randomId,userAccount)', randomId, userAccount, ret);

    return hexTrip0x(ret);
}

function getHash1(randomId, userAccount) {
  const hash = bitcoin.crypto.sha256(hexAdd0x(randomId) + userAccount)
  return hexTrip0x(hash.toString('hex'))
}

// in: hexString
// out: byte
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

function hashToAddress(hash, addressType, network) {
  let version;

  if (addressType === 'pubkeyhash') {
    version = network.pubKeyHash;
    return bitcoin.address.toBase58Check(Buffer.from(this.hexTrip0x(hash), "hex"), version)
  } else if (addressType === 'scripthash') {
    version = network.scriptHash;
    return bitcoin.address.toBase58Check(Buffer.from(this.hexTrip0x(hash), "hex"), version)
  } else if (addressType === 'p2tr') {
    version = 1;
    return bitcoin.address.toBech32(Buffer.from(this.hexTrip0x(hash), "hex"), version, network.bech32)
  } else if (addressType === 'p2wsh') {
    version = 0;
    return bitcoin.address.toBech32(Buffer.from(this.hexTrip0x(hash), "hex"), version, network.bech32)
  }
  return null
}

function addressToLockHash(address, network) {
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

function getOtaP2trRedeemScript(randomId, userAccount, xOnlyMpcPk) {
  let randomHash = getHash(randomId, userAccount);
  return bitcoin.script.fromASM(
  `
  ${hexTrip0x(randomHash)}
  OP_DROP
  OP_DUP
  OP_HASH160
  ${bitcoin.crypto.hash160(Buffer.from(xOnlyMpcPk, 'hex')).toString('hex')}
  OP_EQUALVERIFY
  OP_CHECKSIG
  `.trim().replace(/\s+/g, ' '),
  )
}

function getOtaP2TRAddr(randomId, userAccount, network, MPC_PK) {
  const xBytes = getXBytes(MPC_PK)
  const script = getOtaP2trRedeemScript(randomId, userAccount, xBytes)

  let script_node = {
    leaf_version:"0xc0",
    script:script
  };

  let o = createScriptSpendOutput(xBytes, script_node);

  let p2trAddr = getP2TRAddr(o.output,network);
  
  return p2trAddr;
}

function getSmgP2trRedeemScript(xOnlyMpcPk, network) {
  const redeemScript = bitcoin.script.fromASM(
    `
    OP_DUP
    OP_HASH160
    ${bitcoin.crypto.hash160(xOnlyMpcPk).toString('hex')}
    OP_EQUALVERIFY
    OP_CHECKSIG
    `.trim().replace(/\s+/g, ' '),
  )

  return redeemScript
}

function getSmgP2trAddress(gpk, network) {
  const xOnlyMpcPk = getXBytes(gpk)
  const redeemScript = getSmgP2trRedeemScript(xOnlyMpcPk)
  const scriptTree = {
    output: redeemScript,
    version: 0xc0
  }

  const p2tr = bitcoin.payments.p2tr({ 
    internalPubkey: xOnlyMpcPk,
    scriptTree: scriptTree,
    redeem: scriptTree,
    network 
  })
  return p2tr.address
}

function encodeBuf(s) {
  // 长度小于255的话，可以
  // return Buffer.concat([s.length], s)
  const varLen = varUint.encodingLength(s.length)
  const l = Buffer.allocUnsafe(varLen)
  varUint.encode(s.length, l)

  return Buffer.concat([l, s])
}

function toLeafHash(leafScript) {
  const version = leafScript.version || 0xc0;
  const leafData = Buffer.concat([Buffer.from([version]), encodeBuf(leafScript.output)])
  return bitcoin.crypto.taggedHash('TapLeaf', leafData)
}

function toTreeHash(treeScript) {
  if (Array.isArray(treeScript)) {
    const hashes = [toTreeHash(scriptTree[0]), toTreeHash(scriptTree[1])];
    hashes.sort((a, b) => a.hash.compare(b.hash));
    const [left, right] = hashes;
    return {
      hash: bitcoin.crypto.taggedHash('TapBranch', Buffer.concat(left, right)),
      left,
      right,
    };
  } else {
    return { hash: toLeafHash(treeScript) }
  }
}

function tweakKey(pubKey, h) {
  if (pubKey.length !== 32) return null
  if (h && h.length !== 32) return null

  const tweakHash = bitcoin.crypto.taggedHash('TapTweak', Buffer.concat(h ? [pubKey, h] : [pubKey]));
  const res = ecc.xOnlyPointAddTweak(pubKey, tweakHash);
  if (!res || res.xOnlyPubkey === null) return null;
  return {
    parity: res.parity,
    x: Buffer.from(res.xOnlyPubkey),
  };
}

function buildP2tr2(leafScript, internalPubkey) {
  const scriptTree = {
    output: leafScript,
    version: 0xc0
  }

  const redeem = {
    output: leafScript,
    redeemVersion: 0xc0
  }

  // const treeHash = toTreeHash(scriptTree)
  const leafHash = toLeafHash(redeem)
  // asset(treeHash.hash === leafHash)

  // path = leaf -> [ p1, ..., pn ]-> tree
  const path = []
  const outputKey = tweakKey(internalPubkey, treeHash.hash)
  const controlBlock = Buffer.concat(
    [Buffer.from([redeem.redeemVersion | outputKey.parity]), internalPubkey].concat(path)
  )

  return {
    controlBlock,
    leafHash,
  }
}

function buildP2tr(leafScript, internalPubkey, network) {
  const scriptTree = {
    output: leafScript,
  }

  const redeem = {
    output: leafScript,
    redeemVersion: 0xc0
  }

  // 2.2 生成控制块
  const p2tr = bitcoin.payments.p2tr({
    internalPubkey,
    scriptTree,
    redeem,
    network,
  });

  const leafHash = bip341.tapleafHash({
    output: redeem.output,
    version: redeem.redeemVersion
  })

  return {
    controlBlock: p2tr.witness[p2tr.witness.length - 1],
    leafHash
  }
}

setTimeout(async () => {
  await init()
  const wanAddress = '0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8'
  const rndId = '1234'
  const network = bitcoin.networks['testnet']
  const alice = ECPair.fromWIF('cNUx4bohBTqM41hf2dLDVoCHSexqgj29Q9poCnvT3i8DtMnJATaa', network)
  const leafScript = getOtaP2trRedeemScript(rndId, wanAddress, alice.publicKey)
  const xOnlyMpcPk = getXBytes(alice.publicKey.toString('hex'))
  const p = buildP2tr(leafScript, xOnlyMpcPk, network)
  const p1 = buildP2tr2(leafScript, xOnlyMpcPk, network)
  console.log('dd')
}, 0)

module.exports = {
    getP2TRAddr: getP2TRAddr,
    getXBytes:getXBytes,
    init:init,
    getSmgP2trAddress,
    getSmgP2trRedeemScript,
    getOtaP2TRAddr,
    getOtaP2trRedeemScript,
    addressToLockHash,
    getAddressType,
    buildP2tr,
    buildP2tr2,
    hashToAddress,
    bitcoin,
};
