import { EquipmentClass } from '../../Equipment/scripts/EquipmentClass'
import { HouseFloorClass } from './HouseFloorClass'

/**
 * Represents the input data required to create or update a house logger.
 *
 * @property {number} [id] - The unique identifier of the house logger (optional).
 * @property {number} [equLoggerId] - The identifier of the associated equipment logger (optional).
 * @property {number} [houseFloorId] - The identifier of the house floor where the logger is located (optional).
 * @property {number} [posX] - The X coordinate position of the logger within the floor (optional).
 * @property {number} [posY] - The Y coordinate position of the logger within the floor (optional).
 * @property {EquipmentClass} [logger] - The equipment logger instance associated with this house logger (optional).
 * @property {HouseFloorClass} [floor] - The house floor instance associated with this house logger (optional).
 */
export interface HouseLoggerInput {
	id?: number | undefined
	equLoggerId?: number | undefined
	houseFloorId?: number | undefined
	posX?: number | undefined
	posY?: number | undefined
	logger?: EquipmentClass | undefined
	floor?: HouseFloorClass | undefined
}

/**
 * Represents a logger device associated with a house floor.
 *
 * @implements {HouseLoggerInput}
 *
 * @property {number | undefined} id - Unique identifier for the house logger.
 * @property {number | undefined} equLoggerId - Identifier for the associated equipment logger.
 * @property {number | undefined} houseFloorId - Identifier for the house floor where the logger is located.
 * @property {number | undefined} posX - X coordinate position of the logger on the floor.
 * @property {number | undefined} posY - Y coordinate position of the logger on the floor.
 * @property {EquipmentClass | undefined} logger - The equipment logger instance.
 * @property {HouseFloorClass | undefined} floor - The house floor instance.
 *
 * @constructor
 * Creates a new instance of HouseLoggerClass.
 * @param {HouseLoggerInput} [model={}] - Optional initial values to populate the logger instance.
 */
export class HouseLoggerClass implements HouseLoggerInput {
	id: number | undefined
	equLoggerId: number | undefined
	houseFloorId: number | undefined
	posX: number | undefined
	posY: number | undefined
	logger: EquipmentClass | undefined
	floor: HouseFloorClass | undefined

	constructor(model: HouseLoggerInput = {}) {
		if (model) {
			Object.assign(this, model)
			if (model.logger) {
				this.logger = new EquipmentClass(model.logger)
			}
			if (model.floor) {
				this.floor = new HouseFloorClass(model.floor)
			}
		}
	}
}
