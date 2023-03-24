"use strict"

const SchnorrMPC = require("./schnorrMpc.js");
const MPC = require("./mpc.js");

function sleep(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, time);
  })
}

async function syncMpcRequest(logger) {
  // while (1) {
    try {
      let mpc = new SchnorrMPC();

      let mpcApproveDatas = [];
      mpcApproveDatas = await mpc.getDataForApprove();
      if (mpcApproveDatas == null) {
        mpcApproveDatas = [];
      }
      logger.info("********************************** syncMpcRequest start **********************************");

      let multiDataApproves = [...mpcApproveDatas].map((approveData) => {
        return new Promise(async (resolve, reject) => {
          try {
            if (!global.tokenList.gpks.includes(approveData.pk) || !approveData.Extern) {
              // only manager the approve request when the storemanPK is included
              resolve();
              return;
            }
                // approveData extern should be "cross:approveAction:srcChain:destChain:srcSmg:destSmg/timestamp:hashX"
            let extern = approveData.Extern.split(':');
            if (extern.length === 7 && extern[0] === 'cross') {
              let transOnChain = extern[2];
              let crossAgent = new global.agentDict[transOnChain]();

                let option = {
                  hashX : extern[6]
                };
                let result = await global.modelOps.getEventHistory(option);
                if (result.length === 0) {
                  let content = await crossAgent.decodeSignatureData(approveData);
                  if (content !== null) {
                    logger.info("********************************** syncMpcRequest get one valid data **********************************", JSON.stringify(approveData, null, 4), " for hashX :", content[0]);
                    let recoverable = await crossAgent.recoverableApproveTx(content);
                    if (recoverable) {
                      logger.info("********************************** syncMpcRequest will recover tx ********************************** for hashX :", content[0]);
                      content[1].status = 'init';
                    }
                    await global.modelOps.syncSave(...content);
                  }
                }
            }
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });

      try {
        if (mpcApproveDatas !== null && mpcApproveDatas.length !== 0) {
          await Promise.all(multiDataApproves);
        }
        logger.info("********************************** syncMpcRequest done **********************************");
      } catch (err) {
        logger.error("syncMpcRequest failed", err);
        return await Promise.reject(err);
      }
    } catch (err) {
      logger.error("syncMpcRequest failed:", err);
    }

  //   await sleep(moduleConfig.MPCREQUEST_TIME);
  // }
}

async function syncBTCMpcRequest(logger) {
    try {
      let mpc = new MPC();

      let mpcApproveTxs = [];
      mpcApproveTxs = await mpc.getMpcBtcTransForApprove();
      if (mpcApproveTxs == null) {
        mpcApproveTxs = [];
      }
      logger.info("********************************** syncBTCMpcRequest start **********************************");

      // let multiDataApproves = [...mpcApproveTxs].map((mpcTx) => {
      //   return new Promise(async (resolve, reject) => {
      //     try {
      //       if (!global.tokenList.gpks.includes(mpcTx.From)) {
      //         // only manager the approve request when the storemanPK is included
      //         resolve();
      //         return;
      //       }
      //       let crossAgent = new global.agentDict['BTC']();
      //       let content = await crossAgent.decodeSignatureData(mpcTx);
      //       if (content !== null) {
      //         logger.info("********************************** syncBTCMpcRequest get one valid data **********************************", JSON.stringify(mpcTx, null, 4), " for hashX :", content[0]);
      //         await global.modelOps.syncSave(...content);
      //       }
      //       resolve();
      //     } catch (err) {
      //       reject(err);
      //     }
      //   });
      // });

      try {
        if (mpcApproveTxs !== null && mpcApproveTxs.length !== 0) {
          // await Promise.all(multiDataApproves);
          let chainType;
          for (let mpcTx of mpcApproveTxs) {
            try {
              if (!global.tokenList.gpks.includes(mpcTx.From)) {
                // only manager the approve request when the storemanPK is included
                continue;
              }

              let extern = mpcTx.Extern.split(':');
              if (extern.length !== 7) {
                chainType = 'BTC'
              } else {
                let hashX = extern[6];
                chainType = extern[2];
              }

              let crossAgent = new global.agentDict[chainType.toUpperCase()]();
              let content = await crossAgent.decodeSignatureData(mpcTx);
              if (content !== null) {
                logger.info("********************************** syncBTCMpcRequest get one valid data **********************************", JSON.stringify(mpcTx, null, 4), " for hashX :", content[0], " on chainType :", chainType);
                let recoverable = await crossAgent.recoverableApproveTx(content);
                if (recoverable) {
                  logger.info("********************************** syncMpcRequest will recover tx ********************************** for hashX :", content[0]);
                  content[1].status = 'init';
                }
                await global.modelOps.syncSave(...content);
              }
            } catch (err) {
              logger.error("********************************** syncBTCMpcRequest failed **********************************", JSON.stringify(mpcTx, null, 4), " on chainType :", chainType, err);
            }
          }
        }
        logger.info("********************************** syncBTCMpcRequest done **********************************");
      } catch (err) {
        logger.error("syncBTCMpcRequest failed", err);
        return await Promise.reject(err);
      }
    } catch (err) {
      logger.error("syncBTCMpcRequest failed:", err);
    }
}


async function syncDotMpcRequest(logger) {
  try {
    logger.info("********************************** syncDotMpcRequest start **********************************");

    let mpc = new MPC();

    let mpcApproveTxs = [];
    mpcApproveTxs = await mpc.getMpcDotTransForApprove();
    if (mpcApproveTxs == null) {
      return
    }

    try {
      if (mpcApproveTxs !== null && mpcApproveTxs.length !== 0) {

        logger.info("********************************** syncDotMpcRequest global.tokenList.gpks: **********************************", JSON.stringify(global.tokenList.gpks));
        logger.info("********************************** syncDotMpcRequest mpcTx numbers:  **********************************", mpcApproveTxs.length);

        for (let mpcTx of mpcApproveTxs) {
          logger.info("********************************** syncDotMpcRequest mpcTx: **********************************", mpcTx);

          if(!mpcTx.TxData || mpcTx.TxData === '') {
            continue;
          }
          const txData = JSON.parse(mpcTx.TxData);
          if(!txData.hashX) {
            continue;
          }

          let crossAgent = new global.agentDict['DOT']();
          // WYH: 这里的 mpcTx 应该就是 是 formatMpcTx（）中返回的那个了！
          let content = await crossAgent.decodeSignatureData(mpcTx);
          if (content !== null) {
            logger.info("********************************** syncDotMpcRequest get one valid data **********************************", JSON.stringify(mpcTx, null, 4), " for hashX :", content[0]);
            let recoverable = await crossAgent.recoverableApproveTx(content);
            if (recoverable) {
              logger.info("********************************** syncMpcRequest will recover tx ********************************** for hashX :", content[0]);
              content[1].status = 'init';
            }
            await global.modelOps.syncSave(...content);
          }else{
            logger.info("********************************** syncDotMpcRequest get NULL data **********************************");
          }
        }
      }
      logger.info("********************************** syncDotMpcRequest done **********************************");
    } catch (err) {
      logger.error("syncDotMpcRequest failed", err);
      return await Promise.reject(err);
    }
  } catch (err) {
    logger.error("syncDotMpcRequest failed:", err);
  }
}


async function syncUniMpcRequest(logger) {
  try {
    logger.info("********************************** syncUniMpcRequest start **********************************");

    let mpc = new MPC();

    let mpcApproveTxs = [];
    mpcApproveTxs = await mpc.getMpcUniTransForApprove();
    if (mpcApproveTxs == null) {
      return
    }

    try {
      if (mpcApproveTxs !== null && mpcApproveTxs.length !== 0) {

        logger.info("********************************** syncUniMpcRequest global.tokenList.gpks: **********************************", JSON.stringify(global.tokenList.gpks));
        logger.info("********************************** syncUniMpcRequest mpcTx numbers:  **********************************", mpcApproveTxs.length);

        for (let mpcTx of mpcApproveTxs) {
          logger.info("********************************** syncUniMpcRequest mpcTx: **********************************", mpcTx);

          if(!mpcTx.rawData || mpcTx.rawData.length === 0 || !mpcTx.hashData || mpcTx.hashData.length === 0 || mpcTx.hashData.length!=mpcTx.rawData.length) {
            continue;
          }
          const extern = JSON.parse(mpcTx.Extern);
          // if(!extern.hashX || extern.hashX.length == 0) {
          //   console.log("x================================================== no hashX")
          //   continue;
          // }
            let crossAgent = new global.agentDict[extern.chainType]();

          let content = await crossAgent.decodeSignatureData(mpcTx);
          if (content !== null) {
            logger.info("********************************** syncUniMpcRequest get one valid data **********************************", JSON.stringify(mpcTx, null, 4), " for hashX :", content[0]);
            let recoverable = await crossAgent.recoverableApproveTx(content);
            if (recoverable) {
              logger.info("********************************** syncUniMpcRequest will recover tx ********************************** for hashX :", content[0]);
              content[1].status = 'init';
            }
            await global.modelOps.syncSave(...content);
          }else{
            logger.info("********************************** syncUniMpcRequest get NULL data **********************************");
          }
        }
      }
      logger.info("********************************** syncUniMpcRequest done **********************************");
    } catch (err) {
      logger.error("syncUniMpcRequest failed", err);
      return await Promise.reject(err);
    }
  } catch (err) {
    logger.error("syncUniMpcRequest failed:", err);
  }
}

exports.syncMpcRequest = syncMpcRequest;
exports.syncBTCMpcRequest = syncBTCMpcRequest;
exports.syncDotMpcRequest = syncDotMpcRequest;
exports.syncUniMpcRequest = syncUniMpcRequest;
