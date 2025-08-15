/**
 * Represents the input data required for user registration.
 *
 * @property {string} [username] - The username chosen by the user.
 * @property {string} [email] - The user's email address.
 * @property {string} [password] - The password set by the user.
 * @property {string} [confirmPassword] - The confirmation of the password entered by the user.
 */
export interface UserRegiserInput {
	username?: string | undefined
	email?: string | undefined
	password?: string | undefined
	confirmPassword?: string | undefined
}

/**
 * Represents a user registration model with required fields for registering a new user.
 * Implements the {@link UserRegiserInput} interface.
 *
 * @remarks
 * This class is used to encapsulate the data required for user registration,
 * including username, email, password, and password confirmation.
 *
 * @example
 * ```typescript
 * const user = new UserRegisterClass({
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   password: 'password123',
 *   confirmPassword: 'password123'
 * });
 * ```
 *
 * @param model - An optional object conforming to {@link UserRegiserInput} to initialize the instance.
 */
export class UserRegisterClass implements UserRegiserInput {
	username: string | undefined
	email: string | undefined
	password: string | undefined
	confirmPassword: string | undefined

	constructor(model: UserRegiserInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
