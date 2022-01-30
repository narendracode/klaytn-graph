import * as klaytnGraph from '@klaytn-graph/common'
import Caver, { Wallet } from 'caver-js';
import { interfaceIds } from './util'
import { ContractType, SearchContractDto } from '@klaytn-graph/common/src/dtos/contract.dto';

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
        //const contractFindByRes = await klaytnGraph.commons.contractService.find({ type: ContractType.NFT })
        //console.log(`contractFindByRes : ${JSON.stringify(contractFindByRes)}`)

        /*
        const createNFTRes = await klaytnGraph.commons.nftService.addNFT({
            contractAddress: "testcontractaddress1",
            ownerAddress: "testowneraddress1",
            tokenId: 2,
            tokenUri: "someipfsurl",
            price: -1
        })
        console.log(`nft create res : ${JSON.stringify(createNFTRes)}`)
        */

        // const nfts = await klaytnGraph.commons.nftService.getAllNFTs({ tokenId: "1" });
        //console.log(`nft : ${JSON.stringify(nfts)}`)

        /*
        const updateNFTOwnerRes = await klaytnGraph.commons.nftService.updateNFTOwner({
            nextOwnerAddress: "someTEStNextOwneraddress1",
            contractAddress: "testcontractaddress1",
            tokenId: 2,
            currentOwnerAddress: "someTEStNextOwneraddress"
        })
        console.log(`update nft owner res : ${JSON.stringify(updateNFTOwnerRes)}`)
        */

        const updateNFTPriceRes = await klaytnGraph.commons.nftService.updateNFTPrice({
            ownerAddress: "someTEStNextOwneraddress1",
            contractAddress: "testcontractaddress1",
            tokenId: 2,
            price: 12
        })
        console.log(`update nft price res : ${JSON.stringify(updateNFTPriceRes)}`)
    } catch (error) {
        console.log(`Error encountered : ${error}`)
    }

    //}, 50000) // every 20 seconds
})();