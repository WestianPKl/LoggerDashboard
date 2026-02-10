import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

const InventoryPackage = sequelize.define(
	'inventory_package',
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
		tableName: 'inventory_package',
	}
)

export default InventoryPackage
