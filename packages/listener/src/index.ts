import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}

import * as klaytnGraph from '@klaytn-graph/common'
import { dbService } from '@klaytn-graph/common';
import { TransactionReceipt } from 'caver-js';
import { interfaceIds } from './util'
import { addKP7Contract, transferFT } from './processFT'
import { addKP17Contract, transferNFT } from './processNFT';

const klaytnSrvc = new klaytnGraph.commons.klaytnService(String(process.env.NETWORK_URL));

const processContractCreation = async (receipt: TransactionReceipt, tx: any) => {
    const contractAddress = receipt["contractAddress"];
    const txHash = receipt["transactionHash"]

    const senderAddress = receipt["from"].toLowerCase()
    const kp17Contract = klaytnSrvc.getKP17Contract(contractAddress);
    const kp7Contract = klaytnSrvc.getKP7Contract(contractAddress);
    let isKP17 = false;
    let isIKIP17Metadata = false;
    let isIKIP17Enumerable = false;
    let isKP7 = false;
    try {
        isKP17 = await kp17Contract.methods.supportsInterface(interfaceIds.kip17.IKIP17).call();
        isIKIP17Metadata = await kp17Contract.methods.supportsInterface(interfaceIds.kip17.IKIP17Metadata).call();
        isIKIP17Enumerable = await kp17Contract.methods.supportsInterface(interfaceIds.kip17.IKIP17Enumerable).call();
        isKP7 = await kp7Contract.methods.supportsInterface(interfaceIds.kip7.IKIP7).call();
    } catch (err) {
        console.log(`Error encounted while checking supportedInterface in contract with Address ${contractAddress}, possibly it is some custom contract.`)
    }

    if (isKP17 && isIKIP17Metadata && isIKIP17Enumerable) {
        await addKP17Contract(contractAddress, senderAddress, kp17Contract, txHash, tx)
    } else if (isKP7) {
        await addKP7Contract(contractAddress, senderAddress, kp7Contract, txHash, tx)

        // process events
        const blkNum = klaytnSrvc.hexToNumber(receipt["blockNumber"])
        const contractType = "ft";
        let ownerAddress = receipt["from"]
        const allEvents = await klaytnSrvc.getEvents(contractAddress, blkNum, txHash, contractType);
        for (let index = 0; index < allEvents.length; index++) {
            const event = allEvents[index];
            const eventName = event.event;
            console.log(`processing event ${eventName} for txHash ${txHash}`)
            switch (eventName) {
                case "Transfer": {
                    await transferFT(contractAddress, ownerAddress, event, txHash, tx)
                    break;
                }
                default: {
                    console.log(`Event ${eventName} is not in use. Ignore.`)
                }
            }
        }
    }
    else {
        // just ignoring other type of contracts for now.
    }
}

const processContractFunctionExecution = async (receipt: TransactionReceipt, tx: any) => {
    let txHash = receipt["transactionHash"]
    let ownerAddress = receipt["from"]
    let contractAddress = receipt["to"] ? receipt["to"].toLowerCase() : ""; //

    // check if contractAddress is something which is supposed to be tracked.
    console.log(`Checking contract exists for address : ${contractAddress}`)
    const existingContracts = await klaytnGraph.commons.contractService.findByContractAddressTx(contractAddress.toLowerCase(), tx)

    const isExistingContract = (existingContracts && existingContracts.length && existingContracts.length > 0)
    if (isExistingContract) {
        const blkNum = klaytnSrvc.hexToNumber(receipt["blockNumber"])
        const contractType = existingContracts[0].type;
        const allEvents = await klaytnSrvc.getEvents(contractAddress, blkNum, txHash, contractType);
        for (let index = 0; index < allEvents.length; index++) {
            const event = allEvents[index];
            const eventName = event.event;
            console.log(`processing event ${eventName} for txHash ${txHash}`)
            switch (eventName) {
                case "Transfer": {
                    await transferToken(contractAddress, ownerAddress, contractType, event, txHash, tx)
                    break;
                }
                default: {
                    console.log(`Event ${eventName} is not in use. Ignore.`)
                }
            }
        }
    }
}

const transferToken = async (contractAddress: string, ownerAddress: string, contractType: string, event: any, txhash: string, tx: any) => {
    if (contractType === 'ft') {
        await transferFT(contractAddress, ownerAddress, event, txhash, tx)
    } else {
        await transferNFT(contractAddress, ownerAddress, event, txhash, tx)
    }
}

const processBlockTx = async (blockNum: number, tx: any) => {
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
            await processContractCreation(receipt, tx)
        } else {
            await processContractFunctionExecution(receipt, tx)
        }
    }
}

const indexBlocks = async () => {
    const latestBlkInNwk = await klaytnSrvc.getLatestBlock();
    const currBlockInDB = await klaytnGraph.commons.globalBlockService.getCurrentBlock()
    console.log(`latestBlockInNetwork : ${latestBlkInNwk}, currBlockInDB : ${currBlockInDB}`)

    const nextBlockInDB = currBlockInDB + 1;
    if (nextBlockInDB <= latestBlkInNwk) {
        const tx = await dbService.dbConn.transaction();
        try {
            await processBlockTx(nextBlockInDB, tx);
            await klaytnGraph.commons.globalBlockService.incrementBlockTx(tx)
            await tx.commit()
        } catch (err) {
            console.error(`error encountered while procesing blocks : ${err}`)
            tx.rollback()
        }
    } else {
        console.log(`Latest block in network ${latestBlkInNwk}, current block in DB is ${currBlockInDB}. Waiting for new block to be generated in network.`)
    }

}

const delay = (time: number) => new Promise(res => setTimeout(res, time));
(async () => {
    while (true) {
        //running it in infinite loop like mad
        try {
            console.log(`start running`)
            await indexBlocks();
            console.log(`completed`)
            await delay(500) // sleep for half second.
        } catch (error) {
            console.log(`Error encountered : ${error}`)
        }
    }
    // klaytn generates new block every one second it seems hence it makes sense to run this every 0.5 seconds
})();