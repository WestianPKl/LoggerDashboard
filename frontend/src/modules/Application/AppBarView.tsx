import { lazy, Suspense } from 'react'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { useNavigate } from 'react-router'
import { AppBar, Box, Toolbar, Typography, Button, useMediaQuery, useTheme } from '@mui/material'
import { selectIsLogged } from '../../store/account-store'
import { useAppSelector } from '../../store/hooks'
const AppDrawer = lazy(() => import('./components/AppDrawer'))
const AppMenu = lazy(() => import('./components/AppMenu'))

/**
 * Renders the main application app bar with navigation and authentication controls.
 *
 * - Displays the application title and navigation drawer when the user is logged in.
 * - Shows "Login" and "Register" buttons when the user is not logged in.
 * - Adapts button sizes for mobile devices using Material-UI's responsive utilities.
 * - Uses React Suspense to lazily load the `AppDrawer` and `AppMenu` components with a loading indicator.
 *
 * @returns {JSX.Element} The rendered app bar component.
 */
export default function AppBarView() {
	const isLogged = useAppSelector(selectIsLogged)
	const navigate = useNavigate()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Handles the login button click event by navigating the user to the login page.
	 *
	 * @remarks
	 * This function uses the `navigate` function to redirect the user to the `/login` route.
	 *
	 * @returns {void}
	 */
	function loginButtonHandler(): void {
		navigate('/login')
	}

	/**
	 * Navigates the user to the registration page.
	 *
	 * This function should be used as an event handler for actions
	 * that require redirecting the user to the '/register' route.
	 */
	function registerButtonHandler(): void {
		navigate('/register')
	}

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position='static'>
				<Toolbar>
					{isLogged && (
						<Suspense fallback={<LoadingCircle />}>
							<AppDrawer />
							<Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
								Logger Dashboard
							</Typography>
						</Suspense>
					)}

					{!isLogged ? (
						<div>
							<Button color='inherit' size={isMobile ? 'small' : 'medium'} onClick={loginButtonHandler}>
								Login
							</Button>
							<Button color='inherit' size={isMobile ? 'small' : 'medium'} onClick={registerButtonHandler}>
								Register
							</Button>
						</div>
					) : (
						<Suspense fallback={<LoadingCircle />}>
							<AppMenu />
						</Suspense>
					)}
				</Toolbar>
			</AppBar>
		</Box>
	)
}
