/**
 * Represents the input data structure for an equipment type.
 *
 * @property id - (Optional) The unique identifier of the equipment type.
 * @property name - (Optional) The name of the equipment type.
 */
export interface EquipmentTypeInput {
	id?: number | undefined
	name?: string | undefined
}

/**
 * Represents an equipment type with an optional ID and name.
 * Implements the {@link EquipmentTypeInput} interface.
 *
 * @example
 * ```typescript
 * const equipmentType = new EquipmentTypeClass({ id: 1, name: "Generator" });
 * ```
 *
 * @property id - The unique identifier for the equipment type (optional).
 * @property name - The name of the equipment type (optional).
 *
 * @constructor
 * Creates a new instance of EquipmentTypeClass.
 * @param model - An optional object conforming to EquipmentTypeInput to initialize the instance properties.
 */
export class EquipmentTypeClass implements EquipmentTypeInput {
	id: number | undefined
	name: string | undefined

	constructor(model: EquipmentTypeInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
