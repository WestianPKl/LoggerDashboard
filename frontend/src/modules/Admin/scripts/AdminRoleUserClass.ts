import { AdminRoleClass } from './AdminRoleClass'

/**
 * Represents the input data required to associate a user with an admin role.
 *
 * @property {number} [roleId] - The unique identifier of the admin role.
 * @property {number} [userId] - The unique identifier of the user.
 * @property {AdminRoleClass} [role] - The admin role object associated with the user.
 */
export interface AdminRoleUserInput {
	roleId?: number | undefined
	userId?: number | undefined
	role?: AdminRoleClass | undefined
}

/**
 * Represents the association between a user and a role in the admin module.
 *
 * @implements {AdminRoleUserInput}
 *
 * @property {number | undefined} roleId - The unique identifier of the role.
 * @property {number | undefined} userId - The unique identifier of the user.
 * @property {AdminRoleClass | undefined} role - The role object associated with the user.
 *
 * @constructor
 * Creates a new instance of AdminRoleUserClass.
 * @param {AdminRoleUserInput} [model={}] - Optional input model to initialize the instance.
 */
export class AdminRoleUserClass implements AdminRoleUserInput {
	roleId: number | undefined
	userId: number | undefined
	role: AdminRoleClass | undefined

	constructor(model: AdminRoleUserInput = {}) {
		if (model) {
			Object.assign(this, model)
			if (model.role) {
				this.role = new AdminRoleClass(model.role)
			}
		}
	}
}
