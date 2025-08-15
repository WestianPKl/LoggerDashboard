import type { AdminRoleUserClass } from '../../Admin/scripts/AdminRoleUserClass'
import type { PermissionClass } from '../../Admin/scripts/PermissionClass'
import type { UserClass } from './UserClass'

/**
 * Props for the user profile component.
 *
 * @property user - An instance of the UserClass representing the current user.
 */
export interface IUserProfileProps {
	user: UserClass
}

/**
 * Props for a user form component.
 *
 * @property user - An instance of the UserClass representing the current user.
 * @property onSave - Callback function invoked when the form is saved, receiving the updated user profile data.
 */
export interface IUserFormProps {
	user: UserClass
	onSave: (data: IUserProfileData) => void
}

/**
 * Represents the profile data of a user.
 *
 * @property username - The username of the user, or undefined if not set.
 * @property email - The email address of the user, or undefined if not set.
 * @property password - The user's password, or undefined if not set.
 */
export interface IUserProfileData {
	username: string | undefined
	email: string | undefined
	password: string | undefined
}

/**
 * Props for the user avatar component.
 *
 * @property avatarUrl - The URL of the user's avatar image. Can be undefined if no avatar is set.
 * @property onAvatarChange - Callback function invoked when the avatar is changed. Receives the new avatar data as a parameter.
 */
export interface IUserAvatarProps {
	avatarUrl: string | undefined
	onAvatarChange: (avatarData: any) => void
}

/**
 * Props representing a user's permissions and related metadata.
 *
 * @property permissionData - An array of `PermissionClass` objects representing the user's permissions.
 * @property isAdmin - (Optional) Indicates if the user has administrative privileges.
 * @property userId - (Optional) The unique identifier of the user.
 * @property roleId - (Optional) The unique identifier of the user's role.
 */
export interface IUserPermissionProps {
	permissionData: PermissionClass[]
	isAdmin?: boolean
	userId?: number
	roleId?: number
}

/**
 * Props for components that require user role data.
 *
 * @property rolesData - An array of `AdminRoleUserClass` instances representing the roles assigned to a user.
 */
export interface IUserRolesProps {
	rolesData: AdminRoleUserClass[]
}
