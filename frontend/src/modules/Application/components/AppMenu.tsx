import { useState } from 'react'
import { useNavigate, useSubmit } from 'react-router'
import { Avatar, MenuItem, Menu, IconButton, Typography, useMediaQuery, useTheme, Tooltip } from '@mui/material'
import { selectUser, selectAvatar } from '../../../store/account-store'
import { useAppSelector } from '../../../store/hooks'

export default function AppMenu() {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const user = useAppSelector(selectUser)
	const avatar = useAppSelector(selectAvatar)
	const navigate = useNavigate()
	const submit = useSubmit()

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const handleLogout = () => {
		handleClose()
		submit(null, { action: '/logout', method: 'post' })
	}

	const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	const handleProfile = () => {
		handleClose()
		navigate('/profile')
	}

	const avatarSrc = avatar ? `${import.meta.env.VITE_API_IP}/${avatar}` : ''

	return (
		<>
			<Tooltip title={user?.username || ''}>
				<IconButton size='medium' onClick={handleMenu} color='inherit'>
					<Avatar sx={{ mr: !isMobile ? 0.5 : 0 }} alt='avatar' src={avatarSrc} />
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
