const axios = require('axios');
const { getHash } = require('./utils.js')
// const crypto = require('crypto');
// const taproot = require('./taproot')

// let apiHome = "https://bridgeapi-testnet.wanchain.org:9004/api/"
let apiHome = "http://127.0.0.1:9004/api/"

/// queryActionInfo
// https://bridgeapi.wanchain.org/api/btc/queryActionInfo/2MsUzdLqKjSdaWenaY2Uh8KU5pvX9mRQUrT
// {"success":true,"data":null}


// curve=1 algo=1 gpk1 "0x258b8e8350086792f3adf797c50390760ac8722df6ab3ebfd26de846db7e1e7004bc427ae9568758db8daba80b5266f6f6e266e5253cb8ce98a4ba73e6619af1"
// curve=0 algo=0 gpk2 "0x4dd7ac4596dc87a266d559b4b2c53b8b340522ce3d21443f9f3b19ec532571b0d140b91b47a68c3758196614f6d523792dd5c7fd7e25647b5507e8d6a21ffd57"
// curve=0 algo=2 gpk3 "0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8"

{
  /// 介绍

  /// btc -> wan

  // https://bridgeapi-testnet.wanchain.org:9004/api/btc/addAddrInfo
  // "networkFee" : "0.00047124",// apiServer本地获取的networkfee
  // "wanBridgeNetworkfee" : "0.00047124",// wanBridge传递的networkfee
  const mint = {
    "oneTimeAddr":"2NA9UEWU6wRkzp5cRXWsnukwrpQzhQBf2Rr",
    "randomId":"0x5840e27f62db1533292af237f9f48474b119e66866ef54f12dee895a2cf6607e",
    "chainType":"WAN",
    "chainAddr":"0x6aBdBe7d9fA6D658bF3435D10742F27EF9a53028",
    "smgPublicKey":"0xc01cfea6d16eae031fa1a0e03a5113f2dd2134bf69c315846078a4972f901132808d0cbf0e41ea3afff04d9953ea8fc4fd926b6eb462fb7c3188527c899c6fba",
    "smgId":"0x000000000000000000000000000000000000000000746573746e65745f303530",
    "tokenPairId":"15",
    "networkFee":"0.0001",
    "value":"21000"
  }

  /// wan -> btc
  // https://bridgeapi-testnet.wanchain.org:9004/api/btc/addTxInfo
  // WAN/ETH跨向BTC,wanBridge post txHash等信息
  const burn = {
    "chainType":"WAN",
    "chainAddr":"0x6aBdBe7d9fA6D658bF3435D10742F27EF9a53028",
    "chainHash":"0xaf9597bee0383f8838ca9d9ea464a3e41326ad8c29e4316ae8d2d45d4a1b79c9",
    "btcAddr":"tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e"
  }
  // 存储btcTxInfo:
  // {
  // "timestamp" : 1614950031962,
  // "btcAddr"   : "ms7o3axvg33pbeqxNpvZJgxpwrcHnzeANw",
  // "chainType" : "WAN",
  // "chainAddr" : "0x406b41140149f85e2d91d4daf7af8314c6c1437c",
  // "chainHash" : "0x0c89f15ce5a89ac0eabe92ea8fd2ec4930a926d08fa4823c75e9e8c32354e7d1"    
  // }
  // https://bridgeapi-testnet.wanchain.org:9004/api/btc/queryTxAckInfo/0xaf9597bee0383f8838ca9d9ea464a3e41326ad8c29e4316ae8d2d45d4a1b79c9
  const burnGet = {
    "success":true,
    "data":{
      "timestamp":1681177379165,
      "btcAddr":"tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e",
      "chainHash":"0xaf9597bee0383f8838ca9d9ea464a3e41326ad8c29e4316ae8d2d45d4a1b79c9",
      "btcHash":"73ea5418a7f1f5fd3b4275ee9001545c739627ca14dc0b086db9823fa5a16e13",
      "value":"10000"
    }
  }
}


// gpkP2tr is 0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8
// p2tr ota script path spend = tb1px25ern5cte676f8eft679cc4w5hvkmfsmfqr7246tc52rxjy4nys787lcp, length = 62
// p2tr smg script path spend = tb1p97lc6zfzyv9wzahpq6ktykltmpuhta48l9t6rwpa77xf9ch6lwlqn628ap, length = 62
function addAddrInfo() {
  const url = apiHome + "btc/addAddrInfo"
  const data = {
    "oneTimeAddr": "tb1p7y6wzygq03c6nu3dnmpgwr8x5pqm9shkgxxwjuk25yvdl9wxepkst44lav",
    "randomId": "0x1096125c5f89d4a29869f526415b6bf0818b6697b34c02f65361a0046d211f1b",
    "chainType": "WAN",
    "chainAddr": "0x34aABB238177eF195ed90FEa056Edd6648732014",
    "smgPublicKey": "0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8",
    "smgId": "0x000000000000000000000000000000000000000000000000006a73775f303033",
    "tokenPairId": "15",
    "networkFee": "0.0001",
    "value": "120000"
  }
//   { 
//     "chainAddr": "0x8b157B3fFEAD48C8a4CDC6bddBE1C1D170049Da4", 
//     "chainType": "WAN", 
//     "networkFee": "0.0001", 
//     "oneTimeAddr": "tb1pfkx6x9vurde8q2kpvu2x3surjw3l6ggzzpnr2e2hlhl3gmyn0rnqd0jwsv", 
//     "randomId": "0xadbc3bb034f5f0ba275e065134d1f04481a12d1c27c96465d8ce03460a08f784", 
//     "smgId": "0x000000000000000000000000000000000000000000000000006465765f313236", 
//     "smgPublicKey": "0x1758d8c707f973496a640cabcdec5ef833a883b5f08624bba7ba14d87b50c57105f8adf0c91b83b4f43284941d0d38651af1c325b90904c40fea3ef371e5da53", 
//     "tokenPairId": "15", 
//     "value": "100000" 
// }

  // hashX: 1082084cdcde1a6322d2a27061671d85e52b2bf3be03ab06f851db6175b156a2
  // getHash(data.randomId, data.chainAddr)

  // {"success":true,"apiServerNetworkFee":"0.0001"}
  let ret = axios.post(url, data)
  return ret
}


// const wanAddress = '0x34aABB238177eF195ed90FEa056Edd6648732014'
// const rndId = '0x3096125c5f89d4a29869f526415b6bf0818b6697b34c02f65361a0046d211f1b'
// const gpkP2pkh = '0x4dd7ac4596dc87a266d559b4b2c53b8b340522ce3d21443f9f3b19ec532571b0d140b91b47a68c3758196614f6d523792dd5c7fd7e25647b5507e8d6a21ffd57'
// p2pkh = mvqKUF6jQhv6JszEJ4QkTtS4h7tgpjVQ89, length = 34 
// p2sh = 2N8spV8DBdAMTKpdVKCSeayMvZUZPQoqaQB, length = 35
function addAddrInfoOld() {
  const url = apiHome + "btc/addAddrInfo"
  const data = {
    "oneTimeAddr": "2NBB2seaMjMxNpPEDwZY2out1ob2TFFRAZu",
    "randomId": "0x4096125c5f89d4a29869f526415b6bf0818b6697b34c02f65361a0046d211f1b",
    "chainType": "WAN",
    "chainAddr": "0x34aABB238177eF195ed90FEa056Edd6648732014",
    "smgPublicKey": "0x4dd7ac4596dc87a266d559b4b2c53b8b340522ce3d21443f9f3b19ec532571b0d140b91b47a68c3758196614f6d523792dd5c7fd7e25647b5507e8d6a21ffd57",
    "smgId": "0x000000000000000000000000000000000000000000000000006a73775f303033",
    "tokenPairId": "15",
    "networkFee": "0.0001",
    "value": "20000"
  }

  // hashX: 108/usr/share/code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html2084cdcde1a6322d2a27061671d85e52b2bf3be03ab06f851db6175b156a2
  // getHash(data.randomId, data.chainAddr)

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
        // await addAddrInfo()
        await addAddrInfoOld()
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