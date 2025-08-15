import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model for the 'data_view_logs' view/table.
 *
 * Represents a log entry containing environmental sensor data.
 *
 * @typedef {Object} DataLogsView
 * @property {number} equLoggerId - Equipment logger ID (Primary Key).
 * @property {number} time - Timestamp of the log entry.
 * @property {number} equSensorId - Equipment sensor ID.
 * @property {string} temperature - Recorded temperature value.
 * @property {string} humidity - Recorded humidity value.
 * @property {string} atmPressure - Recorded atmospheric pressure value.
 * @property {string} altitude - Recorded altitude value.
 */
const DataLogsView = sequelize.define(
    'data_view_logs',
    {
        equLoggerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'equ_logger_id',
        },
        time: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'time',
        },
        equSensorId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'equ_sensor_id',
        },
        temperature: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'temperature',
        },
        humidity: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'humidity',
        },
        atmPressure: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'atmPressure',
        },
        altitude: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'altitude',
        },
    },
    {
        timestamps: false,
        tableName: 'data_view_logs',
    }
)

export default DataLogsView
