import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model for the 'equ_sensor_functions' table.
 *
 * Represents the association between equipment sensors and their data definitions.
 *
 * @typedef {Object} EquSensorFunctions
 * @property {number} equSensorId - The ID of the equipment sensor (Primary Key).
 * @property {number} dataDefinitionId - The ID of the data definition (Primary Key).
 *
 * @see {@link https://sequelize.org/master/manual/model-basics.html|Sequelize Model Basics}
 */
const EquSensorFunctions = sequelize.define(
    'equ_sensor_functions',
    {
        equSensorId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'equ_sensor_id',
        },
        dataDefinitionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'data_definition_id',
        },
    },
    {
        timestamps: false,
        tableName: 'equ_sensor_functions',
    }
)

export default EquSensorFunctions
