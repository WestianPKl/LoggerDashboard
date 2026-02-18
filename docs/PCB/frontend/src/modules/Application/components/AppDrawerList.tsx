import { Box, Divider, List, Typography, useMediaQuery, useTheme } from '@mui/material'
import AppDrawerItem from './AppDrawerItem'
import type { IAppDrawerListProps, IAppDrawerArray } from '../scripts/AppInterface'
import HomeIcon from '@mui/icons-material/Home'
import InventoryIcon from '@mui/icons-material/Inventory'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoardOutlined'
import { useMemo } from 'react'

export default function AppDrawerList({ toggleDrawer }: IAppDrawerListProps) {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	const listItems: IAppDrawerArray[] = useMemo(() => {
		const items: IAppDrawerArray[] = [
			{ id: 1, text: 'Strona główna', icon: <HomeIcon />, link: '/' },
			{ id: 2, text: 'Inventory', icon: <InventoryIcon />, link: '/inventory' },
			{ id: 3, text: 'PCB', icon: <DeveloperBoardIcon />, link: '/pcb' },
			{ id: 4, text: 'Production', icon: <PrecisionManufacturingIcon />, link: '/production' },
		]
		return items
	}, [])

	return (
		<Box sx={{ width: isMobile ? 220 : 280 }} role='presentation'>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 2 }}>
				<DeveloperBoardIcon sx={{ color: 'primary.main' }} />
				<Typography variant='subtitle1' sx={{ fontWeight: 700, color: 'text.primary' }}>
					PCB Manager
				</Typography>
			</Box>
			<Divider />
			<List onClick={() => toggleDrawer(false)} sx={{ px: 1, pt: 1 }}>
				{listItems.map(ele => (
					<AppDrawerItem key={ele.id} text={ele.text} icon={ele.icon} link={ele.link} />
				))}
			</List>
		</Box>
	)
}
