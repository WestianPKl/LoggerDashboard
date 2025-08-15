import { useEffect } from 'react'
import type { EquipmentClass } from '../modules/Equipment/scripts/EquipmentClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetEquipmentsQuery } from '../store/api/equipmentApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for the Equipment selection component.
 *
 * @property getItem - Callback function invoked when an equipment item is selected or cleared.
 *   Receives the selected `EquipmentClass` object or `null` if no item is selected.
 * @property item - The currently selected equipment item, or `null`/`undefined` if none is selected.
 */
interface ISelectProps {
	getItem: (item: EquipmentClass | null) => void
	item: EquipmentClass | null | undefined
}

/**
 * EquipmentSelect is a React functional component that renders an Autocomplete dropdown
 * for selecting equipment items. It fetches equipment data using the `useGetEquipmentsQuery` hook,
 * displays error alerts if fetching fails, and allows users to select an equipment item.
 *
 * @param getItem - Callback function invoked when an equipment item is selected.
 * @param item - The currently selected equipment item.
 *
 * @remarks
 * - Uses Material-UI's Autocomplete and TextField components for UI.
 * - Adapts width based on screen size (responsive for mobile).
 * - Displays equipment options with a label containing the equipment's ID, vendor, and model.
 * - Shows an error alert if equipment data fetching fails.
 *
 * @example
 * ```tsx
 * <EquipmentSelect getItem={handleSelect} item={selectedEquipment} />
 * ```
 */
export default function EquipmentSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: equipment = [], error: equipmentError } = useGetEquipmentsQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (equipmentError) {
			const message =
				(equipmentError as any)?.data?.message || (equipmentError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, equipmentError])

	/**
	 * Returns a formatted label string for a given equipment object.
	 *
	 * The label includes the equipment's ID, vendor name, and model name, if available.
	 *
	 * @param equipment - The equipment object for which to generate the label.
	 * @returns A string in the format "ID{id} {vendor name} {model name}", or an empty string if equipment is undefined.
	 */
	function getOptionLabel(equipment: EquipmentClass): string {
		let value: string = ''
		if (equipment) {
			value = `ID${equipment.id} ${equipment.vendor?.name} ${equipment.model?.name} `
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
			options={equipment}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Equipment' />}
		/>
	)
}
