import { DatabaseService } from './services/db.service';
import { BlockchainService } from './services/blockchain.service';
import NftDao from './daos/NFTDao';
import ContractDao from './daos/ContractDao';
import GlobalDao from './daos/GlobalDao';
import FtDao from './daos/FTDao';
declare const dbService: DatabaseService;
export { dbService };
export declare const commons: {
    klaytnService: typeof BlockchainService;
    nftService: NftDao;
    ftSservice: FtDao;
    contractService: ContractDao;
    globalBlockService: GlobalDao;
};
//# sourceMappingURL=index.d.ts.map