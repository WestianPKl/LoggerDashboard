import { useEffect, useState, useRef } from 'react'
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
import type { IAddHouseFoorProps } from '../scripts/IHouse'
import HouseSelect from '../../../components/HouseSelect'
import type { HouseClass } from '../scripts/HouseClass'
import classes from './AddHouseFloorDialog.module.css'

/**
 * A dialog component for adding or editing a house floor.
 *
 * This component displays a form within a dialog, allowing users to input or edit the name,
 * select a house, and upload a layout image for a house floor. It supports both single and
 * multiple edit modes, and adapts its UI for mobile devices.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.edit - Indicates if the dialog is in edit mode.
 * @param {boolean} props.isDashboard - Indicates if the dialog is used within the dashboard context.
 * @param {HouseClass | null} [props.dashboardData] - The house data from the dashboard, if applicable.
 * @param {Array<HouseFloorClass>} [props.selectedItems] - The currently selected house floor items for editing.
 * @param {boolean} props.openAddDialog - Controls whether the dialog is open.
 * @param {() => void} props.handleCloseAdd - Callback to close the dialog.
 * @param {(data: IAddHouseFloorData | IAddHouseFloorData[]) => void} props.addItemHandler - Callback to handle adding or editing house floor data.
 *
 * @returns {JSX.Element} The rendered dialog component for adding or editing a house floor.
 */
export default function AddHouseFloorDialog({
	edit,
	isDashboard,
	dashboardData,
	selectedItems,
	openAddDialog,
	handleCloseAdd,
	addItemHandler,
}: IAddHouseFoorProps) {
	const [name, setName] = useState('')
	const [house, setHouse] = useState<HouseClass | null>(null)
	const [enteredImg, setEnteredImg] = useState<File | string | undefined>(undefined)
	const [previewImg, setPreviewImg] = useState<string | undefined>(undefined)
	const [multiple, setMultiple] = useState(false)
	const [itemId, setItemId] = useState<number | undefined>(undefined)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const imgPickerRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (isDashboard && dashboardData) {
			setHouse(dashboardData)
		} else {
			setHouse(null)
		}
		if (edit) {
			if (selectedItems?.length === 1) {
				const item = selectedItems[0]
				setName(item.name || '')
				setHouse(item.house || null)
				setItemId(item.id)
				setEnteredImg(item.layout)
				setMultiple(false)
			} else {
				setName('')
				setHouse(null)
				setItemId(undefined)
				setEnteredImg(undefined)
				setMultiple(true)
			}
		} else {
			setName('')
			setHouse(isDashboard && dashboardData ? dashboardData : null)
			setItemId(undefined)
			setEnteredImg(undefined)
			setMultiple(false)
		}
		setPreviewImg(undefined)
	}, [openAddDialog, edit, selectedItems, isDashboard, dashboardData])

	useEffect(() => {
		if (!enteredImg) {
			setPreviewImg(undefined)
			return
		}
		if (enteredImg instanceof File) {
			const fileReader = new FileReader()
			fileReader.onload = () => setPreviewImg(fileReader.result as string)
			fileReader.readAsDataURL(enteredImg)
		} else if (typeof enteredImg === 'string' && enteredImg.length > 0) {
			setPreviewImg(`${import.meta.env.VITE_API_IP}/${enteredImg}?w=100&h=100&format=webp`)
		}
	}, [enteredImg])

	/**
	 * Triggers a click event on the image picker input element, allowing the user to select an image file.
	 * Utilizes the `imgPickerRef` reference to access the input element.
	 */
	function pickImg(): void {
		imgPickerRef.current?.click()
	}

	/**
	 * Handles the image file input change event.
	 * Extracts the first selected file from the input and updates the state with it if present.
	 *
	 * @param e - The change event from the file input element.
	 */
	function imgHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		const file = e.target.files?.[0]
		if (file) setEnteredImg(file)
	}

	/**
	 * Closes the Add House Floor dialog by invoking the provided close handler.
	 * Typically used to reset dialog state and hide the dialog from view.
	 */
	function closeDialog(): void {
		handleCloseAdd()
	}

	/**
	 * Handles the form submission for adding or editing house floor data.
	 *
	 * - If not in edit mode, creates a new floor entry and passes it to `addItemHandler`.
	 * - If in edit mode with multiple selection, updates multiple floor entries.
	 * - If in edit mode with a single selection, updates a single floor entry.
	 * - Closes the dialog after processing.
	 *
	 * @param e - The form submission event.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		if (!edit) {
			addItemHandler({
				name,
				layout: enteredImg,
				houseId: house?.id,
			})
		} else if (edit && multiple) {
			addItemHandler(
				selectedItems?.map(item => ({
					id: item.id,
					name: item.name,
					layout: item.layout,
					houseId: item.houseId,
				})) || []
			)
		} else if (edit && !multiple) {
			addItemHandler([
				{
					id: itemId,
					name,
					layout: enteredImg,
					houseId: house?.id,
				},
			])
		}
		closeDialog()
	}

	return (
		<Dialog sx={{ width: '100%' }} open={openAddDialog} onClose={closeDialog} closeAfterTransition={false}>
			<DialogTitle>{edit ? 'Edit house floor' : 'Add house floor'}</DialogTitle>
			<Box sx={{ padding: 0, margin: 0 }} onSubmit={onSubmitHandler} component='form' noValidate autoComplete='off'>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<TextField
							sx={{ mt: 1, width: isMobile ? 200 : 400 }}
							id='name'
							label='Name'
							onChange={e => setName(e.target.value)}
							disabled={multiple}
							value={name}
						/>
						<HouseSelect getItem={setHouse} item={house} disabled={isDashboard || multiple} />
						<input
							type='file'
							id='img'
							ref={imgPickerRef}
							style={{ display: 'none' }}
							accept='.jpg,.png,.jpeg'
							onChange={imgHandler}
						/>
						<div className={classes.imgHolder}>
							{previewImg && (
								<div className={classes.img}>
									<img src={previewImg} alt='Preview' className={classes.img} />
								</div>
							)}
							<div className={classes.img_action}>
								<Button type='button' size={isMobile ? 'small' : 'medium'} onClick={pickImg}>
									Choose layout!
								</Button>
							</div>
						</div>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} onClick={closeDialog}>
						Cancel
					</Button>
					<Button variant='outlined' size={isMobile ? 'small' : 'medium'} type='submit'>
						{edit ? 'Save' : 'Add'}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}
