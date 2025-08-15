import { useEffect } from 'react'
import type { EquipmentVendorClass } from '../modules/Equipment/scripts/EquipmentVendorClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetEquipmentVendorsQuery } from '../store/api/equipmentApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for the EquipmentVendorSelect component.
 *
 * @property getItem - Callback function that receives the selected EquipmentVendorClass item or null.
 * @property item - The currently selected EquipmentVendorClass item, or null/undefined if none is selected.
 */
interface ISelectProps {
	getItem: (item: EquipmentVendorClass | null) => void
	item: EquipmentVendorClass | null | undefined
}

/**
 * EquipmentVendorSelect is a React component that renders an Autocomplete dropdown for selecting an equipment vendor.
 * It fetches the list of equipment vendors using the `useGetEquipmentVendorsQuery` hook and displays them as selectable options.
 * The component handles error reporting by dispatching an alert if the vendor data fails to load.
 *
 * @param getItem - Callback function invoked when a vendor is selected from the dropdown.
 * @param item - The currently selected vendor item.
 *
 * @remarks
 * - The component adapts its width based on the screen size (responsive for mobile).
 * - Uses Material-UI's Autocomplete and TextField components for UI.
 * - Displays an error alert if fetching vendors fails.
 *
 * @example
 * ```tsx
 * <EquipmentVendorSelect
 *   getItem={handleVendorSelect}
 *   item={selectedVendor}
 * />
 * ```
 */
export default function EquipmentVendorSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: equipmentVendor = [], error: equipmentVendorError } = useGetEquipmentVendorsQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (equipmentVendorError) {
			const message =
				(equipmentVendorError as any)?.data?.message || (equipmentVendorError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, equipmentVendorError])

	/**
	 * Returns the display label for a given equipment vendor.
	 *
	 * @param vendor - The equipment vendor object.
	 * @returns The name of the vendor if available, otherwise an empty string.
	 */
	function getOptionLabel(vendor: EquipmentVendorClass): string {
		let value: string = ''
		if (vendor.name) {
			value = vendor.name
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
			options={equipmentVendor}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Vendor' />}
		/>
	)
}
