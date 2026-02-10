import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

const InventoryType = sequelize.define(
	'inventory_type',
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
	},
	{
		timestamps: false,
		tableName: 'inventory_type',
	}
)

export default InventoryType
