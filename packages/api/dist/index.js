"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const dotenvResult = dotenv_1.default.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const winston_1 = __importDefault(require("winston"));
const expressWinston = __importStar(require("express-winston"));
const cors_1 = __importDefault(require("cors"));
const debug_1 = __importDefault(require("debug"));
const apollo_server_express_1 = require("apollo-server-express");
const resolvers_graphql_1 = require("./graphql/resolvers.graphql");
const schema_graphql_1 = require("./graphql/schema.graphql");
const apollo_server_core_1 = require("apollo-server-core");
const debugLog = (0, debug_1.default)('indexer-api');
const port = 5000;
const app = (0, express_1.default)();
const httpServer = http.createServer(app);
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const loggerOptions = {
    transports: [new winston_1.default.transports.Console()],
    format: winston_1.default.format.combine(winston_1.default.format.json(), winston_1.default.format.prettyPrint(), winston_1.default.format.colorize({ all: true })),
};
if (!process.env.DEBUG) {
    loggerOptions.meta = false; // when not debugging, make terse
    //if (typeof global.it === 'function') {
    //  loggerOptions.level = 'http'; // for non-debug test runs, squelch entirely
    //}
}
app.use(expressWinston.logger(loggerOptions));
const runningMessage = `🚀 Server is ready at port : ${process.env.PORT || port}`;
/*
app.get('/ping', (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage);
}*/
const listen = () => __awaiter(void 0, void 0, void 0, function* () {
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs: schema_graphql_1.typeDefs,
        resolvers: resolvers_graphql_1.resolvers,
        plugins: [
            (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)({})
        ]
    });
    yield server.start();
    server.applyMiddleware({ app });
    return new Promise((resolve, reject) => {
        /* httpServer.listen(process.env.PORT || 5000, () => {
             routes.forEach((route: CommonRoutesConfig) => {
                 debugLog(`Routes configured for ${route.getName()}`);
             });
             console.log(runningMessage);
         });
         */
        httpServer.listen(port).once('listening', resolve).once('error', reject);
    });
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield listen();
            console.log(runningMessage);
        }
        catch (err) {
            console.error('💀 Error starting the server', err);
        }
    });
}
void main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQTRCO0FBQzVCLE1BQU0sWUFBWSxHQUFHLGdCQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDckMsSUFBSSxZQUFZLENBQUMsS0FBSyxFQUFFO0lBQ3BCLE1BQU0sWUFBWSxDQUFDLEtBQUssQ0FBQztDQUM1QjtBQUVELHNEQUE4QjtBQUM5QiwyQ0FBNkI7QUFDN0Isc0RBQThCO0FBQzlCLGdFQUFrRDtBQUNsRCxnREFBd0I7QUFDeEIsa0RBQTBCO0FBQzFCLGlFQUFvRDtBQUNwRCxtRUFBd0Q7QUFDeEQsNkRBQW9EO0FBQ3BELDJEQUFvRjtBQUVwRixNQUFNLFFBQVEsR0FBb0IsSUFBQSxlQUFLLEVBQUMsYUFBYSxDQUFDLENBQUM7QUFDdkQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLE1BQU0sR0FBRyxHQUF3QixJQUFBLGlCQUFPLEdBQUUsQ0FBQztBQUMzQyxNQUFNLFVBQVUsR0FBZ0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2RCxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUN4QixHQUFHLENBQUMsR0FBRyxDQUFDLElBQUEsY0FBSSxHQUFFLENBQUMsQ0FBQztBQUVoQixNQUFNLGFBQWEsR0FBaUM7SUFDaEQsVUFBVSxFQUFFLENBQUMsSUFBSSxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM5QyxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUMxQixpQkFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFDckIsaUJBQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQzVCLGlCQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUN6QztDQUNKLENBQUM7QUFFRixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUU7SUFDcEIsYUFBYSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxpQ0FBaUM7SUFDN0Qsd0NBQXdDO0lBQ3hDLDhFQUE4RTtJQUM5RSxHQUFHO0NBQ047QUFDRCxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUM5QyxNQUFNLGNBQWMsR0FBRyxnQ0FBZ0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7QUFDbEY7OztHQUdHO0FBRUgsTUFBTSxNQUFNLEdBQUcsR0FBUyxFQUFFO0lBQ3RCLE1BQU0sTUFBTSxHQUFpQixJQUFJLG9DQUFZLENBQUM7UUFDMUMsUUFBUSxFQUFSLHlCQUFRO1FBQ1IsU0FBUyxFQUFULDZCQUFTO1FBQ1QsT0FBTyxFQUFFO1lBQ0wsSUFBQSxtRUFBOEMsRUFBQyxFQUFFLENBQUM7U0FDckQ7S0FDSixDQUFDLENBQUE7SUFDRixNQUFNLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUNwQixNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUUvQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25DOzs7Ozs7V0FNRztRQUNILFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQzVFLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFBLENBQUE7QUFFRCxTQUFlLElBQUk7O1FBQ2YsSUFBSTtZQUNBLE1BQU0sTUFBTSxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO1NBQzlCO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLEdBQUcsQ0FBQyxDQUFBO1NBQ3JEO0lBQ0wsQ0FBQztDQUFBO0FBRUQsS0FBSyxJQUFJLEVBQUUsQ0FBQyJ9