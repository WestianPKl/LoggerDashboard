/**
 * Represents the input required for user login operations.
 *
 * @property token - (Optional) The authentication token for the user session.
 * @property permissionToken - (Optional) A token specifying the user's permissions.
 */
export interface UserLoginInput {
	token?: string | undefined
	permissionToken?: string | undefined
}

/**
 * Represents a user login model with authentication and permission tokens.
 *
 * @implements {UserLoginInput}
 *
 * @property {string | undefined} token - The authentication token for the user.
 * @property {string | undefined} permissionToken - The permission token for the user.
 *
 * @constructor
 * Creates a new instance of UserLoginClass.
 * @param {UserLoginInput} [model={}] - An optional object to initialize the instance properties.
 */
export class UserLoginClass implements UserLoginInput {
	token: string | undefined
	permissionToken: string | undefined

	constructor(model: UserLoginInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
