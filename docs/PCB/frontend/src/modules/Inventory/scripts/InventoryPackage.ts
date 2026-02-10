export interface InventoryPackage {
	id?: number | undefined
	name?: string | undefined
}

export class InventoryPackageClass implements InventoryPackage {
	id: number | undefined
	name: string | undefined

	constructor(model: InventoryPackage = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
