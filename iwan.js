const iWanClient = require('iwan-sdk');

const configs = {
  mainnet: {
    "url": ['api.wanchain.org', 'api.wanglutech.net'],
    "port": [8443, 8443],
    "apikey": '651a3d796085ccb00d1c8f7e13f0e1d4f819777a1b771f9f3c063d78c1f7faa8',
    "secret": '94aa6c8b1096ee11b07dc1c7bd3804b68ced32095c2ad64f848993b1ebc0dd18',
  },
  testnet: {
    "url": ['apitest.wanchain.org'],
    "port": [8443],
    "apikey": '651a3d796085ccb00d1c8f7e13f0e1d4f819777a1b771f9f3c063d78c1f7faa8',
    "secret": '94aa6c8b1096ee11b07dc1c7bd3804b68ced32095c2ad64f848993b1ebc0dd18',
  }
}

const net = 'testnet'
const config = configs[net]
const opt = {
  url : config.url[0],
  port : config.port[0],
  flag : 'ws',
  version: 'v3',
  timeout: '300000'
}
const iWan = new iWanClient(config.apikey, config.secret, opt);

async function getTxCount(addr) {
  const count = await iWan.getNonce('WAN', addr )
  console.log(`getTxCount = ${count}`)
}

setTimeout(async () => {
  // await getTxCount('0x34aABB238177eF195ed90FEa056Edd6648732014')

  const g = await iWan.getStoremanGroupList('0x000000000000000000000000000000000000000000000000006465765f313237')
  console.log(JSON.stringify(g,null,2))
  if (iWan.isOpen()) {
    return iWan.close();
  }
}, 0)