import type { PermissionClass } from './PermissionClass'

/**
 * Represents the structure of a decoded authentication token.
 *
 * @property tokenType - The type of the token (e.g., access, refresh).
 * @property user - The user information associated with the token, including id, username, email, creation and update timestamps, and confirmation status.
 * @property permissions - An array of permissions granted to the user.
 * @property expiration - The expiration date and time of the token in ISO string format.
 * @property superuser - Indicates whether the user has superuser privileges.
 */
export interface IDecodedToken {
	tokenType: number
	user: { id: number; username: string; email: string; createdAt: string; updatedAt: string; confirmed: number }
	permissions: PermissionClass[]
	expiration: string
	superuser: boolean
}
