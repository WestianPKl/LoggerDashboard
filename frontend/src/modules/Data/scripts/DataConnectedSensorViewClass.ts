/**
 * Represents the input data structure for a connected sensor view.
 *
 * @property id - The unique identifier for the sensor view (optional).
 * @property equLoggerId - The equipment logger's unique identifier (optional).
 * @property equSensorId - The equipment sensor's unique identifier (optional).
 * @property houseFloorId - The identifier for the house floor where the sensor is located (optional).
 * @property houseLoggerId - The identifier for the house logger associated with the sensor (optional).
 * @property sensorVendor - The vendor/manufacturer of the sensor (optional).
 * @property sensorModel - The model name or number of the sensor (optional).
 * @property sensorSerialNumber - The serial number of the sensor (optional).
 */
export interface DataConnectedSensorViewInput {
	id?: number | undefined
	equLoggerId?: number | undefined
	equSensorId?: number | undefined
	houseFloorId?: number | undefined
	houseLoggerId?: number | undefined
	sensorVendor?: string | undefined
	sensorModel?: string | undefined
	sensorSerialNumber?: string | undefined
}

/**
 * Represents a view model for a connected sensor's data within the system.
 *
 * This class implements the `DataConnectedSensorViewInput` interface and encapsulates
 * properties related to a sensor's connection, such as IDs for the logger, sensor,
 * house floor, and vendor/model/serial information.
 *
 * @remarks
 * The constructor accepts a partial or complete `DataConnectedSensorViewInput` object
 * and assigns its properties to the instance.
 *
 * @property {number | undefined} id - Unique identifier for the connected sensor view.
 * @property {number | undefined} equLoggerId - Identifier for the equipment logger.
 * @property {number | undefined} equSensorId - Identifier for the equipment sensor.
 * @property {number | undefined} houseFloorId - Identifier for the house floor.
 * @property {number | undefined} houseLoggerId - Identifier for the house logger.
 * @property {string | undefined} sensorVendor - Vendor name of the sensor.
 * @property {string | undefined} sensorModel - Model name of the sensor.
 * @property {string | undefined} sensorSerialNumber - Serial number of the sensor.
 *
 * @constructor
 * @param {DataConnectedSensorViewInput} [model={}] - Optional initial values to assign to the instance.
 */
export class DataConnectedSensorViewClass implements DataConnectedSensorViewInput {
	id: number | undefined
	equLoggerId: number | undefined
	equSensorId: number | undefined
	houseFloorId: number | undefined
	houseLoggerId: number | undefined
	sensorVendor: string | undefined
	sensorModel: string | undefined
	sensorSerialNumber: string | undefined

	constructor(model: DataConnectedSensorViewInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
