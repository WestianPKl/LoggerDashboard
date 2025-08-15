import { DataLogClass } from './DataLogClass'
import { EquipmentClass } from '../../Equipment/scripts/EquipmentClass'

/**
 * Represents the input structure for the last value of data logs.
 *
 * @property {number} [id] - The unique identifier for the last value entry.
 * @property {number} [dataLogId] - The identifier of the associated data log.
 * @property {number} [equLoggerId] - The identifier of the equipment logger.
 * @property {number} [equSensorId] - The identifier of the equipment sensor.
 * @property {number} [dataDefinitionId] - The identifier of the data definition.
 * @property {DataLogClass} [log] - The associated data log object.
 * @property {string} [createdAt] - The creation timestamp in ISO format.
 * @property {string} [updatedAt] - The last update timestamp in ISO format.
 * @property {EquipmentClass} [sensor] - The associated equipment sensor object.
 */
export interface DataLastValueInput {
	id?: number | undefined
	dataLogId?: number | undefined
	equLoggerId?: number | undefined
	equSensorId?: number | undefined
	dataDefinitionId?: number | undefined
	log?: DataLogClass | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	sensor?: EquipmentClass | undefined
}

/**
 * Represents the last recorded value of a data log entry, including references to related entities.
 *
 * @implements {DataLastValueInput}
 *
 * @property {number | undefined} id - Unique identifier for the last value entry.
 * @property {number | undefined} dataLogId - Identifier of the associated data log.
 * @property {number | undefined} equLoggerId - Identifier of the equipment logger.
 * @property {number | undefined} equSensorId - Identifier of the equipment sensor.
 * @property {number | undefined} dataDefinitionId - Identifier of the data definition.
 * @property {DataLogClass | undefined} log - Instance of the related data log.
 * @property {string | undefined} createdAt - Timestamp of when the entry was created.
 * @property {string | undefined} updatedAt - Timestamp of the last update.
 * @property {EquipmentClass | undefined} sensor - Instance of the related equipment sensor.
 *
 * @constructor
 * Creates a new instance of DataLastValueClass, optionally initializing it with values from a DataLastValueInput model.
 * If the model includes nested `log` or `sensor` objects, they are instantiated as `DataLogClass` and `EquipmentClass` respectively.
 *
 * @param {DataLastValueInput} [model={}] - Optional initial values for the instance.
 */
export class DataLastValueClass implements DataLastValueInput {
	id: number | undefined
	dataLogId: number | undefined
	equLoggerId: number | undefined
	equSensorId: number | undefined
	dataDefinitionId: number | undefined
	log: DataLogClass | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	sensor: EquipmentClass | undefined

	constructor(model: DataLastValueInput = {}) {
		if (model) {
			Object.assign(this, model)
			if (model.log) {
				this.log = new DataLogClass(model.log)
			}
			if (model.sensor) {
				this.sensor = new EquipmentClass(model.sensor)
			}
		}
	}
}
