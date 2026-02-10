import { Link } from 'react-router'
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import type { IAppDrawerItemProps } from '../scripts/AppInterface'

export default function AppDrawerItem({ text, icon, link }: IAppDrawerItemProps) {
	return (
		<ListItem disablePadding>
			<ListItemButton component={Link} to={link}>
				<ListItemIcon>{icon}</ListItemIcon>
				<ListItemText primary={text} />
			</ListItemButton>
		</ListItem>
	)
}
