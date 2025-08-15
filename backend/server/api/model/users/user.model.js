import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

/**
 * Sequelize model definition for the 'users' table.
 *
 * @typedef {Object} User
 * @property {number} id - Primary key, auto-incremented user ID.
 * @property {string} username - Unique username of the user.
 * @property {string} email - Unique email address of the user.
 * @property {string} password - Hashed password of the user.
 * @property {Date} [createdAt] - Timestamp when the user was created.
 * @property {Date} [updatedAt] - Timestamp when the user was last updated.
 * @property {boolean} [confirmed=false] - Whether the user's email is confirmed.
 * @property {string} [avatar] - URL or path to the user's avatar image.
 * @property {string} [avatarBig] - URL or path to the user's large avatar image.
 * @property {string} [resetPasswordToken] - Token for password reset functionality.
 * @property {Date} [resetPasswordExpires] - Expiry date for the reset password token.
 */
const User = sequelize.define(
    'users',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            field: 'username',
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            field: 'email',
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'password',
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
        confirmed: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            field: 'confirmed',
        },
        avatar: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'avatar',
        },
        avatarBig: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'avatar_big',
        },
        resetPasswordToken: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'reset_password_token',
        },
        resetPasswordExpires: {
            type: Sequelize.DATE,
            allowNull: true,
            field: 'reset_password_expires',
        },
    },
    {
        timestamps: true,
        underscored: true,
        tableName: 'users',
    }
)

export default User
