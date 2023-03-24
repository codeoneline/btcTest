const spends = {
  'alice': [
    {
      // p2wpkh tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: 'd13405c724f5882f00566145e4547304cc5ed8d3e268a0ab869ccb1b3fa54b7c',
      vout: 0,
      value: 1284912,
    },
    {
      // p2wpkh  tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: '6e840d221536359155c42881ae7a4fc955d0722f5bacaf99f7ccfec8fd4bcbfb',
      vout: 1,
      value: 279866,
    },
    {
      // p2wpkh tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: '7638a9260fb3017c2f665a74b89adcea100250d9625d2771305b0b92cfa3ea6c',
      vout: 0,
      value: 1000,
    },
    {
      // p2pkh mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh
      txId: 'd13405c724f5882f00566145e4547304cc5ed8d3e268a0ab869ccb1b3fa54b7c',
      vout: 1,
      value: 100001,
    },
    {
      // p2wpkh tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: 'c93a92ec3fef6e7c0c9d1b896405616dd82065b3b02c542a3fa38b2e16cadb83',
      vout: 0,
      value: 1385087,
    },
    {
      // p2shtr  tb1p76h0uyjxvca9g4qmnvs6zv29lucjfnpqr0crg2uvwtjnfsklleqsf0rjcc
      txId: '8b7cc0ccb8e859fe45d9e41713eb9eca79ceebb368cfc148eb1e5178256b7589',
      vout: 0,
      value: 5000,
    },
    {
      // p2pktr  tb1pd07zgv8jchdr0h76032yux02znsscawt0yakwnw7yykewt3c6ynsekjyqe
      txId: '069d17a95ecfbae737ccfff6d16fe211efa9f2ccab1c7ab7af558a7a27bf85fe',
      vout: 1,
      value: 9837,
    },
    {
      // p2pktr  tb1pd07zgv8jchdr0h76032yux02znsscawt0yakwnw7yykewt3c6ynsekjyqe
      txId: '6e840d221536359155c42881ae7a4fc955d0722f5bacaf99f7ccfec8fd4bcbfb',
      vout: 0,
      value: 10000,
    },
    {
      // p2wpkh  tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: 'f4aa7b486a981502ada1a330308dce5ce4e7e94cfb3c89d53b6fa639eab2a032',
      vout: 1,
      value: 290019,
    },
    {
      // p2tr  tb1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6psmc2sgg
      // p2wpkh
      // tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: 'bf9e65ea553dea7b39212eb35b78efb8abd3218933fad732a6f6a87a10a43e0a',
      vout: 0,
      value: 291172,
    },
    {
      // p2tr  tb1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6psmc2sgg
      // p2wpkh
      // tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: 'e17c472c8107fb8156a4815e1f561b95e48ae5f766e04fa187ccd2359fc502e4',
      vout: 0,
      value: 292325,
    },
    {
      // tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: '0a3d10daae75864822f0d99d6a26742a4e1982f961a54c6ad7aa9e52db7eeb38',
      vout: 0,
      value: 403778,
    },
    {
      // tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: '24eea9b5009ecc5f0c65afcf9af3994aae98cdcbecec7366f66f6075288ce226',
      vout: 0,
      value: 514078,
    },
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
}

const unSpends = {
  'gpk': [
    {
      // pub: 0xfd89faab31299366fb6ade51dccb84624ef76b4018b1e1c93aac195d985406f9f0ac37c69ccedfd942da33873df0b646346cfde8aa7f378d83755f8785d6c0d8
      // p2tr address : tb1pjgu5q0xp804ju7x97qpw7gdms3ufzrdv6fnnnjtn8f2fwp6ecfcq9udfju
      txId: '1b7657e4f160da4d2814b0dd080dbb267f64c1e0fb2c973904f5056e7a58cf91',
      vout: 1,
      value: 300000,
    },
  ],
// private key: 91nkjxTthS7RUsTRvqZSwZDXTf48rnKPJ2Yg1rpuaErDSKQffe9
// p2pkh = n1HSEBFgJvBCndkigyAvwaVQdguoe1y9Qz, length = 34 
// p2sh = 2N6Q1fEPuWSTUxcFjgrRiUAhNfUv7m77Vt6, length = 35
// 非法 p2wpkh = tb1qmr2qyaldp8pyzpsgy88m5htus6cwxq74kchaf3, length = 42
// 非法 p2wsh = tb1qp0ltycltxlywuzhxkr8g3ywvew5tka8tjhjyzx276x04hw6vnftqqa3g89, length = 62
// p2phtr = tb1pd07zgv8jchdr0h76032yux02znsscawt0yakwnw7yykewt3c6ynsekjyqe, length = 62
// p2shtr = tb1pwyuqpfzyzeft9cuznglndnj5az8td4uqssw9fmnug2jnjhkpl6psmc2sgg, length = 62
  'aliceUncompressed' : [
    {
      // p2pkh n1HSEBFgJvBCndkigyAvwaVQdguoe1y9Qz
    },
    {
      // p2sh 2N6Q1fEPuWSTUxcFjgrRiUAhNfUv7m77Vt6
    },
    {
      // p2phtr tb1pd07zgv8jchdr0h76032yux02znsscawt0yakwnw7yykewt3c6ynsekjyqe
    },
    {
      // p2shtr 
    },

  ],
  // private key: cNUx4bohBTqM41hf2dLDVoCHSexqgj29Q9poCnvT3i8DtMnJATaa,
  // compressed: true,
  // "p2pkh": "mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh",                                // 34
  // "p2sh": "2N1WMNXs5YLZGbyPUt6wGjx3zTgfZxG8HSD",                                // 35
  // "p2wpkh": "tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e",                       // 42
  // "p2wsh": "tb1qansjcula52f0ee0fhkk4n2lzpf876r336vdxyfv70vtfsn7hfacq7q5may",    // 62
  // "p2pktr": "tb1pd07zgv8jchdr0h76032yux02znsscawt0yakwnw7yykewt3c6ynsekjyqe",   // 62
  // "p2shtr": "tb1pjgruzaxk65v7nhw628gyskj87sg926zvktq92gmnqw6h2sdwr7ysglr8ac",   // 62
  'alice': [
    // 51b4853607607b740c1783e45835bb53ed6b0ece0d072bef09b77c3f13f3dafa
    {
      // p2sh 2N1WMNXs5YLZGbyPUt6wGjx3zTgfZxG8HSD
      txId: '3e57064007298b43506fcfe24ee41bfbfb6a2afd91f5a517da031c6550dff860',
      vout: 0,
      value: 20000,
    },
    {
      // p2sh  2N1WMNXs5YLZGbyPUt6wGjx3zTgfZxG8HSD
      txId: '51b4853607607b740c1783e45835bb53ed6b0ece0d072bef09b77c3f13f3dafa',
      vout: 0,
      value: 18866,
    },
    {
      // p2wpkh tb1qkk6xh7dfh7sqa66a0z02etdtfmgk6y0eq7k34e
      txId: '3e57064007298b43506fcfe24ee41bfbfb6a2afd91f5a517da031c6550dff860',
      vout: 1,
      value: 1264758,
    },
    {
      // ota --- compressed
      // p2sh 2N1WMNXs5YLZGbyPUt6wGjx3zTgfZxG8HSD
      txId: '37290723d48517ea5373689f64f94da8f917a6e9b8eda56f6760bbdf22b0726f',
      vout: 0,
      value: 846,
    },
    {
      // ota
      // p2sh 2N1WMNXs5YLZGbyPUt6wGjx3zTgfZxG8HSD
      
    },
    {
      // ota
      // p2wsh tb1qve5uknh5zz8spw8ymd9kxfflqh5wnchw3c5xn6qt72xjrxsfutls6r4wwx

    },
    {
      // p2pkh mx5ijhZuU9Eq49hnEryiGJUVBr9T7NBaTh
      txId: '7638a9260fb3017c2f665a74b89adcea100250d9625d2771305b0b92cfa3ea6c',
      vout: 1,
      value: 98771,
    },
    {
      // p2pktr  tb1pd07zgv8jchdr0h76032yux02znsscawt0yakwnw7yykewt3c6ynsekjyqe
      txId: 'cfeede40ae5366a3a81cfc3d362d630e51131113e8186864a17226f33025c322',
      vout: 1,
      value: 4329,
    },
    {
      // 用的是publicKey 33, 默认的签名有问题
      // p2shtr tb1pjgruzaxk65v7nhw628gyskj87sg926zvktq92gmnqw6h2sdwr7ysglr8ac
      txId: 'cfeede40ae5366a3a81cfc3d362d630e51131113e8186864a17226f33025c322',
      vout: 0,
      value: 200,
    },
    {
      // 用的是publicKey 33, 默认的签名有问题
      // p2shtr tb1pjgruzaxk65v7nhw628gyskj87sg926zvktq92gmnqw6h2sdwr7ysglr8ac
      txId: 'cfeede40ae5366a3a81cfc3d362d630e51131113e8186864a17226f33025c322',
      vout: 0,
      value: 200,
    },
    {
      // p2shtr  tb1p76h0uyjxvca9g4qmnvs6zv29lucjfnpqr0crg2uvwtjnfsklleqsf0rjcc
      txId: '7a1989fddc54fc2b5c2aaafce58ba0a4e7b6749a59e112517cccca5e9e4587ae',
      vout: 1,
      value: 4816,
    },
  ],
}

module.exports = {
  spends,
  unSpends
}