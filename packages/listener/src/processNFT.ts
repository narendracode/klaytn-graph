import { ContractType } from "@klaytn-graph/common/src/dtos/contract.dto"
import * as klaytnGraph from '@klaytn-graph/common'

export const addKP17Contract = async (contractAddress: string, senderAddress: string, kp17Contract: any, tx: any) => {
    const name = await kp17Contract.methods.name().call();
    const symbol = await kp17Contract.methods.symbol().call();
    const contractCreationDto = {
        contractAddress: contractAddress,
        deployerAddress: senderAddress,
        name: name,
        symbol: symbol,
        type: ContractType.NFT
    }
    await klaytnGraph.commons.contractService.addContractTx(contractCreationDto, tx)
}