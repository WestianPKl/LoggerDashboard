import { useEffect } from 'react'
import type { DataDefinitionClass } from '../modules/Data/scripts/DataDefinitionClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetDataDefinitionsQuery } from '../store/api/dataApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for a select component that handles DataDefinitionClass items.
 *
 * @property getItem - Callback function invoked with the selected DataDefinitionClass array.
 * @property item - The currently selected DataDefinitionClass array, or undefined if none is selected.
 */
interface ISelectProps {
	getItem: (item: DataDefinitionClass[]) => void
	item: DataDefinitionClass[] | undefined
}

/**
 * DataDefinitionSelect is a React component that renders a multi-select Autocomplete input
 * for selecting data definitions. It fetches available data definitions using a query hook,
 * displays them as selectable options, and handles error reporting via a Redux alert.
 *
 * @param getItem - Callback function invoked when the selected items change, receiving the new selection.
 * @param item - The currently selected data definitions.
 *
 * @remarks
 * - Uses Material-UI's Autocomplete and TextField components.
 * - Adapts its width based on the screen size (responsive for mobile).
 * - Displays up to two selected tags in the input field.
 * - Shows an error alert if fetching data definitions fails.
 */
export default function DataDefinitionSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: dataDefinitions = [], error: dataDefinitionsError } = useGetDataDefinitionsQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (dataDefinitionsError) {
			const message =
				(dataDefinitionsError as any)?.data?.message || (dataDefinitionsError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, dataDefinitionsError])

	/**
	 * Returns the display label for a given DataDefinitionClass option.
	 *
	 * @param dataDefinition - The data definition object to extract the label from.
	 * @returns The name of the data definition if available, otherwise an empty string.
	 */
	function getOptionLabel(dataDefinition: DataDefinitionClass): string {
		let value: string = ''
		if (dataDefinition.name) {
			value = dataDefinition.name
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
			options={dataDefinitions}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Data definition' />}
		/>
	)
}
