/**
 * Represents the input data structure for a data log view.
 *
 * @property time - The timestamp of the data log entry, as a string (optional).
 * @property equLoggerId - The unique identifier for the equipment logger (optional).
 * @property equSensorId - The unique identifier for the equipment sensor (optional).
 * @property temperature - The recorded temperature value, as a string (optional).
 * @property humidity - The recorded humidity value, as a string (optional).
 * @property atmPressure - The recorded atmospheric pressure value, as a string (optional).
 * @property altitude - The recorded altitude value, as a string (optional).
 */
export interface DataLogsViewInput {
	time?: string | undefined
	equLoggerId?: number | undefined
	equSensorId?: number | undefined
	temperature?: string | undefined
	humidity?: string | undefined
	atmPressure?: string | undefined
	altitude?: string | undefined
}

/**
 * Represents a view model for data logs, encapsulating sensor readings and metadata.
 *
 * @implements {DataLogsViewInput}
 *
 * @property {string | undefined} time - The timestamp of the log entry.
 * @property {number | undefined} equLoggerId - The identifier of the equipment logger.
 * @property {number | undefined} equSensorId - The identifier of the equipment sensor.
 * @property {string | undefined} temperature - The recorded temperature value.
 * @property {string | undefined} humidity - The recorded humidity value.
 * @property {string | undefined} atmPressure - The recorded atmospheric pressure value.
 * @property {string | undefined} altitude - The recorded altitude value.
 *
 * @constructor
 * Creates a new instance of DataLogsViewClass, optionally initializing properties from a given model.
 * @param {DataLogsViewInput} [model={}] - An optional object to initialize the instance properties.
 */
export class DataLogsViewClass implements DataLogsViewInput {
	time: string | undefined
	equLoggerId: number | undefined
	equSensorId: number | undefined
	temperature: string | undefined
	humidity: string | undefined
	atmPressure: string | undefined
	altitude: string | undefined

	constructor(model: DataLogsViewInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
