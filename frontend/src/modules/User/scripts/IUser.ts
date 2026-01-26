import type { AdminRoleUserClass } from '../../Admin/scripts/AdminRoleUserClass'
import type { PermissionClass } from '../../Admin/scripts/PermissionClass'
import type { UserClass } from './UserClass'

export interface IUserProfileProps {
	user: UserClass
}

export interface IUserFormProps {
	user: UserClass
	onSave: (data: IUserProfileData) => void
}

export interface IUserProfileData {
	username: string | undefined
	email: string | undefined
	password: string | undefined
}

export interface IUserAvatarProps {
	avatarUrl: string | undefined
	onAvatarChange: (avatarData: any) => void
}

export interface IUserPermissionProps {
	permissionData: PermissionClass[]
	isAdmin?: boolean
	userId?: number
	roleId?: number
}

export interface IUserRolesProps {
	rolesData: AdminRoleUserClass[]
}
