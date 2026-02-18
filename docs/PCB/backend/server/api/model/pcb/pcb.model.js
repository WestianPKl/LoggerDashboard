import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

const PCB = sequelize.define(
	'pcb',
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
		revision: {
			type: Sequelize.STRING,
			allowNull: false,
			field: 'revision',
		},
		topUrl: {
			type: Sequelize.STRING,
			allowNull: true,
			field: 'top_url',
		},
		bottomUrl: {
			type: Sequelize.STRING,
			allowNull: true,
			field: 'bottom_url',
		},
		comment: {
			type: Sequelize.STRING,
			allowNull: true,
			field: 'comment',
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
		tableName: 'pcb',
	}
)

export default PCB
