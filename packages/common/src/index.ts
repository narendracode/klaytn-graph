import { DatabaseService } from './services/db.service'
import { BlockchainService } from './services/blockchain.service'
import NftDao from './daos/NFTDao'
import ContractDao from './daos/ContractDao'
import GlobalDao from './daos/GlobalDao'
import FtDao from './daos/FTDao'
import { ContractType, CreateContractDto, SearchContractDto } from './dtos/contract.dto'
import { SearchNFTDto, CreateNFTDto } from './dtos/nft.dto';
import { SearchFTDto } from './dtos/ft.dto';


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
const ftDao = new FtDao()
export { dbService }; // exporting raw database connection object.
export { ContractType, CreateContractDto, SearchContractDto }
export { SearchNFTDto, CreateNFTDto }
export { SearchFTDto }
export const commons = {
    klaytnService: BlockchainService,
    nftService: nftDao,
    ftSservice: ftDao,
    contractService: contractDao,
    globalBlockService: globalDao
}