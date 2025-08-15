import { UserClass } from '../../User/scripts/UserClass'

/**
 * Represents the input structure for an admin role.
 *
 * @property {number} [id] - The unique identifier of the admin role.
 * @property {string} [name] - The name of the admin role.
 * @property {string} [description] - A description of the admin role.
 * @property {number} [createdById] - The ID of the user who created the role.
 * @property {number} [updatedById] - The ID of the user who last updated the role.
 * @property {string} [createdAt] - The ISO date string when the role was created.
 * @property {string} [updatedAt] - The ISO date string when the role was last updated.
 * @property {any} [createdBy] - The user object who created the role.
 * @property {any} [updatedBy] - The user object who last updated the role.
 * @property {UserClass[]} [users] - The list of users assigned to this role.
 */
export interface AdminRoleInput {
	id?: number
	name?: string
	description?: string
	createdById?: number
	updatedById?: number
	createdAt?: string
	updatedAt?: string
	createdBy?: any
	updatedBy?: any
	users?: UserClass[]
}

/**
 * Represents an administrative role within the system.
 *
 * @implements {AdminRoleInput}
 *
 * @property {number | undefined} id - Unique identifier for the admin role.
 * @property {string | undefined} name - Name of the admin role.
 * @property {string | undefined} description - Description of the admin role.
 * @property {number | undefined} createdById - ID of the user who created the role.
 * @property {number | undefined} updatedById - ID of the user who last updated the role.
 * @property {string | undefined} createdAt - Timestamp when the role was created.
 * @property {string | undefined} updatedAt - Timestamp when the role was last updated.
 * @property {UserClass | undefined} createdBy - User who created the role.
 * @property {UserClass | undefined} updatedBy - User who last updated the role.
 * @property {UserClass[]} users - List of users assigned to this role.
 *
 * @constructor
 * @param {AdminRoleInput} [model={}] - Optional initial values to populate the admin role.
 */
export class AdminRoleClass implements AdminRoleInput {
	id: number | undefined
	name: string | undefined
	description: string | undefined
	createdById: number | undefined
	updatedById: number | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	createdBy: UserClass | undefined
	updatedBy: UserClass | undefined
	users: UserClass[] = []

	constructor(model: AdminRoleInput = {}) {
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
