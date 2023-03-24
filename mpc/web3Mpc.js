"use strict"

module.exports = {
	extend: (web3) => {
        function insertMethod(name, call, params, inputFormatter, outputFormatter) {
            return new web3._extend.Method({ name, call, params, inputFormatter, outputFormatter });
        }

        function insertProperty(name, getter, outputFormatter) {
            return new web3._extend.Property({ name, getter, outputFormatter });
        }

        web3._extend({
        	property: 'storeman',
        	methods:
        	[
        		insertMethod('addValidMpcTx', 'storeman_addValidMpcTx', 1, [null], null),
        		insertMethod('signMpcTransaction', 'storeman_signMpcTransaction', 1, [null], null),
        		insertMethod('addValidData', 'storeman_addValidData', 1, [null], null),
        		insertMethod('signData', 'storeman_signData', 1, [null], null),
        		insertMethod('signDataByApprove', 'storeman_signDataByApprove', 1, [null], null),
        		insertMethod('getDataForApprove', 'storeman_getDataForApprove', 1, [null], null),
        		insertMethod('approveData', 'storeman_approveData', 1, [null], null),
        		insertMethod('freshGrpInfo', 'storeman_freshGrpInfo', 0, null, null),
        		insertMethod('addValidMpcBtcTx', 'storeman_addValidMpcBtcTx', 1, [null], null),
        		insertMethod('signMpcBtcTransaction', 'storeman_signMpcBtcTransaction', 1, [null], null),
        		insertMethod('signMpcBtcTranByApprove', 'storeman_signMpcBtcTranByApprove', 1, [null], null),
        		insertMethod('getMpcBtcTransForApprove', 'storeman_getMpcBtcTransForApprove', 1, [null], null),
        		insertMethod('approveMpcBtcTran', 'storeman_approveMpcBtcTran', 1, [null], null),
        		insertMethod('addValidMpcXrpTx', 'storeman_addValidMpcXrpTx', 1, [null], null),
        		insertMethod('signMpcXrpTransaction', 'storeman_signMpcXrpTransaction', 1, [null], null),
        		insertMethod('signMpcDotTranByApprove', 'storeman_signMpcDotTranByApprove', 1, [null], null),
        		insertMethod('getMpcDotTransForApprove', 'storeman_getMpcDotTransForApprove', 1, [null], null),
        		insertMethod('approveMpcDotTran', 'storeman_approveMpcDotTran', 1, [null], null),
        		insertMethod('signByApprove', 'storeman_signByApprove', 1, [null], null),
        		insertMethod('getForApprove', 'storeman_getForApprove', 1, [null], null),
        		insertMethod('approve', 'storeman_approve', 1, [null], null),
        		insertMethod('addValid', 'storeman_addValid', 1, [null], null),
        	],
        	properties:[],
        });
	}
};
