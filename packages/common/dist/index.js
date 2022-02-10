"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commons = exports.dbService = void 0;
const db_service_1 = require("./services/db.service");
const blockchain_service_1 = require("./services/blockchain.service");
const NFTDao_1 = __importDefault(require("./daos/NFTDao"));
const ContractDao_1 = __importDefault(require("./daos/ContractDao"));
const GlobalDao_1 = __importDefault(require("./daos/GlobalDao"));
const FTDao_1 = __importDefault(require("./daos/FTDao"));
const connectionConfig = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || "indexdb",
        user: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "rootpassword"
    }
};
const dbService = new db_service_1.DatabaseService(connectionConfig);
exports.dbService = dbService;
const nftDao = new NFTDao_1.default();
const contractDao = new ContractDao_1.default();
const globalDao = new GlobalDao_1.default();
const ftDao = new FTDao_1.default();
exports.commons = {
    klaytnService: blockchain_service_1.BlockchainService,
    nftService: nftDao,
    ftSservice: ftDao,
    contractService: contractDao,
    globalBlockService: globalDao
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBQXVEO0FBQ3ZELHNFQUFpRTtBQUNqRSwyREFBa0M7QUFDbEMscUVBQTRDO0FBQzVDLGlFQUF3QztBQUN4Qyx5REFBZ0M7QUFFaEMsTUFBTSxnQkFBZ0IsR0FBRztJQUNyQixNQUFNLEVBQUUsSUFBSTtJQUNaLFVBQVUsRUFBRTtRQUNSLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxXQUFXO1FBQ3hDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJO1FBQ3pDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxTQUFTO1FBQzFDLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxNQUFNO1FBQ3ZDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxjQUFjO0tBQ3REO0NBQ0osQ0FBQTtBQUVELE1BQU0sU0FBUyxHQUFHLElBQUksNEJBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBSy9DLDhCQUFTO0FBSmxCLE1BQU0sTUFBTSxHQUFHLElBQUksZ0JBQU0sRUFBRSxDQUFBO0FBQzNCLE1BQU0sV0FBVyxHQUFHLElBQUkscUJBQVcsRUFBRSxDQUFBO0FBQ3JDLE1BQU0sU0FBUyxHQUFHLElBQUksbUJBQVMsRUFBRSxDQUFBO0FBQ2pDLE1BQU0sS0FBSyxHQUFHLElBQUksZUFBSyxFQUFFLENBQUE7QUFFWixRQUFBLE9BQU8sR0FBRztJQUNuQixhQUFhLEVBQUUsc0NBQWlCO0lBQ2hDLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFVBQVUsRUFBRSxLQUFLO0lBQ2pCLGVBQWUsRUFBRSxXQUFXO0lBQzVCLGtCQUFrQixFQUFFLFNBQVM7Q0FDaEMsQ0FBQSJ9