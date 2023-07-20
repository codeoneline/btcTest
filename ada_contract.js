const adaMappingTokens = {
  'mainnet': {
    'USDT' : {
      symbol: 'USDT@Cardano',
      tokenId: '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.55534454',
      account: '0x32356335646535663562323836303733633539336564666437376234386162633761343865356134663364346364396434323866663933352e3535353334343534',
    },
    'USDC' : {
      symbol: 'USDC@Cardano',
      tokenId: '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.55534443',
      account: '0x32356335646535663562323836303733633539336564666437376234386162633761343865356134663364346364396434323866663933352e3535353334343433',
    },
    'ETH' : {
      symbol: 'ETH@Cardano',
      tokenId: '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.455448',
      account: '0x32356335646535663562323836303733633539336564666437376234386162633761343865356134663364346364396434323866663933352e343535343438',
    },
    'BTC' : {
      symbol: 'BTC@Cardano',
      tokenId: '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.425443',
      account: '0x32356335646535663562323836303733633539336564666437376234386162633761343865356134663364346364396434323866663933352e343235343433',
    },
    'WAN' : {
      symbol: 'WAN@Cardano',
      tokenId: '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.57414e',
      account: '0x32356335646535663562323836303733633539336564666437376234386162633761343865356134663364346364396434323866663933352e353734313465',
    },
  },
  'testnet': {
    'ada-wasp': {
      symbol: 'ada-wasp',
      tokenId: 'd2a8592ec9673ac18fea1044885f94518e954ab0cb2b6bb0a328d2af.4164612d57617370',
    },
  }
}

const axios = require('axios')

const apiServerMainnet = "https://nodes.wandevs.org/cardano"
// const apiServerTestnet = 'https://testnet.wandevs.org:1337'
const apiServer = apiServerMainnet

async function getBalance(address) {
  try {
    const reqUrl = `${apiServer}/getBalanceByAddress`
    const res = await axios.post(reqUrl, {address})
    console.log('Balance: ', JSON.stringify(res.data, null, 2))
    return res.data
  } catch (error) {
    console.error(error);
    return null
  }
}

async function getTotalSupply(token) {
  try {
    console.log("tokenId:", token.tokenId)
    const reqUrl = `${apiServer}/getAssetMintage`
    const res = await axios.post(reqUrl, {tokenId: token.tokenId})
    console.log(`${token.symbol} Total supply: `, JSON.stringify(res.data))
    return res.data
  } catch (error) {
    console.error(error);
    return null
  }
}

setTimeout(async() => {
  // Balance:  [
  //   {
  //     "unit": "lovelace",
  //     "quantity": "1003452310"
  //   },
  //   {
  //     "unit": "25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.55534454",
  //     "quantity": "1155080"
  //   },
  //   {
  //     "unit": "25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.55534443",
  //     "quantity": "1155080"
  //   },
  //   {
  //     "unit": "25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.425443",
  //     "quantity": "1142150"
  //   }
  // ]
  await getBalance('addr1q8nd57644dctpmh5z49u9kxdsr6t2px0jg0es4gjpy7kvzk2decd8n4d28t9helaqh6eq8tqpqxjn5km60dxreegmzuqesanym')


  // tokenId: 25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.55534454
  //   USDT@Cardano Total supply:  "10000000"
  // tokenId: 25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.55534443
  //   USDC@Cardano Total supply:  "12345600"
  // tokenId: 25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.455448
  //   ETH@Cardano Total supply:  "0"
  // tokenId: 25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.425443
  //   BTC@Cardano Total supply:  "12345"
  // tokenId: 25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.57414e
  //   WAN@Cardano Total supply:  "0"
  for (i in adaMappingTokens.mainnet) {
    const token = adaMappingTokens.mainnet[i]
    await getTotalSupply(token)
  }
}, 0)