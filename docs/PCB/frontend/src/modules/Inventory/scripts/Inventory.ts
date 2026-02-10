import { InventoryPackageClass } from './InventoryPackage'
import { InventoryShopClass } from './InventoryShop'
import { InventoryStockClass } from './InventoryStock'
import { InventoryStockMovementClass } from './InventoryStockMovement'
import { InventorySurfaceMountClass } from './InventorySurfaceMount'
import { InventoryTypeClass } from './InventoryType'

export interface Inventory {
	id?: number | undefined
	name?: string | undefined
	manufacturerNumber?: string | undefined
	parameters?: string | undefined
	comment?: string | undefined
	lowThreshold?: number | undefined
	inventoryTypeId?: number | undefined
	inventoryPackageId?: number | undefined
	inventorySurfaceMountId?: number | undefined
	inventoryShopId?: number | undefined
	type?: InventoryTypeClass | undefined
	package?: InventoryPackageClass | undefined
	surfaceMount?: InventorySurfaceMountClass | undefined
	shop?: InventoryShopClass | undefined
	stock?: InventoryStockClass | undefined
	stockMovements?: InventoryStockMovementClass[] | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
}

export class InventoryClass implements Inventory {
	id: number | undefined
	name: string | undefined
	manufacturerNumber: string | undefined
	parameters: string | undefined
	lowThreshold: number | undefined
	comment: string | undefined
	inventoryTypeId: number | undefined
	inventoryPackageId: number | undefined
	inventorySurfaceMountId: number | undefined
	inventoryShopId: number | undefined
	type?: InventoryTypeClass | undefined
	package?: InventoryPackageClass | undefined
	surfaceMount?: InventorySurfaceMountClass | undefined
	shop?: InventoryShopClass | undefined
	stock?: InventoryStockClass | undefined
	stockMovements?: InventoryStockMovementClass[] | undefined
	createdAt: string | undefined
	updatedAt: string | undefined

	constructor(model: Inventory = {}) {
		if (model) {
			Object.assign(this, model)
			if (model.type) {
				this.type = new InventoryTypeClass(model.type)
			}
			if (model.package) {
				this.package = new InventoryPackageClass(model.package)
			}
			if (model.surfaceMount) {
				this.surfaceMount = new InventorySurfaceMountClass(model.surfaceMount)
			}
			if (model.shop) {
				this.shop = new InventoryShopClass(model.shop)
			}
			if (model.stock) {
				this.stock = new InventoryStockClass(model.stock)
			}
			if (model.stockMovements) {
				this.stockMovements = model.stockMovements.map(movement => new InventoryStockMovementClass(movement))
			}
		}
	}
}
