"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commons = exports.dbService = exports.sayHello = void 0;
const db_service_1 = require("./services/db.service");
const blockchain_service_1 = require("./services/blockchain.service");
const NFTDao_1 = __importDefault(require("./daos/NFTDao"));
const ContractDao_1 = __importDefault(require("./daos/ContractDao"));
const GlobalDao_1 = __importDefault(require("./daos/GlobalDao"));
const connectionConfig = {
    client: 'pg',
    connection: {
        host: "localhost",
        port: 5432,
        database: "indexerdb",
        user: "root",
        password: "rootpassword"
    }
};
const dbService = new db_service_1.DatabaseService(connectionConfig);
exports.dbService = dbService;
const nftDao = new NFTDao_1.default();
const contractDao = new ContractDao_1.default();
const globalDao = new GlobalDao_1.default();
const sayHello = () => {
    console.log(`Hello, hey hows it going.`);
};
exports.sayHello = sayHello;
exports.commons = {
    dbService: dbService,
    klaytnService: blockchain_service_1.BlockchainService,
    nftService: nftDao,
    contractService: contractDao,
    globalBlockService: globalDao
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBQXVEO0FBQ3ZELHNFQUFpRTtBQUNqRSwyREFBa0M7QUFDbEMscUVBQTRDO0FBQzVDLGlFQUF3QztBQUV4QyxNQUFNLGdCQUFnQixHQUFHO0lBQ3JCLE1BQU0sRUFBRSxJQUFJO0lBQ1osVUFBVSxFQUFFO1FBQ1IsSUFBSSxFQUFFLFdBQVc7UUFDakIsSUFBSSxFQUFFLElBQUk7UUFDVixRQUFRLEVBQUUsV0FBVztRQUNyQixJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxjQUFjO0tBQzNCO0NBQ0osQ0FBQTtBQUNELE1BQU0sU0FBUyxHQUFHLElBQUksNEJBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBUy9DLDhCQUFTO0FBUmxCLE1BQU0sTUFBTSxHQUFHLElBQUksZ0JBQU0sRUFBRSxDQUFBO0FBQzNCLE1BQU0sV0FBVyxHQUFHLElBQUkscUJBQVcsRUFBRSxDQUFBO0FBQ3JDLE1BQU0sU0FBUyxHQUFHLElBQUksbUJBQVMsRUFBRSxDQUFBO0FBRTFCLE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRTtJQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUE7QUFDNUMsQ0FBQyxDQUFBO0FBRlksUUFBQSxRQUFRLFlBRXBCO0FBR1ksUUFBQSxPQUFPLEdBQUc7SUFDbkIsU0FBUyxFQUFFLFNBQVM7SUFDcEIsYUFBYSxFQUFFLHNDQUFpQjtJQUNoQyxVQUFVLEVBQUUsTUFBTTtJQUNsQixlQUFlLEVBQUUsV0FBVztJQUM1QixrQkFBa0IsRUFBRSxTQUFTO0NBQ2hDLENBQUEifQ==