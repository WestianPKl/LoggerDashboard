import { useEffect } from 'react'
import type { AccessLevelDefinitionClass } from '../modules/Admin/scripts/AccessLevelDefinitionClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetAccessLevelDefinitionsQuery } from '../store/api/adminApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for the AdminAccessLevelSelect component.
 *
 * @property getItem - Callback function that receives the selected `AccessLevelDefinitionClass` item or `null`.
 * @property item - The currently selected `AccessLevelDefinitionClass` item, or `null`/`undefined` if none is selected.
 */
interface ISelectProps {
	getItem: (item: AccessLevelDefinitionClass | null) => void
	item: AccessLevelDefinitionClass | null | undefined
}

/**
 * AdminAccessLevelDefinitionSelect is a React component that renders an autocomplete dropdown
 * for selecting an access level definition. It fetches access level definitions from the API,
 * handles errors by dispatching alerts, and adapts its width based on the device screen size.
 *
 * @param getItem - Callback function to handle the selected access level definition.
 * @param item - The currently selected access level definition.
 *
 * @remarks
 * - Uses Material-UI's Autocomplete and TextField components.
 * - Utilizes Redux for dispatching alerts on API errors.
 * - Responsive design: adjusts width for mobile and desktop.
 *
 * @returns A Material-UI Autocomplete component for selecting an access level definition.
 */
export default function AdminAccessLevelDefinitionSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: accessLevelDefinition = [], error: accessLevelDefinitionError } = useGetAccessLevelDefinitionsQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (accessLevelDefinitionError) {
			const message =
				(accessLevelDefinitionError as any)?.data?.message ||
				(accessLevelDefinitionError as any)?.message ||
				'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, accessLevelDefinitionError])

	/**
	 * Returns the display label for a given access level definition.
	 *
	 * @param access - The access level definition object.
	 * @returns The name of the access level if available, otherwise an empty string.
	 */
	function getOptionLabel(access: AccessLevelDefinitionClass): string {
		let value: string = ''
		if (access.name) {
			value = access.name
		}
		return value
	}

	return (
		<Autocomplete
			sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
			onChange={(_, value) => getItem(value)}
			disablePortal
			value={item}
			getOptionLabel={getOptionLabel}
			options={accessLevelDefinition}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Access level' />}
		/>
	)
}
