"use strict"

const Web3 = require("web3");
const web3Mpc = require("./web3Mpc.js");
var net = require('net');
// const {getIncntSlshWriter} = require('../osm/src/metric/incntSlshWriter');

const TimeoutPromise = require('./timeoutPromise.js');
const mpcPromiseTimeout = 10 * 60 * 1000;

// const {
//   loadConfig
// } = require('../comm/lib');

module.exports = class mpc {
  constructor() {
    this.mpcWeb3 = this.getClient(global.mpcUrl);
    this.logger = global.monitorLogger;
    web3Mpc.extend(this.mpcWeb3);
  }

  getClient(nodeUrl) {
    let client;
    if (nodeUrl.indexOf("http://") !== -1) {
      client = new Web3()
      client.setProvider(new Web3.providers.HttpProvider(nodeUrl));
    } else {
      if (global.ipcSchnorrClient && global.ipcSchnorrClient.isConnected()) {
        console.log("use existed client");
        client = global.ipcSchnorrClient;
      } else {
        console.log("create new client");
        client = new Web3()
        client.setProvider(new Web3.providers.IpcProvider(nodeUrl, net));
        global.ipcSchnorrClient = client;
      }
    }
    return client;
  }

  setHashX(hashX) {
    this.hashX = hashX;
  }

  setSignData(pk, data, curve, extern) {
    this.pk = pk;
    this.signData = {
      pk: pk,
      data: data,
      Curve: curve
    }
    if (extern) {
      this.signData.extern = extern;
    }
    this.logger.debug("********************************** mpc setSignData **********************************", this.signData, "hashX:", this.hashX);
  }

  signViaMpc() {
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.signData(this.signData, (err, result) => {
          if (!err) {
              // send result to metric agent.
              // getIncntSlshWriter().handleInctSlsh(this.hashX,result);
              // change the result call code.
              if(result && result.ResultType == 0){
                this.logger.debug("********************************** mpc signData successfully **********************************", "hashX:", this.hashX, result);
                let oldVerResult = {R:result.R, S:result.S};
                //resolve(result);
                resolve(oldVerResult);
              }else{
                this.logger.error("********************************** mpc signData failed **********************************", "malice occurs ", "hashX:", this.hashX);
                reject("signMpc failed: malice occurs.");
              }
          } else {
            this.logger.error("********************************** mpc signData failed **********************************", "hashX:", this.hashX, err);
            reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc signData failed **********************************", "hashX:", this.hashX, err);
        reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "signViaMpc mpcTimeout");
  }

  addValidDataViaMpc() {
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.addValidData(this.signData, (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc addValidData successfully **********************************", "hashX:", this.hashX, result);
            resolve(result);
          } else {
            this.logger.error("********************************** mpc addValidData failed **********************************", "hashX:", this.hashX, err);
            reject((err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc addValidData failed **********************************", "hashX:", this.hashX, err);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "addValidDataViaMpc mpcTimeout");
  }

  signDataByApprove() {
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.signDataByApprove(this.signData, (err, result) => {
          if (!err) {
            // send result to metric agent.
            // getIncntSlshWriter().handleInctSlsh(this.hashX, result);
            // change the result call code.
            if (result && result.ResultType == 0) {
              this.logger.debug("********************************** mpc signDataByApprove successfully **********************************", "hashX:", this.hashX, result);
              let oldVerResult = { R: result.R, S: result.S };
              resolve(oldVerResult);
            } else {
              this.logger.error("********************************** mpc signDataByApprove failed **********************************", "malice occurs ", "hashX:", this.hashX);
              reject("signMpc failed: malice occurs.");
            }
          } else {
            this.logger.error("********************************** mpc signDataByApprove failed **********************************", "hashX:", this.hashX, err);
            reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc signDataByApprove failed **********************************", "hashX:", this.hashX, err);
        reject("signMpc failed: " + (err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "signDataByApprove mpcTimeout");
  }

  getDataForApprove() {
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.getDataForApprove((err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc getDataForApprove successfully **********************************");
            resolve(result);
          } else {
            this.logger.error("********************************** mpc getDataForApprove failed **********************************", err);
            reject((err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc getDataForApprove failed **********************************", err);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "getDataForApprove mpcTimeout");
  }

  approveData() {
    return new TimeoutPromise((resolve, reject) => {
      try {
        this.mpcWeb3.storeman.approveData([this.signData], (err, result) => {
          if (!err) {
            this.logger.debug("********************************** mpc approveData successfully **********************************", "hashX:", this.hashX, result);
            resolve(result);
          } else {
            this.logger.error("********************************** mpc approveData failed **********************************", "hashX:", this.hashX, err);
            reject((err.hasOwnProperty("message") ? err.message : err));
          }
        })
      } catch (err) {
        this.logger.error("********************************** mpc approveData failed **********************************", "hashX:", this.hashX, err);
        reject((err.hasOwnProperty("message") ? err.message : err));
      }
    }, mpcPromiseTimeout, "approveData mpcTimeout");
  }
}
