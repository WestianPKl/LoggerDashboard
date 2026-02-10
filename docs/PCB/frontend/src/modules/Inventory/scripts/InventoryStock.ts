export interface InventoryStock {
	inventoryId?: number | undefined
	quantity?: number | undefined
	updated_at?: string | undefined
}

export class InventoryStockClass implements InventoryStock {
	inventoryId: number | undefined
	quantity: number | undefined
	updated_at: string | undefined

	constructor(model: InventoryStock = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
