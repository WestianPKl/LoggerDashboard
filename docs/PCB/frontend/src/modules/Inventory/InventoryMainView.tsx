import { Tabs, Tab, Box } from '@mui/material'
import { Outlet, useNavigate, useLocation} from 'react-router'

export default function InventoryMainView() {
	const navigate = useNavigate()
	const location = useLocation()
	const validTabs = ['inventory', 'inventory-type', 'inventory-surface-mount', 'inventory-packages', 'inventory-shop']
	const tab = location.pathname.split('/').pop() || validTabs[0]
	let value = validTabs.indexOf(tab)
	if (value === -1) value = 0

	return (
		<>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs
					value={value}
					onChange={(_: React.SyntheticEvent, newValue: number) => {
						const tabPath = validTabs[newValue]
						navigate(tabPath)
					}}
					variant='scrollable'
					scrollButtons='auto'
					aria-label='horizontal-tab-user-profile'>
					{validTabs.map(label => (
						<Tab key={label} label={label} />
					))}
				</Tabs>
			</Box>

			<Box component='div' sx={{ marginTop: '2rem', width: '100%', textAlign: 'center', justifyContent: 'center' }}>
				<Outlet />
			</Box>
		</>
	)
}
