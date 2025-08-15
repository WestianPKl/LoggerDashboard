import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import User from '../users/user.model.js'

/**
 * Sequelize model definition for the "house_house" table.
 *
 * @typedef {Object} House
 * @property {number} id - Primary key, auto-incremented.
 * @property {string} name - Name of the house. (required)
 * @property {string} [postalCode] - Postal code of the house.
 * @property {string} [city] - City where the house is located.
 * @property {string} [street] - Street address of the house.
 * @property {string} [houseNumber] - House number.
 * @property {string} [pictureLink] - URL to the house's picture.
 * @property {string} [pictureLinkBig] - URL to a larger version of the house's picture.
 * @property {number} createdById - ID of the user who created the record. (required)
 * @property {number} updatedById - ID of the user who last updated the record. (required)
 * @property {Date} [createdAt] - Timestamp when the record was created.
 * @property {Date} [updatedAt] - Timestamp when the record was last updated.
 */
const House = sequelize.define(
    'house_house',
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
        postalCode: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'postal_code',
        },
        city: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'city',
        },
        street: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'street',
        },
        houseNumber: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'house_number',
        },
        pictureLink: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'picture_link',
        },
        pictureLinkBig: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'picture_link_big',
        },
        createdById: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'created_by_id',
        },
        updatedById: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'updated_by_id',
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
        tableName: 'house_house',
    }
)

House.belongsTo(User, {
    as: 'createdBy',
    targetKey: 'id',
    foreignKey: 'createdById',
})
House.belongsTo(User, {
    as: 'updatedBy',
    targetKey: 'id',
    foreignKey: 'updatedById',
})

export default House
