import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import User from '../users/user.model.js'
import ProcessType from './processType.model.js'

/**
 * Sequelize model for the 'process_definition' table.
 *
 * @typedef {Object} ProcessDefinition
 * @property {number} id - Primary key, auto-incremented.
 * @property {number} processTypeId - Foreign key referencing the process type (process_type_id).
 * @property {string} name - Name of the process definition.
 * @property {number} createdById - ID of the user who created the record (created_by_id).
 * @property {number} updatedById - ID of the user who last updated the record (updated_by_id).
 * @property {Date} [createdAt] - Timestamp when the record was created (created_at).
 * @property {Date} [updatedAt] - Timestamp when the record was last updated (updated_at).
 */
const ProcessDefinition = sequelize.define(
    'process_definition',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        processTypeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'process_type_id',
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'name',
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
        tableName: 'process_definition',
    }
)

ProcessDefinition.belongsTo(User, {
    as: 'createdBy',
    targetKey: 'id',
    foreignKey: 'createdById',
})
ProcessDefinition.belongsTo(User, {
    as: 'updatedBy',
    targetKey: 'id',
    foreignKey: 'updatedById',
})

ProcessDefinition.belongsTo(ProcessType, {
    as: 'type',
    targetKey: 'id',
    foreignKey: 'processTypeId',
})

export default ProcessDefinition
