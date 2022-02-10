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
const contract_dto_1 = require("@klaytn-graph/common/src/dtos/contract.dto");
const util_1 = require("./util");
const klaytnSrvc = new klaytnGraph.commons.klaytnService(String(process.env.NETWORK_URL));
const OX_ADDRESS = "0x0000000000000000000000000000000000000000";
const processContractCreation = (receipt, tx) => __awaiter(void 0, void 0, void 0, function* () {
    const contractAddress = receipt["contractAddress"];
    const txHash = receipt["transactionHash"];
    const senderAddress = receipt["from"];
    const nftContract = klaytnSrvc.getKP17Contract(contractAddress);
    const isKP17 = yield nftContract.methods.supportsInterface(util_1.interfaceIds.kip17.IKIP17).call();
    const isIKIP17Metadata = yield nftContract.methods.supportsInterface(util_1.interfaceIds.kip17.IKIP17Metadata).call();
    const isIKIP17Enumerable = yield nftContract.methods.supportsInterface(util_1.interfaceIds.kip17.IKIP17Enumerable).call();
    const name = yield nftContract.methods.name().call();
    const symbol = yield nftContract.methods.symbol().call();
    if (isKP17 && isIKIP17Metadata && isIKIP17Enumerable) {
        const contractCreationDto = {
            contractAddress: contractAddress,
            deployerAddress: senderAddress,
            name: name,
            symbol: symbol,
            type: contract_dto_1.ContractType.NFT
        };
        yield klaytnGraph.commons.contractService.addContractTx(contractCreationDto, tx);
    }
    else {
        // just ignoring other type of contracts for now.
    }
});
const processContractFunctionExecution = (receipt, tx) => __awaiter(void 0, void 0, void 0, function* () {
    let txHash = receipt["transactionHash"];
    let ownerAddress = receipt["from"];
    let contractAddress = receipt["to"] ? receipt["to"].toLowerCase() : ""; //
    // check if contractAddress is something which is supposed to be tracked.
    console.log(`Checking contract exists query : ${contractAddress}`);
    const existingContracts = yield klaytnGraph.commons.contractService.findByContractAddressTx(contractAddress.toLowerCase(), tx);
    const isExistingContract = (existingContracts && existingContracts.length && existingContracts.length > 0);
    if (isExistingContract) {
        const blkNum = klaytnSrvc.hexToNumber(receipt["blockNumber"]);
        const allEvents = yield klaytnSrvc.getEvents(contractAddress, blkNum, txHash);
        for (let index = 0; index < allEvents.length; index++) {
            const event = allEvents[index];
            const eventName = event.event;
            switch (eventName) {
                case "Transfer": {
                    const eventValues = event.returnValues ? event.returnValues : {};
                    const from = eventValues.from;
                    const to = eventValues.to;
                    const tokenId = eventValues.tokenId;
                    if (from && from.length && to && to.length && tokenId && tokenId.length) {
                        if (from === OX_ADDRESS) {
                            // token minted
                            const tokenUri = yield klaytnSrvc.getTokenUri(contractAddress.toLowerCase(), Number(tokenId));
                            yield klaytnGraph.commons.nftService.addNFTTx({
                                contractAddress: contractAddress.toLowerCase(),
                                ownerAddress: ownerAddress.toLowerCase(),
                                tokenId: Number(tokenId),
                                tokenUri: tokenUri,
                                price: -1
                            }, tx);
                            console.log(`token minted with tokenId ${tokenId} in contract ${contractAddress.toLowerCase()}`);
                        }
                        else {
                            // token transferred
                            yield klaytnGraph.commons.nftService.updateNFTOwnerTx({
                                nextOwnerAddress: to.toLowerCase(),
                                contractAddress: contractAddress.toLowerCase(),
                                tokenId: Number(tokenId),
                                currentOwnerAddress: from.toLowerCase()
                            }, tx);
                            console.log(`token with tokenId ${tokenId} in contract ${contractAddress} transferred from ${from.toLowerCase()} to ${to.toLowerCase()}`);
                        }
                    }
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
const testKP17 = () => __awaiter(void 0, void 0, void 0, function* () {
    // run this only for testing.
    /*
    // deploy new contract
    await klaytnSrvc.useKey("") // set your private key before making smart contract call.
    const [nftAddress, abi] = await klaytnSrvc.deployKP17("Neelima Token", "NFT")
    console.log(`New token contract deployed at address : ${nftAddress}`) // 0x57E913FDAbe0DC8aB80000A2C32645dba73B059D
    */
    //const [address,abi] = await deployKP17();
    const address = "0x2ae2e621Ee0152d9B13D5B5AF25EB1c0f091c682"; //1. smart contract address
    //const blockNum = 81708921; // nft contract deploy
    /*
    // mint new token
    await klaytnSrvc.useKey("")
    await klaytnSrvc.mint("0x57E913FDAbe0DC8aB80000A2C32645dba73B059D", "https://ipfs.io/ipfs/QmNrZAd5tGuL9LXj7QTLNPdRpsKUZMgRpqnKs9KTJtWtLi", 1)
    */
    //const blockNum = 81767413; // nft mint
    /*
    // transfer token
    // await klaytnSrvc.useKey("")
    // await klaytnSrvc.transfer("0x57E913FDAbe0DC8aB80000A2C32645dba73B059D", "0x7d5236c8f1199d9d072C0CCa6a9C74A0e6C8Bbe5", 1)
   */
    //const blockNum = 81782471; //nft transfer
    //await klaytnGraph.commons.globalBlockService.setBlock(81782470);
    // console.log(version)
    //const contracts = await klaytnGraph.commons.contractService.getAllContracts();
    //console.log(`contracts : ${JSON.stringify(contracts)}`)
    //const contractFindByRes = await klaytnGraph.commons.contractService.findByContractAddress("testcontractaddress")
    //const contractFindByRes = await klaytnGraph.commons.contractService.find({ type: ContractType.NFT })
    //console.log(`contractFindByRes : ${JSON.stringify(contractFindByRes)}`)
    // const nfts = await klaytnGraph.commons.nftService.getAllNFTs({ tokenId: "1" });
    //console.log(`nft : ${JSON.stringify(nfts)}`)
    /*
    const updateNFTPriceRes = await klaytnGraph.commons.nftService.updateNFTPrice({
        ownerAddress: "someTEStNextOwneraddress1",
        contractAddress: "testcontractaddress1",
        tokenId: 2,
        price: 12
    })
    console.log(`update nft price res : ${JSON.stringify(updateNFTPriceRes)}`)
    */
});
const testKP7 = () => __awaiter(void 0, void 0, void 0, function* () {
    yield klaytnSrvc.useKey("0x3ce9f63a378c070f9ef02ae60a4fc8ab65563f618b31d612095416c69e0eee63"); // set your private key before making smart contract call.
    const deployRes = yield klaytnSrvc.deployKP7("Narendra Token", "NT", 10, '', '100000000', {});
    console.log(`contract deploy res : ${JSON.stringify(deployRes)}`);
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    // await test()
    yield testKP7();
    /*
    setInterval(async () => {
        try {
            console.log(`Listener is running`)
            await indexBlocks();
        } catch (error) {
            console.log(`Error encountered : ${error}`)
        }

    }, 500) */ // klaytn generates new block every one second it seems hence it makes sense to run this every 0.5 seconds
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQTRCO0FBQzVCLE1BQU0sWUFBWSxHQUFHLGdCQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDckMsSUFBSSxZQUFZLENBQUMsS0FBSyxFQUFFO0lBQ3BCLE1BQU0sWUFBWSxDQUFDLEtBQUssQ0FBQztDQUM1QjtBQUVELGtFQUFtRDtBQUNuRCxpREFBaUQ7QUFDakQsNkVBQTBFO0FBRTFFLGlDQUFxQztBQUNyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDMUYsTUFBTSxVQUFVLEdBQUcsNENBQTRDLENBQUE7QUFFL0QsTUFBTSx1QkFBdUIsR0FBRyxDQUFPLE9BQTJCLEVBQUUsRUFBTyxFQUFFLEVBQUU7SUFDM0UsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDbkQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7SUFFekMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBRXJDLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDaEUsTUFBTSxNQUFNLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLG1CQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzdGLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLG1CQUFZLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FB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