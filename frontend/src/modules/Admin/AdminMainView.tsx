import { Tabs, Tab, Box } from '@mui/material'
import { Outlet, useNavigate, useLocation, redirect } from 'react-router'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'

/**
 * The `AdminMainView` component renders the main administrative interface with a horizontal tab navigation.
 *
 * - Uses React Router's `useNavigate` and `useLocation` hooks to manage navigation and determine the active tab.
 * - Defines a set of valid admin tabs and synchronizes the selected tab with the current URL path.
 * - Renders a scrollable `Tabs` component (from MUI) for navigation between different admin sections.
 * - Displays the corresponding child route content using React Router's `<Outlet />`.
 *
 * @component
 * @returns {JSX.Element} The rendered admin main view with tab navigation and routed content.
 */
export default function AdminMainView() {
	const navigate = useNavigate()
	const location = useLocation()
	const validTabs = [
		'functionality-defnition',
		'object-definition',
		'access-levels-definition',
		'permission-roles',
		'users',
		'equipment',
		'equipment-vendors',
		'equipment-models',
		'equipment-types',
	]
	const tab = location.pathname.split('/').pop() || validTabs[0]
	let value = validTabs.indexOf(tab)
	if (value === -1) value = 0

	/**
	 * Handles tab change events by navigating to the corresponding tab path.
	 *
	 * @param _ - The React synthetic event triggered by the tab change (unused).
	 * @param newValue - The index of the newly selected tab.
	 */
	const handleChange = (_: React.SyntheticEvent, newValue: number) => {
		const tabPath = validTabs[newValue]
		navigate(tabPath)
	}

	return (
		<>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs
					value={value}
					onChange={handleChange}
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

export function loader() {
	if (!localStorage.getItem('token')) {
		store.dispatch(showAlert({ message: 'Unknown user - token not found', severity: 'error' }))
		return redirect('/login')
	}
}
