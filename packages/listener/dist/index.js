"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const dotenvResult = dotenv_1.default.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}
const klaytnGraph = __importStar(require("@klaytn-graph/common"));
const common_1 = require("@klaytn-graph/common");
const util_1 = require("./util");
const processFT_1 = require("./processFT");
const processNFT_1 = require("./processNFT");
const klaytnSrvc = new klaytnGraph.commons.klaytnService(String(process.env.NETWORK_URL));
const processContractCreation = (receipt, tx) => __awaiter(void 0, void 0, void 0, function* () {
    const contractAddress = receipt["contractAddress"];
    const txHash = receipt["transactionHash"];
    const senderAddress = receipt["from"].toLowerCase();
    const kp17Contract = klaytnSrvc.getKP17Contract(contractAddress);
    const kp7Contract = klaytnSrvc.getKP7Contract(contractAddress);
    let isKP17 = false;
    let isIKIP17Metadata = false;
    let isIKIP17Enumerable = false;
    let isKP7 = false;
    try {
        isKP17 = yield kp17Contract.methods.supportsInterface(util_1.interfaceIds.kip17.IKIP17).call();
        isIKIP17Metadata = yield kp17Contract.methods.supportsInterface(util_1.interfaceIds.kip17.IKIP17Metadata).call();
        isIKIP17Enumerable = yield kp17Contract.methods.supportsInterface(util_1.interfaceIds.kip17.IKIP17Enumerable).call();
        isKP7 = yield kp7Contract.methods.supportsInterface(util_1.interfaceIds.kip7.IKIP7).call();
    }
    catch (err) {
        console.log(`Error encounted while checking supportedInterface in contract with Address ${contractAddress}, possibly it is some custom contract.`);
    }
    if (isKP17 && isIKIP17Metadata && isIKIP17Enumerable) {
        yield (0, processNFT_1.addKP17Contract)(contractAddress, senderAddress, kp17Contract, txHash, tx);
    }
    else if (isKP7) {
        yield (0, processFT_1.addKP7Contract)(contractAddress, senderAddress, kp7Contract, txHash, tx);
    }
    else {
        // just ignoring other type of contracts for now.
    }
});
const transferToken = (contractAddress, ownerAddress, contractType, event, txhash, tx) => __awaiter(void 0, void 0, void 0, function* () {
    if (contractType === 'ft') {
        yield (0, processFT_1.transferFT)(contractAddress, ownerAddress, event, txhash, tx);
    }
    else {
        yield (0, processNFT_1.transferNFT)(contractAddress, ownerAddress, event, txhash, tx);
    }
});
const processContractFunctionExecution = (receipt, tx) => __awaiter(void 0, void 0, void 0, function* () {
    let txHash = receipt["transactionHash"];
    let ownerAddress = receipt["from"];
    let contractAddress = receipt["to"] ? receipt["to"].toLowerCase() : ""; //
    // check if contractAddress is something which is supposed to be tracked.
    console.log(`Checking contract exists for address : ${contractAddress}`);
    const existingContracts = yield klaytnGraph.commons.contractService.findByContractAddressTx(contractAddress.toLowerCase(), tx);
    const isExistingContract = (existingContracts && existingContracts.length && existingContracts.length > 0);
    if (isExistingContract) {
        const blkNum = klaytnSrvc.hexToNumber(receipt["blockNumber"]);
        const contractType = existingContracts[0].type;
        const allEvents = yield klaytnSrvc.getEvents(contractAddress, blkNum, txHash, contractType);
        for (let index = 0; index < allEvents.length; index++) {
            const event = allEvents[index];
            const eventName = event.event;
            console.log(`processing event ${eventName} for txHash ${txHash}`);
            switch (eventName) {
                case "Transfer": {
                    yield transferToken(contractAddress, ownerAddress, contractType, event, txHash, tx);
                    break;
                }
                default: {
                    console.log(`Event ${eventName} is not in use. Ignore.`);
                }
            }
        }
    }
});
const processBlockTx = (blockNum, tx) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`processing block : ${blockNum}`);
    const receipts = yield klaytnSrvc.getTxReceipt(blockNum);
    for (let i = 0; i < receipts.length; i++) {
        let receipt = receipts[i];
        const status = klaytnSrvc.hexToNumber(receipt["status"]);
        if (status !== 1) {
            console.log(`status for transaction is not 1.`);
            continue;
        }
        // if receipt returns contract address then it is contract creation else it is function execution.
        if (receipt["contractAddress"] !== null) {
            // transaction is contract creation
            yield processContractCreation(receipt, tx);
        }
        else {
            yield processContractFunctionExecution(receipt, tx);
        }
    }
});
const indexBlocks = () => __awaiter(void 0, void 0, void 0, function* () {
    const latestBlkInNwk = yield klaytnSrvc.getLatestBlock();
    const currBlockInDB = yield klaytnGraph.commons.globalBlockService.getCurrentBlock();
    console.log(`latestBlockInNetwork : ${latestBlkInNwk}, currBlockInDB : ${currBlockInDB}`);
    const nextBlockInDB = currBlockInDB + 1;
    if (nextBlockInDB <= latestBlkInNwk) {
        const tx = yield common_1.dbService.dbConn.transaction();
        try {
            yield processBlockTx(nextBlockInDB, tx);
            yield klaytnGraph.commons.globalBlockService.incrementBlockTx(tx);
            yield tx.commit();
        }
        catch (err) {
            console.error(`error encountered while procesing blocks : ${err}`);
            tx.rollback();
        }
    }
    else {
        console.log(`Latest block in network ${latestBlkInNwk}, current block in DB is ${currBlockInDB}. Waiting for new block to be generated in network.`);
    }
});
const delay = (time) => new Promise(res => setTimeout(res, time));
(() => __awaiter(void 0, void 0, void 0, function* () {
    while (true) {
        //running it in infinite loop like mad
        try {
            console.log(`start running`);
            yield indexBlocks();
            console.log(`completed`);
            yield delay(500); // sleep for half second.
        }
        catch (error) {
            console.log(`Error encountered : ${error}`);
        }
    }
    // klaytn generates new block every one second it seems hence it makes sense to run this every 0.5 seconds
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQTRCO0FBQzVCLE1BQU0sWUFBWSxHQUFHLGdCQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDckMsSUFBSSxZQUFZLENBQUMsS0FBSyxFQUFFO0lBQ3BCLE1BQU0sWUFBWSxDQUFDLEtBQUssQ0FBQztDQUM1QjtBQUVELGtFQUFtRDtBQUNuRCxpREFBaUQ7QUFFakQsaUNBQXFDO0FBQ3JDLDJDQUF3RDtBQUN4RCw2Q0FBNEQ7QUFFNUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBRTFGLE1BQU0sdUJBQXVCLEdBQUcsQ0FBTyxPQUEyQixFQUFFLEVBQU8sRUFBRSxFQUFFO0lBQzNFLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBRXpDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNuRCxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDL0QsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ25CLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0lBQzdCLElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0lBQy9CLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNsQixJQUFJO1FBQ0EsTUFB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