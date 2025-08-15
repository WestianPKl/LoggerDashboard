import { useState } from 'react'
import { useNavigate, useSubmit } from 'react-router'
import { Avatar, MenuItem, Menu, IconButton, Typography, useMediaQuery, useTheme, Tooltip } from '@mui/material'
import { selectUser, selectAvatar } from '../../../store/account-store'
import { useAppSelector } from '../../../store/hooks'

/**
 * Renders the application menu component, displaying the user's avatar and username,
 * and providing a dropdown menu with options to view the profile or log out.
 *
 * - Shows the user's avatar and username (if not on mobile).
 * - Opens a menu on avatar click with "Profile" and "Logout" options.
 * - Navigates to the profile page or submits a logout request as appropriate.
 *
 * @component
 * @returns {JSX.Element} The rendered AppMenu component.
 */
export default function AppMenu() {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const user = useAppSelector(selectUser)
	const avatar = useAppSelector(selectAvatar)
	const navigate = useNavigate()
	const submit = useSubmit()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Handles the user logout process by first closing the menu and then submitting a POST request to the '/logout' endpoint.
	 *
	 * @remarks
	 * This function is typically triggered when the user selects the logout option from the application menu.
	 *
	 * @returns {void} This function does not return a value.
	 */
	function handleLogout(): void {
		handleClose()
		submit(null, { action: '/logout', method: 'post' })
	}

	/**
	 * Handles the menu open event by setting the anchor element for the menu.
	 *
	 * @param event - The mouse event triggered by clicking the menu button.
	 */
	function handleMenu(event: React.MouseEvent<HTMLElement>): void {
		setAnchorEl(event.currentTarget)
	}

	/**
	 * Closes the menu by resetting the anchor element to null.
	 * Typically used as an event handler to close popover or menu components.
	 */
	function handleClose(): void {
		setAnchorEl(null)
	}

	/**
	 * Handles the user profile menu action.
	 * Closes the current menu and navigates to the profile page.
	 *
	 * @remarks
	 * This function is typically used as an event handler for profile-related menu items.
	 */
	function handleProfile(): void {
		handleClose()
		navigate('/profile')
	}

	return (
		<>
			<Tooltip title={user?.username || ''}>
				<IconButton size='medium' onClick={handleMenu} color='inherit'>
					<Avatar
						sx={{ mr: !isMobile ? 0.5 : 0 }}
						alt='avatar'
						src={avatar ? `${import.meta.env.VITE_API_IP}/${avatar}` : ''}
					/>
					{!isMobile && (
						<Typography variant='subtitle1' sx={{ ml: 0.5 }}>
							{user?.username}
						</Typography>
					)}
				</IconButton>
			</Tooltip>
			<Menu
				id='menu-appbar'
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				keepMounted
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				open={Boolean(anchorEl)}
				onClose={handleClose}>
				<MenuItem onClick={handleProfile}>Profile</MenuItem>
				<MenuItem onClick={handleLogout}>Logout</MenuItem>
			</Menu>
		</>
	)
}
