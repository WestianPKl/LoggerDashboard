import express from 'express'
import {
	getInventoryTypes,
	getInventoryType,
	addInventoryType,
	updateInventoryType,
	deleteInventoryType,
	getInventorySurfaceMounts,
	getInventorySurfaceMount,
	addInventorySurfaceMount,
	updateInventorySurfaceMount,
	deleteInventorySurfaceMount,
	getInventoryPackages,
	getInventoryPackage,
	addInventoryPackage,
	updateInventoryPackage,
	deleteInventoryPackage,
	getInventoryShops,
	getInventoryShop,
	addInventoryShop,
	updateInventoryShop,
	deleteInventoryShop,
	getInventories,
	getInventory,
	addInventory,
	updateInventory,
	deleteInventory,
	setInventoryStock,
	adjustInventoryStock,
} from '../controller/inventory.controller.js'
import { dataName } from '../../middleware/body-validation.js'

const router = express.Router()

router.post('/inventory-types', getInventoryTypes)
router.get('/inventory-type/:inventoryTypeId', getInventoryType)
router.post('/inventory-type', [dataName], addInventoryType)
router.patch(
	'/inventory-type/:inventoryTypeId',

	[dataName],
	updateInventoryType
)
router.delete(
	'/inventory-type/:inventoryTypeId',

	deleteInventoryType
)

router.post('/inventory-surface-mounts', getInventorySurfaceMounts)
router.get(
	'/inventory-surface-mount/:inventorySurfaceMountId',
	getInventorySurfaceMount
)
router.post('/inventory-surface-mount', [dataName], addInventorySurfaceMount)
router.patch(
	'/inventory-surface-mount/:inventorySurfaceMountId',

	[dataName],
	updateInventorySurfaceMount
)
router.delete(
	'/inventory-surface-mount/:inventorySurfaceMountId',

	deleteInventorySurfaceMount
)

router.post('/inventory-packages', getInventoryPackages)
router.get('/inventory-package/:inventoryPackageId', getInventoryPackage)
router.post('/inventory-package', [dataName], addInventoryPackage)
router.patch(
	'/inventory-package/:inventoryPackageId',

	[dataName],
	updateInventoryPackage
)
router.delete(
	'/inventory-package/:inventoryPackageId',

	deleteInventoryPackage
)

router.post('/inventory-shops', getInventoryShops)
router.get('/inventory-shop/:inventoryShopId', getInventoryShop)
router.post('/inventory-shop', [dataName], addInventoryShop)
router.patch(
	'/inventory-shop/:inventoryShopId',

	[dataName],
	updateInventoryShop
)
router.delete(
	'/inventory-shop/:inventoryShopId',

	deleteInventoryShop
)

router.post('/inventories', getInventories)
router.get('/inventory/:inventoryId', getInventory)
router.post('/inventory', addInventory)
router.patch('/inventory/:inventoryId', updateInventory)
router.delete('/inventory/:inventoryId', deleteInventory)

router.patch('/inventory/:inventoryId/stock', setInventoryStock)
router.patch('/inventory/:inventoryId/stock/adjust', adjustInventoryStock)

export default router
