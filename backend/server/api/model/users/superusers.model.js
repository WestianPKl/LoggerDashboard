import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model definition for the 'superusers' table.
 *
 * Represents superuser records with the following fields:
 * - id: Primary key, auto-incremented integer.
 * - userId: String identifier for the user, mapped to the 'user_id' column.
 *
 * @typedef {Object} SuperUsers
 * @property {number} id - Primary key, auto-incremented.
 * @property {string} userId - User identifier, mapped to 'user_id'.
 *
 * @see {@link https://sequelize.org/master/manual/model-basics.html|Sequelize Model Basics}
 */
const SuperUsers = sequelize.define(
    'superusers',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'user_id',
        },
    },
    {
        timestamps: false,
        tableName: 'superusers',
    }
)

export default SuperUsers
