import knex from "knex";
import knexfile from '../knexfile'

const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env]

module.exports = knex(configOptions)