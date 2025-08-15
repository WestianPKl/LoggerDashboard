import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import House from './house.model.js'

/**
 * Sequelize model definition for the 'house_floors' table.
 *
 * Represents a floor within a house, including layout information and positioning.
 *
 * Fields:
 * @typedef {Object} HouseFloors
 * @property {number} id - Primary key, auto-incremented.
 * @property {string} name - Name of the floor (required).
 * @property {string} [layout] - Layout image or data for the floor (optional).
 * @property {string} [layoutBig] - High-resolution layout image or data (optional).
 * @property {number} houseId - Foreign key referencing the house (required).
 * @property {number} [x] - X coordinate for the floor (optional).
 * @property {number} [y] - Y coordinate for the floor (optional).
 * @property {number} [zoom] - Zoom level for the floor layout (optional).
 * @property {number} [posX] - X position offset for the floor (optional).
 * @property {number} [posY] - Y position offset for the floor (optional).
 *
 * @see {@link https://sequelize.org/master/manual/model-basics.html|Sequelize Model Basics}
 */
const HouseFloors = sequelize.define(
    'house_floors',
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
        layout: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'layout',
        },
        layoutBig: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'layout_big',
        },
        houseId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'house_id',
        },
        x: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'x',
        },
        y: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'y',
        },
        zoom: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'zoom',
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
        tableName: 'house_floors',
    }
)

HouseFloors.belongsTo(House, {
    as: 'house',
    targetKey: 'id',
    foreignKey: 'houseId',
})

House.hasMany(HouseFloors, {
    as: 'floors',
    targetKey: 'id',
    foreignKey: 'houseId',
})

export default HouseFloors
