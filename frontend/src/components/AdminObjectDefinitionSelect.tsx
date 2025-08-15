import { useEffect } from 'react'
import type { ObjectDefinitionClass } from '../modules/Admin/scripts/ObjectDefinitionClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetObjectDefinitionsQuery } from '../store/api/adminApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for a select component that allows choosing an ObjectDefinitionClass.
 *
 * @property getItem - Callback function invoked when an item is selected or cleared. Receives the selected ObjectDefinitionClass or null.
 * @property item - The currently selected ObjectDefinitionClass, or null/undefined if none is selected.
 */
interface ISelectProps {
	getItem: (item: ObjectDefinitionClass | null) => void
	item: ObjectDefinitionClass | null | undefined
}

/**
 * AdminObjectDefinitionSelect is a React component that renders an autocomplete dropdown
 * for selecting an object definition from a list fetched via a query.
 *
 * @param getItem - Callback function invoked when an object definition is selected.
 * @param item - The currently selected object definition.
 *
 * The component fetches object definitions using a custom hook, displays them in a Material-UI
 * Autocomplete component, and handles error reporting via a Redux alert system.
 * It is responsive to mobile layouts and customizes the dropdown's appearance.
 */
export default function AdminObjectDefinitionSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: objectDefinition = [], error: objectDefinitionError } = useGetObjectDefinitionsQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (objectDefinitionError) {
			const message =
				(objectDefinitionError as any)?.data?.message ||
				(objectDefinitionError as any)?.message ||
				'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, objectDefinitionError])

	/**
	 * Returns the display label for a given ObjectDefinitionClass option.
	 *
	 * @param object - The object for which to retrieve the label.
	 * @returns The name of the object if available, otherwise an empty string.
	 */
	function getOptionLabel(object: ObjectDefinitionClass): string {
		let value: string = ''
		if (object.name) {
			value = object.name
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
			options={objectDefinition}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Object definition' />}
		/>
	)
}
