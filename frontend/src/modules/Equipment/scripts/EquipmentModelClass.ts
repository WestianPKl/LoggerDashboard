/**
 * Represents the input data required to create or update an equipment model.
 *
 * @property {number} [id] - The unique identifier of the equipment model (optional).
 * @property {string} [name] - The name of the equipment model (optional).
 */
export interface EquipmentModelInput {
	id?: number | undefined
	name?: string | undefined
}

/**
 * Represents an equipment model with basic properties.
 * Implements the {@link EquipmentModelInput} interface.
 *
 * @example
 * ```typescript
 * const model = new EquipmentModelClass({ id: 1, name: "Excavator" });
 * ```
 *
 * @property id - The unique identifier of the equipment model.
 * @property name - The name of the equipment model.
 *
 * @constructor
 * Creates a new instance of EquipmentModelClass.
 * @param model - An optional object conforming to EquipmentModelInput to initialize the instance properties.
 */
export class EquipmentModelClass implements EquipmentModelInput {
	id: number | undefined
	name: string | undefined

	constructor(model: EquipmentModelInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
