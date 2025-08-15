import { useEffect } from 'react'
import type { UserClass } from '../modules/User/scripts/UserClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetUsersQuery } from '../store/api/userApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for the AdminUserSelect component.
 *
 * @property getItem - Callback function invoked with the selected array of UserClass items.
 * @property item - The currently selected UserClass items, or undefined if none are selected.
 */
interface ISelectProps {
	getItem: (item: UserClass[]) => void
	item: UserClass[] | undefined
}

/**
 * DataDefinitionSelect is a React component that renders a multi-select Autocomplete input for selecting users.
 * It fetches the list of users using the `useGetUsersQuery` hook and displays them as selectable options.
 * The component handles error states by dispatching an alert if the user fetch fails.
 *
 * @param getItem - Callback function invoked when the selected users change.
 * @param item - The currently selected users.
 *
 * @remarks
 * - Uses Material-UI's Autocomplete and TextField components.
 * - Adapts its width based on the screen size (responsive for mobile).
 * - Limits the number of visible tags to 2.
 * - Displays both username and email for each user option.
 * - Shows an error alert if fetching users fails.
 */
export default function DataDefinitionSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: users = [], error: usersError } = useGetUsersQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (usersError) {
			const message = (usersError as any)?.data?.message || (usersError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, usersError])

	/**
	 * Returns a string label for a given user, combining the username and email if both are present.
	 *
	 * @param user - The user object for which to generate the label.
	 * @returns A string containing the username and email separated by a space, or an empty string if either is missing.
	 */
	function getOptionLabel(user: UserClass): string {
		let value: string = ''
		if (user.username && user.email) {
			value = `${user.username} ${user.email}`
		}
		return value
	}

	return (
		<Autocomplete
			multiple
			limitTags={2}
			sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
			onChange={(_, value) => getItem(value)}
			disablePortal
			value={item ?? []}
			getOptionLabel={getOptionLabel}
			options={users}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Users' />}
		/>
	)
}
