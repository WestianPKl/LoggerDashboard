import { lazy, Suspense } from 'react'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { AppBar, Box, Toolbar, Typography } from '@mui/material'
const AppDrawer = lazy(() => import('./components/AppDrawer'))
const AppMenu = lazy(() => import('./components/AppMenu'))

export default function AppBarView() {
	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position='static'>
				<Toolbar>
					<Suspense fallback={<LoadingCircle />}>
						<AppDrawer />
						<Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
							Inventory Dashboard
						</Typography>
					</Suspense>
					<Suspense fallback={<LoadingCircle />}>
						<AppMenu />
					</Suspense>
				</Toolbar>
			</AppBar>
		</Box>
	)
}
