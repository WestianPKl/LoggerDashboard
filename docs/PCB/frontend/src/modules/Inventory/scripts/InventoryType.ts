export interface InventoryType {
	id?: number | undefined
	name?: string | undefined
}

export class InventoryTypeClass implements InventoryType {
	id: number | undefined
	name: string | undefined

	constructor(model: InventoryType = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
