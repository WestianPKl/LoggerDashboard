import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model for the 'adm_access_level_definition' table.
 *
 * Represents an access level definition with the following fields:
 * - id: Primary key, auto-incremented integer.
 * - name: Name of the access level (string, required).
 * - accessLevel: Numeric value representing the access level (integer, required).
 *
 * @typedef {Object} AccessLevelDefinition
 * @property {number} id - Unique identifier for the access level definition.
 * @property {string} name - Name of the access level.
 * @property {number} accessLevel - Numeric value of the access level.
 */
const AccessLevelDefinition = sequelize.define(
    'adm_functionality_definition',
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
        accessLevel: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'access_level',
        },
    },
    {
        timestamps: false,
        tableName: 'adm_access_level_definition',
    }
)

export default AccessLevelDefinition
