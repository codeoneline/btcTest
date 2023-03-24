// standard chain config
module.exports = {
  'wanchain': {
    'testnet': {
      chainType: 'WAN',
      rpc: 'https://nodes-testnet.wandevs.org/wan',
      gasPrice: 0x174876e800,
      gasLimit: 0x989680,
      chainId: 999,
      curveType: '1',
      deployedFile: 'testnet.json',
      bip44: 0x8057414e,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'WAN',
      decimals: 18,
      chainName: 'wan',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x14095a721Dddb892D6350a777c75396D634A7d97'.toLowerCase(),
    },
    'mainnet': {
      chainType: 'WAN',
      rpc: 'https://nodes.wandevs.org/wan',
      gasPrice: 0x174876e800,
      gasLimit: 0x989680,
      chainId: 888,
      curveType: '1',
      deployedFile: 'mainnet.json',
      bip44: 0x8057414e,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'WAN',
      decimals: 18,
      chainName: 'wan',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0xBa5934Ab3056fcA1Fa458D30FBB3810c3eb5145f'.toLowerCase(),
    },
  },
  'ethereum': {
    'testnet': {
      chainType: 'ETH',
      rpc: 'https://nodes-testnet.wandevs.org/eth',
      gasPrice: 0xe8d4a51000,
      gasLimit: 0x7a1200,
      chainId: 5,
      curveType: '1',
      deployedFile: 'rinkeby.json',
      bip44: 0x8000003c,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'ETH',
      decimals: 18,
      chainName: 'ethereum',

      // 3 hour
      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x95492fD2f5b2D2e558e8aF811f951e2DCbc846d3'.toLowerCase(),
    },
    'mainnet': {
      chainType: 'ETH',
      rpc: 'https://nodes.wandevs.org/eth',
      gasPrice: 0x174876e800,
      gasLimit: 0x7a1200,
      chainId: 1,
      curveType: '1',
      deployedFile: 'ethereum.json',
      bip44: 0x8000003c,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'ETH',
      decimals: 18,
      chainName: 'ethereum',
      
      // 2 hour
      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441'.toLowerCase(),
    },
  },
  'bsc': {
    'testnet': {
      chainType: 'BSC',
      rpc: 'https://data-seed-prebsc-2-s2.binance.org:8545/',
      gasPrice: 0xe8d4a51000,
      gasLimit: 0x7a1200,
      chainId: 97,
      curveType: '1',
      deployedFile: 'testnet_bsc.json',
      bip44: 0x800002ca,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'BSC',
      decimals: 18,
      chainName: 'bsc',

      maxNoBlockTime: 1800000,
      rpcS: ['https://data-seed-prebsc-2-s2.binance.org:8545/','https://bsctestapi.terminet.io/rpc','https://bsc-testnet.public.blastapi.io'],

      multiCall: '0x54b738619DE4770A17fF3D6bA4c2b591a886A062'.toLowerCase(),
    },
    'mainnet': {
      chainType: 'BSC',
      rpc: 'https://bsc-dataseed1.binance.org',
      gasPrice: 0xe8d4a51000,
      gasLimit: 0x7a1200,
      chainId: 56,
      curveType: '1',
      deployedFile: 'bsc.json',
      bip44: 0x800002ca,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'BSC',
      decimals: 18,
      chainName: 'bsc',

      maxNoBlockTime: 1800000,
      rpcS: ['https://bsc-dataseed1.binance.org', 'https://bsc-dataseed.binance.org', 'https://bsc-dataseed1.defibit.io/', 'https://bsc-dataseed1.ninicoin.io/'],

      multiCall: '0x023a33445F11C978f8a99E232E1c526ae3C0Ad70'.toLowerCase(),
    },
  },
  'avalanche': {
    'testnet': {
      chainType: 'AVAX',
      rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
      gasPrice: 0x6d6e2edc00,
      gasLimit: 0x2dc6c0,
      chainId: 43113,
      curveType: '1',
      deployedFile: 'testnet_avax.json',
      bip44: 0x80002328,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'AVAX',
      decimals: 18,
      chainName: 'avax',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x0EA414bAAf9643be59667E92E26a87c4Bae3F33a'.toLowerCase(),
    },
    'mainnet': {
      chainType: 'AVAX',
      rpc: 'https://rpc.ankr.com/avalanche',
      gasPrice: 0x6d6e2edc00,
      gasLimit: 0x2dc6c0,
      chainId: 43114,
      curveType: '1',
      deployedFile: 'avalancheMainnet.json',
      bip44: 0x80002328,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'AVAX',
      decimals: 18,
      chainName: 'avax',

      maxNoBlockTime: 1800000,
      rpcS: ['https://api.avax.network/ext/bc/C/rpc', 'https://rpc.ankr.com/avalanche'],

      multiCall: '0xA4726706935901fe7dd0F23Cf5D4fb19867dfc88'.toLowerCase(),
    }
  },
  'moonriver': {
    'testnet': {
      chainType: 'DEV',
      rpc: 'https://moonbeam-alpha.api.onfinality.io/public',
      gasPrice: 0xba43b74000,
      gasLimit: 0x7a1200,
      chainId: 1287,
      curveType: '1',
      deployedFile: 'moonbeamTestnet.json',
      bip44: 0x40000001,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'DEV',
      decimals: 18,
      chainName: 'moonbase',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x136333217C18Cd6E018B85Aaf8Bd563EB72E97Fd'.toLowerCase(),
    },
    'mainnet': {
      chainType: 'MOVR',
      rpc: 'https://rpc.api.moonriver.moonbeam.network',
      gasPrice: 0x2540be400,
      gasLimit: 0x7a1200,
      chainId: 1285,
      curveType: '1',
      deployedFile: 'moonriverMainnet.json',
      bip44: 0x40000001,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'MOVR',
      decimals: 18,
      chainName: 'moonriver',

      maxNoBlockTime: 1800000,
      rpcS: ['https://moonriver.api.onfinality.io/public', 'https://rpc.api.moonriver.moonbeam.network'],

      multiCall: '0x1Fe0C23940FcE7f440248e00Ce2a175977EE4B16'.toLowerCase(),
    },
  },
  'moonbeam': {
    'mainnet': {
      chainType: 'GLMR',
      rpc: 'https://rpc.api.moonbeam.network',
      gasPrice: 0x45d964b800,
      gasLimit: 0x7a1200,
      chainId: 1284,
      curveType: '1',
      deployedFile: 'moonbeamMainnet.json',
      bip44: 0x40000004,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'GLMR',
      decimals: 18,
      chainName: 'moonbeam',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0xBAcAaa4509EE9c9b2cF7133B970BC6db47713477'.toLowerCase(),

      explorer: 'https://blockscout.moonbeam.network/',
    },
  },
  'polygon': {
    'testnet': {
      chainType: 'MATIC',
      rpc: 'https://matic-mumbai.chainstacklabs.com',
      gasPrice: 0xba43b74000,
      gasLimit: 0x7a1200,
      chainId: 80001,
      curveType: '1',
      deployedFile: 'maticTestnet.json',
      bip44: 0x800003c6,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'MATIC',
      decimals: 8,
      chainName: 'polygon',

      maxNoBlockTime: 1800000,
      rpcS: ['https://matic-mumbai.chainstacklabs.com', 'https://rpc-mumbai.maticvigil.com'],

      multiCall: '0x905B3237B2367B2DdEBdF54D4F5320429710850a'.toLowerCase(),
    },
    'mainnet': {
      chainType: 'MATIC',
      rpc: 'https://polygon-rpc.com',
      gasPrice: 0x45d964b800,
      gasLimit: 0x4c4b40,
      chainId: 137,
      curveType: '1',
      deployedFile: 'maticMainnet.json',
      bip44: 0x800003c6,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'MATIC',
      decimals: 8,
      chainName: 'polygon',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x1bbc16260d5d052f1493b8f2aeee7888fed1e9ab'.toLowerCase(),
    },
  },
  'arbitrum': {
    'testnet': {
      chainType: 'ARB',
      rpc: 'https://goerli-rollup.arbitrum.io/rpc',
      gasPrice: 0x2faf0800,
      gasLimit: 0x7a1200,
      chainId: 421613,
      curveType: '1',
      deployedFile: 'arbTestnet.json',
      bip44: 0x40000002,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'ETH',
      decimals: 18,
      chainName: 'arbitrum',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x674499D5fF2B200ef60214CF07DF4c1661c75725'.toLowerCase(),

      explorer: 'https://rinkeby-explorer.arbitrum.io/#/',
    },
    'mainnet': {
      chainType: 'ARB',
      rpc: 'https://arb1.arbitrum.io/rpc',
      gasPrice: 0x37e11d600,
      gasLimit: 0x4c4b40,
      chainId: 42161,
      curveType: '1',
      deployedFile: 'arbMainnet.json',
      bip44: 0x40000002,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'ETH',
      decimals: 18,
      chainName: 'arbitrum',

      maxNoBlockTime: 1800000,
      rpcS:['https://arb1.arbitrum.io/rpc', 'https://rpc.ankr.com/arbitrum'],

      multiCall: '0xb66f96e30d6a0ae64d24e392bb2dbd25155cb3a6'.toLowerCase(),

      explorer: 'https://rinkeby-explorer.arbitrum.io/#/',
    },
  },
  'fantom': {
    'testnet': {
      chainType: 'FTM',
      rpc: 'https://rpcapi-tracing.testnet.fantom.network/',
      gasPrice: 0x746a528800,
      gasLimit: 0x7a1200,
      chainId: 4002,
      curveType: '1',
      deployedFile: 'ftmTestnet.json',
      bip44: 0x800003ef,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'FTM',
      decimals: 18,
      chainName: 'fantom',

      maxNoBlockTime: 1800000,
      rpcS: ['https://rpcapi-tracing.testnet.fantom.network/', 'https://rpc.testnet.fantom.network', 'https://fantom-testnet.public.blastapi.io'],

      multiCall: '0x5379271958a603ba1cd782588643d9566799670c'.toLowerCase(),

      explorer: 'https://testnet.ftmscan.com/',
    },
    'mainnet': {
      chainType: 'FTM',
      rpc: 'https://rpcapi.fantom.network',
      gasPrice: 0xd18c2e2800,
      gasLimit: 0x7a1200,
      chainId: 250,
      curveType: '1',
      deployedFile: 'ftmMainnet.json',
      bip44: 0x800003ef,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'FTM',
      decimals: 18,
      chainName: 'fantom',

      maxNoBlockTime: 1800000,
      rpcS: ['https://rpcapi.fantom.network', 'https://rpc.fantom.network/'],

      multiCall: '0x5f4870D51d2629D7493970B9d4526377Da98e95e'.toLowerCase(),

      explorer: 'https://www.ftmscan.com/',
    },
  },
  'optimism' : {
    'testnet': {
      chainType: 'OPT',
      rpc: 'https://goerli.optimism.io/',
      gasPrice: 0x45d964b800,
      gasLimit: 0x7a1200,
      chainId: 420,
      curveType: '1',
      deployedFile: 'optTestnet.json',
      bip44: 0x80000266,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'KETH',
      decimals: 18,
      chainName: 'optimism',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x05211bBC9E0C1ED3bE0252021Cf558718ab65189'.toLowerCase(),

      explorer: 'https://goerli-optimism.etherscan.io/',

    },
    'mainnet': {
      chainType: 'OPT',
      // rpc: 'https://mainnet.optimism.io/',
      rpc: 'https://endpoints.omniatech.io/v1/op/mainnet/public',
      gasPrice: 0x45d964b800,
      gasLimit: 0x7a1200,
      chainId: 10,
      curveType: '1',
      deployedFile: 'optMainnet.json',
      bip44: 0x80000266,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'OETH',
      decimals: 18,
      chainName: 'optimism',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x2DC0E2aa608532Da689e89e237dF582B783E552C'.toLowerCase(),

      explorer: 'https://optimistic.etherscan.com/',
    }
  },
  'xdc': {
    'testnet': {
      chainType: 'XDC',
      rpc: 'https://erpc.apothem.network',
      wss: 'wss://ws.apothem.network',
      gasPrice: 0x3b9aca00,
      gasLimit: 0x7a1200,
      chainId: 51,
      curveType: '1',
      deployedFile: 'xdcTestnet.json',
      bip44: 0x80000226,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'XDC',
      decimals: 18,
      chainName: 'xinfin',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x4a9F99ceb037E8C4FBEC272D17D40282aA67d9c6'.toLowerCase(),

      explorer: 'https://explorer.apothem.network/',
    },
    'mainnet': {
      chainType: 'XDC',
      rpc: 'https://rpc.xinfin.network',
      wss: 'wss://ws.xinfin.network',
      gasPrice: 0x3b9aca00,
      gasLimit: 0x7a1200,
      chainId: 50,
      curveType: '1',
      deployedFile: 'xdcMainnet.json',
      bip44: 0x80000226,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'XDC',
      decimals: 18,
      chainName: 'xinfin',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x711bC8Dc6BF017958470c6A25f77D05Db2DCe65B'.toLowerCase(),

      explorer: 'https://explorer.xinfin.network/',
    }
  },
  'tron': {
    'testnet': {
      chainType: 'TRON',
      rpc: 'https://api.nileex.io',
      wss: 'wss://ws.apothem.network',
      gasPrice: 0x3b9aca00,
      gasLimit: 0x7a1200,
      chainId: 0x00000c3,
      curveType: '1',
      deployedFile: 'tronTestnetNile.json',
      bip44: 0x800000c3,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'tron',

      symbol: 'XDC',
      decimals: 6,
      chainName: 'tron',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '41b2401225f5ec9b4c1014a93edb3cda19afdd9c1b'.toLowerCase(),

      explorer: 'https://nile.tronscan.org/',
    },
    'mainnet': {
      chainType: 'TRON',
      rpc: 'https://ultron-rpc.net',
      gasPrice: 0x3b9aca00,
      gasLimit: 0x7a1200,
      chainId: 0x00004cf,
      curveType: '1',
      deployedFile: 'tronMainnet.json',
      bip44: 0x800000c3,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'tron',

      symbol: 'XDC',
      decimals: 6,
      chainName: 'tron',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '419d5b1c2defe060b74fa9561269a37b1c71331848'.toLowerCase(),

      explorer: 'https://nile.tronscan.org/',
    },
  },
  'okt': {
    'testnet': {
      chainType: 'OKT',
      rpc: 'https://exchaintestrpc.okex.org',
      wss: 'wss://ws.apothem.network',
      gasPrice: 0x174876e800,
      gasLimit: 0x7a1200,
      chainId: 65,
      curveType: '1',
      deployedFile: 'oktTestnet.json',
      bip44: 0x800003e4,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'OKT',
      decimals: 18,
      chainName: 'okt',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x3ecc2399611A26E70dbac73714395b13Bc3B69fA'.toLowerCase(),

      explorer: 'https://www.oklink.com/oec-test/',
      faucet: 'https://www.okx.com/okc/faucet',
    },
    'mainnet': {
      chainType: 'OKT',
      rpc: 'https://exchainrpc.okex.org',
      wss: 'wss://ws.apothem.network',
      gasPrice: 0x174876e800,
      gasLimit: 0x7a1200,
      chainId: 66,
      curveType: '1',
      deployedFile: 'oktMainnet.json',
      bip44: 0x800003e4,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'OKT',
      decimals: 18,
      chainName: 'okt',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0xbd4191828aeff23fb9e0249a5ae583a4b9425e49'.toLowerCase(),

      explorer: 'https://www.oklink.com/oec/',
    }
  },
  'clv': {
    'testnet': {
      chainType: 'CLV',
      rpc: 'https://api-para.clover.finance',
      wss: 'wss://rpc-para.clover.finance',
      gasPrice: 0x45d964b800,
      gasLimit: 0x7a1200,
      chainId: 1024,
      curveType: '1',
      deployedFile: 'clvTestnet.json',
      bip44: 0x40000005,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'CLV',
      decimals: 18,
      chainName: 'clover-p',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x9b281146a04a67948f4601abda704016296017c5'.toLowerCase(),

      explorer: 'https://clvscan.com/',
      faucet: '',
    },
    'mainnet': {
      chainType: 'CLV',
      rpc: 'https://api-para.clover.finance',
      wss: 'wss://rpc-para.clover.finance',
      gasPrice: 0x45d964b800,
      gasLimit: 0x7a1200,
      chainId: 1024,
      curveType: '1',
      deployedFile: 'clvMainnet.json',
      bip44: 0x40000005,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'CLV',
      decimals: 18,
      chainName: 'clover-p',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x9b281146a04a67948f4601abda704016296017c5'.toLowerCase(),

      explorer: 'https://clvscan.com/',
      faucet: '',
    }
  },
  'FX': {
    'testnet': {
      chainType: 'FX',
      rpc: 'https://testnet-fx-json-web3.functionx.io:8545',
      wss: '',
      gasPrice: 0xe8d4a51000,
      gasLimit: 0x7a1200,
      chainId: 90001,
      curveType: '1',
      deployedFile: 'fx-core-Testnet.json',
      bip44: 0x40000006,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'FX',
      decimals: 18,
      chainName: 'functionX',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x131DFc3Ca32D3a959012606855320cBE8e655132'.toLowerCase(),

      explorer: 'https://testnet-explorer.functionx.io/evm',
      faucet: '',
    },
    'mainnet': {
      chainType: 'FX',
      rpc: 'https://fx-json-web3.functionx.io:8545',
      wss: '',
      gasPrice: 0x45d964b800,
      gasLimit: 0x7a1200,
      chainId: 530,
      curveType: '1',
      deployedFile: 'fx-core-Mainnet.json',
      bip44: 0x40000006,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'FX',
      decimals: 18,
      chainName: 'functionX',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x131DFc3Ca32D3a959012606855320cBE8e655132'.toLowerCase(),

      explorer: 'https://explorer.functionx.io/evm',
      faucet: '',
    }
  },
  'astar': {
    'testnet': {
      chainType: 'ASTR',
      rpc: 'https://evm.shibuya.astar.network',
      wss: '',
      gasPrice: 0xe8d4a51000,
      gasLimit: 0x7a1200,
      chainId: 81,
      curveType: '1',
      deployedFile: 'astarTestnet.json',
      bip44: 0x8000032a,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'ASTR',
      decimals: 18,
      chainName: 'Shibaya',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0x8331595fb5D64466A6877276337782A94E647005'.toLowerCase(),

      explorer: 'https://shibuya.subscan.io/',
      faucet: '',
    },
    'mainnet': {
      chainType: 'ASTR',
      rpc: 'https://evm.astar.network',
      wss: '',
      gasPrice: 0xe8d4a51000,
      gasLimit: 0x7a1200,
      chainId: 592,
      curveType: '1',
      deployedFile: 'astarMainnet.json',
      bip44: 0x8000032a,
      ownerSk: 'f1fc0288344abd7c014f3bebc08638eba44e9b267b8aa2250d05f64ce3ba3700',
      chainKind: 'eth',

      symbol: 'ASTR',
      decimals: 18,
      chainName: 'Shibaya',

      maxNoBlockTime: 1800000,
      rpcS: [],

      multiCall: '0xb023f2D496A04c5Af9cd1214924B0Fb19397e3fA'.toLowerCase(),

      explorer: 'https://www.subscan.io/',
      faucet: '',
    }
  }
}