import { createAppSlice } from './createAppSlice'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { IApplicationState } from './scripts/StoreScripts'

const initialState: IApplicationState = {
	message: '',
	severity: 'success',
	isActive: false,
	timeout: 5000,
}

/**
 * Defines the application slice for managing alert state in the Redux store.
 *
 * This slice includes reducers for showing and hiding alerts, as well as selectors
 * for accessing alert-related state properties such as timeout, active status, message, and severity.
 *
 * @remarks
 * - `showAlert`: Activates an alert with a specified message, severity, and optional timeout.
 * - `hideAlert`: Deactivates the alert and resets its state.
 * - Selectors provide convenient access to alert state properties.
 *
 * @example
 * // Dispatch an alert
 * dispatch(applicationSlice.actions.showAlert({
 *   message: "Operation successful",
 *   severity: "success",
 *   timeout: 3000
 * }));
 *
 * // Hide the alert
 * dispatch(applicationSlice.actions.hideAlert());
 */
export const applicationSlice = createAppSlice({
	name: 'application',
	initialState,
	reducers: create => ({
		showAlert: create.reducer(
			(
				state,
				action: PayloadAction<{
					message: string | string[]
					severity: 'success' | 'info' | 'warning' | 'error'
					timeout?: number
				}>
			) => {
				state.message = action.payload.message
				state.severity = action.payload.severity
				state.isActive = true
				if (action.payload.timeout !== undefined) {
					state.timeout = action.payload.timeout
				}
			}
		),
		hideAlert: create.reducer(state => {
			state.isActive = false
			state.message = ''
			state.severity = 'success'
		}),
	}),
	selectors: {
		selectTimeout: (state: IApplicationState) => state.timeout,
		selectIsActive: (state: IApplicationState) => state.isActive,
		selectMessage: (state: IApplicationState) => state.message,
		selectSeverity: (state: IApplicationState) => state.severity,
	},
})

export const { showAlert, hideAlert } = applicationSlice.actions
export const { selectTimeout, selectIsActive, selectMessage, selectSeverity } = applicationSlice.selectors
