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
const klaytnGraph = __importStar(require("@klaytn-graph/common"));
const caver_js_1 = __importDefault(require("caver-js"));
const util_1 = require("./util");
const caver = new caver_js_1.default('https://api.baobab.klaytn.net:8651/');
const senderPrvKey = "0x3ce9f63a378c070f9ef02ae60a4fc8ab65563f618b31d612095416c69e0eee63";
const useKey = (privateKey) => {
    const senderAddress = caver.klay.accounts.wallet.add(privateKey).address;
    caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(privateKey));
    return senderAddress;
};
const deployKP17 = (privateKey) => __awaiter(void 0, void 0, void 0, function* () {
    const senderAddress = useKey(privateKey);
    const deployedKP17 = yield caver.kct.kip17.deploy({ name: "NTest Contract", "symbol": "NCT" }, senderAddress);
    const deployedContractAddress = deployedKP17.options.address;
    const contractAbi = deployedKP17.options.jsonInterface;
    return [deployedContractAddress, contractAbi];
});
const mintToken = (privateKey, contractAddress, tokenURI, tokenId) => __awaiter(void 0, void 0, void 0, function* () {
    const senderAddress = useKey(privateKey);
    const kp17Contract = new caver.klay.Contract(caver.kct.kip17.abi, contractAddress);
    /*
        {
            constant: false,
            inputs: [{ name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }, { name: 'tokenURI', type: 'string' }],
            name: 'mintWithTokenURI',
            outputs: [{ name: '', type: 'bool' }],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
        },
    */
    const receipt = yield kp17Contract.methods.mintWithTokenURI(senderAddress, tokenId, tokenURI).send({
        from: senderAddress,
        gas: '20000000',
    });
    console.log(`receipt : ${JSON.stringify(receipt)}`);
    return receipt;
});
const transferToken = (privateKey, contractAddress, toAddress, tokenId) => __awaiter(void 0, void 0, void 0, function* () {
    const senderAddress = useKey(privateKey);
    const kp17Contract = new caver.klay.Contract(caver.kct.kip17.abi, contractAddress);
    // https://github.com/klaytn/klaytn-contracts/blob/master/contracts/token/KIP17/KIP17.sol#L147
    const receipt = yield kp17Contract.methods.transferFrom(senderAddress, toAddress, tokenId).send({
        from: senderAddress,
        gas: '20000000'
    });
    console.log(`transfer token receipt : ${JSON.stringify(receipt)}`);
    return receipt;
});
const getTxReceipt = (blockNum) => __awaiter(void 0, void 0, void 0, function* () {
    let block = yield caver.klay.getBlock(blockNum);
    // console.log(`block : ${JSON.stringify(block)}`)
    const receipts = yield caver.klay.getBlockReceipts(block["hash"]);
    //console.log(`receipts : ${JSON.stringify(receipts)}`)
    return receipts;
});
const testContractCreation = (blockNum) => __awaiter(void 0, void 0, void 0, function* () {
    const receipts = yield getTxReceipt(blockNum);
    for (let i = 0; i < receipts.length; i++) {
        let receipt = receipts[i];
        if (receipt["contractAddress"] === null) {
            // transaction is not contract creation
            // either klay transfer or smart contract function call.
            console.log(`Contract address not found.`);
            continue;
        }
        let contractAddress = receipt["contractAddress"];
        let txHash = receipt["transactionHash"];
        let status = receipt["status"];
        let senderAddress = receipt["from"];
        let nftContract = new caver.contract(caver.kct.kip17.abi, contractAddress);
        let isKP17 = yield nftContract.methods.supportsInterface(util_1.interfaceIds.kip17.IKIP17).call();
        let isIKIP17Metadata = yield nftContract.methods.supportsInterface(util_1.interfaceIds.kip17.IKIP17Metadata).call();
        let isIKIP17Enumerable = yield nftContract.methods.supportsInterface(util_1.interfaceIds.kip17.IKIP17Enumerable).call();
        console.log(`contract address : ${contractAddress}`);
        console.log(`tx hash: ${txHash}`);
        console.log(`status : ${status}, status in number : ${caver.utils.hexToNumber(status)}`);
        console.log(`sender address : ${senderAddress}`);
        console.log(`isKP17 : ${isKP17}`);
        console.log(`isIKIP17Metadata : ${isIKIP17Metadata}`);
        console.log(`isIKIP17Enumerable : ${isIKIP17Enumerable}`);
        let name = yield nftContract.methods.name().call();
        let symbol = yield nftContract.methods.symbol().call();
        console.log(`name : ${name}, symbol : ${symbol}`);
    }
});
const testNFTMint = (blockNum) => __awaiter(void 0, void 0, void 0, function* () {
    const receipts = yield getTxReceipt(blockNum);
    for (let i = 0; i < receipts.length; i++) {
        let receipt = receipts[i];
        if (receipt["contractAddress"] !== null) {
            // transaction is contract creation
            continue;
        }
        // console.log(`receipt : ${JSON.stringify(receipt)}`)
        let txHash = receipt["transactionHash"];
        let status = receipt["status"];
        let senderAddress = receipt["from"];
        let contractAddress = receipt["to"] ? receipt["to"].toLowerCase() : ""; //
        console.log(`txHash : ${txHash} , status : ${status}, senderAddress : ${senderAddress}, contractAddress : ${contractAddress}`);
        const txReceipt = yield caver.klay.getTransactionReceipt(txHash);
        const kp17Contract = new caver.klay.Contract(caver.kct.kip17.abi, contractAddress);
        const allEvents = yield kp17Contract.getPastEvents('allEvents', {
            fromBlock: blockNum,
            toBlock: blockNum
        });
        const allEventsFromTxHash = allEvents.filter((event) => { var _a; return ((_a = event.address) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === contractAddress && event.transactionHash === txHash; });
        console.log(`all events : ${JSON.stringify(allEventsFromTxHash)}`);
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    //setInterval(async () => {
    try {
        console.log(`Listener is running`);
        //common.sayHello();
        // const version = await caver.rpc.klay.getClientVersion()
        //const [address,abi] = await deployKP17();
        const address = "0x2ae2e621Ee0152d9B13D5B5AF25EB1c0f091c682";
        //const blockNum = 81708921; // nft contract deploy
        //await mintToken(senderPrvKey, address, "https://ipfs.io/ipfs/QmNrZAd5tGuL9LXj7QTLNPdRpsKUZMgRpqnKs9KTJtWtLi", 1);
        //const blockNum = 81767413; // nft mint
        // await testContractCreation(blockNum);
        // await testNFTMint(blockNum);
        //await transferToken(senderPrvKey, address, "0x7d5236c8f1199d9d072C0CCa6a9C74A0e6C8Bbe5", 1)
        //const blockNum = 81782471; //nft transfer
        //await testNFTMint(blockNum);
        //let currBlock = await klaytnGraph.commons.globalBlockService.getCurrentBlock()
        //console.log(`current block : ${JSON.stringify(currBlock)}`)
        // await klaytnGraph.commons.globalBlockService.incrementBlock()
        //await klaytnGraph.commons.globalBlockService.setBlock(10);
        // console.log(version)
        /*
        const contractCreateRes = await klaytnGraph.commons.contractService.addContract({
            contractAddress: "testcontractaddress1",
            deployerAddress: "testdeployeraddress1",
            type: ContractType.NFT,
            name: "dummyname1",
            symbol: "dummysymbol1"
        })
        console.log(`contarct create res : ${JSON.stringify(contractCreateRes)}`)
        */
        //const contracts = await klaytnGraph.commons.contractService.getAllContracts();
        //console.log(`contracts : ${JSON.stringify(contracts)}`)
        //const contractFindByRes = await klaytnGraph.commons.contractService.findByContractAddress("testcontractaddress")
        const contractFindByRes = yield klaytnGraph.commons.contractService.find({ deployerAddress: "testdeployeraddress1" });
        console.log(`contractFindByRes : ${JSON.stringify(contractFindByRes)}`);
    }
    catch (error) {
        console.log(`Error encountered : ${error}`);
    }
    //}, 50000) // every 20 seconds
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsa0VBQW1EO0FBQ25ELHdEQUF5QztBQUN6QyxpQ0FBcUM7QUFHckMsTUFBTSxLQUFLLEdBQUcsSUFBSSxrQkFBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7QUFDL0QsTUFBTSxZQUFZLEdBQUcsb0VBQW9FLENBQUM7QUFHMUYsTUFBTSxNQUFNLEdBQUcsQ0FBQyxVQUFrQixFQUFFLEVBQUU7SUFDbEMsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUE7SUFDeEUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtJQUN2RSxPQUFPLGFBQWEsQ0FBQztBQUN6QixDQUFDLENBQUE7QUFFRCxNQUFNLFVBQVUsR0FBRyxDQUFPLFVBQWtCLEVBQUUsRUFBRTtJQUM1QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7SUFFeEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFBO0lBQzdHLE1BQU0sdUJBQXVCLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUE7SUFDNUQsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUE7SUFDdEQsT0FBTyxDQUFDLHVCQUF1QixFQUFFLFdBQVcsQ0FBQyxDQUFDO0FB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