import { useEffect } from 'react'
import type { FunctionalityDefinitionClass } from '../modules/Admin/scripts/FunctionalityDefinitionClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetFunctionalityDefinitionsQuery } from '../store/api/adminApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for the AdminFunctionalityDefinitionSelect component.
 *
 * @property getItem - Callback function invoked when a functionality definition is selected or cleared.
 *   Receives the selected `FunctionalityDefinitionClass` instance or `null` if no selection.
 * @property item - The currently selected functionality definition, or `null`/`undefined` if none is selected.
 */
interface ISelectProps {
	getItem: (item: FunctionalityDefinitionClass | null) => void
	item: FunctionalityDefinitionClass | null | undefined
}

/**
 * Renders an autocomplete select component for choosing a functionality definition in the admin panel.
 *
 * Fetches available functionality definitions using a query hook and displays them as selectable options.
 * Handles errors by dispatching an alert message. Adapts its width based on the current screen size.
 *
 * @param getItem - Callback function invoked when a functionality definition is selected.
 * @param item - The currently selected functionality definition.
 *
 * @returns A Material-UI Autocomplete component for selecting a functionality definition.
 */
export default function AdminFunctionalityDefinitionSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: functionalityDefinition = [], error: functionalityDefinitionError } =
		useGetFunctionalityDefinitionsQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (functionalityDefinitionError) {
			const message =
				(functionalityDefinitionError as any)?.data?.message ||
				(functionalityDefinitionError as any)?.message ||
				'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, functionalityDefinitionError])

	/**
	 * Returns the display label for a given `FunctionalityDefinitionClass` option.
	 *
	 * @param functionality - The functionality definition object to extract the label from.
	 * @returns The name of the functionality if available, otherwise an empty string.
	 */
	function getOptionLabel(functionality: FunctionalityDefinitionClass): string {
		let value: string = ''
		if (functionality.name) {
			value = functionality.name
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
			options={functionalityDefinition}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Functionality definition' />}
		/>
	)
}
