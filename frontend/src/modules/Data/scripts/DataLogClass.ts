import { DataDefinitionClass } from './DataDefinitionClass'
import { EquipmentClass } from '../../Equipment/scripts/EquipmentClass'

/**
 * Represents the input structure for a data log entry.
 *
 * @property {number} [id] - The unique identifier of the data log entry.
 * @property {string} [value] - The value recorded in the log.
 * @property {string} [time] - The timestamp when the log entry was created (ISO string).
 * @property {number} [dataDefinitionId] - The identifier for the associated data definition.
 * @property {number} [equLoggerId] - The identifier for the equipment logger.
 * @property {number} [equSensorId] - The identifier for the equipment sensor.
 * @property {DataDefinitionClass} [definition] - The data definition object related to this log.
 * @property {EquipmentClass} [logger] - The equipment logger object related to this log.
 * @property {EquipmentClass} [sensor] - The equipment sensor object related to this log.
 * @property {string} [event] - An optional event description or type associated with the log entry.
 */
export interface DataLogInput {
	id?: number | undefined
	value?: string | undefined
	time?: string | undefined
	dataDefinitionId?: number | undefined
	equLoggerId?: number | undefined
	equSensorId?: number | undefined
	definition?: DataDefinitionClass | undefined
	logger?: EquipmentClass | undefined
	sensor?: EquipmentClass | undefined
	event?: string
}

/**
 * Represents a data log entry with associated metadata and relationships.
 *
 * @implements {DataLogInput}
 *
 * @property {number | undefined} id - Unique identifier for the data log entry.
 * @property {string | undefined} value - The value recorded in the log.
 * @property {string | undefined} time - The timestamp of the log entry.
 * @property {number | undefined} dataDefinitionId - Identifier for the data definition.
 * @property {number | undefined} equLoggerId - Identifier for the equipment logger.
 * @property {number | undefined} equSensorId - Identifier for the equipment sensor.
 * @property {DataDefinitionClass | undefined} definition - The data definition associated with this log.
 * @property {EquipmentClass | undefined} logger - The equipment logger associated with this log.
 * @property {EquipmentClass | undefined} sensor - The equipment sensor associated with this log.
 * @property {string} [event] - Optional event description related to the log entry.
 *
 * @constructor
 * Creates a new instance of DataLogClass.
 * Initializes properties from the provided model and instantiates related classes if present.
 * 
 * @param {DataLogInput} [model={}] - The input model to initialize the data log entry.
 */
export class DataLogClass implements DataLogInput {
	id: number | undefined
	value: string | undefined
	time: string | undefined
	dataDefinitionId: number | undefined
	equLoggerId: number | undefined
	equSensorId: number | undefined
	definition: DataDefinitionClass | undefined
	logger: EquipmentClass | undefined
	sensor: EquipmentClass | undefined
	event?: string

	constructor(model: DataLogInput = {}) {
		if (model) {
			Object.assign(this, model)
			if (model.definition) {
				this.definition = new DataDefinitionClass(model.definition)
			}
			if (model.logger) {
				this.logger = new EquipmentClass(model.logger)
			}
			if (model.sensor) {
				this.sensor = new EquipmentClass(model.sensor)
			}
		}
	}
}
