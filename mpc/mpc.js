"use strict"

const Web3 = require("web3");
const web3Mpc = require("../mpc/web3Mpc.js");
var net = require('net');
// const {getIncntSlshWriter} = require('../osm/src/metric/incntSlshWriter');

const TimeoutPromise = require('./timeoutPromise.js');
const mpcPromiseTimeout = 10 * 60 * 1000;


module.exports = class mpc {
  constructor(url) {
    this.mpcWeb3 = this.getClient(url ? url : global.mpcUrl);
    this.logger = global.monitorLogger;
    web3Mpc.extend(this.mpcWeb3);
  }

  getClient(nodeUrl) {
    let client;
    if (nodeUrl.indexOf("http://") !== -1) {
      client = new Web3()
      client.setProvider(new Web3.providers.HttpProvider(nodeUrl));
    } else {
      if (global.ipcClient && global.ipcClient.isConnected()) {
        console.log("use existed client");
        client = global.ipcClient;
      } else {
        console.log("create new client");
        client = new Web3()
        client.setProvider(new Web3.providers.IpcProvider(nodeUrl, net));
        global.ipcClient = client;
      }
    }
    return client;
  }

  setTx(trans, chainType, chainId) {
    this.sendTxArgs = {
      From: trans.from,
      To: trans.to,
      Gas: trans.gasLimit.toString(16),
      GasPrice: trans.gasPrice.toString(16),
      Nonce: '0x' + trans.nonce.toString(16),
      Value: '0x' + trans.value.toString(16),
      Data: trans.data,
      ChainType: chainType,
      ChainID: '0x' + chainId.toString(16)
    };

    this.logger.debug(this.sendTxArgs);
  }

  setHashX(hashX) {
    this.hashX = hashX;
  }

  signViaMpc() {
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.signMpcTransaction(this.sendTxArgs, (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc signViaMpc successfully **********************************", "hashX:", this.hashX, result);
            resolve(result);

          } else {
            this.logger.error("********************************** mpc signViaMpc failed **********************************", "hashX:", this.hashX, err);
            reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc signViaMpc failed **********************************", "hashX:", this.hashX, err);
        reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "signViaMpc mpcTimeout");
  }

  addValidMpcTx() {
    return new TimeoutPromise((resolve, reject) => {
      try {
        // this.logger.debug(this.mpcWeb3.storeman);
        this.mpcWeb3.storeman.addValidMpcTx(this.sendTxArgs, (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc addValidMpcTx successfully **********************************", "hashX:", this.hashX, result);
            resolve(result);
          } else {
            this.logger.error("********************************** mpc addValidMpcTx failed **********************************", "hashX:", this.hashX, err);
            reject((err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc addValidMpcTx failed **********************************", "hashX:", this.hashX, err);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "addValidMpcTx mpcTimeout");
  }

  signMpcBtcTransaction(mpcTx) {
    this.logger.info("signMpcBtcTransaction hashX:", this.hashX, " mpcTx:", JSON.stringify(mpcTx, null, 4));
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.signMpcBtcTransaction(mpcTx, (err, result) => {
          if (!err) {
            // send result to metric agent.
            // getIncntSlshWriter().handleInctSlsh(this.hashX, result);
            // change the result call code.
            if (result && result.ResultType == 0) {
              this.logger.debug("********************************** mpc signMpcBtcTransaction successfully **********************************", "hashX:", this.hashX, result);
              // signaure result is array
              let oldVerResult = result.SignedBtc;
              //resolve(result);
              resolve(oldVerResult);
            } else {
              this.logger.error("********************************** mpc signMpcBtcTransaction failed **********************************", "malice occurs ", "hashX:", this.hashX, "tx:", mpcTx);
              reject("signMpc failed: malice occurs.");
            }
          } else {
            this.logger.error("********************************** mpc signMpcBtcTransaction failed **********************************", "hashX:", this.hashX, err);
            reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.info("********************************** mpc signMpcBtcTransaction failed **********************************", "hashX:", this.hashX, err);
        reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "signMpcBtcTransaction mpcTimeout");
  }

  addValidMpcBtcTx(mpcTx) {
    this.logger.info("addValidMpcBtcTx hashX:", this.hashX, " mpcTx:", JSON.stringify(mpcTx, null, 4));
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.addValidMpcBtcTx(mpcTx, (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc addValidMpcBtcTx successfully **********************************", "hashX:", this.hashX, result);
            resolve(result);
          } else {
            this.logger.error("********************************** mpc addValidMpcBtcTx failed **********************************", "hashX:", this.hashX, err);
            reject((err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc addValidMpcBtcTx failed **********************************", "hashX:", this.hashX, err);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "addValidMpcBtcTx mpcTimeout");
  }

  signMpcBtcTranByApprove(mpcTx) {
    this.logger.info("signMpcBtcTranByApprove hashX:", this.hashX, " mpcTx:", JSON.stringify(mpcTx, null, 4));
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.signMpcBtcTranByApprove(mpcTx, (err, result) => {
          if (!err) {
            // send result to metric agent.
            // getIncntSlshWriter().handleInctSlsh(this.hashX, result);
            // change the result call code.
            // if (result && result.ResultType == 0) {
              this.logger.debug("********************************** mpc signMpcBtcTranByApprove successfully **********************************", "hashX:", this.hashX, result);
              let oldVerResult = result.SignedBtc;
              resolve(oldVerResult);
            // } else {
            //   this.logger.error("********************************** mpc signMpcBtcTranByApprove failed **********************************", "malice occurs ", "hashX:", this.hashX);
            //   reject("signMpc failed: malice occurs.");
            // }
          } else {
            this.logger.error("********************************** mpc signMpcBtcTranByApprove failed **********************************", "hashX:", this.hashX, err);
            reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc signMpcBtcTranByApprove failed **********************************", "hashX:", this.hashX, err);
        reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "signMpcBtcTranByApprove mpcTimeout");
  }

  getMpcBtcTransForApprove(time = 0) {
    this.logger.info("getMpcBtcTransForApprove with time %s:", time);
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.getMpcBtcTransForApprove(time, (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc getMpcBtcTransForApprove successfully **********************************");
            resolve(result);
          } else {
            this.logger.error("********************************** mpc getMpcBtcTransForApprove failed **********************************", err);
            reject((err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc getMpcBtcTransForApprove failed **********************************", err);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "getMpcBtcTransForApprove mpcTimeout");
  }

  approveMpcBtcTran(mpcTx) {
    this.logger.info("approveMpcBtcTran hashX:", this.hashX, " mpcTx:", JSON.stringify(mpcTx, null, 4));
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.approveMpcBtcTran([mpcTx], (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc approveMpcBtcTran successfully **********************************", "hashX:", this.hashX, result);
            resolve(result);
          } else {
            if (err.hasOwnProperty("message") && (err.message === "has in approved db")) {
              this.logger.warn("********************************** mpc approveMpcBtcTran failed ********************************** hashX", this.hashX, err);
              resolve();
            } else {
              this.logger.error("********************************** mpc approveMpcBtcTran failed **********************************", "hashX:", this.hashX, err);
              reject((err.hasOwnProperty("message") ? err.message : err));
            }
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc approveMpcBtcTran failed **********************************", "hashX:", this.hashX, err);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "approveMpcBtcTran mpcTimeout");
  }

  signMpcXrpTransaction(mpcTx) {
    this.logger.info("signMpcXrpTransaction hashX:", this.hashX, " mpcTx:", JSON.stringify(mpcTx, null, 4));
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.signMpcXrpTransaction(mpcTx, (err, result) => {
          if (!err) {
            // send result to metric agent.
            // getIncntSlshWriter().handleInctSlsh(this.hashX, result);
            // change the result call code.
            // if (result && result.ResultType == 0) {
              this.logger.debug("********************************** mpc signMpcXrpTransaction successfully **********************************", "hashX:", this.hashX, result);
              resolve(result);
            // } else {
            //   this.logger.error("********************************** mpc signMpcXrpTransaction failed **********************************", "malice occurs ", "hashX:", this.hashX, "tx:", mpcTx);
            //   reject("malice occurs.");
            // }
          } else {
            this.logger.error("********************************** mpc signMpcXrpTransaction failed **********************************", "hashX:", this.hashX, err);
            reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.info("********************************** mpc signMpcXrpTransaction failed **********************************", "hashX:", this.hashX, err);
        reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "signMpcXrpTransaction mpcTimeout");
  }

  addValidMpcXrpTx(mpcTx) {
    this.logger.info("addValidMpcXrpTx hashX:", this.hashX, " mpcTx:", JSON.stringify(mpcTx, null, 4));
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.addValidMpcXrpTx(mpcTx, (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc addValidMpcXrpTx successfully **********************************", "hashX:", this.hashX, result);
            resolve(result);
          } else {
            this.logger.error("********************************** mpc addValidMpcXrpTx failed **********************************", "hashX:", this.hashX, err);
            reject((err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc addValidMpcXrpTx failed **********************************", "hashX:", this.hashX, err);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "addValidMpcXrpTx mpcTimeout");
  }


  signMpcDotTranByApprove(mpcTx) {
    this.logger.info("signMpcDotTranByApprove hashX:", this.hashX, " mpcTx:", JSON.stringify(mpcTx, null, 4));
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.signMpcDotTranByApprove(mpcTx, (err, result) => {
          if (!err) {
            // send result to metric agent.
            // getIncntSlshWriter().handleInctSlsh(this.hashX, result);
            // change the result call code.
            // if (result && result.ResultType == 0) {
              this.logger.debug("********************************** mpc signMpcDotTranByApprove successfully **********************************", "hashX:", this.hashX, result);
              resolve(result.SignedData);
            // } else {
            //   this.logger.error("********************************** mpc signMpcDotTranByApprove failed **********************************", "malice occurs ", "hashX:", this.hashX);
            //   reject("signMpc failed: malice occurs.");
            // }
          } else {
            this.logger.error("********************************** mpc signMpcDotTranByApprove failed **********************************", "hashX:", this.hashX, err);
            reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc signMpcDotTranByApprove failed **********************************", "hashX:", this.hashX, err);
        reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "mpc signMpcDotTranByApprove mpcTimeout");
  }

  getMpcDotTransForApprove(time = 0) {
    this.logger.info("getMpcDotTransForApprove with time %s:", time);
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.getMpcDotTransForApprove(time, (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc getMpcDotTransForApprove successfully **********************************");
            resolve(result);
          } else {
            this.logger.error("********************************** mpc getMpcDotTransForApprove failed **********************************", err);
            reject((err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc getMpcDotTransForApprove failed **********************************", err);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "mpc getMpcDotTransForApprove mpcTimeout");
  }

  approveMpcDotTran(mpcTx) {
    this.logger.info("approveMpcDotTran hashX:", this.hashX, " mpcTx:", JSON.stringify(mpcTx, null, 4));
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.approveMpcDotTran([mpcTx], (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc approveMpcDotTran successfully **********************************", "hashX:", this.hashX, result);
            resolve(result);
          } else {
            if (err.hasOwnProperty("message") && (err.message === "has in approved db")) {
              this.logger.warn("********************************** mpc approveMpcDotTran failed ********************************** hashX", this.hashX, err);
              resolve();
            } else {
              this.logger.error("********************************** mpc approveMpcDotTran failed **********************************", "hashX:", this.hashX, err);
              reject((err.hasOwnProperty("message") ? err.message : err));
            }
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc approveMpcDotTran failed **********************************", "hashX:", this.hashX, err);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "mpc approveMpcDotTran mpcTimeout");
  }
  
  signMpcUniTransaction(mpcTx) {
    this.logger.info("signMpcUniTransaction mpcTx:", JSON.stringify(mpcTx, null, 4), "hashX:", this.hashX);
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.signByApprove(mpcTx, (err, result) => {
          if (!err) {
            // send result to metric agent.
            // getIncntSlshWriter().handleInctSlsh(this.hashX, result);
            // change the result call code.
            // if (result && result.ResultType == 0) {
              this.logger.debug("********************************** mpc signMpcUniTransaction successfully **********************************", result, "hashX:", this.hashX);
              resolve(result);
            // } else {
            //   this.logger.error("********************************** mpc signMpcUniTransaction failed1 **********************************", "malice occurs ", "hashX:", this.hashX, "tx:", mpcTx);
            //   reject("malice occurs.");
            // }
          } else {
            this.logger.error("********************************** mpc signMpcUniTransaction failed 2**********************************", err, "hashX:", this.hashX);
            reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.info("********************************** mpc signMpcUniTransaction failed **********************************", err, "hashX:", this.hashX);
        reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "signMpcUniTransaction mpcTimeout");
  }

  getMpcUniTransForApprove(time = 1000) {
    this.logger.info("getMpcUniTransForApprove with time %s:", time);
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.getForApprove(time, (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc getMpcUniTransForApprove successfully **********************************");
            resolve(result);
          } else {
            this.logger.error("********************************** mpc getMpcUniTransForApprove failed **********************************", err);
            reject((err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc getMpcUniTransForApprove failed **********************************", err);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "mpc getMpcUniTransForApprove mpcTimeout");
  }

  approveMpcUniTran(mpcTx) {
    this.logger.info("394,3:   approveMpcUniTran(mpcTx) { mpcTx:", JSON.stringify(mpcTx, null, 4), "hashX:", this.hashX);
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.approve([mpcTx], (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc 394,3:   approveMpcUniTran(mpcTx) { successfully **********************************", result, "hashX:", this.hashX, mpcTx);
            resolve(result);
          } else {
            if (err.hasOwnProperty("message") && (err.message === "has in approved db")) {
              this.logger.warn("********************************** mpc 394,3:   approveMpcUniTran(mpcTx) { failed ********************************** hashX", this.hashKey, err);
              resolve();
            } else {
              this.logger.error("********************************** mpc 394,3:   approveMpcUniTran(mpcTx) { failed **********************************", err, "hashX:", this.hashX);
              reject((err.hasOwnProperty("message") ? err.message : err));
            }
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc 394,3:   approveMpcUniTran(mpcTx) { failed **********************************", err, "hashX:", this.hashX);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "mpc 394,3:   approveMpcUniTran(mpcTx) { mpcTimeout");
  }
}
