import { createAppSlice } from './createAppSlice'
import type { IAuthState } from './scripts/StoreScripts'
import type { PermissionClass } from '../modules/Admin/scripts/PermissionClass'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AccessLevelDefinitionClass } from '../modules/Admin/scripts/AccessLevelDefinitionClass'

const initialState: IAuthState = {
	permissions: [],
	accessLevels: [],
}

/**
 * Creates the authentication slice for the application's Redux store.
 *
 * @remarks
 * This slice manages authentication-related state, including user permissions and access levels.
 * It provides reducers for updating permissions and access levels, as well as clearing the authentication state.
 * Selectors are included for accessing permissions and access levels from the state.
 *
 * @example
 * // Dispatch an action to update permissions
 * dispatch(authenticateSlice.actions.getPermissions(newPermissions));
 *
 * // Select permissions from the state
 * const permissions = useSelector(authenticateSlice.selectors.selectPermissions);
 *
 * @property name - The name of the slice ('authenticate').
 * @property initialState - The initial state for authentication.
 * @property reducers
 *   - getPermissions: Updates the permissions array in the state.
 *   - getAccessLevels: Updates the access levels array in the state.
 *   - clearAuthState: Clears both permissions and access levels in the state.
 * @property selectors
 *   - selectPermissions: Selector for retrieving permissions from the state.
 *   - selectAccessLevels: Selector for retrieving access levels from the state.
 */
export const authenticateSlice = createAppSlice({
	name: 'authenticate',
	initialState,
	reducers: create => ({
		getPermissions: create.reducer((state, action: PayloadAction<PermissionClass[]>) => {
			state.permissions = action.payload
		}),
		getAccessLevels: create.reducer((state, action: PayloadAction<AccessLevelDefinitionClass[]>) => {
			state.accessLevels = action.payload
		}),
		clearAuthState: create.reducer(state => {
			state.permissions = []
			state.accessLevels = []
		}),
	}),
	selectors: {
		selectPermissions: (state: IAuthState) => state.permissions,
		selectAccessLevels: (state: IAuthState) => state.accessLevels,
	},
})

export const { getPermissions, getAccessLevels, clearAuthState } = authenticateSlice.actions
export const { selectPermissions, selectAccessLevels } = authenticateSlice.selectors
