import { configureStore, combineSlices, type Action, type ThunkAction } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { accountSlice } from './account-store'
import { applicationSlice } from './application-store'
import { authenticateSlice } from './auth-store'
import { api } from './api/api'

const rootReducer = combineSlices(accountSlice, applicationSlice, authenticateSlice, api)
export type RootState = ReturnType<typeof rootReducer>

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

export const store = makeStore()

export type AppStore = typeof store
export type AppDispatch = AppStore['dispatch']
export type AppThunk<ThunkReturnType = void> = ThunkAction<ThunkReturnType, RootState, unknown, Action>
