import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import Inventory from '../inventory/inventory.model.js'
import ProductionOrders from './productionOrders.model.js'

const ProductionOrderItems = sequelize.define(
	'production_order_items',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		productionOrderId: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'production_order_id',
		},
		inventoryId: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'inventory_id',
		},
		qtyPerBoard: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'qty_per_board',
		},
		requiredQtyTotal: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'required_qty_total',
		},
		consumedQty: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 0,
			field: 'consumed_qty',
		},
		allowSubstitute: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			field: 'allow_substitute',
		},
		designators: {
			type: Sequelize.STRING,
			allowNull: true,
			field: 'designators',
		},
		status: {
			type: Sequelize.ENUM('ok', 'low', 'missing'),
			allowNull: false,
			defaultValue: 'ok',
			field: 'status',
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
		tableName: 'production_order_items',
	}
)

ProductionOrderItems.belongsTo(ProductionOrders, {
	as: 'productionOrder',
	targetKey: 'id',
	foreignKey: 'productionOrderId',
})

ProductionOrders.hasMany(ProductionOrderItems, {
	as: 'productionOrderItems',
	sourceKey: 'id',
	foreignKey: 'productionOrderId',
})

ProductionOrderItems.belongsTo(Inventory, {
	as: 'inventory',
	targetKey: 'id',
	foreignKey: 'inventoryId',
})

Inventory.hasMany(ProductionOrderItems, {
	as: 'productionOrderItems',
	sourceKey: 'id',
	foreignKey: 'inventoryId',
})

export default ProductionOrderItems
