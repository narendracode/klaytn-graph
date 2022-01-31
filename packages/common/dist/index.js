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
exports.commons = {
    klaytnService: blockchain_service_1.BlockchainService,
    nftService: nftDao,
    contractService: contractDao,
    globalBlockService: globalDao
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBQXVEO0FBQ3ZELHNFQUFpRTtBQUNqRSwyREFBa0M7QUFDbEMscUVBQTRDO0FBQzVDLGlFQUF3QztBQUV4QyxNQUFNLGdCQUFnQixHQUFHO0lBQ3JCLE1BQU0sRUFBRSxJQUFJO0lBQ1osVUFBVSxFQUFFO1FBQ1IsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLFdBQVc7UUFDeEMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUk7UUFDekMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLFNBQVM7UUFDMUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLE1BQU07UUFDdkMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLGNBQWM7S0FDdEQ7Q0FDSixDQUFBO0FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSw0QkFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFLL0MsOEJBQVM7QUFKbEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQkFBTSxFQUFFLENBQUE7QUFDM0IsTUFBTSxXQUFXLEdBQUcsSUFBSSxxQkFBVyxFQUFFLENBQUE7QUFDckMsTUFBTSxTQUFTLEdBQUcsSUFBSSxtQkFBUyxFQUFFLENBQUE7QUFHcEIsUUFBQSxPQUFPLEdBQUc7SUFDbkIsYUFBYSxFQUFFLHNDQUFpQjtJQUNoQyxVQUFVLEVBQUUsTUFBTTtJQUNsQixlQUFlLEVBQUUsV0FBVztJQUM1QixrQkFBa0IsRUFBRSxTQUFTO0NBQ2hDLENBQUEifQ==