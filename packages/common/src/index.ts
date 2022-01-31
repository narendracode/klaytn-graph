import { DatabaseService } from './services/db.service'
import { BlockchainService } from './services/blockchain.service'
import NftDao from './daos/NFTDao'
import ContractDao from './daos/ContractDao'
import GlobalDao from './daos/GlobalDao'

const connectionConfig = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || "indexdb",
        user: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "rootpassword"
    }
}

const dbService = new DatabaseService(connectionConfig);
const nftDao = new NftDao()
const contractDao = new ContractDao()
const globalDao = new GlobalDao()

export { dbService }; // exporting raw database connection object.
export const commons = {
    klaytnService: BlockchainService,
    nftService: nftDao,
    contractService: contractDao,
    globalBlockService: globalDao
}