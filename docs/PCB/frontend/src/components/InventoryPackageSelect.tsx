import { useEffect, memo } from 'react'
import type { InventoryPackageClass } from '../modules/Inventory/scripts/InventoryPackage'
import { TextField, Autocomplete } from '@mui/material'
import { useGetInventoryPackagesQuery } from '../store/api/inventoryApi'
import { useAppDispatch } from '../store/hooks'
import { showAlert } from '../store/application-store'

interface ISelectProps {
	getItem: (item: InventoryPackageClass | null) => void
	item: InventoryPackageClass | null | undefined
}

export default memo(function InventoryPackageSelect({ getItem, item }: ISelectProps) {
	const dispatch = useAppDispatch()

	const { data: inventoryPackage = [], error: inventoryPackageError } = useGetInventoryPackagesQuery({})

	useEffect(() => {
		if (inventoryPackageError) {
			const message =
				(inventoryPackageError as any)?.data?.message ||
				(inventoryPackageError as any)?.message ||
				'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dispatch, inventoryPackageError])

	function getOptionLabel(Package: InventoryPackageClass): string {
		return Package.name || ''
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
			options={inventoryPackage}
			slotProps={{ listbox: { sx: { maxHeight: 200 } } }}
			renderInput={params => <TextField {...params} label='Obudowa' />}
		/>
	)
})
