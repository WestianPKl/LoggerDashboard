import { Tabs, Tab, Box, Typography, Paper } from '@mui/material'
import { Outlet, useNavigate, useLocation } from 'react-router'
import InventoryIcon from '@mui/icons-material/Inventory2Outlined'

const tabs = [
	{ path: 'inventory', label: 'Komponenty' },
	{ path: 'inventory-type', label: 'Typy' },
	{ path: 'inventory-surface-mount', label: 'Montaż' },
	{ path: 'inventory-packages', label: 'Obudowy' },
	{ path: 'inventory-shop', label: 'Sklepy' },
]

export default function InventoryMainView() {
	const navigate = useNavigate()
	const location = useLocation()
	const tab = location.pathname.split('/').pop() || tabs[0].path
	let value = tabs.findIndex(t => t.path === tab)
	if (value === -1) value = 0

	return (
		<Box sx={{ px: { xs: 1, md: 3 } }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
				<Box
					sx={{
						width: 44,
						height: 44,
						borderRadius: 2,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'primary.light',
						color: 'primary.dark',
					}}>
					<InventoryIcon />
				</Box>
				<Box>
					<Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
						Inventory
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						Zarządzaj komponentami elektronicznymi
					</Typography>
				</Box>
			</Box>

			<Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
				<Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
					<Tabs
						value={value}
						onChange={(_: React.SyntheticEvent, newValue: number) => {
							navigate(tabs[newValue].path)
						}}
						variant='scrollable'
						scrollButtons='auto'>
						{tabs.map(t => (
							<Tab key={t.path} label={t.label} />
						))}
					</Tabs>
				</Box>

				<Box sx={{ p: { xs: 1, md: 3 } }}>
					<Outlet />
				</Box>
			</Paper>
		</Box>
	)
}
