import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import FunctionalityDefinition from './admFunctionalityDefinition.model.js'
import ObjectDefinition from './admObjectDefinition.model.js'
import AccessLevelDefinition from './admAccessLevelDefinitions.model.js'

/**
 * Sequelize model for the 'adm_view_permission' table.
 *
 * Represents view permissions assigned to users and roles for specific functionalities, objects, and access levels.
 *
 * @typedef {Object} AdmViewPermissions
 * @property {number} id - Primary key, auto-incremented.
 * @property {number} userId - ID of the user associated with the permission (maps to 'user_id').
 * @property {number} roleId - ID of the role associated with the permission (maps to 'role_id').
 * @property {number} functionalityDefinitionId - ID of the functionality definition (maps to 'adm_functionality_definition_id').
 * @property {number} objectDefinitionId - ID of the object definition (maps to 'adm_object_definition_id').
 * @property {number} accessLevelDefinitionId - ID of the access level definition (maps to 'adm_access_level_definition_id').
 */
const AdmViewPermissions = sequelize.define(
    'adm_view_permission',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'user_id',
        },
        roleId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'role_id',
        },
        functionalityDefinitionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'adm_functionality_definition_id',
        },
        objectDefinitionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'adm_object_definition_id',
        },
        accessLevelDefinitionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'adm_access_level_definition_id',
        },
    },
    {
        timestamps: false,
        tableName: 'adm_view_permission',
    }
)

AdmViewPermissions.belongsTo(FunctionalityDefinition, {
    as: 'functionalityDefinition',
    targetKey: 'id',
    foreignKey: 'functionalityDefinitionId',
})
AdmViewPermissions.belongsTo(ObjectDefinition, {
    as: 'objectDefinition',
    targetKey: 'id',
    foreignKey: 'objectDefinitionId',
})
AdmViewPermissions.belongsTo(AccessLevelDefinition, {
    as: 'accessLevelDefinition',
    targetKey: 'id',
    foreignKey: 'accessLevelDefinitionId',
})

export default AdmViewPermissions
