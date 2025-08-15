import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model for the 'adm_functionality_definition' table.
 *
 * @typedef {Object} FunctionalityDefinition
 * @property {number} id - Primary key, auto-incremented integer.
 * @property {string} name - Name of the functionality definition.
 * @property {string} description - Description of the functionality definition.
 *
 * @see {@link https://sequelize.org/master/manual/model-basics.html|Sequelize Model Basics}
 */
const FunctionalityDefinition = sequelize.define(
    'adm_functionality_definition',
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
        tableName: 'adm_functionality_definition',
    }
)

export default FunctionalityDefinition
