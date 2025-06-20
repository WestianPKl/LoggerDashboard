import { lazy, Suspense } from 'react'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { useNavigate } from 'react-router'
import { AppBar, Box, Toolbar, Typography, Button, useMediaQuery, useTheme } from '@mui/material'
import { selectIsLogged } from '../../store/account-store'
import { useAppSelector } from '../../store/hooks'
const AppDrawer = lazy(() => import('./components/AppDrawer'))
const AppMenu = lazy(() => import('./components/AppMenu'))

export default function AppBarView() {
	const isLogged = useAppSelector(selectIsLogged)
	const navigate = useNavigate()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	function loginButtonHandler() {
		navigate('/login')
	}

	function registerButtonHandler() {
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
