import type { UserClass } from '../../User/scripts/UserClass'
import type { AccessLevelDefinitionClass } from './AccessLevelDefinitionClass'
import type { AdminRoleClass } from './AdminRoleClass'
import type { FunctionalityDefinitionClass } from './FunctionalityDefinitionClass'
import type { ObjectDefinitionClass } from './ObjectDefinitionClass'
/**
 * Props for the component responsible for adding or editing access level definitions.
 *
 * @property edit - Indicates whether the dialog is in edit mode.
 * @property selectedItems - The currently selected access level definitions, if any.
 * @property handleCloseAdd - Callback to close the add/edit dialog.
 * @property openAddDialog - Whether the add/edit dialog is open.
 * @property addItemHandler - Handler function to add one or more access level definitions.
 */
export interface IAddAccessLevelDefinitionProps {
	edit: boolean
	selectedItems?: AccessLevelDefinitionClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddAccessLevelDefinitionData[] | IAddAccessLevelDefinitionData) => void
}

/**
 * Represents the data required to add or define an access level.
 *
 * @property {number} [id] - The unique identifier for the access level definition (optional).
 * @property {string | undefined} name - The name of the access level.
 * @property {number | undefined} accessLevel - The numeric value representing the access level.
 */
export interface IAddAccessLevelDefinitionData {
	id?: number
	name: string | undefined
	accessLevel: number | undefined
}

/**
 * Props for a component that displays a table of access level definitions.
 *
 * @property accessLevels - An array of `AccessLevelDefinitionClass` instances representing the access levels to display.
 */
export interface IAccessLevelDefinitionTableProps {
	accessLevels: AccessLevelDefinitionClass[]
}

/**
 * Props for the Add Functionality Definition dialog component.
 *
 * @property edit - Indicates whether the dialog is in edit mode.
 * @property selectedItems - Optional array of selected functionality definitions.
 * @property handleCloseAdd - Callback to close the add dialog.
 * @property openAddDialog - Controls whether the add dialog is open.
 * @property addItemHandler - Handler to add one or more functionality definition items.
 */
export interface IAddFunctionalityDefinitionProps {
	edit: boolean
	selectedItems?: FunctionalityDefinitionClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddFunctionalityDefinitionData[] | IAddFunctionalityDefinitionData) => void
}

/**
 * Represents the data required to add a new functionality definition.
 *
 * @property {number} [id] - The unique identifier of the functionality definition (optional).
 * @property {string | undefined} name - The name of the functionality definition.
 * @property {string | undefined} description - A description of the functionality definition.
 */
export interface IAddFunctionalityDefinitionData {
	id?: number
	name: string | undefined
	description: string | undefined
}

/**
 * Props for a table component displaying a list of functionality definitions.
 *
 * @property functionalityDefinitions - An array of `FunctionalityDefinitionClass` instances to be displayed in the table.
 */
export interface IFunctionalityDefinitionTableProps {
	functionalityDefinitions: FunctionalityDefinitionClass[]
}

/**
 * Props for the Add Object Definition dialog component.
 *
 * @property edit - Indicates whether the dialog is in edit mode.
 * @property selectedItems - Optional array of selected object definitions.
 * @property handleCloseAdd - Callback to close the add dialog.
 * @property openAddDialog - Controls whether the add dialog is open.
 * @property addItemHandler - Handler function to add one or more object definitions.
 */
export interface IAddObjectDefinitionProps {
	edit: boolean
	selectedItems?: ObjectDefinitionClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddObjectDefinitionData[] | IAddObjectDefinitionData) => void
}

/**
 * Represents the data required to add a new object definition.
 *
 * @property {number} [id] - The unique identifier of the object definition (optional).
 * @property {string | undefined} name - The name of the object definition.
 * @property {string | undefined} description - The description of the object definition.
 */
export interface IAddObjectDefinitionData {
	id?: number
	name: string | undefined
	description: string | undefined
}

/**
 * Props for a table component that displays a list of object definitions.
 *
 * @property objectDefinitions - An array of `ObjectDefinitionClass` instances to be displayed in the table.
 */
export interface IObjectDefinitionTableProps {
	objectDefinitions: ObjectDefinitionClass[]
}

/**
 * Props for the Add Admin Role component.
 *
 * @property edit - Indicates if the component is in edit mode.
 * @property selectedItems - Optional array of selected admin role items.
 * @property handleCloseAdd - Callback to close the add dialog.
 * @property openAddDialog - Controls the visibility of the add dialog.
 * @property addItemHandler - Handler function to add one or more admin role items.
 */
export interface IAddAdminRoleProps {
	edit: boolean
	selectedItems?: AdminRoleClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddAdminRoleData[] | IAddAdminRoleData) => void
}

/**
 * Props for the Admin Roles Table component.
 *
 * @property admRoles - An array of AdminRoleClass instances representing the available admin roles to display in the table.
 */
export interface IAdminRolesTableProps {
	admRoles: AdminRoleClass[]
}

/**
 * Represents the data required to add a new admin role.
 *
 * @property {number} [id] - The unique identifier of the admin role (optional).
 * @property {string | undefined} name - The name of the admin role.
 * @property {string | undefined} description - A description of the admin role.
 */
export interface IAddAdminRoleData {
	id?: number
	name: string | undefined
	description: string | undefined
}

/**
 * Props for a user table component.
 *
 * @property users - An array of UserClass instances to be displayed in the table.
 */
export interface IUserTableProps {
	users: UserClass[]
}

/**
 * Represents the data required to assign an admin role to a user.
 *
 * @property roleId - The unique identifier of the admin role to assign. Can be `undefined` if not specified.
 * @property userId - The unique identifier of the user to whom the role will be assigned. Can be `undefined` if not specified.
 */
export interface IAddAdminRoleUserData {
	roleId: number | undefined
	userId: number | undefined
}

/**
 * Represents the data required to add a role permission for an admin user.
 *
 * @property {number} [id] - The unique identifier for the role permission entry (optional).
 * @property {number} [userId] - The unique identifier of the user to whom the role is assigned (optional).
 * @property {number} [roleId] - The unique identifier of the role being assigned (optional).
 * @property {number | undefined} admFunctionalityDefinitionId - The identifier for the admin functionality definition.
 * @property {number | undefined | null} admObjectDefinitionId - The identifier for the admin object definition (can be undefined or null).
 * @property {number | undefined} admAccessLevelDefinitionId - The identifier for the admin access level definition.
 */
export interface IAddAdminRolePermissionData {
	id?: number
	userId?: number
	roleId?: number
	admFunctionalityDefinitionId: number | undefined
	admObjectDefinitionId: number | undefined | null
	admAccessLevelDefinitionId: number | undefined
}

/**
 * Props for the component that handles adding users to an admin role.
 *
 * @property selectedItems - An array of `AdminRoleClass` instances representing the currently selected admin role users.
 * @property handleCloseAdd - Callback function to close the add user dialog.
 * @property openAddDialog - Boolean flag indicating whether the add user dialog is open.
 */
export interface IAddAdminRoleUserProps {
	selectedItems: AdminRoleClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
}

/**
 * Props for the component that handles adding role permissions to an admin.
 *
 * @property selectedItems - The list of selected admin roles to which permissions will be added.
 * @property handleCloseAdd - Callback function to close the add permission dialog.
 * @property openAddDialog - Boolean flag indicating whether the add permission dialog is open.
 */
export interface IAddAdminRolePermissionProps {
	selectedItems: AdminRoleClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
}

/**
 * Props for the component responsible for adding admin user permissions.
 *
 * @property selectedItems - An array of UserClass objects representing the currently selected users.
 * @property handleCloseAdd - Callback function to close the add admin user permission dialog.
 * @property openAddDialog - Boolean flag indicating whether the add dialog is open.
 */
export interface IAddAdminUserPermissionProps {
	selectedItems: UserClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
}

/**
 * Props for the Add Admin User Permission Dialog component.
 *
 * @property {number} [userId] - The ID of the user for whom permissions are being managed (optional).
 * @property {number} [roleId] - The ID of the role associated with the user (optional).
 * @property {() => void} handleCloseAdd - Callback function to close the add dialog.
 * @property {boolean} openAddDialog - Indicates whether the add dialog is open.
 * @property {(item: IAddAdminRolePermissionData[] | IAddAdminRolePermissionData) => void} addItemHandler -
 *   Handler function to add one or more admin role permission items.
 */
export interface IAddAdminUserPermissionDialogProps {
	userId?: number
	roleId?: number
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddAdminRolePermissionData[] | IAddAdminRolePermissionData) => void
}

/**
 * Represents the data structure for the dialog used to add a role to one or more users in the admin panel.
 *
 * @property roleId - The unique identifier of the role to be assigned. Can be `undefined` if not selected.
 * @property user - An array of `UserClass` instances representing the users to whom the role will be assigned. Can be `undefined` if no users are selected.
 */
export interface IAddAdminRoleUserDataDialog {
	roleId: number | undefined
	user: UserClass[] | undefined
}

/**
 * Props for the Add Admin Role User Dialog component.
 *
 * @property roleId - The ID of the admin role to assign to the user.
 * @property handleCloseAdd - Callback function to close the add dialog.
 * @property openAddDialog - Boolean indicating whether the add dialog is open.
 * @property addItemHandler - Handler function to add one or more admin role user data items.
 */
export interface IAddAdminRoleUserDialogProps {
	roleId: number
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddAdminRoleUserDataDialog[] | IAddAdminRoleUserDataDialog) => void
}

/**
 * Props for managing user permissions and roles within the admin module.
 *
 * @property usersData - An array of UserClass instances representing the users.
 * @property isAdmin - Optional flag indicating if the current context is administrative.
 * @property userId - Optional ID of the user for whom permissions are being managed.
 * @property roleId - Optional ID of the role associated with the user.
 */
export interface IRoleUserPermissionProps {
	usersData: UserClass[]
	isAdmin?: boolean
	userId?: number
	roleId?: number
}
