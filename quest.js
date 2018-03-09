"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var Hfc = require("fabric-client");
process.env.FABRIC_PEER = process.env.FABRIC_PEER || '52.59.237.127:7059';
process.env.FABRIC_ORDERER = process.env.FABRIC_ORDERER || '52.59.237.127:7060';
process.env.FABRIC_EVENTHUB = process.env.FABRIC_EVENTHUB || '52.59.237.127:7058';
var DEBUG_GRPC = false;
var CHANNEL_ID = 'myc';
var CHAINCODE_ID = 'kyc';
var TRANSACTION_SUBMIT_TMOUT = 20000; // ms
var ASYNC_FABRIC_BATCH_SIZE = 16;
function base64decode(encodedString) {
    try {
        // Node 5.10+
        return String(Buffer.from(encodedString, 'base64'));
    }
    catch (e) {
        // older Node versions
        return String(new Buffer(encodedString, 'base64'));
    }
}
var BCBuilder = /** @class */ (function () {
    function BCBuilder(protocol, peerHostPort, ordererHostPort, eventHubHostPort, userName) {
        this.hfcClient = new Hfc();
        this.hfcChannel = this.hfcClient.newChannel(CHANNEL_ID);
        this.hfcProto = protocol; // "grpc", "grpcs"
        this.hfcPeer = this.hfcClient.newPeer(this.hfcProto + "://" + peerHostPort);
        this.hfcOrderer = this.hfcClient.newOrderer(this.hfcProto + "://" + ordererHostPort);
        this.hfcChannel.addPeer(this.hfcPeer);
        this.hfcChannel.addOrderer(this.hfcOrderer);
        this.eventHubUrl = this.hfcProto + "grpc://" + eventHubHostPort;
        this.protocol = protocol;
        this.peerHostPort = peerHostPort;
        this.ordererHostPort = ordererHostPort;
        this.eventHubHostPort = eventHubHostPort;
        this.userName = userName;
    }
    BCBuilder.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var store, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Hfc.newDefaultKeyValueStore({
                            path: "/tmp/fabric-test/store.db"
                        })];
                    case 1:
                        store = _a.sent();
                        this.hfcClient.setStateStore(store);
                        return [4 /*yield*/, this.hfcClient.createUser({
                                username: this.userName,
                                mspid: "DEFAULT",
                                cryptoContent: {
                                    privateKey: "./msp/keystore/key.pem",
                                    signedCert: "./msp/signcerts/signcert.pem"
                                }
                            })];
                    case 2:
                        user = _a.sent();
                        return [2 /*return*/, this.hfcClient];
                }
            });
        });
    };
    BCBuilder.prototype.getChannels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self, respt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.hfcChannel.queryInfo(self.hfcPeer)];
                    case 1:
                        respt = _a.sent();
                        this.resp = respt;
                        return [2 /*return*/, this];
                }
            });
        });
    };
    BCBuilder.prototype.queryChannels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.hfcChannel.queryInfo(self.hfcPeer)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BCBuilder.prototype.invokeByChaincode = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var self, tx_id, FUNC, results, proposalResponses, proposal, header, all_good, error_text, i, one_good, this_error, request_1, transactionID_1, eh_1, txPromise, sendPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        tx_id = self.hfcClient.newTransactionID();
                        request = Object.assign(request, { txId: tx_id });
                        FUNC = "Invoke";
                        return [4 /*yield*/, self.hfcChannel.sendTransactionProposal(request)];
                    case 1:
                        results = _a.sent();
                        proposalResponses = results[0];
                        proposal = results[1];
                        header = results[2];
                        all_good = true;
                        error_text = null;
                        for (i in proposalResponses) {
                            one_good = false;
                            if (proposalResponses && proposalResponses[i].response &&
                                proposalResponses[i].response.status === 200) {
                                one_good = true;
                                if (DEBUG_GRPC)
                                    console.log(FUNC + 'transaction proposal was good');
                            }
                            else {
                                this_error = proposalResponses[i].response ?
                                    proposalResponses[i].response.message : proposalResponses[i];
                                console.error(FUNC + 'Proposal error:', this_error);
                                if (!error_text) {
                                    error_text = this_error;
                                }
                            }
                            all_good = all_good && one_good;
                        }
                        if (!all_good) return [3 /*break*/, 3];
                        if (DEBUG_GRPC)
                            console.log(FUNC +
                                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s"', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload);
                        request_1 = {
                            proposalResponses: proposalResponses,
                            proposal: proposal,
                            header: header
                        };
                        transactionID_1 = tx_id.getTransactionID();
                        eh_1 = self.hfcClient.newEventHub();
                        eh_1.setPeerAddr("grpc://" + process.env.FABRIC_EVENTHUB);
                        eh_1.connect();
                        txPromise = new Promise(function (resolve, reject) {
                            var handle = setTimeout(function () {
                                eh_1.disconnect();
                                return reject('Transaction submit timeout! peer = ' + eh_1.getPeerAddr() + ', txId = ' + transactionID_1);
                            }, TRANSACTION_SUBMIT_TMOUT);
                            eh_1.registerTxEvent(transactionID_1, function (tx, code) {
                                clearTimeout(handle);
                                eh_1.unregisterTxEvent(transactionID_1);
                                eh_1.disconnect();
                                if (code !== 'VALID') {
                                    return reject('The transaction ' + transactionID_1 + ' was invalid, code = ' + code);
                                }
                                else {
                                    if (DEBUG_GRPC)
                                        console.log(FUNC + 'The transaction %s has been committed on peer %s', transactionID_1, eh_1.getPeerAddr());
                                    return resolve(tx);
                                }
                            }, function (err) {
                                clearTimeout(handle);
                                eh_1.unregisterTxEvent(transactionID_1);
                                eh_1.disconnect();
                                return reject(err);
                            });
                        });
                        return [4 /*yield*/, self.hfcChannel.sendTransaction(request_1)];
                    case 2:
                        sendPromise = _a.sent();
                        console.log(sendPromise);
                        return [2 /*return*/, Promise.all([sendPromise, txPromise])
                                .then(function (results) {
                                return {
                                    response: results[0],
                                    tx: results[1],
                                    retValue: proposalResponses[0].response.payload
                                };
                            })];
                    case 3: return [2 /*return*/, Promise.reject(error_text)];
                }
            });
        });
    };
    BCBuilder.prototype.queryInvokeChain = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var self, command, chaincodeId, fcn, argss, request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        command = args[0];
                        chaincodeId = args[1];
                        fcn = args[2];
                        argss = args.slice(3);
                        request = {
                            chaincodeId: chaincodeId,
                            fcn: fcn,
                            args: argss
                        };
                        if (!(command === 'invoke')) return [3 /*break*/, 2];
                        return [4 /*yield*/, self.invokeByChaincode(request)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!(command === 'query')) return [3 /*break*/, 4];
                        return [4 /*yield*/, self.hfcChannel.queryByChaincode(request)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: 
                    // If there is command doesnt exist throw error to the user
                    throw new Error("There is no such command. Please check manual.");
                }
            });
        });
    };
    return BCBuilder;
}());
function initAll() {
    return __awaiter(this, void 0, void 0, function () {
        var bcBuilder, client, eh;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    bcBuilder = new BCBuilder('grpc', process.env.FABRIC_PEER, process.env.FABRIC_ORDERER, process.env.FABRIC_EVENTHUB, 'this_bank_name');
                    return [4 /*yield*/, bcBuilder.init()];
                case 1:
                    client = _a.sent();
                    eh = client.newEventHub();
                    eh.setPeerAddr("grpc://" + process.env.FABRIC_EVENTHUB);
                    return [2 /*return*/, bcBuilder];
            }
        });
    });
}
function validateFncParams(params) {
    if (params.length < 3)
        throw new Error("Not enough parameters. Please check manual.");
}
initAll().then(function (bcBuilder) { return __awaiter(_this, void 0, void 0, function () {
    var client, fncParams, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bcBuilder.init()];
            case 1:
                client = _a.sent();
                fncParams = process.argv.slice(2);
                validateFncParams(fncParams);
                return [4 /*yield*/, bcBuilder.queryInvokeChain(fncParams)];
            case 2:
                response = _a.sent();
                // If the response is an array and contains Buffers then use toString to show data
                if (Array.isArray(response) && Buffer.isBuffer(response[0])) {
                    console.log(response.toString());
                }
                else {
                    console.log(JSON.stringify(response));
                }
                return [2 /*return*/];
        }
    });
}); })["catch"](function (err) {
    // Do nothing on err
    if (err && err.message) {
        console.log(err.message);
    }
    else {
        console.log(err);
    }
});
