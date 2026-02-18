import { useEffect, memo } from 'react'
import type { InventoryClass } from '../modules/Inventory/scripts/Inventory'
import { TextField, Autocomplete } from '@mui/material'
import { useGetInventoriesQuery } from '../store/api/inventoryApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

interface ISelectProps {
	getItem: (item: InventoryClass | null) => void
	item: InventoryClass | null | undefined
}

export default memo(function InventorySelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: inventory = [], error: inventoryError } = useGetInventoriesQuery({})

	useEffect(() => {
		if (inventoryError) {
			const message =
				(inventoryError as any)?.data?.message || (inventoryError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, inventoryError])

	function getOptionLabel(inventory: InventoryClass): string {
		return (
			`${inventory.name} / ${inventory.manufacturerNumber} ${inventory.package?.name ? `- ${inventory.package.name}` : ''}` ||
			''
		)
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
			options={inventory}
			slotProps={{ listbox: { sx: { maxHeight: 200 } } }}
			renderInput={params => <TextField {...params} label='Komponent' />}
		/>
	)
})
