import debug from "debug";
import { Knex } from 'knex';
import { DatabaseService } from "src/services/db.service";
import { dbService } from '../index'

const log: debug.IDebugger = debug('app:global-dao');

class GlobalDao {
    private dbService: DatabaseService;

    constructor() {
        this.dbService = dbService;
    }

    getCurrentBlock = async () => {
        log(`getting last synced block from database`)
        const dbBlock = await this.dbService.dbConn.select("*").from("global").limit(1);
        if (dbBlock === null || dbBlock === undefined) {
            throw Error('Could not find block from ')
        }
        return Number(dbBlock[0].block)
    }

    incrementBlock = async () => {
        log(`increment block in DB`);
        const incBlockRes = await this.dbService.dbConn.from('global').increment("block", 1);
        return incBlockRes;
    }

    incrementBlockTx = async (tx: Knex.Transaction) => {
        log(`Tx increment block in DB`);
        const incBlockRes = await tx.from('global').increment("block", 1);
        return incBlockRes;
    }

    setBlock = async (block: number) => {
        log(`set current block to ${block}`)
        return this.dbService.dbConn.from('global').update({ block: block });
    }

    setBlockTx = async (block: number, tx: Knex.Transaction) => {
        log(`Tx set current block to ${block}`)
        return tx.from('global').update({ block: block });
    }
}

export default GlobalDao;