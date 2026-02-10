import { useEffect, memo } from 'react'
import type { InventoryTypeClass } from '../modules/Inventory/scripts/InventoryType'
import { TextField, Autocomplete, useMediaQuery, useTheme } from '@mui/material'
import { useGetInventoryTypesQuery } from '../store/api/inventoryApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

interface ISelectProps {
	getItem: (item: InventoryTypeClass | null) => void
	item: InventoryTypeClass | null | undefined
}

export default memo(function InventoryTypeSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: inventoryType = [], error: inventoryTypeError } = useGetInventoryTypesQuery({})

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (inventoryTypeError) {
			const message =
				(inventoryTypeError as any)?.data?.message || (inventoryTypeError as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, inventoryTypeError])

	function getOptionLabel(type: InventoryTypeClass): string {
		return type.name || ''
	}

	return (
		<Autocomplete
			sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
			onChange={(_, value) => getItem(value)}
			disablePortal
			value={item ?? null}
			getOptionLabel={getOptionLabel}
			isOptionEqualToValue={(option, value) => option.id === value.id}
			options={inventoryType}
			slotProps={{ listbox: { sx: { maxHeight: '100px' } } }}
			renderInput={params => <TextField {...params} label='Type' />}
		/>
	)
})
