import debug from "debug";
import knex, { Knex } from 'knex';
import { ConnectionConfig } from "src/types/db.types";

const log: debug.IDebugger = debug('app:database-service');

export class DatabaseService {
    private knexDbConn: Knex;

    constructor(connectionConfig: ConnectionConfig) {
        this.knexDbConn = knex({
            client: connectionConfig.client,
            connection: {
                user: connectionConfig.connection.user,
                host: connectionConfig.connection.host,
                port: connectionConfig.connection.port,
                database: connectionConfig.connection.database,
                password: connectionConfig.connection.password
            }
        });
        log(`knex db connection object created with config : ${JSON.stringify(connectionConfig)}`)
    }

    get dbConn() {
        return this.knexDbConn;
    }
}
