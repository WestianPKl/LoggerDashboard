import { Sequelize } from 'sequelize'
import 'dotenv/config'

let DB = process.env.DB_DEV || ''
let DB_USER = process.env.DBUSER_DEV || ''
let DB_PASSWORD = process.env.DBPASSWORD_DEV || ''
let DB_HOST = process.env.DBHOST_DEV || 'localhost'
let DB_PORT = process.env.DBPORT_DEV || 3306

if (process.env.NODE_ENV === 'production') {
    DB = process.env.DB_PROD || ''
    DB_USER = process.env.DBUSER_PROD || ''
    DB_PASSWORD = process.env.DBPASSWORD_PROD || ''
    DB_HOST = process.env.DBHOST_PROD || 'localhost'
    DB_PORT = process.env.DBPORT_PROD || 3306
}

/**
 * Initializes a Sequelize instance for connecting to a MySQL database.
 *
 * @constant
 * @type {Sequelize}
 * @param {string} DB - The name of the database.
 * @param {string} DB_USER - The database user.
 * @param {string} DB_PASSWORD - The database user's password.
 * @param {Object} options - Additional Sequelize configuration options.
 * @param {string} options.host - The database host.
 * @param {number} options.port - The database port.
 * @param {string} options.dialect - The SQL dialect to use (e.g., 'mysql').
 * @param {Object} options.pool - Connection pool settings.
 * @param {number} options.pool.max - Maximum number of connections in pool.
 * @param {number} options.pool.min - Minimum number of connections in pool.
 * @param {number} options.pool.idle - Maximum time, in milliseconds, that a connection can be idle before being released.
 * @param {boolean} options.logging - Enables or disables SQL query logging.
 * @param {Object} options.dialectOptions - Additional options for the SQL dialect.
 * @param {string} options.dialectOptions.timezone - The timezone used when writing to the database.
 */
const sequelize = new Sequelize(DB, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    pool: {
        max: 90,
        min: 0,
        idle: 10000,
    },
    logging: process.env.NODE_ENV !== 'production',
    dialectOptions: {
        timezone: 'Z',
    },
    logging: false,
})

export default sequelize
