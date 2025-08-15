import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model definition for the 'adm_object_definition' table.
 *
 * @typedef {Object} ObjectDefinition
 * @property {number} id - Primary key, auto-incremented integer.
 * @property {string} name - Name of the object definition.
 * @property {string} description - Description of the object definition.
 *
 * @see {@link https://sequelize.org/master/manual/model-basics.html|Sequelize Model Basics}
 */
const ObjectDefinition = sequelize.define(
    'adm_object_definition',
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
        description: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'description',
        },
    },
    {
        timestamps: false,
        tableName: 'adm_object_definition',
    }
)

export default ObjectDefinition
