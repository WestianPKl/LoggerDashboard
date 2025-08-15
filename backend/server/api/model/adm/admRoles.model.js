import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import User from '../users/user.model.js'
import AdmRolesUser from './admRolesUser.model.js'

/**
 * Sequelize model definition for the 'adm_roles' table.
 *
 * Represents administrative roles within the system.
 *
 * @typedef {Object} AdmRoles
 * @property {number} id - Primary key, auto-incremented.
 * @property {string} name - Name of the role.
 * @property {string} description - Description of the role.
 * @property {number} createdById - ID of the user who created the role.
 * @property {number} updatedById - ID of the user who last updated the role.
 * @property {Date} [createdAt] - Timestamp when the role was created.
 * @property {Date} [updatedAt] - Timestamp when the role was last updated.
 */
const AdmRoles = sequelize.define(
    'adm_roles',
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
        tableName: 'adm_roles',
    }
)

AdmRoles.belongsToMany(User, {
    as: 'users',
    through: AdmRolesUser,
    sourceKey: 'id',
    foreignKey: 'roleId',
    otherKey: 'userId',
    targetKey: 'id',
})
AdmRolesUser.belongsTo(AdmRoles, {
    as: 'role',
    targetKey: 'id',
    foreignKey: 'roleId',
})

AdmRoles.belongsTo(User, {
    as: 'createdBy',
    targetKey: 'id',
    foreignKey: 'createdById',
})
AdmRoles.belongsTo(User, {
    as: 'updatedBy',
    targetKey: 'id',
    foreignKey: 'updatedById',
})

export default AdmRoles
