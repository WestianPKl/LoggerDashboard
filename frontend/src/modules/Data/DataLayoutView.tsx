import { Outlet, redirect } from 'react-router'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'

/**
 * Renders the layout view for the Data module.
 *
 * This component serves as a layout wrapper and renders the nested route components
 * using React Router's `<Outlet />`. It does not accept any props.
 *
 * @returns The nested route components for the Data module.
 */
export default function DataLayoutView() {
	return <Outlet />
}

/**
 * Loader function to check for a valid authentication token in localStorage.
 * If the token is not found, dispatches an error alert and redirects the user to the login page.
 *
 * @returns {Response | undefined} A redirect response to the login page if the token is missing, otherwise undefined.
 */
export function loader(): Response | undefined {
	if (!localStorage.getItem('token')) {
		store.dispatch(showAlert({ message: 'Unknown user - token not found', severity: 'error' }))
		return redirect('/login')
	}
}
