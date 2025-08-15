import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model for the 'data_view_last_value' view.
 *
 * Represents the latest value data for equipment sensors.
 *
 * @typedef {Object} DataLastValueView
 * @property {number} id - Primary key identifier.
 * @property {number} equLoggerId - Equipment logger ID (maps to 'equ_logger_id').
 * @property {number} equSensorId - Equipment sensor ID (maps to 'equ_sensor_id').
 * @property {number} houseFloorId - House floor ID (maps to 'house_floor_id').
 * @property {number} houseLoggerId - House logger ID (maps to 'house_logger_id').
 * @property {string} time - Timestamp of the last value.
 * @property {string} value - Last recorded value.
 * @property {string} parameter - Parameter name.
 * @property {string} unit - Unit of the value.
 */
const DataLastValueView = sequelize.define(
    'data_view_last_value',
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        equLoggerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'equ_logger_id',
        },
        equSensorId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'equ_sensor_id',
        },
        houseFloorId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'house_floor_id',
        },
        houseLoggerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'house_logger_id',
        },
        time: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'time',
        },
        value: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'value',
        },
        parameter: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'parameter',
        },
        unit: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'unit',
        },
    },
    {
        timestamps: false,
        tableName: 'data_view_last_value',
    }
)

export default DataLastValueView
