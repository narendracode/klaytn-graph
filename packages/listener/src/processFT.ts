import { ContractType } from "@klaytn-graph/common"
import * as klaytnGraph from '@klaytn-graph/common'
const OX_ADDRESS = "0x0000000000000000000000000000000000000000"

export const addKP7Contract = async (contractAddress: string, senderAddress: string, kp7Contract: any, txhash: string, tx: any) => {
    const name = await kp7Contract.methods.name().call();
    const symbol = await kp7Contract.methods.symbol().call();
    const totalSupply = await kp7Contract.methods.totalSupply().call();
    const decimals = await kp7Contract.methods.decimals().call();
    const contractCreationDto = {
        contractAddress: contractAddress,
        deployerAddress: senderAddress,
        name: name,
        symbol: symbol,
        type: ContractType.FT,
        totalSupply: totalSupply,
        decimals: decimals,
        txhash: txhash
    }
    await klaytnGraph.commons.contractService.addContractTx(contractCreationDto, tx)
}

export const transferFT = async (contractAddress: string, ownerAddress: string, event: any, txhash: string, tx: any) => {
    const eventValues = event.returnValues ? event.returnValues : {};
    const from = eventValues.from.toLowerCase();
    const to = eventValues.to.toLowerCase();
    const value = eventValues.value
    console.log(`from : ${from} , to : ${to}, value : ${value}`)
    if (from && from.length && to && to.length && value && value.length) {
        if (from === OX_ADDRESS) {
            console.log(`tokens minted`)
            await klaytnGraph.commons.ftSservice.addFTTx({
                contractAddress: contractAddress.toLowerCase(),
                ownerAddress: ownerAddress.toLowerCase(),
                amount: value,
                txhash: txhash
            }, tx)
            console.log(`tokens minted in contract ${contractAddress.toLowerCase()} with initial supply of ${value} to ${to}`)
        } else {
            console.log(`tokens transferred`)
            await klaytnGraph.commons.ftSservice.updateFTBalanceTx({
                contractAddress: contractAddress.toLowerCase(),
                from: from,
                to: to,
                amount: value,
                txhash: txhash
            }, tx)
            console.log(`transferred tokens in contract ${contractAddress.toLowerCase()} from : ${from} to : ${to} with amount ${value}`)
        }
    }
}