const bitcoin6 = require('btcjs-libv610');

let ecc

async function init(){
  ecc = await import('tiny-secp256k1');
  bitcoin6.initEccLib(ecc)
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

function getP2TRAddress(hashVal, publicKey, networkInfo) {
  const xOnlyMpcPk = getXBytes(publicKey)
  const redeemScript = bitcoin6.script.fromASM(
    `
    ${hashVal}
    OP_DROP
    OP_DUP
    OP_HASH160
    ${bitcoin6.crypto.hash160(xOnlyMpcPk).toString('hex')}
    OP_EQUALVERIFY
    OP_CHECKSIG
    `.trim().replace(/\s+/g, ' '),
  )
  const scriptTree = {
    output: redeemScript,
    version: 0xc0
  }
  const p2tr = bitcoin6.payments.p2tr({
    internalPubkey: xOnlyMpcPk,
    scriptTree,
    network: networkInfo
  });

  return p2tr.address;
}

function getP2trKeySpendAddress(storemanPk, network) {
    const xPubKey = getXBytes(storemanPk)
    const p2tr = bitcoin6.payments.p2tr({ pubkey: xPubKey, network})
    return p2tr.address
}

setTimeout(async function () {
  await init()
}, 0)

module.exports = {
  init,
  getP2TRAddress,
  getP2trKeySpendAddress
}