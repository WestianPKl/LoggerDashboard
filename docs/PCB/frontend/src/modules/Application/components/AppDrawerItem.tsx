import { Link, useLocation } from 'react-router'
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import type { IAppDrawerItemProps } from '../scripts/AppInterface'

export default function AppDrawerItem({ text, icon, link }: IAppDrawerItemProps) {
	const location = useLocation()
	const isActive = link === '/' ? location.pathname === '/' : location.pathname.startsWith(link)

	return (
		<ListItem disablePadding sx={{ mb: 0.5 }}>
			<ListItemButton
				component={Link}
				to={link}
				selected={isActive}
				sx={{
					borderRadius: 2,
					'&.Mui-selected': {
						backgroundColor: 'primary.light',
						color: 'primary.dark',
						'& .MuiListItemIcon-root': { color: 'primary.dark' },
					},
					'&.Mui-selected:hover': {
						backgroundColor: 'primary.light',
					},
				}}>
				<ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
				<ListItemText primary={text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }} />
			</ListItemButton>
		</ListItem>
	)
}
