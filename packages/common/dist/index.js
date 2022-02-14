"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commons = exports.ContractType = exports.dbService = void 0;
const db_service_1 = require("./services/db.service");
const blockchain_service_1 = require("./services/blockchain.service");
const NFTDao_1 = __importDefault(require("./daos/NFTDao"));
const ContractDao_1 = __importDefault(require("./daos/ContractDao"));
const GlobalDao_1 = __importDefault(require("./daos/GlobalDao"));
const FTDao_1 = __importDefault(require("./daos/FTDao"));
const contract_dto_1 = require("./dtos/contract.dto");
Object.defineProperty(exports, "ContractType", { enumerable: true, get: function () { return contract_dto_1.ContractType; } });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBQXVEO0FBQ3ZELHNFQUFpRTtBQUNqRSwyREFBa0M7QUFDbEMscUVBQTRDO0FBQzVDLGlFQUF3QztBQUN4Qyx5REFBZ0M7QUFDaEMsc0RBQXdGO0FBc0IvRSw2RkF0QkEsMkJBQVksT0FzQkE7QUFqQnJCLE1BQU0sZ0JBQWdCLEdBQUc7SUFDckIsTUFBTSxFQUFFLElBQUk7SUFDWixVQUFVLEVBQUU7UUFDUixJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksV0FBVztRQUN4QyxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSTtRQUN6QyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksU0FBUztRQUMxQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksTUFBTTtRQUN2QyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksY0FBYztLQUN0RDtDQUNKLENBQUE7QUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLDRCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUsvQyw4QkFBUztBQUpsQixNQUFNLE1BQU0sR0FBRyxJQUFJLGdCQUFNLEVBQUUsQ0FBQTtBQUMzQixNQUFNLFdBQVcsR0FBRyxJQUFJLHFCQUFXLEVBQUUsQ0FBQTtBQUNyQyxNQUFNLFNBQVMsR0FBRyxJQUFJLG1CQUFTLEVBQUUsQ0FBQTtBQUNqQyxNQUFNLEtBQUssR0FBRyxJQUFJLGVBQUssRUFBRSxDQUFBO0FBS1osUUFBQSxPQUFPLEdBQUc7SUFDbkIsYUFBYSxFQUFFLHNDQUFpQjtJQUNoQyxVQUFVLEVBQUUsTUFBTTtJQUNsQixVQUFVLEVBQUUsS0FBSztJQUNqQixlQUFlLEVBQUUsV0FBVztJQUM1QixrQkFBa0IsRUFBRSxTQUFTO0NBQ2hDLENBQUEifQ==