import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model definition for the 'equ_vendor' table.
 *
 * Represents an equipment vendor.
 *
 * Fields:
 * - id: Primary key, auto-incremented integer.
 * - name: Name of the vendor, non-null string.
 *
 * @typedef {Object} EquVendor
 * @property {number} id - Unique identifier for the vendor.
 * @property {string} name - Name of the equipment vendor.
 */
const EquVendor = sequelize.define(
    'equ_vendor',
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
        tableName: 'equ_vendor',
    }
)

export default EquVendor
