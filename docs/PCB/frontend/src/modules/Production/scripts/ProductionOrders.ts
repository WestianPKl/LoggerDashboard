import { PCBClass } from '../../PCB/scripts/PCB'
import { ProductionOrderItemsClass } from './ProductionOrderItems'

export interface ProductionOrders {
	id?: number | undefined
	pcbId?: number | undefined
	quantity?: number | undefined
	status?: 'planned' | 'ready' | 'reserved' | 'in_assembly' | 'produced' | 'cancelled' | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	pcb?: PCBClass | undefined
	productionOrderItems?: ProductionOrderItemsClass[] | undefined
}

export class ProductionOrdersClass implements ProductionOrders {
	id?: number | undefined
	pcbId?: number | undefined
	quantity?: number | undefined
	status?: 'planned' | 'ready' | 'reserved' | 'in_assembly' | 'produced' | 'cancelled' | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	pcb?: PCBClass | undefined
	productionOrderItems?: ProductionOrderItemsClass[] | undefined

	constructor(model: ProductionOrders = {}) {
		if (model) {
			Object.assign(this, model)

			if (model.pcb) {
				this.pcb = new PCBClass(model.pcb)
			}

			if (model.productionOrderItems) {
				this.productionOrderItems = model.productionOrderItems.map(item => new ProductionOrderItemsClass(item))
			}
		}
	}
}
