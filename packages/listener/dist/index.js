"use strict";
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
const caver_js_1 = __importDefault(require("caver-js"));
const util_1 = require("./util");
const caver = new caver_js_1.default('https://api.baobab.klaytn.net:8651/');
const senderPrvKey = "0x3ce9f63a378c070f9ef02ae60a4fc8ab65563f618b31d612095416c69e0eee63";
const useKey = (privateKey) => {
    const senderAddress = caver.klay.accounts.wallet.add(senderPrvKey).address;
    caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(senderPrvKey));
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
        const blockNum = 81782471; //nft transfer
        yield testNFTMint(blockNum);
        /*
        const isKP17 = await caver.kct.kip17.detectInterface(address)
        console.log(`contract is KP17 : ${JSON.stringify(isKP17)}`)
        */
        /*
            const isNotKP17 = await caver.kct.kip17.detectInterface("0x7D047Cbd15a05D9FA2E65033c7E75d9C5957A21B")
            console.log(`contract is not KP17 : ${JSON.stringify(isNotKP17)}`)
    
            const isKP7 = await caver.kct.kip7.detectInterface("0x7D047Cbd15a05D9FA2E65033c7E75d9C5957A21B")
            console.log(`contract is KP7 : ${JSON.stringify(isKP7)}`)
        const isNotKP7 = await caver.kct.kip7.detectInterface(address)
        console.log(`contract is not KP7 : ${JSON.stringify(isNotKP7)}`)
        */
        // console.log(version)
        // const code = await caver.rpc.klay.getCode('0xf192d912649d59d91cd61a141e56e8a0e0a85294');
        // console.log(`code received : ${JSON.stringify(code)}`)
    }
    catch (error) {
        console.log(`Error encountered : ${error}`);
    }
    //}, 50000) // every 20 seconds
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFDQSx3REFBeUM7QUFDekMsaUNBQXFDO0FBRXJDLE1BQU0sS0FBSyxHQUFHLElBQUksa0JBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sWUFBWSxHQUFHLG9FQUFvRSxDQUFDO0FBRTFGLE1BQU0sTUFBTSxHQUFHLENBQUMsVUFBa0IsRUFBRSxFQUFFO0lBQ2xDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFBO0lBQzFFLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7SUFDekUsT0FBTyxhQUFhLENBQUM7QUFDekIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxVQUFVLEdBQUcsQ0FBTyxVQUFrQixFQUFFLEVBQUU7SUFDNUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBRXhDLE1BQU0sWUFBWSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUM3RyxNQUFNLHVCQUF1QixHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFBO0lBQzVELE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFBO0lBQ3RELE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUEsQ0FBQTtBQUVELE1BQU0sU0FB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