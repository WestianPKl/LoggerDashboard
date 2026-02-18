import { useEffect, useState, useCallback } from 'react'
import {
	Box,
	TextField,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Checkbox,
	FormGroup,
	FormControlLabel,
	Chip,
	Typography,
} from '@mui/material'
import type { IAddProductionOrderItemsProps, IAddProductionOrderItemsData } from '../scripts/Production'
import type { InventoryClass } from '../../Inventory/scripts/Inventory'
import InventorySelect from '../../../components/InventorySelect'

export default function AddProductionOrderItemDialog({
	edit,
	productionOrderId,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddProductionOrderItemsProps) {
	const [qtyPerBoard, setQtyPerBoard] = useState(0)
	const [requiredQtyTotal, setRequiredQtyTotal] = useState(0)
	const [consumedQty, setConsumedQty] = useState(0)
	const [designators, setDesignators] = useState('')
	const [allowSubstitutes, setAllowSubstitutes] = useState<boolean | undefined>(undefined)
	const [inventory, setInventory] = useState<InventoryClass | undefined>(undefined)
	const [status, setStatus] = useState<'ok' | 'low' | 'missing' | undefined>(undefined)

	const [multiple, setMultiple] = useState(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				setQtyPerBoard(selectedItems[0].qtyPerBoard || 0)
				setRequiredQtyTotal(selectedItems[0].requiredQtyTotal || 0)
				setConsumedQty(selectedItems[0].consumedQty || 0)
				setDesignators(selectedItems[0].designators || '')
				setAllowSubstitutes(selectedItems[0].allowSubstitutes)
				setInventory(selectedItems[0].inventory)
				setStatus(selectedItems[0].status)
				setItemId(selectedItems[0].id)
				setMultiple(false)
			} else {
				setMultiple(true)
			}
		} else {
			setMultiple(false)
		}
	}, [openAddDialog, edit, selectedItems])

	const onInventoryChangeHandler = useCallback((item: InventoryClass | null): void => {
		setInventory(item || undefined)
	}, [])

	function closeDialog(): void {
		handleCloseAdd()
	}

	function resetForm(): void {
		setQtyPerBoard(0)
		setRequiredQtyTotal(0)
		setConsumedQty(0)
		setDesignators('')
		setAllowSubstitutes(undefined)
		setInventory(undefined)
		setStatus(undefined)
		setItemId(undefined)
	}

	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		const base: IAddProductionOrderItemsData = {
			qtyPerBoard,
			requiredQtyTotal,
			consumedQty,
			designators,
			allowSubstitutes,
			status,
			productionOrderId,
			inventoryId: inventory?.id,
		}

		if (!edit) {
			addItemHandler(base)
		} else if (edit && multiple) {
			addItemHandler(
				selectedItems?.map(e => ({
					id: e.id,
					qtyPerBoard: e.qtyPerBoard,
					requiredQtyTotal: e.requiredQtyTotal,
					consumedQty: e.consumedQty,
					designators: e.designators,
					allowSubstitutes: e.allowSubstitutes,
					status: e.status,
					productionOrderId: e.productionOrderId,
					inventoryId: e.inventoryId,
				})) || [],
			)
		} else if (edit && !multiple) {
			addItemHandler([{ ...base, id: itemId }])
		}
		resetForm()
		closeDialog()
	}

	const statusMap: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
		ok: { label: 'OK', color: 'success' },
		low: { label: 'Niski stan', color: 'warning' },
		missing: { label: 'Brak', color: 'error' },
	}

	return (
		<Dialog open={openAddDialog} onClose={closeDialog} closeAfterTransition={false} maxWidth='sm' fullWidth>
			<DialogTitle sx={{ fontWeight: 600 }}>{edit ? 'Edytuj pozycję zlecenia' : 'Dodaj pozycję zlecenia'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						<InventorySelect getItem={onInventoryChangeHandler} item={inventory} />
						<TextField
							fullWidth
							size='small'
							id='qtyPerBoard'
							label='Ilość na płytkę'
							type='number'
							onChange={e => setQtyPerBoard(Number(e.target.value))}
							disabled={multiple}
							value={qtyPerBoard}
							autoFocus
						/>
						<TextField
							fullWidth
							size='small'
							id='requiredQtyTotal'
							label='Wymagana ilość łączna'
							type='number'
							onChange={e => setRequiredQtyTotal(Number(e.target.value))}
							disabled={multiple}
							value={requiredQtyTotal}
						/>
						<TextField
							fullWidth
							size='small'
							id='consumedQty'
							label='Zużyta ilość'
							type='number'
							onChange={e => setConsumedQty(Number(e.target.value))}
							disabled={multiple}
							value={consumedQty}
						/>
						<TextField
							fullWidth
							size='small'
							id='designators'
							label='Oznaczenia'
							onChange={e => setDesignators(e.target.value)}
							disabled={multiple}
							value={designators}
						/>
						<FormGroup>
							<FormControlLabel
								control={
									<Checkbox
										onChange={e => setAllowSubstitutes(e.target.checked)}
										disabled={multiple}
										checked={allowSubstitutes ?? false}
									/>
								}
								label='Zamienniki dozwolone'
							/>
						</FormGroup>
						<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
							<Typography variant='body2' color='text.secondary' sx={{ width: '100%', mb: 0.5 }}>
								Status:
							</Typography>
							{Object.entries(statusMap).map(([key, val]) => (
								<Chip
									key={key}
									label={val.label}
									color={status === key ? val.color : 'default'}
									variant={status === key ? 'filled' : 'outlined'}
									size='small'
									onClick={() => setStatus(key as 'ok' | 'low' | 'missing')}
									disabled={multiple}
									sx={{ cursor: 'pointer' }}
								/>
							))}
						</Box>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button size='small' onClick={closeDialog}>
						Anuluj
					</Button>
					<Button
						variant='contained'
						size='small'
						type='submit'
						disabled={qtyPerBoard <= 0 || !inventory || (edit && multiple)}>
						{edit ? 'Zapisz' : 'Dodaj'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
