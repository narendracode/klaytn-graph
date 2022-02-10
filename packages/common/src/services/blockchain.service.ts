import Caver from 'caver-js';
import BigNumber from 'bignumber.js';

export class BlockchainService {
    private caver: Caver;
    private sender!: string;

    constructor(networkUri: string) {
        this.caver = new Caver(networkUri);
    }

    getCaver = (): Caver => {
        return this.caver;
    }

    useKey = (privateKey: string) => {
        const senderAddress = this.caver.klay.accounts.wallet.add(privateKey).address
        this.caver.wallet.add(this.caver.wallet.keyring.createFromPrivateKey(privateKey))
        this.sender = senderAddress;
    }

    getCurrentNetworkBlock = async () => {
        let currNetworkBlock = await this.caver.klay.getBlock("latest");
        return this.caver.utils.hexToNumber(currNetworkBlock.number)
    }

    deployKP17 = async (name: string, symbol: string) => {
        const deployedKP17 = await this.caver.kct.kip17.deploy({ name: name, symbol: symbol }, this.sender)
        const deployedContractAddress = deployedKP17.options.address
        const contractAbi = deployedKP17.options.jsonInterface
        return [deployedContractAddress, contractAbi];
    }

    deployKP7 = async (name: string, symbol: string, decimals: number, alias: string, initialSupply: string, sendOptions: any) => {
        const tokenInfo = {
            name: name,
            symbol: symbol,
            decimals: decimals,
            alias: '',
            initialSupply: initialSupply
        }
        if (alias) tokenInfo.alias = alias;
        if (!sendOptions) sendOptions = {};
        const deployedKP7 = await this.caver.kct.kip7.deploy(tokenInfo, this.sender)
        const deployedContractAddress = deployedKP7.options.address
        const contractAbi = deployedKP7.options.jsonInterface
        return [deployedContractAddress, contractAbi];
    }

    mint = async (contractAddress: string, tokenURI: string, tokenId: Number) => {
        const kp17Contract = new this.caver.klay.Contract(this.caver.kct.kip17.abi, contractAddress)
        const receipt = await kp17Contract.methods.mintWithTokenURI(this.sender, tokenId, tokenURI).send({
            from: this.sender,
            gas: '20000000',
        })
        return receipt;
    }

    transfer = async (contractAddress: string, toAddress: string, tokenId: Number) => {
        const kp17Contract = new this.caver.klay.Contract(this.caver.kct.kip17.abi, contractAddress)
        // https://github.com/klaytn/klaytn-contracts/blob/master/contracts/token/KIP17/KIP17.sol#L147
        const receipt = await kp17Contract.methods.transferFrom(this.sender, toAddress, tokenId).send({
            from: this.sender,
            gas: '20000000'
        })
        return receipt;
    }

    getTxReceipt = async (blockNum: Number) => {
        let block = await this.caver.klay.getBlock(blockNum);
        const receipts = await this.caver.klay.getBlockReceipts(block["hash"]);
        return receipts;
    }

    getLatestBlock = async () => {
        let currNetworkBlock = await this.caver.klay.getBlock("latest");
        return Number(this.caver.utils.hexToNumber(currNetworkBlock.number)) - 2; // keeping two blocks behind
    }

    getKP17Contract = (contractAddress: string) => {
        return new this.caver.contract(this.caver.kct.kip17.abi, contractAddress);
    }

    getEvents = async (contractAddress: string, blockNum: number, txHash: string) => {
        const kp17Contract = new this.caver.klay.Contract(this.caver.kct.kip17.abi, contractAddress)
        const allEvents = await kp17Contract.getPastEvents('allEvents', {
            fromBlock: blockNum,
            toBlock: blockNum
        })
        const allEventsFromTxHash = allEvents.filter((event) => { return event.address?.toLowerCase() === contractAddress && event.transactionHash === txHash });
        return allEventsFromTxHash
    }

    hexToNumber = (hex: string): number => {
        return Number(this.caver.utils.hexToNumber(hex))
    }

    getTokenUri = async (contractAddress: string, tokenId: number) => {
        const kp17Contract = new this.caver.klay.Contract(this.caver.kct.kip17.abi, contractAddress)
        return await kp17Contract.methods.tokenURI(tokenId).call()
    }
}