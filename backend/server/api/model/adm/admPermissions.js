import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import FunctionalityDefinition from './admFunctionalityDefinition.model.js'
import ObjectDefinition from './admObjectDefinition.model.js'
import AccessLevelDefinition from './admAccessLevelDefinitions.model.js'

/**
 * Sequelize model for the 'adm_permissions' table.
 *
 * Represents permissions assigned to users or roles for specific functionalities and objects,
 * with associated access levels.
 *
 * Fields:
 * @typedef {Object} AdmPermissions
 * @property {number} id - Primary key, auto-incremented.
 * @property {number|null} userId - ID of the user (nullable), maps to 'user_id'.
 * @property {number|null} roleId - ID of the role (nullable), maps to 'role_id'.
 * @property {number} admFunctionalityDefinitionId - ID of the functionality definition, maps to 'adm_functionality_definition_id'.
 * @property {number|null} admObjectDefinitionId - ID of the object definition (nullable), maps to 'adm_object_definition_id'.
 * @property {number} admAccessLevelDefinitionId - ID of the access level definition, maps to 'adm_access_level_definition_id'.
 *
 * @see {@link https://sequelize.org/master/manual/model-basics.html|Sequelize Model Basics}
 */
const AdmPermissions = sequelize.define(
    'adm_permissions',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'user_id',
        },
        roleId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'role_id',
        },
        admFunctionalityDefinitionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'adm_functionality_definition_id',
        },
        admObjectDefinitionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'adm_object_definition_id',
        },
        admAccessLevelDefinitionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'adm_access_level_definition_id',
        },
    },
    {
        timestamps: false,
        tableName: 'adm_permissions',
    }
)

AdmPermissions.belongsTo(FunctionalityDefinition, {
    as: 'functionalityDefinition',
    targetKey: 'id',
    foreignKey: 'admFunctionalityDefinitionId',
})
AdmPermissions.belongsTo(ObjectDefinition, {
    as: 'objectDefinition',
    targetKey: 'id',
    foreignKey: 'admObjectDefinitionId',
})
AdmPermissions.belongsTo(AccessLevelDefinition, {
    as: 'accessLevelDefinition',
    targetKey: 'id',
    foreignKey: 'admAccessLevelDefinitionId',
})

export default AdmPermissions
