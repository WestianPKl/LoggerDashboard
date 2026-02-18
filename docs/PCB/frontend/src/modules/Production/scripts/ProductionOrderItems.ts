import { InventoryClass } from '../../Inventory/scripts/Inventory'
import { ProductionOrdersClass } from './ProductionOrders'

export interface ProductionOrderItems {
	id?: number | undefined
	productionOrderId?: number | undefined
	inventoryId?: number | undefined
	qtyPerBoard?: number | undefined
	requiredQtyTotal?: number | undefined
	consumedQty?: number | undefined
	allowSubstitutes?: boolean | undefined
	designators?: string | undefined
	status?: 'ok' | 'low' | 'missing' | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	productionOrder?: ProductionOrdersClass | undefined
	inventory?: InventoryClass | undefined
}

export class ProductionOrderItemsClass implements ProductionOrderItems {
	id?: number | undefined
	productionOrderId?: number | undefined
	inventoryId?: number | undefined
	qtyPerBoard?: number | undefined
	requiredQtyTotal?: number | undefined
	consumedQty?: number | undefined
	allowSubstitutes?: boolean | undefined
	designators?: string | undefined
	status?: 'ok' | 'low' | 'missing' | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	productionOrder?: ProductionOrdersClass | undefined
	inventory?: InventoryClass | undefined

	constructor(model: ProductionOrderItems = {}) {
		if (model) {
			Object.assign(this, model)

			if (model.productionOrder) {
				this.productionOrder = new ProductionOrdersClass(model.productionOrder)
			}

			if (model.inventory) {
				this.inventory = new InventoryClass(model.inventory)
			}
		}
	}
}
