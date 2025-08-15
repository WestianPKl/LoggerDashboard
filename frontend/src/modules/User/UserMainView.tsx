import * as React from 'react'
import { Outlet, useNavigate, useLocation, redirect } from 'react-router'
import { Tabs, Tab, Box } from '@mui/material'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'

/**
 * Renders the main view for the User module, providing tab navigation between
 * user-related sections such as "user", "permissions", and "roles".
 *
 * The component uses React Router's `useNavigate` and `useLocation` hooks to
 * synchronize the selected tab with the current URL path. When a tab is selected,
 * navigation occurs to the corresponding route. The content for each tab is rendered
 * via the `<Outlet />` component.
 *
 * @returns {JSX.Element} The rendered UserMainView component with tab navigation and outlet for nested routes.
 */
export default function UserMainView() {
	const navigate = useNavigate()
	const location = useLocation()

	const validTabs = ['user', 'permissions', 'roles']
	const tab = location.pathname.split('/').pop() || validTabs[0]
	let value = validTabs.indexOf(tab)
	if (value === -1) value = 0

	/**
	 * Handles tab change events by navigating to the corresponding tab path.
	 *
	 * @param _ - The React synthetic event (unused).
	 * @param newValue - The index of the newly selected tab.
	 */
	function handleChange(_: React.SyntheticEvent, newValue: number): void {
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

			<Box component='div' sx={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
				<Outlet />
			</Box>
		</>
	)
}

/**
 * Loader function to check for user authentication token in localStorage.
 * If the token is missing, dispatches an error alert and redirects to the login page.
 *
 * @returns {Response | undefined} A redirect response to the login page if the token is not found, otherwise undefined.
 */
export function loader(): Response | undefined {
	if (!localStorage.getItem('token')) {
		store.dispatch(showAlert({ message: 'Unknown user - token not found', severity: 'error' }))
		return redirect('/login')
	}
}
