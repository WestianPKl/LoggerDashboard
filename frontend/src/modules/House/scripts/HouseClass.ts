import { UserClass } from '../../User/scripts/UserClass'
import { HouseFloorClass } from './HouseFloorClass'

/**
 * Represents the input data structure for a house entity.
 *
 * @property {number} [id] - The unique identifier of the house.
 * @property {string} [name] - The name of the house.
 * @property {string} [postalCode] - The postal code of the house's address.
 * @property {string} [city] - The city where the house is located.
 * @property {string} [street] - The street name of the house's address.
 * @property {string} [houseNumber] - The house number in the address.
 * @property {string} [pictureLink] - A URL to a picture of the house.
 * @property {string} [pictureLinkBig] - A URL to a larger version of the house picture.
 * @property {number} [createdById] - The ID of the user who created the house entry.
 * @property {number} [updatedById] - The ID of the user who last updated the house entry.
 * @property {string} [createdAt] - The ISO date string when the house was created.
 * @property {string} [updatedAt] - The ISO date string when the house was last updated.
 * @property {HouseFloorClass[]} [floors] - An array of floor objects associated with the house.
 * @property {UserClass} [createdBy] - The user who created the house entry.
 * @property {UserClass} [updatedBy] - The user who last updated the house entry.
 */
export interface HouseInput {
	id?: number | undefined
	name?: string | undefined
	postalCode?: string | undefined
	city?: string | undefined
	street?: string | undefined
	houseNumber?: string | undefined
	pictureLink?: string | undefined
	pictureLinkBig?: string | undefined
	createdById?: number | undefined
	updatedById?: number | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	floors?: HouseFloorClass[]
	createdBy?: UserClass | undefined
	updatedBy?: UserClass | undefined
}

/**
 * Represents a house entity with its associated properties and relationships.
 *
 * @implements {HouseInput}
 *
 * @property {number | undefined} id - Unique identifier for the house.
 * @property {string | undefined} name - Name of the house.
 * @property {string | undefined} postalCode - Postal code of the house's location.
 * @property {string | undefined} city - City where the house is located.
 * @property {string | undefined} street - Street address of the house.
 * @property {string | undefined} houseNumber - House number.
 * @property {string | undefined} pictureLink - URL to the house's picture.
 * @property {string | undefined} pictureLinkBig - URL to a larger version of the house's picture.
 * @property {number | undefined} createdById - ID of the user who created the house record.
 * @property {number | undefined} updatedById - ID of the user who last updated the house record.
 * @property {string | undefined} createdAt - Timestamp of when the house was created.
 * @property {string | undefined} updatedAt - Timestamp of the last update to the house.
 * @property {HouseFloorClass[]} floors - List of floors associated with the house.
 * @property {UserClass | undefined} createdBy - User who created the house record.
 * @property {UserClass | undefined} updatedBy - User who last updated the house record.
 *
 * @constructor
 * @param {HouseInput} [model={}] - Optional initial values to populate the house instance.
 */
export class HouseClass implements HouseInput {
	id: number | undefined
	name: string | undefined
	postalCode: string | undefined
	city: string | undefined
	street: string | undefined
	houseNumber: string | undefined
	pictureLink: string | undefined
	pictureLinkBig: string | undefined
	createdById: number | undefined
	updatedById: number | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	floors: HouseFloorClass[] = []
	createdBy: UserClass | undefined
	updatedBy: UserClass | undefined

	constructor(model: HouseInput = {}) {
		if (model) {
			Object.assign(this, model)
			if (model.createdBy) {
				this.createdBy = new UserClass(model.createdBy)
			}
			if (model.updatedBy) {
				this.updatedBy = new UserClass(model.updatedBy)
			}
		}
	}
}
