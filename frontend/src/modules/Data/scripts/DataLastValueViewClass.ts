/**
 * Represents the input data structure for the last value view of a data entity.
 *
 * @property {number} [id] - The unique identifier for the data entry.
 * @property {number} [equLoggerId] - The identifier for the equipment logger.
 * @property {number} [equSensorId] - The identifier for the equipment sensor.
 * @property {number} [houseFloorId] - The identifier for the house floor.
 * @property {number} [houseLoggerId] - The identifier for the house logger.
 * @property {string} [time] - The timestamp of the recorded value, in ISO format.
 * @property {number} [value] - The measured value.
 * @property {string} [parameter] - The parameter name associated with the value.
 * @property {string} [unit] - The unit of the measured value.
 */
export interface DataLastValueViewInput {
	id?: number | undefined
	equLoggerId?: number | undefined
	equSensorId?: number | undefined
	houseFloorId?: number | undefined
	houseLoggerId?: number | undefined
	time?: string | undefined
	value?: number | undefined
	parameter?: string | undefined
	unit?: string | undefined
}

/**
 * Represents the last recorded value for a specific data point, including metadata such as logger, sensor, and time.
 *
 * @implements {DataLastValueViewInput}
 *
 * @property {number | undefined} id - Unique identifier for the data value.
 * @property {number | undefined} equLoggerId - Identifier for the equipment logger.
 * @property {number | undefined} equSensorId - Identifier for the equipment sensor.
 * @property {number | undefined} houseFloorId - Identifier for the house floor.
 * @property {number | undefined} houseLoggerId - Identifier for the house logger.
 * @property {string | undefined} time - Timestamp of the recorded value.
 * @property {number | undefined} value - The recorded value.
 * @property {string | undefined} parameter - The parameter being measured.
 * @property {string | undefined} unit - The unit of the recorded value.
 *
 * @constructor
 * @param {DataLastValueViewInput} [model={}] - Optional initial values to assign to the instance.
 */
export class DataLastValueViewClass implements DataLastValueViewInput {
	id: number | undefined
	equLoggerId: number | undefined
	equSensorId: number | undefined
	houseFloorId: number | undefined
	houseLoggerId: number | undefined
	time: string | undefined
	value: number | undefined
	parameter: string | undefined
	unit: string | undefined

	constructor(model: DataLastValueViewInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
