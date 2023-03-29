const axios = require('axios');
const { getHash } = require('./utils.js')
// const crypto = require('crypto');
// const taproot = require('./taproot')

// let apiHome = "https://bridgeapi-testnet.wanchain.org:9004/api/"
let apiHome = "http://127.0.0.1:9004/api/"

/// queryActionInfo
// https://bridgeapi.wanchain.org/api/btc/queryActionInfo/2MsUzdLqKjSdaWenaY2Uh8KU5pvX9mRQUrT
// {"success":true,"data":null}


// curve --- secp256k1: 0, bn256: 1, 
// AlgoId --- ecdsa: 0, schnorr: 1, schnorr340: 2,

// const sInfo = await sgaWan.call('getStoremanGroupInfo', groupId)
// console.log(JSON.stringify(sInfo, null, 2))
// const gpkCount = await gpkWan.call('getGpkCount', groupId)
// const gpkInfos = []
// for(let i=0; i<gpkCount; i++) {
//   const cfg = await gpkWan.call('getGpkCfgbyGroup', groupId, i)
//   const gpk = await gpkWan.call('getGpkbyIndex', groupId, i)
//   gpkInfos.push({
//     curve: cfg.curveIndex,
//     algo: cfg.algoIndex,
//     gpk,
//     index: i
//   })
// }
// console.log(JSON.stringify(gpkInfos, null, 2))

// curve=1 algo=1 gpk1 "0x258b8e8350086792f3adf797c50390760ac8722df6ab3ebfd26de846db7e1e7004bc427ae9568758db8daba80b5266f6f6e266e5253cb8ce98a4ba73e6619af1"
// curve=0 algo=0 gpk2 "0x4dd7ac4596dc87a266d559b4b2c53b8b340522ce3d21443f9f3b19ec532571b0d140b91b47a68c3758196614f6d523792dd5c7fd7e25647b5507e8d6a21ffd57"
// curve=0 algo=2 gpk3 "0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8"

function addAddrInfo() {
  const url = apiHome + "btc/addAddrInfo"
  const data = {
    "oneTimeAddr": "tb1px25ern5cte676f8eft679cc4w5hvkmfsmfqr7246tc52rxjy4nys787lcp",
    "randomId": "0x9096125c5f89d4a29869f526415b6bf0818b6697b34c02f65361a0046d211f1b",
    "chainType": "WAN",
    "chainAddr": "0x34aABB238177eF195ed90FEa056Edd6648732014",
    "smgPublicKey": "0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8",
    "smgId": "0x000000000000000000000000000000000000000000000000006a73775f303033",
    "tokenPairId": "15",
    "networkFee": "0.0001",
    "value": "110000"
  }

  // hashX: 1082084cdcde1a6322d2a27061671d85e52b2bf3be03ab06f851db6175b156a2
  getHash(data.randomId, data.chainAddr)

  // {"success":true,"apiServerNetworkFee":"0.0001"}
  let ret = axios.post(url, data)
  return ret
}


async function queryActionInfo(address) {
    const url = apiHome + "btc/queryActionInfo/" + address
    let ret = await axios.get(url)
    return ret
}


async function main() {
    try{
        await addAddrInfo()
    }catch(err){
        if(err.response) {
            console.log("error occur:", err.response.statusText)
        }else{
            console.log("error occur:", err)
        }
        
    }
}

const eventModel = {
    hashX: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    status: {
        type: String, 
        default: 'init'
        /*
        waitingCross, 
        waitingApprove,
        approveFailed,
        approveFinished
        waitingCrossLockConfirming,
        lockHashFailed,
        waitingX, 
        receivedX,
        waitingCrossRedeemConfirming,
        redeemFailed,
        redeemFinished,
        walletRevoked,
        waitingRevoke,
        waitingCrossRevokeConfirming,
        revokeFailed,
        revokeFinished,
        transIgnored
        */
      },
}

main()