import { Sequelize } from 'sequelize'
import sequelize from '../../util/database.js'

/**
 * Sequelize model for the 'error_log' table.
 *
 * @typedef {Object} ErrorLog
 * @property {number} id - Primary key, auto-incremented.
 * @property {string} message - Error message (required).
 * @property {string} [details] - Additional error details (optional).
 * @property {'Equipment'|'DB'|'Other'} type - Type of error (required).
 * @property {'Critical'|'Error'|'Warning'|'Info'} severity - Severity level (required).
 * @property {number} [equipmentId] - Associated equipment ID (optional).
 * @property {Date} [createdAt] - Timestamp when the error was created.
 * @property {Date} [updatedAt] - Timestamp when the error was last updated.
 */
const ErrorLog = sequelize.define(
    'error_log',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        message: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'message',
        },
        details: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'details',
        },
        type: {
            type: Sequelize.ENUM(['Equipment', 'DB', 'Other']),
            allowNull: false,
            field: 'type',
        },
        severity: {
            type: Sequelize.ENUM(['Critical', 'Error', 'Warning', 'Info']),
            allowNull: false,
            field: 'severity',
        },
        equipmentId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'equipment_id',
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
        tableName: 'error_log',
    }
)

export default ErrorLog
