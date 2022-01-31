import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}

import express from 'express';
import * as http from 'http';
import winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import debug from 'debug';
import { ApolloServer } from 'apollo-server-express'
import { resolvers } from './graphql/resolvers.graphql';
import { typeDefs } from './graphql/schema.graphql';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';

const debugLog: debug.IDebugger = debug('indexer-api');
const port = 5000;
const app: express.Application = express();
const httpServer: http.Server = http.createServer(app);
app.use(express.json());
app.use(cors());

const loggerOptions: expressWinston.LoggerOptions = {
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize({ all: true })
    ),
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

const listen = async () => {
    const server: ApolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground({})
        ]
    })
    await server.start()
    server.applyMiddleware({ app })

    return new Promise((resolve, reject) => {
        /* httpServer.listen(process.env.PORT || 5000, () => {
             routes.forEach((route: CommonRoutesConfig) => {
                 debugLog(`Routes configured for ${route.getName()}`);
             });
             console.log(runningMessage);
         });
         */
        httpServer.listen(port).once('listening', resolve).once('error', reject)
    })
}

async function main() {
    try {
        await listen();
        console.log(runningMessage)
    } catch (err) {
        console.error('💀 Error starting the server', err)
    }
}

void main();