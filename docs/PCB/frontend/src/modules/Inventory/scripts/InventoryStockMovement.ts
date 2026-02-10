export interface InventoryStockMovement {
	id?: number | undefined
	inventoryId?: number | undefined
	delta?: number | undefined
	reason?: 'initial' | 'purchase' | 'production' | 'correction' | 'adjustment' | undefined
	note?: string | undefined
	created_at?: string | undefined
}

export class InventoryStockMovementClass implements InventoryStockMovement {
	id: number | undefined
	inventoryId: number | undefined
	delta: number | undefined
	reason: 'initial' | 'purchase' | 'production' | 'correction' | 'adjustment' | undefined
	note: string | undefined
	created_at: string | undefined

	constructor(model: InventoryStockMovement = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
