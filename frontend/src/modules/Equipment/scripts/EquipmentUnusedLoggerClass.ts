/**
 * Represents the input parameters for an unused equipment logger.
 *
 * @property equLoggerId - (Optional) The unique identifier of the equipment logger.
 */
export interface EquipmentUnsusedLoggerInput {
	equLoggerId?: number | undefined
}

/**
 * Represents a logger for unused equipment.
 * Implements the {@link EquipmentUnsusedLoggerInput} interface.
 *
 * @remarks
 * This class is used to encapsulate the properties and initialization logic
 * for an unused equipment logger. It can be constructed with a partial or complete
 * model object, and will assign all matching properties to the instance.
 *
 * @property {number | undefined} equLoggerId - The unique identifier for the equipment logger.
 *
 * @param {EquipmentUnsusedLoggerInput} [model={}] - An optional model object to initialize the instance.
 */
export class EquipmentUnusedLoggerClass implements EquipmentUnsusedLoggerInput {
	equLoggerId: number | undefined

	constructor(model: EquipmentUnsusedLoggerInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
