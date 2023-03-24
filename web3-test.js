const Web3 = require("web3");

const configs = require('./configs')

const createWeb3 = (url) => {
  const options = {
    timeout: 30000, // ms
  
    clientConfig: {
        // Useful if requests are large
        maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
        maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
  
        // Useful to keep a connection alive
        keepalive: true,
        keepaliveInterval: -1 // ms
    },
  
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 1000, // ms
        maxAttempts: 10,
        onTimeout: false
    }
  };
  const provider = new Web3.providers.HttpProvider(url, options);
  const web3 = new Web3(provider)

  return web3
}

const createContract = async (web3, abi, address) => {
  const contract = new web3.eth.Contract(abi, address)

  return contract
}

const contractCall = async (contract, methodName, args, blockNumber) => {
  return await contract.methods[methodName](...args).call(null, blockNumber);
}

const getStoremanGroupInfo = async (c, groupId) => {
  const sInfo = await contractCall(c, 'getStoremanGroupInfo', [groupId])
  console.log(JSON.stringify(sInfo, null, 2))
  return sInfo
}

const getGpkDetail = async (groupId) => {
  const curveIds = ['secp256k1', 'bn256', 'ecdsa25519']
  const algoIds = ['ecdsa', 'schnorr', 'schnorr340']
  // const gpks = [
  //   {
  //     curveId: 1,
  //     algoId: 1,
  //     gpk: '0x258b8e8350086792f3adf797c50390760ac8722df6ab3ebfd26de846db7e1e7004bc427ae9568758db8daba80b5266f6f6e266e5253cb8ce98a4ba73e6619af1',
  //     index: 0,
  //   },
  //   {
  //     curveId: 0,
  //     algoId: 0,
  //     gpk: '0x4dd7ac4596dc87a266d559b4b2c53b8b340522ce3d21443f9f3b19ec532571b0d140b91b47a68c3758196614f6d523792dd5c7fd7e25647b5507e8d6a21ffd57',
  //     index: 1,
  //   },
  //   {
  //     curveId: 0,
  //     algoId: 2,
  //     gpk: '0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8',
  //     index: 2,
  //   }
  // ]
  const wanChainConfig = configs.wanchain.testnet
  const wanDeployConfig = require(`./abi/${wanChainConfig.deployedFile}`)
  const web3 = createWeb3(wanChainConfig.rpc)
  const address = wanDeployConfig.GpkProxyV2.address.toLowerCase()
  const abiFileName = wanDeployConfig.GpkProxyV2.abi
  const abi = require(`./abi/${abiFileName}`)
  const contract = new web3.eth.Contract(abi, address)
  const gpkCount = await contract.methods.getGpkCount(groupId).call()
  console.log(`gpk count ${gpkCount}`)
  const gpkInfos = []
  for (let i = 0; i < gpkCount; i++) {
    const cfg = await contract.methods.getGpkCfgbyGroup(groupId, i).call()
    const gpk = await contract.methods.getGpkbyIndex(groupId, i).call()
    gpkInfos.push({
      index: i,
      curve: Number(cfg.curveIndex),
      algo: Number(cfg.algoIndex),
      gpk,
    })
  }
  console.log(JSON.stringify(gpkInfos, null, 2))
}


setTimeout(async ()=> {
  await getGpkDetail('0x000000000000000000000000000000000000000000000000006a73775f303033')
}, 0)