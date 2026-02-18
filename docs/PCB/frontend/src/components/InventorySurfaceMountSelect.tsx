import { useEffect, memo } from 'react'
import type { InventorySurfaceMountClass } from '../modules/Inventory/scripts/InventorySurfaceMount'
import { TextField, Autocomplete } from '@mui/material'
import { useGetInventorySurfaceMountsQuery } from '../store/api/inventoryApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

interface ISelectProps {
	getItem: (item: InventorySurfaceMountClass | null) => void
	item: InventorySurfaceMountClass | null | undefined
}

export default memo(function InventorySurfaceMountSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: inventorySurfaceMount = [], error: inventorySurfaceMountError } = useGetInventorySurfaceMountsQuery({})

	useEffect(() => {
		if (inventorySurfaceMountError) {
			const message =
				(inventorySurfaceMountError as any)?.data?.message ||
				(inventorySurfaceMountError as any)?.message ||
				'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, inventorySurfaceMountError])

	function getOptionLabel(SurfaceMount: InventorySurfaceMountClass): string {
		return SurfaceMount.name || ''
	}

	return (
		<Autocomplete
			fullWidth
			size='small'
			sx={{ mt: 1.5 }}
			onChange={(_, value) => getItem(value)}
			disablePortal
			value={item ?? null}
			getOptionLabel={getOptionLabel}
			isOptionEqualToValue={(option, value) => option.id === value.id}
			options={inventorySurfaceMount}
			slotProps={{ listbox: { sx: { maxHeight: 200 } } }}
			renderInput={params => <TextField {...params} label='Montaż powierzchniowy' />}
		/>
	)
})
