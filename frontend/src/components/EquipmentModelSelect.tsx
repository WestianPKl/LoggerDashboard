import { useEffect } from 'react'
import type { EquipmentModelClass } from '../modules/Equipment/scripts/EquipmentModelClass'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetEquipmentModelsQuery } from '../store/api/equipmentApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

/**
 * Props for the EquipmentModelSelect component.
 *
 * @property getItem - Callback function invoked when an equipment model is selected or cleared.
 *   Receives the selected `EquipmentModelClass` instance or `null` if no selection.
 * @property item - The currently selected equipment model, which can be an `EquipmentModelClass` instance,
 *   `null` (no selection), or `undefined` (uninitialized).
 */
interface ISelectProps {
	getItem: (item: EquipmentModelClass | null) => void
	item: EquipmentModelClass | null | undefined
}

/**
 * EquipmentModelSelect is a React functional component that renders an Autocomplete dropdown
 * for selecting an equipment model. It fetches available equipment models using a query hook,
 * handles errors by dispatching alerts, and adapts its width based on the screen size.
 *
 * @param getItem - Callback function invoked when a model is selected, receiving the selected EquipmentModelClass or null.
 * @param item - The currently selected EquipmentModelClass or null.
 *
 * @remarks
 * - Utilizes Material-UI's Autocomplete and TextField components.
 * - Uses Redux for dispatching alerts on query errors.
 * - Responsive design: adjusts width for mobile screens.
 *
 * @returns A JSX element rendering the equipment model selection dropdown.
 */
export default function EquipmentModelSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: equipmentModel = [], error: equipmentModelError } = useGetEquipmentModelsQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (equipmentModelError) {
			const message =
				(equipmentModelError as any)?.data?.message || (equipmentModelError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, equipmentModelError])

	/**
	 * Returns the display label for a given equipment model.
	 *
	 * @param model - The equipment model object.
	 * @returns The name of the equipment model if available, otherwise an empty string.
	 */
	function getOptionLabel(model: EquipmentModelClass): string {
		let value: string = ''
		if (model.name) {
			value = model.name
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
			options={equipmentModel}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Model' />}
		/>
	)
}
