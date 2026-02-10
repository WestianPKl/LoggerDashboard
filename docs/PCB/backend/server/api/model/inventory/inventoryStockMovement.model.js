import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'

const InventoryStockMovement = sequelize.define(
	'inventory_stock_movement',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		inventoryId: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'inventory_id',
		},
		delta: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'delta',
		},
		reason: {
			type: Sequelize.ENUM(
				'initial',
				'purchase',
				'production',
				'correction',
				'adjustment'
			),
			allowNull: false,
			field: 'reason',
		},
		note: {
			type: Sequelize.STRING,
			allowNull: true,
			field: 'note',
		},
		createdAt: {
			type: Sequelize.DATE,
			allowNull: true,
			field: 'created_at',
		},
	},
	{
		timestamps: true,
		underscored: true,
		updatedAt: false,
		tableName: 'inventory_stock_movement',
	}
)

export default InventoryStockMovement
