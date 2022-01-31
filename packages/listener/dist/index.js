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
const contract_dto_1 = require("@klaytn-graph/common/src/dtos/contract.dto");
const util_1 = require("./util");
const klaytnSrvc = new klaytnGraph.commons.klaytnService("https://api.baobab.klaytn.net:8651/");
const processContractCreation = (receipt) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield klaytnGraph.commons.contractService.addContract(contractCreationDto);
    }
    else {
        // just ignoring other type of contracts for now.
    }
});
const processContractFunctionExecution = (receipt) => __awaiter(void 0, void 0, void 0, function* () {
    let txHash = receipt["transactionHash"];
    let ownerAddress = receipt["from"];
    let contractAddress = receipt["to"] ? receipt["to"].toLowerCase() : ""; //
    // check if contractAddress is something which is supposed to be tracked.
    const existingContracts = yield klaytnGraph.commons.contractService.findByContractAddress(contractAddress.toLowerCase());
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
                        if (from === "0x0000000000000000000000000000000000000000") {
                            // token minted
                            const tokenUri = yield klaytnSrvc.getTokenUri(contractAddress.toLowerCase(), Number(tokenId));
                            yield klaytnGraph.commons.nftService.addNFT({
                                contractAddress: contractAddress.toLowerCase(),
                                ownerAddress: ownerAddress.toLowerCase(),
                                tokenId: Number(tokenId),
                                tokenUri: tokenUri,
                                price: -1
                            });
                            console.log(`token minted with tokenId ${tokenId} in contract ${contractAddress.toLowerCase()}`);
                        }
                        else {
                            // token transferred
                            yield klaytnGraph.commons.nftService.updateNFTOwner({
                                nextOwnerAddress: to.toLowerCase(),
                                contractAddress: contractAddress.toLowerCase(),
                                tokenId: Number(tokenId),
                                currentOwnerAddress: from.toLowerCase()
                            });
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
const processBlock = (blockNum) => __awaiter(void 0, void 0, void 0, function* () {
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
            yield processContractCreation(receipt);
        }
        else {
            yield processContractFunctionExecution(receipt);
        }
    }
});
const indexBlocks = () => __awaiter(void 0, void 0, void 0, function* () {
    const latestBlkInNwk = yield klaytnSrvc.getLatestBlock();
    const currBlockInDB = yield klaytnGraph.commons.globalBlockService.getCurrentBlock();
    console.log(`latestBlockInNetwork : ${latestBlkInNwk}, currBlockInDB : ${currBlockInDB}`);
    const nextBlockInDB = currBlockInDB + 1;
    if (nextBlockInDB <= latestBlkInNwk) {
        yield processBlock(nextBlockInDB);
        yield klaytnGraph.commons.globalBlockService.incrementBlock();
    }
    else {
        console.log(`Latest block in network ${latestBlkInNwk}, current block in DB is ${currBlockInDB}. Waiting for new block to be generated in network.`);
    }
});
const test = () => __awaiter(void 0, void 0, void 0, function* () {
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    // await test()
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(`Listener is running`);
            yield indexBlocks();
        }
        catch (error) {
            console.log(`Error encountered : ${error}`);
        }
    }), 500); // klaytn generates new block every one second it seems hence it makes sense to run this every 0.5 seconds
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQTRCO0FBQzVCLE1BQU0sWUFBWSxHQUFHLGdCQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDckMsSUFBSSxZQUFZLENBQUMsS0FBSyxFQUFFO0lBQ3BCLE1BQU0sWUFBWSxDQUFDLEtBQUssQ0FBQztDQUM1QjtBQUVELGtFQUFtRDtBQUNuRCw2RUFBMEU7QUFFMUUsaUNBQXFDO0FBQ3JDLE1BQU0sVUFBVSxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMscUNBQXFDLENBQUMsQ0FBQztBQUVoRyxNQUFNLHVCQUF1QixHQUFHLENBQU8sT0FBMkIsRUFBRSxFQUFFO0lBQ2xFLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBRXpDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUVyQyxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2hFLE1BQU0sTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM3RixNQUFNLGdCQUFnQixHQUFHLE1BQU0sV0FBVyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBWSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMvRyxNQUFNLGtCQUFrQixHQUFHLE1BQU0sV0FBVyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBWSxD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