import { useEffect, useState, useCallback } from 'react'
import {
	Box,
	TextField,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import type { IAddInventoryProps } from '../scripts/inventories'
import type { InventoryTypeClass } from '../scripts/InventoryType'
import type { InventoryPackageClass } from '../scripts/InventoryPackage'
import type { InventorySurfaceMountClass } from '../scripts/InventorySurfaceMount'
import type { InventoryShopClass } from '../scripts/InventoryShop'
import InventoryTypeSelect from '../../../components/InventoryTypeSelect'
import InventorySurfaceMountSelect from '../../../components/InventorySurfaceMountSelect'
import InventoryPackageSelect from '../../../components/InventoryPackageSelect'
import InventoryShopSelect from '../../../components/InventoryShopSelect'

export default function AddInventoryDialog({
	edit,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddInventoryProps) {
	const [name, setName] = useState('')
	const [manufacturerNumber, setManufacturerNumber] = useState('')
	const [parameters, setParameters] = useState('')
	const [stock, setStock] = useState<number | undefined>(undefined)
	const [lowThreshold, setLowThreshold] = useState<number | undefined>(undefined)
	const [inventoryType, setInventoryType] = useState<InventoryTypeClass | undefined>(undefined)
	const [inventoryPackage, setInventoryPackage] = useState<InventoryPackageClass | undefined>(undefined)
	const [inventorySurfaceMount, setInventorySurfaceMount] = useState<InventorySurfaceMountClass | undefined>(undefined)
	const [inventoryShop, setInventoryShop] = useState<InventoryShopClass | undefined>(undefined)
	const [comment, setComment] = useState('')

	const [multiple, setMultiple] = useState(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	useEffect(() => {
		if (edit) {
			if (selectedItems?.length === 1) {
				setName(selectedItems[0].name || '')
				setManufacturerNumber(selectedItems[0].manufacturerNumber || '')
				setParameters(selectedItems[0].parameters || '')
				setStock(selectedItems[0].stock?.quantity)
				setComment(selectedItems[0].comment || '')
				setInventoryType(selectedItems[0].type)
				setInventoryPackage(selectedItems[0].package)
				setInventorySurfaceMount(selectedItems[0].surfaceMount)
				setInventoryShop(selectedItems[0].shop)
				setLowThreshold(selectedItems[0].lowThreshold)
				setItemId(selectedItems[0].id)
				setMultiple(false)
			} else {
				setMultiple(true)
			}
		} else {
			setMultiple(false)
		}
	}, [openAddDialog, edit, selectedItems])

	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setName(e.target.value)
	}

	function onManufacturerNumberChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setManufacturerNumber(e.target.value)
	}

	function onParametersChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setParameters(e.target.value)
	}

	function onStockChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setStock(Number(e.target.value))
	}

	function onLowThresholdChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setLowThreshold(Number(e.target.value))
	}

	function onCommentChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setComment(e.target.value)
	}

	const onInventoryTypeChangeHandler = useCallback((item: InventoryTypeClass | null): void => {
		setInventoryType(item || undefined)
	}, [])

	const onInventorySurfaceMountChangeHandler = useCallback((item: InventorySurfaceMountClass | null): void => {
		setInventorySurfaceMount(item || undefined)
	}, [])

	const onInventoryPackageChangeHandler = useCallback((item: InventoryPackageClass | null): void => {
		setInventoryPackage(item || undefined)
	}, [])

	const onInventoryShopChangeHandler = useCallback((item: InventoryShopClass | null): void => {
		setInventoryShop(item || undefined)
	}, [])

	function closeDialog(): void {
		handleCloseAdd()
	}

	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			addItemHandler({
				name,
				manufacturerNumber,
				parameters,
				stock,
				comment,
				inventoryTypeId: inventoryType?.id,
				inventoryPackageId: inventoryPackage?.id,
				inventorySurfaceMountId: inventorySurfaceMount?.id,
				inventoryShopId: inventoryShop?.id,
				lowThreshold,
			})
		} else if (edit && multiple) {
			addItemHandler(
				selectedItems?.map(e => ({
					id: e.id,
					name: e.name,
					manufacturerNumber: e.manufacturerNumber,
					parameters: e.parameters,
					stock: e.stock?.quantity,
					comment: e.comment,
					inventoryTypeId: e.inventoryTypeId,
					inventoryPackageId: e.inventoryPackageId,
					inventorySurfaceMountId: e.inventorySurfaceMountId,
					inventoryShopId: e.inventoryShopId,
					lowThreshold: e.lowThreshold,
				})) || [],
			)
		} else if (edit && !multiple) {
			addItemHandler([
				{
					id: itemId,
					name,
					manufacturerNumber,
					parameters,
					stock,
					comment,
					inventoryTypeId: inventoryType?.id,
					inventoryPackageId: inventoryPackage?.id,
					inventorySurfaceMountId: inventorySurfaceMount?.id,
					inventoryShopId: inventoryShop?.id,
					lowThreshold,
				},
			])
		}
		setName('')
		setManufacturerNumber('')
		setParameters('')
		setStock(undefined)
		setComment('')
		setLowThreshold(undefined)
		setInventoryType(undefined)
		setInventoryPackage(undefined)
		setInventorySurfaceMount(undefined)
		setInventoryShop(undefined)
		setItemId(undefined)
		closeDialog()
	}

	function addContinueHandler(e: React.FormEvent): void {
		e.preventDefault()
		addItemHandler(
			{
				name,
				manufacturerNumber,
				parameters,
				stock,
				comment,
				inventoryTypeId: inventoryType?.id,
				inventoryPackageId: inventoryPackage?.id,
				inventorySurfaceMountId: inventorySurfaceMount?.id,
				inventoryShopId: inventoryShop?.id,
				lowThreshold,
			},
			true,
		)
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>{edit ? 'Edit inventory ' : 'Add inventory '}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='name'
							label='Name'
							onChange={onNameChangeHandler}
							disabled={multiple}
							value={name}
							autoFocus
						/>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='manufacturerNumber'
							label='Manufacturer Number'
							onChange={onManufacturerNumberChangeHandler}
							disabled={multiple}
							value={manufacturerNumber}
							autoFocus
						/>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='parameters'
							label='Parameters'
							onChange={onParametersChangeHandler}
							disabled={multiple}
							value={parameters}
							autoFocus
						/>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='stock'
							label='Stock'
							type='number'
							onChange={onStockChangeHandler}
							disabled={multiple}
							value={stock}
							autoFocus
						/>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='lowThreshold'
							label='Low Threshold'
							type='number'
							onChange={onLowThresholdChangeHandler}
							disabled={multiple}
							value={lowThreshold}
							autoFocus
						/>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='comment'
							label='Comment'
							onChange={onCommentChangeHandler}
							disabled={multiple}
							value={comment}
							autoFocus
						/>

						<InventoryTypeSelect getItem={onInventoryTypeChangeHandler} item={inventoryType} />
						<InventoryPackageSelect getItem={onInventoryPackageChangeHandler} item={inventoryPackage} />
						<InventorySurfaceMountSelect getItem={onInventorySurfaceMountChangeHandler} item={inventorySurfaceMount} />
						<InventoryShopSelect getItem={onInventoryShopChangeHandler} item={inventoryShop} />
					</Box>
				</DialogContent>
				<DialogActions>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} onClick={closeDialog}>
						Cancel
					</Button>
					{!edit && (
						<Button
							variant='outlined'
							size={isMobile ? 'small' : 'medium'}
							type='button'
							disabled={!name.trim()}
							onClick={addContinueHandler}>
							Add and continue
						</Button>
					)}
					<Button
						variant='outlined'
						size={isMobile ? 'small' : 'medium'}
						type='submit'
						disabled={!name.trim() || (edit && multiple)}>
						{edit ? 'Save' : 'Add'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
