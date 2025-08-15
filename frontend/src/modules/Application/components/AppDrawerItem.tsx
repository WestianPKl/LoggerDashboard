import { Link, useSubmit } from 'react-router'
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import type { IAppDrawerItemProps } from '../scripts/AppInterface'

/**
 * Renders a navigation drawer item for the application sidebar.
 *
 * Displays a button with an icon and text. If the item's text is "Logout",
 * it triggers a form submission to log the user out; otherwise, it navigates
 * to the specified route using a React Router Link.
 *
 * @param {IAppDrawerItemProps} props - The properties for the drawer item.
 * @param {string} props.text - The display text for the drawer item.
 * @param {React.ReactNode} props.icon - The icon to display alongside the text.
 * @param {string} props.link - The route path to navigate to when the item is clicked (ignored for "Logout").
 *
 * @returns {JSX.Element} The rendered drawer item component.
 */
export default function AppDrawerItem({ text, icon, link }: IAppDrawerItemProps) {
	const submit = useSubmit()

	return (
		<ListItem disablePadding>
			{text === 'Logout' ? (
				<ListItemButton onClick={() => submit(null, { action: '/logout', method: 'post' })}>
					<ListItemIcon>{icon}</ListItemIcon>
					<ListItemText primary={text} />
				</ListItemButton>
			) : (
				<ListItemButton component={Link} to={link}>
					<ListItemIcon>{icon}</ListItemIcon>
					<ListItemText primary={text} />
				</ListItemButton>
			)}
		</ListItem>
	)
}
