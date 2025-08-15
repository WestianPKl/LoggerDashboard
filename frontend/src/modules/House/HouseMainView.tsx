import { Tabs, Tab, Box } from '@mui/material'
import { Outlet, useNavigate, useLocation, redirect } from 'react-router'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'

/**
 * Main view component for the House module.
 *
 * Renders a tabbed navigation interface for "houses", "floors", and "loggers" sections.
 * Handles tab selection and navigation using React Router's `useNavigate` and `useLocation` hooks.
 * Displays the corresponding child route content via the `<Outlet />` component.
 *
 * @returns {JSX.Element} The rendered HouseMainView component.
 */
export default function HouseMainView() {
	const navigate = useNavigate()
	const location = useLocation()
	const validTabs = ['houses', 'floors', 'loggers']
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

/**
 * Loader function that checks for the presence of an authentication token in localStorage.
 * If the token is not found, it dispatches an error alert and redirects the user to the login page.
 *
 * @returns {Response | undefined} A redirect response to the login page if the token is missing, otherwise undefined.
 */
export function loader(): Response | undefined {
	if (!localStorage.getItem('token')) {
		store.dispatch(showAlert({ message: 'Unknown user - token not found', severity: 'error' }))
		return redirect('/login')
	}
}
