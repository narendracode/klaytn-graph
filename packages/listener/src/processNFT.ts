import { ContractType } from "@klaytn-graph/common"
import * as klaytnGraph from '@klaytn-graph/common'
const OX_ADDRESS = "0x0000000000000000000000000000000000000000"
const klaytnSrvc = new klaytnGraph.commons.klaytnService(String(process.env.NETWORK_URL));

export const addKP17Contract = async (contractAddress: string, senderAddress: string, kp17Contract: any, txhash: string, tx: any) => {
    const name = await kp17Contract.methods.name().call();
    const symbol = await kp17Contract.methods.symbol().call();
    const contractCreationDto = {
        contractAddress: contractAddress,
        deployerAddress: senderAddress,
        name: name,
        symbol: symbol,
        type: ContractType.NFT,
        txhash: txhash
    }
    await klaytnGraph.commons.contractService.addContractTx(contractCreationDto, tx)
}

export const transferNFT = async (contractAddress: string, ownerAddress: string, event: any, txhash: string, tx: any) => {
    const eventValues = event.returnValues ? event.returnValues : {};
    const from = eventValues.from;
    const to = eventValues.to;
    const tokenId = eventValues.tokenId
    if (from && from.length && to && to.length && tokenId && tokenId.length) {
        if (from === OX_ADDRESS) {
            // token minted
            const tokenUri = await klaytnSrvc.getTokenUri(contractAddress.toLowerCase(), Number(tokenId))
            await klaytnGraph.commons.nftService.addNFTTx({
                contractAddress: contractAddress.toLowerCase(),
                ownerAddress: ownerAddress.toLowerCase(),
                tokenId: Number(tokenId),
                tokenUri: tokenUri,
                price: -1
            }, tx)
            console.log(`token minted with tokenId ${tokenId} in contract ${contractAddress.toLowerCase()}`)
        } else {
            // token transferred
            await klaytnGraph.commons.nftService.updateNFTOwnerTx({
                nextOwnerAddress: to.toLowerCase(),
                contractAddress: contractAddress.toLowerCase(),
                tokenId: Number(tokenId),
                currentOwnerAddress: from.toLowerCase()
            }, tx)
            console.log(`token with tokenId ${tokenId} in contract ${contractAddress} transferred from ${from.toLowerCase()} to ${to.toLowerCase()}`)
        }
    }
}