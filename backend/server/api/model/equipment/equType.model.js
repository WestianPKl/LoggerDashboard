import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model definition for the 'equ_type' table.
 *
 * Represents an equipment type with the following fields:
 * - id: Primary key, auto-incremented integer.
 * - name: Name of the equipment type, non-null string.
 *
 * @typedef {Object} EquType
 * @property {number} id - Unique identifier for the equipment type.
 * @property {string} name - Name of the equipment type.
 *
 * @see {@link https://sequelize.org/master/manual/model-basics.html|Sequelize Model Basics}
 */
const EquType = sequelize.define(
    'equ_type',
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
        tableName: 'equ_type',
    }
)

export default EquType
