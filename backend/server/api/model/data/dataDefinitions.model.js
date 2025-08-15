import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model for the 'data_definitions' table.
 *
 * @typedef {Object} DataDefinitions
 * @property {number} id - Primary key, auto-incremented integer.
 * @property {string} name - Name of the data definition.
 * @property {string} unit - Unit associated with the data definition.
 * @property {string} description - Description of the data definition.
 * @property {Date} [createdAt] - Timestamp when the record was created.
 * @property {Date} [updatedAt] - Timestamp when the record was last updated.
 */
const DataDefinitions = sequelize.define(
    'data_definitions',
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
        unit: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'unit',
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'description',
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: 'created_at',
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: 'updated_at',
        },
    },
    {
        timestamps: true,
        underscored: true,
        tableName: 'data_definitions',
    }
)

export default DataDefinitions
