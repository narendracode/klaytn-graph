import debug from "debug";
import { Knex } from 'knex';
import { DatabaseService } from "src/services/db.service";
import { dbService } from '../index'
import { CreateFTDto, UpdateFTBalanceDto, SearchFTDto, SearchFTHistoryDto } from "src/dtos/ft.dto";
import BigNumber from "bignumber.js";
const log: debug.IDebugger = debug('app:nft-dao');

const OX_ADDRESS = "0x0000000000000000000000000000000000000000"

class FtDao {
    private dbService: DatabaseService;

    constructor() {
        this.dbService = dbService;
    }

    addFT = async (ftFields: CreateFTDto) => {
        log(`create FT entry for mint: ${JSON.stringify(ftFields)}`)

        await this.dbService.dbConn.table('ft_history').insert({
            contractAddress: ftFields.contractAddress.toLowerCase(),
            from: OX_ADDRESS,
            to: ftFields.ownerAddress,
            amount: ftFields.amount,
            txhash: ftFields.txhash
        }).into('ft_history')

        return await this.dbService.dbConn
            .insert({
                contractAddress: ftFields.contractAddress,
                ownerAddress: ftFields.ownerAddress,
                amount: ftFields.amount,
                last_txhash: ftFields.txhash
            })
            .into('ft');
    }

    addFTTx = async (ftFields: CreateFTDto, tx: Knex.Transaction) => {
        log(`create FT entry for mint tx: ${JSON.stringify(ftFields)}`)
        await tx.insert({
            contractAddress: ftFields.contractAddress.toLowerCase(),
            from: OX_ADDRESS,
            to: ftFields.ownerAddress,
            amount: ftFields.amount,
            txhash: ftFields.txhash
        }).into('ft_history')

        return await tx
            .insert({
                contractAddress: ftFields.contractAddress,
                ownerAddress: ftFields.ownerAddress,
                amount: ftFields.amount,
                last_txhash: ftFields.txhash
            })
            .into('ft');
    }

    updateFTBalance = async (ftFields: UpdateFTBalanceDto) => {
        log(`update ft balance for contractAddress : ${ftFields.contractAddress} , from : ${ftFields.from} , to : ${ftFields.to} , amount : ${ftFields.amount}`)
        await this.dbService.dbConn.from('ft')
            .where({ ownerAddress: ftFields.from.toLowerCase() })
            .decrement("amount", ftFields.amount)

        await this.dbService.dbConn.from('ft')
            .where({ ownerAddress: ftFields.from.toLowerCase() })
            .update({ last_txhash: ftFields.txhash })

        // checking if to address exists in DB
        const findToAddr = await this.dbService.dbConn
            .select("*")
            .from("ft")
            .where({ ownerAddress: ftFields.to.toLowerCase() });

        if (findToAddr && findToAddr.length > 0) {
            // to already exists in db
            await this.dbService.dbConn.from('ft')
                .where({ ownerAddress: ftFields.to.toLowerCase() })
                .increment("amount", ftFields.amount)
        } else {
            // to does not exist, add new entry
            await this.dbService.dbConn
                .insert({
                    contractAddress: ftFields.contractAddress,
                    ownerAddress: ftFields.to.toLowerCase(),
                    amount: ftFields.amount
                })
                .into('ft');
        }
        await this.dbService.dbConn.from('ft')
            .where({ ownerAddress: ftFields.to.toLowerCase() })
            .update({ last_txhash: ftFields.txhash })

        return await this.dbService.dbConn.table('ft_history').insert(
            ftFields
        ).into('ft_history')
    }

    updateFTBalanceTx = async (ftFields: UpdateFTBalanceDto, tx: Knex.Transaction) => {
        log(`update ft balance for contractAddress : ${ftFields.contractAddress} , from : ${ftFields.from} , to : ${ftFields.to} , amount : ${ftFields.amount}`)
        await tx.from('ft')
            .where({ ownerAddress: ftFields.from.toLowerCase() })
            .decrement("amount", ftFields.amount)

        await tx.from('ft')
            .where({ ownerAddress: ftFields.from.toLowerCase() })
            .update({ last_txhash: ftFields.txhash })

        // checking if to address exists in DB
        const findToAddr = await tx
            .select("*")
            .from("ft")
            .where({ ownerAddress: ftFields.to.toLowerCase() });

        if (findToAddr && findToAddr.length > 0) {
            // to already exists in db
            await tx.from('ft')
                .where({ ownerAddress: ftFields.to.toLowerCase() })
                .increment("amount", ftFields.amount)
        } else {
            // to does not exist, add new entry
            await tx
                .insert({
                    contractAddress: ftFields.contractAddress,
                    ownerAddress: ftFields.to.toLowerCase(),
                    amount: ftFields.amount
                })
                .into('ft');
        }
        await tx.from('ft')
            .where({ ownerAddress: ftFields.to.toLowerCase() })
            .update({ last_txhash: ftFields.txhash })

        return await tx.insert(ftFields)
            .into('ft_history')
    }

    getBalance = async (searchFTQuery: SearchFTDto) => {
        log(`get Balance search query : ${JSON.stringify(searchFTQuery)}`)
        return await this.dbService.dbConn
            .select("*")
            .from("ft")
            .where(searchFTQuery);
    }

    getHistory = async (contractAddress: string) => {
        log(`get ft history by contract address : ${contractAddress}`)
        let query: SearchFTHistoryDto = {

        }
        if (contractAddress && contractAddress.length) {
            query.contractAddress = contractAddress
        }

        return await this.dbService.dbConn
            .select("*")
            .from("ft_history")
            .where(query);
    }

    getBalanceTx = async (searchFTQuery: SearchFTDto, tx: Knex.Transaction) => {
        log(`get Balance search query Tx: ${JSON.stringify(searchFTQuery)}`)
        return await tx
            .select("*")
            .from("ft")
            .where(searchFTQuery);
    }

}

export default FtDao;