// Update with your config settings.
// import dotenv from 'dotenv';
// const dotenvResult = dotenv.config();
// if (dotenvResult.error) {
//   throw dotenvResult.error;
// }
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

const pgLocal = {
  host: 'localhost',
  port: 5432,
  database: 'indexerdb',
  user: 'root',
  password: 'rootpassword'
}

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host: pgLocal.host,
      port: pgLocal.port,
      database: pgLocal.database,
      user: pgLocal.user,
      password: pgLocal.password
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './data/migrations'
    },
    seeds: {
      directory: './data/seeds'
    }
  },

  staging: {
    client: 'pg',
    connection: {
      database: 'indexerdb',
      user: 'root',
      password: 'rootpassword'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
