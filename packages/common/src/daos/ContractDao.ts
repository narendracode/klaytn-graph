import debug from "debug";
import { DatabaseService } from "src/services/db.service";
import { dbService } from '../index'
import { CreateContractDto, SearchContractDto } from "src/dtos/contract.dto";
import { Knex } from 'knex';

const log: debug.IDebugger = debug('app:contracts-dao');

class ContractDao {
    private dbService: DatabaseService;

    constructor() {
        this.dbService = dbService;
    }

    addContract = async (contractFields: CreateContractDto) => {
        log(`create new contract with contract fields : ${JSON.stringify(contractFields)}`)
        const res = await this.dbService.dbConn.insert(contractFields).into('contract');
        return res;
    }

    addContractTx = async (contractFields: CreateContractDto, tx: Knex.Transaction) => {
        log(`Tx create new contract with contract fields : ${JSON.stringify(contractFields)}`)
        const res = await tx('contract').insert(contractFields);
        return res;
    }

    getAllContracts = async () => {
        return await this.dbService.dbConn.select("*").from("contract");
    }

    findByContractAddress = async (contractAddress: string) => {
        log(`find contracts by contract address : ${contractAddress}`)
        return await this.dbService.dbConn.select("*").from("contract").where({ contractAddress: contractAddress });
    }

    findByContractAddressTx = async (contractAddress: string, tx: Knex.Transaction) => {
        console.log(`Tx find contracts by contract address : ${contractAddress}`)
        return await tx.select("*").from("contract").where({ contractAddress: contractAddress });
    }

    find = async (searchContractQuery: SearchContractDto) => {
        log(`find contracts by search query : ${JSON.stringify(searchContractQuery)}`)
        return await this.dbService.dbConn.select("*").from("contract").where(searchContractQuery);
    }
}

export default ContractDao;