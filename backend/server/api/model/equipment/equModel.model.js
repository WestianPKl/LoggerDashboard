import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model definition for the 'equ_model' table.
 *
 * Represents an equipment model with the following fields:
 * - id: Primary key, auto-incremented integer, not nullable.
 * - name: Name of the equipment model, string, not nullable.
 *
 * @typedef {Object} EquModel
 * @property {number} id - Unique identifier for the equipment model.
 * @property {string} name - Name of the equipment model.
 *
 * @see {@link https://sequelize.org/master/class/lib/model.js~Model.html|Sequelize Model}
 */
const EquModel = sequelize.define(
    'equ_model',
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
        tableName: 'equ_model',
    }
)

export default EquModel
