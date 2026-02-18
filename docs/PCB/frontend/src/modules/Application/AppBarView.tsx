import { lazy, Suspense } from 'react'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { AppBar, Box, Chip, Toolbar, Typography } from '@mui/material'
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoardOutlined'
import { Link } from 'react-router'
const AppDrawer = lazy(() => import('./components/AppDrawer'))
const AppMenu = lazy(() => import('./components/AppMenu'))

export default function AppBarView() {
	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar
				position='sticky'
				color='default'
				sx={{
					backgroundColor: 'rgba(255,255,255,0.85)',
					backdropFilter: 'blur(12px)',
					borderBottom: '1px solid',
					borderColor: 'divider',
					boxShadow: 'none',
				}}>
				<Toolbar>
					<Suspense fallback={<LoadingCircle />}>
						<AppDrawer />
						<Box
							component={Link}
							to='/'
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 1,
								flexGrow: 1,
								textDecoration: 'none',
								color: 'inherit',
							}}>
							<DeveloperBoardIcon sx={{ color: 'primary.main', fontSize: 28 }} />
							<Typography variant='h6' component='div' sx={{ fontWeight: 700, color: 'text.primary' }}>
								PCB Manager
							</Typography>
							<Chip
								label='beta'
								size='small'
								color='primary'
								variant='outlined'
								sx={{ ml: 0.5, height: 20, fontSize: '0.65rem' }}
							/>
						</Box>
					</Suspense>
					<Suspense fallback={<LoadingCircle />}>
						<AppMenu />
					</Suspense>
				</Toolbar>
			</AppBar>
		</Box>
	)
}
