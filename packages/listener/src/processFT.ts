import { ContractType } from "@klaytn-graph/common/src/dtos/contract.dto"
import * as klaytnGraph from '@klaytn-graph/common'

export const addKP7Contract = async (contractAddress: string, senderAddress: string, kp7Contract: any, tx: any) => {
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
        decimals: decimals
    }
    await klaytnGraph.commons.contractService.addContractTx(contractCreationDto, tx)
}
