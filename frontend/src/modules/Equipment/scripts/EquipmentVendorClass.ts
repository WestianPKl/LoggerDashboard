/**
 * Represents the input data structure for an equipment vendor.
 *
 * @property id - (Optional) The unique identifier of the equipment vendor.
 * @property name - (Optional) The name of the equipment vendor.
 */
export interface EquipmentVendorInput {
	id?: number | undefined
	name?: string | undefined
}

/**
 * Represents a vendor of equipment, implementing the {@link EquipmentVendorInput} interface.
 *
 * @remarks
 * This class is used to encapsulate the properties and initialization logic for an equipment vendor.
 *
 * @property id - The unique identifier of the equipment vendor.
 * @property name - The name of the equipment vendor.
 *
 * @constructor
 * Creates a new instance of `EquipmentVendorClass`.
 * @param model - An optional object conforming to `EquipmentVendorInput` to initialize the instance properties.
 */
export class EquipmentVendorClass implements EquipmentVendorInput {
	id: number | undefined
	name: string | undefined

	constructor(model: EquipmentVendorInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
