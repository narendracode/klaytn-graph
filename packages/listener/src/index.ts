import * as klaytnGraph from '@klaytn-graph/common'
import { ContractType } from '@klaytn-graph/common/src/dtos/contract.dto';
import { TransactionReceipt } from 'caver-js';
import { interfaceIds } from './util'
const klaytnSrvc = new klaytnGraph.commons.klaytnService("https://api.baobab.klaytn.net:8651/");

const processContractCreation = async (receipt: TransactionReceipt) => {
    const contractAddress = receipt["contractAddress"];
    const txHash = receipt["transactionHash"]

    const senderAddress = receipt["from"]

    const nftContract = klaytnSrvc.getKP17Contract(contractAddress);
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

const processContractFunctionExecution = async (receipt: TransactionReceipt) => {
    let txHash = receipt["transactionHash"]
    let ownerAddress = receipt["from"]
    let contractAddress = receipt["to"] ? receipt["to"].toLowerCase() : ""; //

    // check if contractAddress is something which is supposed to be tracked.
    const existingContracts = await klaytnGraph.commons.contractService.findByContractAddress(contractAddress.toLowerCase())
    const isExistingContract = (existingContracts && existingContracts.length && existingContracts.length > 0)
    if (isExistingContract) {
        const blkNum = klaytnSrvc.hexToNumber(receipt["blockNumber"])
        const allEvents = await klaytnSrvc.getEvents(contractAddress, blkNum, txHash);
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
    console.log(`processing block : ${blockNum}`)
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

const indexBlocks = async () => {
    const latestBlkInNwk = await klaytnSrvc.getLatestBlock();
    const currBlockInDB = await klaytnGraph.commons.globalBlockService.getCurrentBlock()
    console.log(`latestBlockInNetwork : ${latestBlkInNwk}, currBlockInDB : ${currBlockInDB}`)

    const nextBlockInDB = currBlockInDB + 1;
    if (nextBlockInDB <= latestBlkInNwk) {
        await processBlock(nextBlockInDB);
        await klaytnGraph.commons.globalBlockService.incrementBlock()
    } else {
        console.log(`Latest block in network ${latestBlkInNwk}, current block in DB is ${currBlockInDB}. Waiting for new block to be generated in network.`)
    }

}

const test = async () => {
    // run this only for testing.

    /*
    // deploy new contract
    await klaytnSrvc.useKey("") // set your private key before making smart contract call.
    const [nftAddress, abi] = await klaytnSrvc.deployKP17("Neelima Token", "NFT")
    console.log(`New token contract deployed at address : ${nftAddress}`) // 0x57E913FDAbe0DC8aB80000A2C32645dba73B059D
    */

    //const [address,abi] = await deployKP17();

    const address = "0x2ae2e621Ee0152d9B13D5B5AF25EB1c0f091c682";//1. smart contract address
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
}

(async () => {
    // await test()
    setInterval(async () => {
        try {
            console.log(`Listener is running`)
            await indexBlocks();
        } catch (error) {
            console.log(`Error encountered : ${error}`)
        }

    }, 500) // klaytn generates new block every one second it seems hence it makes sense to run this every 0.5 seconds
})();