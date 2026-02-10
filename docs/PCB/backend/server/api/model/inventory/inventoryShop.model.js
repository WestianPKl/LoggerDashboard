import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

const InventoryShop = sequelize.define(
	'inventory_shop',
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
		tableName: 'inventory_shop',
	}
)

export default InventoryShop
