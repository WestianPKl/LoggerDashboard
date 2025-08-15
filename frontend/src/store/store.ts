import { configureStore, combineSlices, type Action, type ThunkAction } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { accountSlice } from './account-store'
import { applicationSlice } from './application-store'
import { authenticateSlice } from './auth-store'
import { api } from './api/api'

const rootReducer = combineSlices(accountSlice, applicationSlice, authenticateSlice, api)
export type RootState = ReturnType<typeof rootReducer>

/**
 * Creates and configures a Redux store instance with optional preloaded state.
 *
 * @param preloadedState - An optional partial initial state to preload into the store.
 * @returns The configured Redux store instance.
 *
 * @remarks
 * - Disables the default Redux serializable state invariant middleware check.
 * - Adds custom API middleware to the middleware chain.
 * - Sets up listeners for refetching on focus or reconnect.
 */
export const makeStore = (preloadedState?: Partial<RootState>) => {
	const store = configureStore({
		reducer: rootReducer,
		middleware: getDefaultMiddleware => {
			return getDefaultMiddleware({
				serializableCheck: false,
			}).concat(api.middleware)
		},
		preloadedState,
	})
	setupListeners(store.dispatch)
	return store
}

/**
 * Initializes and exports the application's Redux store instance.
 *
 * @remarks
 * This store is created using the `makeStore` factory function and is intended to be used
 * throughout the application for state management.
 *
 * @see makeStore
 */
export const store = makeStore()

/**
 * Represents the type of the application's Redux store instance.
 *
 * This type is inferred from the actual `store` object, ensuring that
 * type information such as state shape and dispatch methods remain consistent
 * throughout the application.
 */
export type AppStore = typeof store

/**
 * Type alias for the dispatch function from the application's Redux store.
 *
 * This type is typically used throughout the application to provide strong typing
 * for dispatching actions, ensuring that only valid actions can be dispatched.
 *
 * @see {@link AppStore}
 */
export type AppDispatch = AppStore['dispatch']

/**
 * A generic type representing a Redux thunk action for the application.
 *
 * @template ThunkReturnType - The return type of the thunk action (defaults to void).
 *
 * This type is used to type asynchronous action creators (thunks) in Redux,
 * ensuring they have access to the application's root state and can dispatch actions.
 */
export type AppThunk<ThunkReturnType = void> = ThunkAction<ThunkReturnType, RootState, unknown, Action>
