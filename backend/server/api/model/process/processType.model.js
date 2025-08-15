import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model definition for the 'process_type' table.
 *
 * @typedef {Object} ProcessType
 * @property {number} id - Primary key, auto-incremented integer.
 * @property {string} name - Name of the process type.
 *
 * @see {@link https://sequelize.org/master/manual/model-basics.html Sequelize Model Basics}
 */
const ProcessType = sequelize.define(
    'process_type',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'name',
        },
    },
    {
        timestamps: false,
        tableName: 'process_type',
    }
)

export default ProcessType
