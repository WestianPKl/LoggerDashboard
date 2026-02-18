import { ProductionOrdersClass } from '../../Production/scripts/ProductionOrders'
import { PCBBomItemsClass } from './PCBBomItems'

export interface PCB {
	id?: number | undefined
	name?: string | undefined
	revision?: string | undefined
	comment?: string | undefined
	topUrl?: string | undefined
	bottomUrl?: string | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	bomItems?: PCBBomItemsClass[] | undefined
	productionOrders?: ProductionOrdersClass[] | undefined
}

export class PCBClass implements PCB {
	id?: number | undefined
	name?: string | undefined
	revision?: string | undefined
	comment?: string | undefined
	topUrl?: string | undefined
	bottomUrl?: string | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	bomItems?: PCBBomItemsClass[] | undefined
	productionOrders?: ProductionOrdersClass[] | undefined

	constructor(model: PCB = {}) {
		if (model) {
			Object.assign(this, model)

			if (model.bomItems) {
				this.bomItems = model.bomItems.map(item => new PCBBomItemsClass(item))
			}

			if (model.productionOrders) {
				this.productionOrders = model.productionOrders.map(order => new ProductionOrdersClass(order))
			}
		}
	}
}
