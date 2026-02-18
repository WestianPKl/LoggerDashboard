import { InventoryClass } from '../../Inventory/scripts/Inventory'
import { PCBClass } from './PCB'

export interface PCBBomItems {
	id?: number | undefined
	pcbId?: number | undefined
	inventoryId?: number | undefined
	qtyPerBoard?: number | undefined
	designators?: string | undefined
	valueSpec?: string | undefined
	allowSubstitutes?: boolean | undefined
	comment?: string | undefined
	pcb?: PCBClass | undefined
	inventory?: InventoryClass | undefined
}

export class PCBBomItemsClass implements PCBBomItems {
	id?: number | undefined
	pcbId?: number | undefined
	inventoryId?: number | undefined
	qtyPerBoard?: number | undefined
	designators?: string | undefined
	valueSpec?: string | undefined
	allowSubstitutes?: boolean | undefined
	comment?: string | undefined
	pcb?: PCBClass | undefined
	inventory?: InventoryClass | undefined

	constructor(model: PCBBomItems = {}) {
		if (model) {
			Object.assign(this, model)

			if (model.pcb) {
				this.pcb = new PCBClass(model.pcb)
			}

			if (model.inventory) {
				this.inventory = new InventoryClass(model.inventory)
			}
		}
	}
}
