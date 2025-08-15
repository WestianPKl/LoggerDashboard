import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model for the 'data_view_connected_sensor' view.
 *
 * Represents a connected sensor with the following fields:
 * @typedef {Object} DataConnectedSensorView
 * @property {number} equLoggerId - Equipment logger ID (not null).
 * @property {number} equSensorId - Equipment sensor ID (primary key, not null).
 * @property {number} houseFloorId - House floor ID (not null).
 * @property {number} houseLoggerId - House logger ID (not null).
 * @property {string} sensorVendor - Sensor vendor name (not null).
 * @property {string} sensorModel - Sensor model name (not null).
 * @property {string} sensorSerialNumber - Sensor serial number (not null).
 *
 * @see {@link https://sequelize.org/master/manual/model-basics.html|Sequelize Model Basics}
 */
const DataConnectedSensorView = sequelize.define(
    'data_view_connected_sensor',
    {
        equLoggerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'equ_logger_id',
        },
        equSensorId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
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
        sensorVendor: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'sensor_vendor',
        },
        sensorModel: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'sensor_model',
        },
        sensorSerialNumber: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'sensor_serial_number',
        },
    },
    {
        timestamps: false,
        tableName: 'data_view_connected_sensor',
    }
)

export default DataConnectedSensorView
