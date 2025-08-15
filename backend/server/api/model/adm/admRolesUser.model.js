import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model for the 'adm_roles_user' table.
 * Represents the association between roles and users.
 *
 * @typedef {Object} AdmRolesUser
 * @property {number} roleId - The ID of the role (primary key, not null).
 * @property {number} userId - The ID of the user (primary key, not null).
 *
 * @see {@link https://sequelize.org/master/manual/model-basics.html|Sequelize Model Basics}
 */
const AdmRolesUser = sequelize.define(
    'adm_roles_user',
    {
        roleId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'role_id',
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'user_id',
        },
    },
    {
        timestamps: false,
        tableName: 'adm_roles_user',
    }
)

export default AdmRolesUser
