import Caver from 'caver-js';

export class BlockchainService {
    private caver: Caver;
    private sender!: string;

    constructor(networkUri: string) {
        this.caver = new Caver(networkUri);
        // this.caver = new Caver('https://api.baobab.klaytn.net:8651/');
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

    hexToNumber = (hex: string): number => {
        return Number(this.caver.utils.hexToNumber(hex))
    }

    getTokenUri = async (contractAddress: string, tokenId: number) => {
        const kp17Contract = new this.caver.klay.Contract(this.caver.kct.kip17.abi, contractAddress)
        return await kp17Contract.methods.tokenURI(tokenId).call()
    }
}