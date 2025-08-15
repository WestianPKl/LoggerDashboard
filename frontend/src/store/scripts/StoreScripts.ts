import { UserClass } from '../../modules/User/scripts/UserClass'
import { PermissionClass } from '../../modules/Admin/scripts/PermissionClass'
import { AccessLevelDefinitionClass } from '../../modules/Admin/scripts/AccessLevelDefinitionClass'

/**
 * Represents the authentication and profile state of the current user account.
 *
 * @property user - The current user's information, or undefined if not loaded.
 * @property isLogged - Indicates whether the user is currently logged in.
 * @property isAdmin - Indicates whether the user has administrative privileges.
 * @property loading - True if the account state is being loaded or updated.
 * @property duration - The session duration in seconds, or undefined if not set.
 * @property token - The authentication token for the current session, or undefined if not available.
 * @property avatar - The URL or identifier for the user's avatar image, or undefined if not set.
 */
export interface IAccountState {
	user: UserClass | undefined
	isLogged: boolean
	isAdmin: boolean
	loading: boolean
	duration: number | undefined
	token: string | undefined
	avatar: string | undefined
}

/**
 * Represents the state of an application message or notification.
 *
 * @property message - The message(s) to display. Can be a single string or an array of strings.
 * @property severity - The severity level of the message. Can be 'success', 'info', 'warning', or 'error'.
 * @property isActive - Indicates whether the message is currently active and should be displayed.
 * @property timeout - The duration in milliseconds before the message is automatically dismissed.
 */
export interface IApplicationState {
	message: string[] | string
	severity: 'success' | 'info' | 'warning' | 'error'
	isActive: boolean
	timeout: number
}
/**
 * Represents the authentication state, including user permissions and access levels.
 *
 * @property permissions - An array of `PermissionClass` objects representing the user's granted permissions.
 * @property accessLevels - An array of `AccessLevelDefinitionClass` objects defining the user's access levels.
 */
export interface IAuthState {
	permissions: PermissionClass[]
	accessLevels: AccessLevelDefinitionClass[]
}

/**
 * Represents the state of an application notification or message.
 *
 * @property message - The message(s) to display. Can be a single string or an array of strings.
 * @property severity - The severity level of the message. Can be 'success', 'info', 'warning', or 'error'.
 * @property isActive - Indicates whether the message is currently active and should be displayed.
 * @property timeout - The duration in milliseconds before the message is automatically dismissed.
 */
export interface IApplicationState {
	message: string[] | string
	severity: 'success' | 'info' | 'warning' | 'error'
	isActive: boolean
	timeout: number
}
