import { useState } from 'react'
import { Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AppDrawerList from './AppDrawerList'

/**
 * AppDrawer is a React functional component that renders a navigation drawer for the application.
 * It displays a menu icon button that, when clicked, opens a side drawer containing navigation options.
 * The drawer adapts its icon button size based on the current screen size (mobile or desktop).
 *
 * @component
 * @returns {JSX.Element} The rendered AppDrawer component.
 *
 * @example
 * <AppDrawer />
 */
export default function AppDrawer() {
	const [open, setOpen] = useState(false)
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const toggleDrawer = (newOpen: boolean) => setOpen(newOpen)

	return (
		<>
			<IconButton
				size={isMobile ? 'small' : 'large'}
				edge='start'
				color='inherit'
				sx={{ mr: 2 }}
				onClick={() => toggleDrawer(true)}>
				<MenuIcon />
			</IconButton>
			<Drawer open={open} onClose={() => toggleDrawer(false)}>
				<AppDrawerList toggleDrawer={toggleDrawer} />
			</Drawer>
		</>
	)
}
