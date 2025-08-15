/**
 * Represents the input data required to create or update a user.
 *
 * @property {number} [id] - The unique identifier of the user.
 * @property {string} [username] - The username of the user.
 * @property {string} [email] - The email address of the user.
 * @property {string} [createdAt] - The ISO date string representing when the user was created.
 * @property {string} [updatedAt] - The ISO date string representing when the user was last updated.
 * @property {number} [confirmed] - Indicates whether the user's email is confirmed (e.g., 1 for confirmed, 0 for not).
 * @property {string} [avatar] - The URL or path to the user's avatar image.
 * @property {string} [avatarBig] - The URL or path to the user's larger avatar image.
 */
export interface UserInput {
	id?: number | undefined
	username?: string | undefined
	email?: string | undefined
	createdAt?: string | undefined
	updatedAt?: string | undefined
	confirmed?: number | undefined
	avatar?: string | undefined
	avatarBig?: string | undefined
}

/**
 * Represents a user entity with basic profile information.
 * Implements the {@link UserInput} interface.
 *
 * @remarks
 * This class is used to encapsulate user data, including identification,
 * authentication, and profile details. It provides a constructor that
 * initializes its properties from a given {@link UserInput} model.
 *
 * @property id - The unique identifier of the user.
 * @property username - The username of the user.
 * @property email - The email address of the user.
 * @property createdAt - The ISO string representing when the user was created.
 * @property updatedAt - The ISO string representing when the user was last updated.
 * @property confirmed - Indicates whether the user's email is confirmed (e.g., 1 for confirmed, 0 for not).
 * @property avatar - (Optional) The URL or path to the user's avatar image.
 * @property avatarBig - (Optional) The URL or path to the user's larger avatar image.
 *
 * @constructor
 * Creates a new UserClass instance, optionally initializing properties from a {@link UserInput} object.
 *
 * @param model - An optional object conforming to {@link UserInput} to initialize the user properties.
 */
export class UserClass implements UserInput {
	id: number | undefined
	username: string | undefined
	email: string | undefined
	createdAt: string | undefined
	updatedAt: string | undefined
	confirmed: number | undefined
	avatar?: string | undefined
	avatarBig?: string | undefined

	constructor(model: UserInput = {}) {
		if (model) {
			Object.assign(this, model)
		}
	}
}
