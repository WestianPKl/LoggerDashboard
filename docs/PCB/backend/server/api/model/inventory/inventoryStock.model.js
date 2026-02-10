import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

const InventoryStock = sequelize.define(
	'inventory_stock',
	{
		inventoryId: {
			type: Sequelize.INTEGER,
			allowNull: false,
			primaryKey: true,
			field: 'inventory_id',
		},
		quantity: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'quantity',
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
		createdAt: false,
		tableName: 'inventory_stock',
	}
)

export default InventoryStock
