export interface InventorySurfaceMount {
	id?: number | undefined
	name?: string | undefined
}

export class InventorySurfaceMountClass implements InventorySurfaceMount {
	id: number | undefined
	name: string | undefined

	constructor(model: InventorySurfaceMount = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
