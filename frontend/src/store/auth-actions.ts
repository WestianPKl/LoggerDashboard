import type { AppThunk } from './store'
import { selectPermissions, selectAccessLevels } from './auth-store'
import { getPermissions, getAccessLevels } from './auth-store'
import { showAlert } from './application-store'
import { adminApi } from './api/adminApi'
import type { RootState } from './store'

/**
 * Thunk action to fetch permissions for a specific user by their user ID.
 *
 * Dispatches an API call to retrieve the user's permissions and updates the store with the result.
 * If an error occurs during the fetch, an alert is dispatched with the error message.
 *
 * @param userId - The unique identifier of the user whose permissions are to be fetched.
 * @returns A thunk action that performs the permission fetch and dispatches relevant actions.
 */
export const fetchPermission =
	(userId: number): AppThunk =>
	async dispatch => {
		try {
			const permissions = await dispatch(adminApi.endpoints.getPermissions.initiate({ userId })).unwrap()
			dispatch(getPermissions(permissions))
		} catch (err: any) {
			dispatch(showAlert({ message: err.message, severity: 'error' }))
		}
	}

/**
 * Thunk action to fetch access level definitions from the server.
 *
 * Dispatches an API call to retrieve access level definitions using the `adminApi`.
 * On success, dispatches the `getAccessLevels` action with the retrieved data.
 * On failure, dispatches the `showAlert` action with an error message.
 *
 * @returns {AppThunk} A thunk action for fetching access levels.
 */
export const fetchAccessLevels = (): AppThunk => async dispatch => {
	try {
		const accessLevels = await dispatch(adminApi.endpoints.getAccessLevelDefinitions.initiate({})).unwrap()
		dispatch(getAccessLevels(accessLevels))
	} catch (err: any) {
		dispatch(showAlert({ message: err.message, severity: 'error' }))
	}
}

/**
 * Checks if the current user has the required permission for a specific functionality and object at a given access level.
 *
 * @param functionName - The name of the functionality to check permission for. If `null`, checks for permissions not tied to a specific functionality.
 * @param objectName - The name of the object to check permission for. If `null`, checks for permissions not tied to a specific object.
 * @param requestedAccessLevel - The required access level name (e.g., "Read", "Write").
 * @returns A selector function that takes the Redux `RootState` and returns `true` if the user has the required permission, otherwise `false`.
 *
 * @remarks
 * - This function uses selectors to retrieve the user's permissions and access levels from the Redux state.
 * - It filters permissions based on the required access level, functionality, and object.
 * - Returns `false` if the required access level is not found or if no matching permission exists.
 */
export function checkPermission(
	functionName: string,
	objectName: string | null,
	requestedAccessLevel: string
): (state: RootState) => boolean {
	return (state: RootState): boolean => {
		let returnValue = false
		if (!requestedAccessLevel) return returnValue
		const permissions = selectPermissions(state)
		const accessLevels = selectAccessLevels(state)
		if (permissions.length > 0) {
			let permissionItems = permissions.filter(_ => true)
			const requestedAccessLevelsData = accessLevels.filter(e => e.name === requestedAccessLevel)
			if (
				!requestedAccessLevelsData ||
				requestedAccessLevelsData.length < 1 ||
				!requestedAccessLevelsData[0].accessLevel
			) {
				return false
			}
			const requestedAccessValue = requestedAccessLevelsData[0].accessLevel
			permissionItems = permissionItems.filter(item => item.accessLevelDefinition?.accessLevel! >= requestedAccessValue)
			if (functionName == null) {
				permissionItems = permissionItems.filter(item => item.admFunctionalityDefinitionId === null)
			} else {
				permissionItems = permissionItems.filter(
					item => item.functionalityDefinition && item.functionalityDefinition.name === functionName
				)
			}
			if (objectName == null) {
				permissionItems = permissionItems.filter(item => item.admObjectDefinitionId === undefined)
			} else {
				permissionItems = permissionItems.filter(
					item => item.objectDefinition && item.objectDefinition.name === objectName
				)
			}
			if (permissionItems.length > 0) {
				returnValue = true
			}
		}
		return returnValue
	}
}
/**
 * Checks if the current user has 'READ' permission for a specific function and object.
 *
 * @param functionName - The name of the function to check permission for.
 * @param objectName - The name of the object to check permission for, or null if not applicable.
 * @returns A selector function that takes the application state and returns a boolean indicating if the user has 'READ' permission.
 */
export const canRead = (functionName: string, objectName: string | null) => (state: RootState) =>
	checkPermission(functionName, objectName, 'READ')(state)

/**
 * Selector to determine if the current user has WRITE permission for a specific function and object.
 *
 * @param functionName - The name of the function to check permissions for.
 * @param objectName - The name of the object to check permissions for, or null if not applicable.
 * @returns A function that takes the Redux `RootState` and returns a boolean indicating WRITE permission.
 */
export const canWrite = (functionName: string, objectName: string | null) => (state: RootState) =>
	checkPermission(functionName, objectName, 'WRITE')(state)

/**
 * Selector function to determine if the current user has DELETE permission
 * for a specific function and object.
 *
 * @param functionName - The name of the function or feature to check permissions for.
 * @param objectName - The name of the object to check permissions for, or null if not applicable.
 * @returns A function that takes the Redux `RootState` and returns a boolean indicating
 *          whether the user has DELETE permission.
 */
export const canDelete = (functionName: string, objectName: string | null) => (state: RootState) =>
	checkPermission(functionName, objectName, 'DELETE')(state)
