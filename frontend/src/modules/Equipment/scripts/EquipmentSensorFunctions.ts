/**
 * Represents the input parameters for an equipment sensor function.
 *
 * @property equSensorId - (Optional) The unique identifier of the equipment sensor.
 * @property dataDefinitionId - (Optional) The identifier for the associated data definition.
 */
export interface EquipmentSensorFunctionInput {
	equSensorId?: number | undefined
	dataDefinitionId?: number | undefined
}

/**
 * Represents a function or configuration for an equipment sensor.
 * Implements the {@link EquipmentSensorFunctionInput} interface.
 *
 * @property {number | undefined} equSensorId - The unique identifier of the equipment sensor.
 * @property {number | undefined} dataDefinitionId - The identifier for the associated data definition.
 *
 * @constructor
 * Creates a new instance of EquipmentSensorFunctionClass.
 * @param {EquipmentSensorFunctionInput} [model={}] - Optional initial values to assign to the instance.
 */
export class EquipmentSensorFunctionClass implements EquipmentSensorFunctionInput {
	equSensorId: number | undefined
	dataDefinitionId: number | undefined

	constructor(model: EquipmentSensorFunctionInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
