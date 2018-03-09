import Hfc = require('fabric-client');

process.env.FABRIC_PEER = process.env.FABRIC_PEER || '52.59.237.127:7059';
process.env.FABRIC_ORDERER = process.env.FABRIC_ORDERER || '52.59.237.127:7060';
process.env.FABRIC_EVENTHUB = process.env.FABRIC_EVENTHUB || '52.59.237.127:7058';
const DEBUG_GRPC = false;
const CHANNEL_ID = 'myc';
const CHAINCODE_ID = 'kyc';
const TRANSACTION_SUBMIT_TMOUT = 20000; // ms
const ASYNC_FABRIC_BATCH_SIZE = 16;

 function base64decode(encodedString:any) {
    try {
        // Node 5.10+
        return String(Buffer.from(encodedString, 'base64'));
    } catch (e) {
        // older Node versions
        return String(new Buffer(encodedString, 'base64'));
    }
}
class BCBuilder {
    public protocol;
    public peerHostPort;
    public ordererHostPort;
    public eventHubHostPort;
    public userName;
    public hfcClient;
    public hfcProto;
    public hfcChannel;
    public hfcPeer;
    public eventHubUrl;
    public hfcOrderer;
    public resp;

    constructor(protocol: any, peerHostPort: any, ordererHostPort: any, eventHubHostPort: any, userName: any) {
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

    async init() {
        const store = await Hfc.newDefaultKeyValueStore({
            path: "/tmp/fabric-test/store.db",
        });
        this.hfcClient.setStateStore(store);

        const user = await this.hfcClient.createUser({
            username: this.userName,
            mspid: "DEFAULT",
            cryptoContent: {
                privateKey: "./msp/keystore/key.pem",
                signedCert: "./msp/signcerts/signcert.pem",
            },
        });
        return  this.hfcClient;
    }
    async getChannels() {
        const self = this;
        const respt = await self.hfcChannel.queryInfo(self.hfcPeer);
        this.resp = respt;
        return this;
    }
    async queryChannels() {
        const self = this;
        return await self.hfcChannel.queryInfo(self.hfcPeer);
    }

  
    async invokeByChaincode(request) {
        const self = this;
        const tx_id =  self.hfcClient.newTransactionID();

     
        request = Object.assign(request, { txId: tx_id})
        const FUNC = "Invoke"
        const results = await self.hfcChannel.sendTransactionProposal(request);
        const proposalResponses = results[0];
        const proposal = results[1];
        const header = results[2];
        let all_good = true;
        let error_text = null;
        for (const i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                if (DEBUG_GRPC) console.log(FUNC + 'transaction proposal was good');
            } else {
                let this_error = proposalResponses[i].response ?
                    proposalResponses[i].response.message : proposalResponses[i];
                console.error(FUNC + 'Proposal error:', this_error);
                if (!error_text) {
                    error_text = this_error;
                }
            }
            all_good = all_good && one_good;
        }
        if (all_good) {
            if (DEBUG_GRPC) console.log(FUNC +
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s"',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload);
            const request = {
                proposalResponses: proposalResponses,
                proposal: proposal,
                header: header
            };

            const transactionID = tx_id.getTransactionID();
            const eh =  self.hfcClient.newEventHub();
            eh.setPeerAddr("grpc://" + process.env.FABRIC_EVENTHUB);
            eh.connect();
            
            let txPromise = new Promise( (resolve, reject) => {
                let handle = setTimeout(() => {
                    eh.disconnect();
                    return reject('Transaction submit timeout! peer = ' + eh.getPeerAddr() + ', txId = ' + transactionID);
                }, TRANSACTION_SUBMIT_TMOUT);

                eh.registerTxEvent(transactionID, (tx, code) => {
                    clearTimeout(handle);
                    eh.unregisterTxEvent(transactionID);
                    eh.disconnect();

                    if (code !== 'VALID') {
                        return reject('The transaction ' + transactionID + ' was invalid, code = ' + code);
                    } else {
                        if (DEBUG_GRPC) console.log(FUNC + 'The transaction %s has been committed on peer %s',
                            transactionID, eh.getPeerAddr());
                        return resolve(tx);
                    }
                }, (err) => {
                    clearTimeout(handle);
                    eh.unregisterTxEvent(transactionID);
                    eh.disconnect();
                    return reject(err);
                });
            });

            const sendPromise = await self.hfcChannel.sendTransaction(request);
            console.log(sendPromise)
            return Promise.all([sendPromise, txPromise])
                .then( (results) => {
                    return {
                        response: results[0],
                        tx: results[1],
                        retValue: proposalResponses[0].response.payload,
                    };
                });
        } else {
            return Promise.reject(error_text);
        }

    }  
    
    async queryInvokeChain(args) {
        const self = this;

        const command = args[0];
        const chaincodeId = args[1];
        const fcn = args[2];
        const argss = args.slice(3);

        const request = {
            chaincodeId,
            fcn,
            args: argss,
        }
        // console.log(command, chaincodeId, fcn, argss);

        // check if command is invoke or query and call a function accordingly
        if (command === 'invoke') {
            return await self.invokeByChaincode(request)
        } else if (command === 'query') {
            return await self.hfcChannel.queryByChaincode(request);    
        }

        // If there is command doesnt exist throw error to the user
        throw new Error("There is no such command. Please check manual.");
        
    }

}

async function initAll() {
    const bcBuilder = new BCBuilder('grpc',
        process.env.FABRIC_PEER,
        process.env.FABRIC_ORDERER,
        process.env.FABRIC_EVENTHUB,
        'this_bank_name');
    const client = await bcBuilder.init();
    let eh = client.newEventHub();
    eh.setPeerAddr("grpc://" + process.env.FABRIC_EVENTHUB);
    return bcBuilder;
}

function validateFncParams(params) {
    if(params.length < 3) 
        throw new Error("Not enough parameters. Please check manual.");
}

initAll().then(async (bcBuilder) => {
    const client = await bcBuilder.init();
 

    const fncParams = process.argv.slice(2);

    validateFncParams(fncParams);

    const response = await bcBuilder.queryInvokeChain(fncParams);

    // If the response is an array and contains Buffers then use toString to show data
    if(Array.isArray(response) && Buffer.isBuffer(response[0])) {
        console.log(response.toString());
    } else { // Else just stringify the response nad show it
        console.log(JSON.stringify(response));
    }
    
}).catch(function(err) {
    // Do nothing on err
    if(err && err.message) {
        console.log(err.message);
    } else { 
        console.log(err);
    }
    
})
