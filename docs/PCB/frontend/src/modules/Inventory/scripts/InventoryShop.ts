export interface InventoryShop {
	id?: number | undefined
	name?: string | undefined
}

export class InventoryShopClass implements InventoryShop {
	id: number | undefined
	name: string | undefined

	constructor(model: InventoryShop = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
