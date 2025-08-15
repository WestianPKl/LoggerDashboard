import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model for the 'equ_view_unused_logger' database view.
 *
 * Represents unused equipment loggers.
 *
 * @typedef {Object} EquUnusedLoggerView
 * @property {number} equLoggerId - The unique identifier for the equipment logger.
 */
const EquUnusedLoggerView = sequelize.define(
    'equ_view_unused_logger',
    {
        equLoggerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'equ_logger_id',
        },
    },
    {
        timestamps: false,
        tableName: 'equ_view_unused_logger',
    }
)

export default EquUnusedLoggerView
