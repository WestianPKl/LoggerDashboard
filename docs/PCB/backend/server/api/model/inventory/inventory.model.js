import { Sequelize } from 'sequelize'
import sequelize from '../../../util/database.js'
import InventoryPackage from './inventoryPackage.model.js'
import InventoryShop from './inventoryShop.model.js'
import InventorySurfaceMount from './inventorySurfaceMount.model.js'
import InventoryType from './inventoryType.model.js'
import InventoryStock from './inventoryStock.model.js'
import InventoryStockMovement from './inventoryStockMovement.model.js'

const Inventory = sequelize.define(
	'inventory',
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
		manufacturerNumber: {
			type: Sequelize.STRING,
			allowNull: true,
			field: 'manufacturer_number',
		},
		parameters: {
			type: Sequelize.STRING,
			allowNull: true,
			field: 'parameters',
		},
		lowThreshold: {
			type: Sequelize.INTEGER,
			allowNull: true,
			field: 'low_threshold',
		},
		comment: {
			type: Sequelize.STRING,
			allowNull: true,
			field: 'comment',
		},
		inventoryTypeId: {
			type: Sequelize.INTEGER,
			allowNull: true,
			field: 'inventory_type_id',
		},
		inventoryPackageId: {
			type: Sequelize.INTEGER,
			allowNull: true,
			field: 'inventory_package_id',
		},
		inventorySurfaceMountId: {
			type: Sequelize.INTEGER,
			allowNull: true,
			field: 'inventory_surface_mount_id',
		},
		inventoryShopId: {
			type: Sequelize.INTEGER,
			allowNull: true,
			field: 'inventory_shop_id',
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
		tableName: 'inventory',
	}
)

Inventory.belongsTo(InventoryType, {
	as: 'type',
	targetKey: 'id',
	foreignKey: 'inventoryTypeId',
})
Inventory.belongsTo(InventorySurfaceMount, {
	as: 'surfaceMount',
	targetKey: 'id',
	foreignKey: 'inventorySurfaceMountId',
})
Inventory.belongsTo(InventoryPackage, {
	as: 'package',
	targetKey: 'id',
	foreignKey: 'inventoryPackageId',
})
Inventory.belongsTo(InventoryShop, {
	as: 'shop',
	targetKey: 'id',
	foreignKey: 'inventoryShopId',
})
Inventory.hasOne(InventoryStock, {
	as: 'stock',
	sourceKey: 'id',
	foreignKey: 'inventoryId',
})
Inventory.hasMany(InventoryStockMovement, {
	as: 'stockMovements',
	sourceKey: 'id',
	foreignKey: 'inventoryId',
})

export default Inventory
