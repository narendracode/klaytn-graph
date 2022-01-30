import debug from "debug";
import { DatabaseService } from "src/services/db.service";
import { dbService } from '../index'
import { CreateContractDto, SearchContractDto } from "src/dtos/contract.dto";

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

    getAllContracts = async () => {
        return await this.dbService.dbConn.select("*").from("contract");
    }

    findByContractAddress = async (contractAddress: string) => {
        log(`find contracts by contract address : ${contractAddress}`)
        return await this.dbService.dbConn.select("*").from("contract").where({ contractAddress: contractAddress });
    }

    find = async (searchContractQuery: SearchContractDto) => {
        log(`find contracts by search query : ${JSON.stringify(searchContractQuery)}`)
        return await this.dbService.dbConn.select("*").from("contract").where(searchContractQuery);
    }
}

export default ContractDao;