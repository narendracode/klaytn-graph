import { DatabaseService } from './services/db.service';
import { BlockchainService } from './services/blockchain.service';
import NftDao from './daos/NFTDao';
import ContractDao from './daos/ContractDao';
import GlobalDao from './daos/GlobalDao';
declare const dbService: DatabaseService;
export declare const sayHello: () => void;
export { dbService };
export declare const commons: {
    dbService: DatabaseService;
    klaytnService: typeof BlockchainService;
    nftService: NftDao;
    contractService: ContractDao;
    globalBlockService: GlobalDao;
};
//# sourceMappingURL=index.d.ts.map