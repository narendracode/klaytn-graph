import * as klaytnGraph from '@klaytn-graph/common'
import { ContractType } from '@klaytn-graph/common/src/dtos/contract.dto';
import Caver, { TransactionReceipt } from 'caver-js';
import { interfaceIds } from './util'
const klaytnSrvc = new klaytnGraph.commons.klaytnService("https://api.baobab.klaytn.net:8651/");
const caver = new Caver('https://api.baobab.klaytn.net:8651/');
const senderPrvKey = "";


const useKey = (privateKey: string) => {
    const senderAddress = caver.klay.accounts.wallet.add(privateKey).address
    caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(privateKey))
    return senderAddress;
}

const deployKP17 = async (privateKey: string) => {
    const senderAddress = useKey(privateKey)

    const deployedKP17 = await caver.kct.kip17.deploy({ name: "NTest Contract", "symbol": "NCT" }, senderAddress)
    const deployedContractAddress = deployedKP17.options.address
    const contractAbi = deployedKP17.options.jsonInterface
    return [deployedContractAddress, contractAbi];
}

const mintToken = async (privateKey: string, contractAddress: string, tokenURI: string, tokenId: Number) => {
    const senderAddress = useKey(privateKey);
    const kp17Contract = new caver.klay.Contract(caver.kct.kip17.abi, contractAddress)
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
    const receipt = await kp17Contract.methods.mintWithTokenURI(senderAddress, tokenId, tokenURI).send({
        from: senderAddress,
        gas: '20000000',
    })
    console.log(`receipt : ${JSON.stringify(receipt)}`)

    return receipt;
}

const transferToken = async (privateKey: string, contractAddress: string, toAddress: string, tokenId: Number) => {
    const senderAddress = useKey(privateKey);
    const kp17Contract = new caver.klay.Contract(caver.kct.kip17.abi, contractAddress)
    // https://github.com/klaytn/klaytn-contracts/blob/master/contracts/token/KIP17/KIP17.sol#L147
    const receipt = await kp17Contract.methods.transferFrom(senderAddress, toAddress, tokenId).send({
        from: senderAddress,
        gas: '20000000'
    })

    console.log(`transfer token receipt : ${JSON.stringify(receipt)}`)

    return receipt;
}


const getTxReceipt = async (blockNum: Number) => {
    let block = await caver.klay.getBlock(blockNum);
    // console.log(`block : ${JSON.stringify(block)}`)
    const receipts = await caver.klay.getBlockReceipts(block["hash"]);
    //console.log(`receipts : ${JSON.stringify(receipts)}`)
    return receipts;
}

const testContractCreation = async (blockNum: Number) => {
    const receipts = await getTxReceipt(blockNum);

    for (let i = 0; i < receipts.length; i++) {
        let receipt = receipts[i];
        if (receipt["contractAddress"] === null) {
            // transaction is not contract creation
            // either klay transfer or smart contract function call.
            console.log(`Contract address not found.`)
            continue;
        }
        let contractAddress = receipt["contractAddress"];
        let txHash = receipt["transactionHash"]
        let status = receipt["status"]
        let senderAddress = receipt["from"]

        let nftContract = new caver.contract(caver.kct.kip17.abi, contractAddress);
        let isKP17 = await nftContract.methods.supportsInterface(interfaceIds.kip17.IKIP17).call();
        let isIKIP17Metadata = await nftContract.methods.supportsInterface(interfaceIds.kip17.IKIP17Metadata).call();
        let isIKIP17Enumerable = await nftContract.methods.supportsInterface(interfaceIds.kip17.IKIP17Enumerable).call();

        console.log(`contract address : ${contractAddress}`)
        console.log(`tx hash: ${txHash}`)
        console.log(`status : ${status}, status in number : ${caver.utils.hexToNumber(status)}`)
        console.log(`sender address : ${senderAddress}`)
        console.log(`isKP17 : ${isKP17}`)
        console.log(`isIKIP17Metadata : ${isIKIP17Metadata}`)
        console.log(`isIKIP17Enumerable : ${isIKIP17Enumerable}`)

        let name = await nftContract.methods.name().call();
        let symbol = await nftContract.methods.symbol().call();
        console.log(`name : ${name}, symbol : ${symbol}`)
    }
}

const testNFTMint = async (blockNum: Number) => {
    const receipts = await getTxReceipt(blockNum);
    for (let i = 0; i < receipts.length; i++) {
        let receipt = receipts[i];
        if (receipt["contractAddress"] !== null) {
            // transaction is contract creation
            continue;
        }
        // console.log(`receipt : ${JSON.stringify(receipt)}`)
        let txHash = receipt["transactionHash"]
        let status = receipt["status"]
        let senderAddress = receipt["from"]
        let contractAddress = receipt["to"] ? receipt["to"].toLowerCase() : ""; //

        console.log(`txHash : ${txHash} , status : ${status}, senderAddress : ${senderAddress}, contractAddress : ${contractAddress}`)
        const txReceipt = await caver.klay.getTransactionReceipt(txHash)
        const kp17Contract = new caver.klay.Contract(caver.kct.kip17.abi, contractAddress)
        const allEvents = await kp17Contract.getPastEvents('allEvents', {
            fromBlock: blockNum,
            toBlock: blockNum
        })
        const allEventsFromTxHash = allEvents.filter((event) => { return event.address?.toLowerCase() === contractAddress && event.transactionHash === txHash });
        console.log(`all events : ${JSON.stringify(allEventsFromTxHash)}`)
    }
}

const processContractCreation = async (receipt: TransactionReceipt) => {
    const contractAddress = receipt["contractAddress"];
    const txHash = receipt["transactionHash"]

    const senderAddress = receipt["from"]

    const nftContract = new caver.contract(caver.kct.kip17.abi, contractAddress);
    const isKP17 = await nftContract.methods.supportsInterface(interfaceIds.kip17.IKIP17).call();
    const isIKIP17Metadata = await nftContract.methods.supportsInterface(interfaceIds.kip17.IKIP17Metadata).call();
    const isIKIP17Enumerable = await nftContract.methods.supportsInterface(interfaceIds.kip17.IKIP17Enumerable).call();
    const name = await nftContract.methods.name().call();
    const symbol = await nftContract.methods.symbol().call();

    if (isKP17 && isIKIP17Metadata && isIKIP17Enumerable) {
        const contractCreationDto = {
            contractAddress: contractAddress,
            deployerAddress: senderAddress,
            name: name,
            symbol: symbol,
            type: ContractType.NFT
        }
        await klaytnGraph.commons.contractService.addContract(contractCreationDto)
    } else {
        // just ignoring other type of contracts for now.
    }
}

const getEvents = async (contractAddress: string, blockNum: number, txHash: string) => {
    const kp17Contract = new caver.klay.Contract(caver.kct.kip17.abi, contractAddress)
    const allEvents = await kp17Contract.getPastEvents('allEvents', {
        fromBlock: blockNum,
        toBlock: blockNum
    })
    const allEventsFromTxHash = allEvents.filter((event) => { return event.address?.toLowerCase() === contractAddress && event.transactionHash === txHash });
    return allEventsFromTxHash
}

const processContractFunctionExecution = async (receipt: TransactionReceipt) => {
    let txHash = receipt["transactionHash"]
    let ownerAddress = receipt["from"]
    let contractAddress = receipt["to"] ? receipt["to"].toLowerCase() : ""; //

    // check if contractAddress is something which is supposed to be tracked.
    const existingContracts = await klaytnGraph.commons.contractService.findByContractAddress(contractAddress.toLowerCase())
    const isExistingContract = (existingContracts && existingContracts.length && existingContracts.length > 0)
    if (isExistingContract) {
        const blkNum = klaytnSrvc.hexToNumber(receipt["blockNumber"])
        const allEvents = await getEvents(contractAddress, blkNum, txHash);
        for (let index = 0; index < allEvents.length; index++) {
            const event = allEvents[index];
            const eventName = event.event;
            switch (eventName) {
                case "Transfer": {
                    const eventValues = event.returnValues ? event.returnValues : {};
                    const from = eventValues.from;
                    const to = eventValues.to;
                    const tokenId = eventValues.tokenId
                    if (from && from.length && to && to.length && tokenId && tokenId.length) {
                        if (from === "0x0000000000000000000000000000000000000000") {
                            // token minted
                            const tokenUri = await klaytnSrvc.getTokenUri(contractAddress.toLowerCase(), Number(tokenId))
                            await klaytnGraph.commons.nftService.addNFT({
                                contractAddress: contractAddress.toLowerCase(),
                                ownerAddress: ownerAddress.toLowerCase(),
                                tokenId: Number(tokenId),
                                tokenUri: tokenUri,
                                price: -1
                            })
                            console.log(`token minted with tokenId ${tokenId} in contract ${contractAddress.toLowerCase()}`)
                        } else {
                            // token transferred
                            await klaytnGraph.commons.nftService.updateNFTOwner({
                                nextOwnerAddress: to.toLowerCase(),
                                contractAddress: contractAddress.toLowerCase(),
                                tokenId: Number(tokenId),
                                currentOwnerAddress: from.toLowerCase()
                            })
                            console.log(`token with tokenId ${tokenId} in contract ${contractAddress} transferred from ${from.toLowerCase()} to ${to.toLowerCase()}`)
                        }
                    }
                    break;
                }
                default: {
                    console.log(`Event ${eventName} is not in use. Ignore.`)
                }
            }
        }
    }
}

const processBlock = async (blockNum: number) => {
    const receipts = await klaytnSrvc.getTxReceipt(blockNum)

    for (let i = 0; i < receipts.length; i++) {
        let receipt = receipts[i];
        const status = klaytnSrvc.hexToNumber(receipt["status"])

        if (status !== 1) {
            console.log(`status for transaction is not 1.`)
            continue;
        }
        // if receipt returns contract address then it is contract creation else it is function execution.
        if (receipt["contractAddress"] !== null) {
            // transaction is contract creation
            await processContractCreation(receipt)
        } else {
            await processContractFunctionExecution(receipt)
        }
    }
}

(async () => {
    //setInterval(async () => {
    try {
        console.log(`Listener is running`)
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

        let currNetworkBlock = await caver.klay.getBlock("latest");
        // console.log(`currentNetworkBlock : ${JSON.stringify(currNetworkBlock.number)}`)
        let currentNwBlockNumber = caver.utils.hexToNumber(currNetworkBlock.number)
        console.log(`currentNetworkBlock : ${currentNwBlockNumber}`)
        //await processBlock(81782471)
        //let currBlock = await klaytnGraph.commons.globalBlockService.getCurrentBlock()
        //console.log(`current block : ${JSON.stringify(currBlock)}`)

        // await klaytnGraph.commons.globalBlockService.incrementBlock()
        //await klaytnGraph.commons.globalBlockService.setBlock(10);

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
    } catch (error) {
        console.log(`Error encountered : ${error}`)
    }

    //}, 50000) // every 20 seconds
})();