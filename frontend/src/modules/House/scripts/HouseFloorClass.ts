import { HouseClass } from './HouseClass'
import { HouseLoggerClass } from './HouseLoggerClass'

/**
 * Represents the input data required to define a house floor.
 *
 * @property {number} [id] - The unique identifier of the floor.
 * @property {string} [name] - The name of the floor.
 * @property {string} [layout] - The layout image or data for the floor.
 * @property {string} [layoutBig] - The high-resolution layout image or data for the floor.
 * @property {number} [houseId] - The identifier of the associated house.
 * @property {HouseClass} [house] - The associated house object.
 * @property {HouseLoggerClass[]} [loggers] - The list of loggers associated with the floor.
 * @property {number} x - The X coordinate of the floor's position.
 * @property {number} y - The Y coordinate of the floor's position.
 * @property {number} zoom - The zoom level for the floor layout.
 * @property {number} [posX] - The X position offset for the floor.
 * @property {number} [posY] - The Y position offset for the floor.
 */
export interface HouseFloorInput {
	id?: number | undefined
	name?: string | undefined
	layout?: string | undefined
	layoutBig?: string | undefined
	houseId?: number | undefined
	house?: HouseClass | undefined
	loggers?: HouseLoggerClass[]
	x?: number
	y?: number
	zoom?: number
	posX?: number | undefined
	posY?: number | undefined
}

/**
 * Represents a floor within a house, including its layout, position, zoom, and associated loggers.
 * Implements the `HouseFloorInput` interface.
 *
 * @property {number | undefined} id - The unique identifier of the floor.
 * @property {string | undefined} name - The name of the floor.
 * @property {string | undefined} layout - The layout image or data for the floor.
 * @property {string | undefined} layoutBig - The high-resolution layout image or data for the floor.
 * @property {number | undefined} houseId - The identifier of the associated house.
 * @property {HouseClass | undefined} house - The associated house object.
 * @property {HouseLoggerClass[]} loggers - The list of loggers associated with the floor.
 * @property {number} x - The X coordinate for the floor's position.
 * @property {number} y - The Y coordinate for the floor's position.
 * @property {number} zoom - The zoom level for the floor's layout.
 * @property {number | undefined} posX - The X position of the floor (optional).
 * @property {number | undefined} posY - The Y position of the floor (optional).
 *
 * @constructor
 * Creates a new instance of HouseFloorClass.
 * @param {HouseFloorInput} [model={}] - An optional model to initialize the floor's properties.
 */
export class HouseFloorClass implements HouseFloorInput {
	id: number | undefined
	name: string | undefined
	layout: string | undefined
	layoutBig: string | undefined
	houseId: number | undefined
	house: HouseClass | undefined
	loggers: HouseLoggerClass[] = []
	x: number = 0
	y: number = 0
	zoom: number = 1
	posX: number | undefined
	posY: number | undefined

	constructor(model: HouseFloorInput = {}) {
		if (model) {
			Object.assign(this, model)
			if (model.house) {
				this.house = new HouseClass(model.house)
			}
		}
	}
}
