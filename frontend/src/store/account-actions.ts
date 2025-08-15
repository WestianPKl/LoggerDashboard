import type { AppThunk } from './store'
import type { IDecodedToken } from '../modules/Admin/scripts/PermissionInterface'
import { jwtDecode } from 'jwt-decode'
import { accountSlice, getAuthDuration, getUserAvatar, logIn, selectDuration } from './account-store'
import { redirect } from 'react-router'
import type { UserLoginClass } from '../modules/User/scripts/UserLoginClass'
import { showAlert } from './application-store'
import { userApi } from './api/userApi'

/**
 * Retrieves the remaining duration (in milliseconds) until the current authentication token expires.
 *
 * This thunk action checks for the presence of a 'permissionToken' in localStorage, decodes it to extract
 * the expiration time, and calculates the time left until expiration. If the token is valid and not expired,
 * it dispatches the `getAuthDuration` action with the remaining duration and returns the duration.
 * If the token is missing or expired, it returns `undefined`.
 *
 * @returns A thunk action that resolves to the remaining duration in milliseconds, or `undefined` if the token is missing or expired.
 */
export const getAuthTokenDuration = (): AppThunk<number | undefined> => dispatch => {
	const permissionsToken = localStorage.getItem('permissionToken')
	if (!permissionsToken) return undefined

	const decoded: IDecodedToken = jwtDecode(permissionsToken)
	const expiration = new Date(decoded.expiration).getTime()
	const now = Date.now()
	const duration = expiration - now

	if (duration > 0) {
		dispatch(getAuthDuration(duration))
		return duration
	}
	return undefined
}

/**
 * Thunk action creator for logging in a user.
 *
 * Decodes the provided `permissionToken` to extract user information,
 * constructs a user object, and dispatches the `logIn` action with the
 * user's data, authentication token, and expiration time.
 *
 * @param data - An object containing the user's login information, including `token` and `permissionToken`.
 * @returns A thunk function that dispatches the `logIn` action if both tokens are present.
 */
export const loginAction =
	(data: UserLoginClass): AppThunk =>
	dispatch => {
		const { token, permissionToken } = data
		if (token && permissionToken) {
			const decoded: IDecodedToken = jwtDecode(permissionToken)
			const { id, username, email, createdAt, updatedAt, confirmed } = decoded.user
			const user = { id, username, email, createdAt, updatedAt, confirmed }
			const expiration = Number(decoded.expiration)
			dispatch(logIn({ expiration, user, token }))
		}
	}

/**
 * Logs out the current user by removing authentication tokens from local storage
 * and dispatching the logOff action to update the account state.
 *
 * @returns {AppThunk} A thunk action that performs the logout process.
 */
export const logoutAction = (): AppThunk => dispatch => {
	localStorage.removeItem('token')
	localStorage.removeItem('permissionToken')
	dispatch(accountSlice.actions.logOff())
}

/**
 * Initializes the authentication state in the store.
 *
 * This thunk action checks for the presence and validity of authentication tokens in local storage.
 * If the tokens are missing or invalid, it dispatches a logout action and returns `undefined`.
 * Otherwise, it decodes the permission token, dispatches a login action with the tokens,
 * and returns the user's ID.
 *
 * @returns A thunk action that resolves to the user's ID (`number`) if authentication is valid, or `undefined` otherwise.
 */
export const initStore = (): AppThunk<number | undefined> => dispatch => {
	const getAuthDuration = dispatch(getAuthTokenDuration())
	const token = localStorage.getItem('token')
	const permissionToken = localStorage.getItem('permissionToken')

	if (!token || !permissionToken || typeof getAuthDuration !== 'number' || getAuthDuration <= 0) {
		dispatch(logoutAction())
		return undefined
	}

	const decoded: IDecodedToken = jwtDecode(permissionToken)
	dispatch(loginAction({ token, permissionToken }))
	return decoded.user.id
}

/**
 * Retrieves the authentication token from localStorage and checks its validity based on duration.
 *
 * @returns {AppThunk<boolean>} A thunk action that returns `true` if a valid token exists and its duration is greater than zero, otherwise `false`.
 */
export const getToken =
	(): AppThunk<boolean> =>
	(_, getState): boolean => {
		const token = localStorage.getItem('token')
		if (!token) return false

		const tokenDuration = selectDuration(getState())
		if (tokenDuration && tokenDuration > 0) {
			return true
		}
		return false
	}

/**
 * Thunk action to fetch a user's profile information and avatar.
 *
 * @param userId - The unique identifier of the user whose profile is to be fetched.
 * @returns A thunk action that dispatches API calls to retrieve the user profile and avatar.
 *
 * @remarks
 * - Dispatches `userApi.endpoints.getUser.initiate` to fetch user data.
 * - On success, dispatches `getUserAvatar` with the user's avatar.
 * - On failure, dispatches `showAlert` with an error message.
 */
export const getUserProfile =
	(userId: number): AppThunk =>
	async dispatch => {
		try {
			const userAccount = await dispatch(userApi.endpoints.getUser.initiate(userId)).unwrap()
			dispatch(getUserAvatar(userAccount.avatar))
		} catch (err: any) {
			dispatch(showAlert({ message: err.message, severity: 'error' }))
		}
	}

/**
 * Loader function that checks if a user authentication token exists in localStorage.
 *
 * If a token is present, the function returns `null`, allowing the user to proceed.
 * If no token is found, the function redirects the user to the login page.
 *
 * @returns {null | Response} Returns `null` if authenticated, or a redirect `Response` to '/login' if not.
 */
export function checkAuthLoader(): Response | null {
	return localStorage.getItem('token') ? null : redirect('/login')
}

/**
 * Loader function that checks if a user is authenticated by verifying the presence of a 'token' in localStorage.
 * If authenticated, redirects the user to the home page ('/').
 * If not authenticated, allows the current route to proceed.
 *
 * @returns {null | Response} Returns a redirect response if authenticated, otherwise null.
 */
export function checkNotAuthLoader(): Response | null {
	return localStorage.getItem('token') ? redirect('/') : null
}
