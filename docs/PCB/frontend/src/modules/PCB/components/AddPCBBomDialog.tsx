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
} from '@mui/material'
import type { IAddPCBBomItemsProps } from '../scripts/PCBs'
import type { InventoryClass } from '../../Inventory/scripts/Inventory'
import InventorySelect from '../../../components/InventorySelect'

export default function AddInventoryDialog({
	edit,
	pcbId,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddPCBBomItemsProps) {
	const [qtyPerBoard, setQtyPerBoard] = useState(0)
	const [designators, setDesignators] = useState('')
	const [valueSpec, setValueSpec] = useState('')
	const [allowSubstitutes, setAllowSubstitutes] = useState<boolean | undefined>(undefined)
	const [inventory, setInventory] = useState<InventoryClass | undefined>(undefined)
	const [comment, setComment] = useState('')

	const [multiple, setMultiple] = useState(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				setQtyPerBoard(selectedItems[0].qtyPerBoard || 0)
				setDesignators(selectedItems[0].designators || '')
				setValueSpec(selectedItems[0].valueSpec || '')
				setAllowSubstitutes(selectedItems[0].allowSubstitutes)
				setInventory(selectedItems[0].inventory)
				setComment(selectedItems[0].comment || '')
				setItemId(selectedItems[0].id)
				setMultiple(false)
			} else {
				setMultiple(true)
			}
		} else {
			setMultiple(false)
		}
	}, [openAddDialog, edit, selectedItems])

	function onQtyPerBoardChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setQtyPerBoard(Number(e.target.value))
	}

	function onDesignatorsChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setDesignators(e.target.value)
	}

	function onValueSpecChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setValueSpec(e.target.value)
	}

	function onAllowSubstitutesChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setAllowSubstitutes(e.target.checked)
	}

	function onCommentChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setComment(e.target.value)
	}

	const onInventoryChangeHandler = useCallback((item: InventoryClass | null): void => {
		setInventory(item || undefined)
	}, [])

	function closeDialog(): void {
		handleCloseAdd()
	}

	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			addItemHandler({
				qtyPerBoard,
				designators,
				valueSpec,
				allowSubstitutes,
				comment,
				pcbId,
				inventoryId: inventory?.id,
			})
		} else if (edit && multiple) {
			addItemHandler(
				selectedItems?.map(e => ({
					id: e.id,
					qtyPerBoard: e.qtyPerBoard,
					designators: e.designators,
					valueSpec: e.valueSpec,
					allowSubstitutes: e.allowSubstitutes,
					comment: e.comment,
					pcbId: e.pcbId,
					inventoryId: e.inventoryId,
				})) || [],
			)
		} else if (edit && !multiple) {
			addItemHandler([
				{
					id: itemId,
					qtyPerBoard,
					designators,
					valueSpec,
					allowSubstitutes,
					comment,
					pcbId,
					inventoryId: inventory?.id,
				},
			])
		}
		setQtyPerBoard(0)
		setDesignators('')
		setValueSpec('')
		setAllowSubstitutes(undefined)
		setComment('')
		setInventory(undefined)
		setItemId(undefined)
		closeDialog()
	}

	return (
		<Dialog open={openAddDialog} onClose={closeDialog} closeAfterTransition={false} maxWidth='sm' fullWidth>
			<DialogTitle sx={{ fontWeight: 600 }}>{edit ? 'Edytuj pozycję BOM' : 'Dodaj pozycję BOM'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						<TextField
							fullWidth
							size='small'
							id='qtyPerBoard'
							label='Ilość na płytkę'
							type='number'
							onChange={onQtyPerBoardChangeHandler}
							disabled={multiple}
							value={qtyPerBoard}
							autoFocus
						/>
						<TextField
							fullWidth
							size='small'
							id='designators'
							label='Oznaczenia'
							onChange={onDesignatorsChangeHandler}
							disabled={multiple}
							value={designators}
						/>
						<TextField
							fullWidth
							size='small'
							id='valueSpec'
							label='Wartość / specyfikacja'
							onChange={onValueSpecChangeHandler}
							disabled={multiple}
							value={valueSpec}
						/>
						<FormGroup>
							<FormControlLabel
								control={
									<Checkbox onChange={onAllowSubstitutesChangeHandler} disabled={multiple} checked={allowSubstitutes} />
								}
								label='Zamienniki dozwolone'
							/>
						</FormGroup>
						<TextField
							fullWidth
							size='small'
							id='comment'
							label='Komentarz'
							onChange={onCommentChangeHandler}
							disabled={multiple}
							value={comment}
						/>
						<InventorySelect getItem={onInventoryChangeHandler} item={inventory} />
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
						disabled={qtyPerBoard <= 0 || !designators.trim() || !valueSpec.trim() || (edit && multiple)}>
						{edit ? 'Zapisz' : 'Dodaj'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
