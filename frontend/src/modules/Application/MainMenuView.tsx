import { Box, Container, useMediaQuery, useTheme } from '@mui/material'
import { redirect, useLoaderData, Await, data } from 'react-router'
import DashboardView from '../Dashboard/DashboardView'
import type { HouseClass } from '../House/scripts/HouseClass'
import { store } from '../../store/store'
import { houseApi } from '../../store/api/houseApi'
import { showAlert } from '../../store/application-store'
import { Suspense } from 'react'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { getUserProfile } from '../../store/account-actions'
import { fetchAccessLevels, fetchPermission } from '../../store/auth-actions'
import type { UserClass } from '../User/scripts/UserClass'

/**
 * MainMenuView is a React functional component that renders the main menu view of the application.
 * It utilizes data loaded via `useLoaderData`, specifically a promise resolving to an array of `HouseClass` objects.
 * The component adapts its layout responsively based on the current theme's breakpoint, displaying a loading indicator
 * while awaiting the house data. Once loaded, it renders the `DashboardView` component with the fetched houses.
 *
 * @returns {JSX.Element} The rendered main menu view.
 */
export default function MainMenuView() {
	const { houses } = useLoaderData() as { houses: Promise<HouseClass[]> }
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<Container
			maxWidth={isMobile ? 'sm' : 'xl'}
			sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={houses}>
					{houseData => (
						<Box sx={{ textAlign: 'center' }}>
							<DashboardView houses={houseData} />
						</Box>
					)}
				</Await>
			</Suspense>
		</Container>
	)
}

/**
 * Loader function for the MainMenuView route.
 *
 * This function checks for authentication tokens in local storage and redirects to the login page if not found.
 * If authenticated, it dispatches actions to fetch the user profile, permissions, and access levels.
 * Then, it retrieves the list of houses from the API.
 *
 * @returns {Promise<Response | { houses: HouseClass[] }>}
 * Returns a redirect response if not authenticated, or an object containing the list of houses.
 * Throws an error and dispatches an alert if any operation fails.
 */
export async function loader(): Promise<Response | { houses: HouseClass[] }> {
	if (!localStorage.getItem('token')) {
		return redirect('/login')
	}
	try {
		if (
			(store.getState().account.user as UserClass).id &&
			localStorage.getItem('token') &&
			localStorage.getItem('permissionToken')
		) {
			const userId = (store.getState().account.user as UserClass).id
			if (typeof userId === 'number') {
				await Promise.all([
					store.dispatch(getUserProfile(userId)),
					store.dispatch(fetchPermission(userId)),
					store.dispatch(fetchAccessLevels()),
				])
			} else {
				throw new Error('User ID is undefined')
			}
		}
		if (!(await store.dispatch(houseApi.endpoints.getHouses.initiate({})).unwrap())) {
			throw data('Data not Found', { status: 404 })
		}
		return { houses: await store.dispatch(houseApi.endpoints.getHouses.initiate({})).unwrap() }
	} catch (err: any) {
		store.dispatch(
			showAlert({
				message: err?.data?.message || err?.message || 'Something went wrong!',
				severity: 'error',
			})
		)
		throw err
	}
}
