import { DatabaseService } from './services/db.service'
import { BlockchainService } from './services/blockchain.service'
import NftDao from './daos/NFTDao'
import ContractDao from './daos/ContractDao'
import GlobalDao from './daos/GlobalDao'

const connectionConfig = {
    client: 'pg',
    connection: {
        host: "localhost",
        port: 5432,
        database: "indexerdb",
        user: "root",
        password: "rootpassword"
    }
}
const dbService = new DatabaseService(connectionConfig);
const nftDao = new NftDao()
const contractDao = new ContractDao()
const globalDao = new GlobalDao()

export const sayHello = () => {
    console.log(`Hello, hey hows it going.`)
}

export { dbService };
export const commons = {
    dbService: dbService,
    klaytnService: BlockchainService,
    nftService: nftDao,
    contractService: contractDao,
    globalBlockService: globalDao
}