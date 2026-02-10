import { Box, List, useMediaQuery, useTheme } from '@mui/material'
import AppDrawerItem from './AppDrawerItem'
import type { IAppDrawerListProps, IAppDrawerArray } from '../scripts/AppInterface'
import HomeIcon from '@mui/icons-material/Home'
import InventoryIcon from '@mui/icons-material/Inventory'
import { useMemo } from 'react'

export default function AppDrawerList({ toggleDrawer }: IAppDrawerListProps) {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const listItems: IAppDrawerArray[] = useMemo(() => {
		const items: IAppDrawerArray[] = [
			{ id: 1, text: isMobile ? 'Main' : 'Main page', icon: <HomeIcon />, link: '/' },
			{ id: 2, text: 'Inventory', icon: <InventoryIcon />, link: '/inventory' },
		]
		return items
	}, [isMobile])

	return (
		<Box sx={{ width: isMobile ? 180 : 250 }} role='presentation'>
			<List onClick={() => toggleDrawer(false)}>
				{listItems.map(ele => (
					<AppDrawerItem key={ele.id} text={ele.text} icon={ele.icon} link={ele.link} />
				))}
			</List>
		</Box>
	)
}
