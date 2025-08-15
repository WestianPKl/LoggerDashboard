import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import DataLogs from './dataLogs.model.js'
import Equipment from '../equipment/equipment.model.js'

/**
 * Sequelize model for the 'data_last_value' table.
 *
 * Represents the last value of data logs associated with specific data definitions, loggers, and sensors.
 *
 * @typedef {Object} DataLastValue
 * @property {number} id - Primary key, auto-incremented.
 * @property {number} dataLogId - Foreign key referencing the data log (data_log_id).
 * @property {number} dataDefinitionId - Foreign key referencing the data definition (data_definition_id).
 * @property {number} equLoggerId - Foreign key referencing the equipment logger (equ_logger_id).
 * @property {number} equSensorId - Foreign key referencing the equipment sensor (equ_sensor_id).
 * @property {Date} createdAt - Timestamp when the record was created.
 * @property {Date} updatedAt - Timestamp when the record was last updated.
 */
const DataLastValue = sequelize.define(
    'data_last_value',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        dataLogId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'data_log_id',
        },
        dataDefinitionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'data_definition_id',
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
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            field: 'created_at',
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            field: 'updated_at',
        },
    },
    {
        timestamps: true,
        underscored: true,
        tableName: 'data_last_value',
    }
)

DataLastValue.belongsTo(Equipment, {
    as: 'logger',
    targetKey: 'id',
    foreignKey: 'equLoggerId',
})

Equipment.hasOne(DataLastValue, {
    as: 'lastValue',
    targetKey: 'id',
    foreignKey: 'equLoggerId',
})

DataLastValue.belongsTo(DataLogs, {
    as: 'log',
    targetKey: 'id',
    foreignKey: 'dataLogId',
})

export default DataLastValue
