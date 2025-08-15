import { useEffect } from 'react'
import type { EquipmentTypeClass } from '../modules/Equipment/scripts/EquipmentTypeClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetEquipmentTypesQuery } from '../store/api/equipmentApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for the EquipmentTypeSelect component.
 *
 * @property getItem - Callback function that receives the selected EquipmentTypeClass item or null.
 * @property item - The currently selected EquipmentTypeClass item, or null/undefined if none is selected.
 */
interface ISelectProps {
	getItem: (item: EquipmentTypeClass | null) => void
	item: EquipmentTypeClass | null | undefined
}

/**
 * EquipmentTypeSelect is a React component that renders an autocomplete dropdown for selecting equipment types.
 * It fetches equipment types from the backend using the `useGetEquipmentTypesQuery` hook and displays them as selectable options.
 * The component handles error reporting by dispatching an alert if the fetch fails.
 * 
 * @param getItem - Callback function invoked when an equipment type is selected.
 * @param item - The currently selected equipment type.
 * 
 * @remarks
 * - Uses Material-UI's `Autocomplete` and `TextField` components for UI.
 * - Adapts its width based on the screen size (responsive for mobile).
 * - Displays an error alert if fetching equipment types fails.
 * 
 * @example
 * ```tsx
 * <EquipmentTypeSelect getItem={handleSelect} item={selectedType} />
 * ```
 */
export default function EquipmentTypeSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: equipmentType = [], error: equipmentTypeError } = useGetEquipmentTypesQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (equipmentTypeError) {
			const message =
				(equipmentTypeError as any)?.data?.message || (equipmentTypeError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, equipmentTypeError])

	/**
	 * Returns the display label for a given equipment type.
	 *
	 * @param type - The equipment type object.
	 * @returns The name of the equipment type if available, otherwise an empty string.
	 */
	function getOptionLabel(type: EquipmentTypeClass): string {
		let value: string = ''
		if (type.name) {
			value = type.name
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
			options={equipmentType}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Type' />}
		/>
	)
}
