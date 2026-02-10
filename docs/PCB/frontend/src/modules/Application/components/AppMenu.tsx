import { useState } from 'react'
import { useNavigate, useSubmit } from 'react-router'
import { MenuItem, Menu, } from '@mui/material'

export default function AppMenu() {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const navigate = useNavigate()
	const submit = useSubmit()

	function handleLogout(): void {
		handleClose()
		submit(null, { action: '/logout', method: 'post' })
	}

	function handleClose(): void {
		setAnchorEl(null)
	}

	function handleProfile(): void {
		handleClose()
		navigate('/profile')
	}

	return (
		<>
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
