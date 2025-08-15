import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import Equipment from '../equipment/equipment.model.js'
import HouseFloors from './houseFloors.model.js'

/**
 * Sequelize model definition for the 'house_logger' table.
 *
 * Represents a logger device associated with a house floor.
 *
 * Fields:
 * @typedef {Object} HouseLogger
 * @property {number} id - Primary key. Auto-incremented unique identifier.
 * @property {number} equLoggerId - Foreign key referencing the equipment logger (column: equ_logger_id).
 * @property {number} houseFloorId - Foreign key referencing the house floor (column: house_floor_id).
 * @property {number|null} posX - X position of the logger on the floor (column: pos_x).
 * @property {number|null} posY - Y position of the logger on the floor (column: pos_y).
 *
 * @see {@link https://sequelize.org/master/manual/model-basics.html Sequelize Model Basics}
 */
const HouseLogger = sequelize.define(
    'house_logger',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        equLoggerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'equ_logger_id',
        },
        houseFloorId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'house_floor_id',
        },
        posX: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'pos_x',
        },
        posY: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'pos_y',
        },
    },
    {
        timestamps: false,
        tableName: 'house_logger',
    }
)

HouseLogger.belongsTo(HouseFloors, {
    as: 'floor',
    targetKey: 'id',
    foreignKey: 'houseFloorId',
})
HouseFloors.hasMany(HouseLogger, {
    as: 'loggers',
    targetKey: 'id',
    foreignKey: 'houseFloorId',
})

HouseLogger.belongsTo(Equipment, {
    as: 'logger',
    targetKey: 'id',
    foreignKey: 'equLoggerId',
})
Equipment.hasMany(HouseLogger, {
    as: 'houseLogger',
    targetKey: 'id',
    foreignKey: 'equLoggerId',
})

export default HouseLogger
