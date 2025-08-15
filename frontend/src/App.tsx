import { useEffect, useRef } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './router/routes'
import SnackBar from './components/UI/SnackBar'
import { selectTimeout, selectIsActive, selectMessage, selectSeverity, hideAlert } from './store/application-store'
import { useAppDispatch, useAppSelector } from './store/hooks'

/**
 * The main application component.
 *
 * This component sets up the application's routing and manages the display of a global alert (SnackBar)
 * based on the application's state. It uses Redux selectors to determine the alert's visibility, message,
 * severity, and timeout duration. When an alert is active, it automatically hides after the specified timeout.
 *
 * @returns {JSX.Element} The rendered application, including the router and conditional SnackBar.
 */
export default function App() {
	const dispatch = useAppDispatch()
	const isActive = useAppSelector(selectIsActive)
	const timeout = useAppSelector(selectTimeout)
	const message = useAppSelector(selectMessage)
	const severity = useAppSelector(selectSeverity)
	const alertTimeout = useRef<number | null>(null)

	useEffect(() => {
		if (isActive) {
			if (alertTimeout.current) clearTimeout(alertTimeout.current)
			alertTimeout.current = setTimeout(() => {
				dispatch(hideAlert())
			}, timeout)
		}
		return () => {
			if (alertTimeout.current) clearTimeout(alertTimeout.current)
		}
	}, [isActive, timeout, dispatch])

	return (
		<>
			<RouterProvider router={router} />
			{isActive && <SnackBar message={message} severity={severity} />}
		</>
	)
}
