import { Link, useSubmit } from 'react-router'
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import type { IAppDrawerItemProps } from '../scripts/AppInterface'

export default function AppDrawerItem({ text, icon, link }: IAppDrawerItemProps) {
	const submit = useSubmit()

	return (
		<ListItem disablePadding>
			{text === 'Logout' ? (
				<ListItemButton onClick={() => submit(null, { action: '/logout', method: 'post' })}>
					<ListItemIcon>{icon}</ListItemIcon>
					<ListItemText primary={text} />
				</ListItemButton>
			) : (
				<ListItemButton component={Link} to={link}>
					<ListItemIcon>{icon}</ListItemIcon>
					<ListItemText primary={text} />
				</ListItemButton>
			)}
		</ListItem>
	)
}
