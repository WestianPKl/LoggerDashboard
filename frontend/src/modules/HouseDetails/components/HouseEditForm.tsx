import { useState, useEffect, useRef } from 'react'
import { Button, Box, TextField, useMediaQuery, useTheme } from '@mui/material'
import type { IHouseEditFormProps } from '../scripts/IHouseDetails'
import type { IAddHouseFloorData } from '../../House/scripts/IHouse'
import classes from '../../House/components/AddHouseDialog.module.css'
import AddHouseFloorDialog from '../../House/components/AddHouseFloorDialog'

/**
 * HouseEditForm component allows editing of house details such as name, address, and image.
 *
 * @component
 * @param {IHouseEditFormProps} props - The props for the HouseEditForm component.
 * @param {IHouse} props.house - The house object containing current house details.
 * @param {(item: IAddHouseFloorData | IAddHouseFloorData[]) => void} props.addHouseFloorHandler - Handler to add a new floor to the house.
 * @param {(data: any[]) => void} props.editHouseHandler - Handler to submit the edited house details.
 *
 * @returns {JSX.Element} The rendered HouseEditForm component.
 *
 * @example
 * <HouseEditForm
 *   house={house}
 *   addHouseFloorHandler={addFloor}
 *   editHouseHandler={editHouse}
 * />
 */
export default function HouseEditForm({ house, addHouseFloorHandler, editHouseHandler }: IHouseEditFormProps) {
	const [name, setName] = useState<string>('')
	const [postalCode, setPostalCode] = useState<string | undefined>('')
	const [city, setCity] = useState<string | undefined>('')
	const [street, setStreet] = useState<string | undefined>('')
	const [houseNumber, setHouseNumber] = useState<string | undefined>('')
	const [enteredImg, setEnteredImg] = useState<any>(undefined)
	const [previewImg, setPreviewImg] = useState<any>(undefined)
	const imgPickerRef = useRef<any>(null)
	const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)

	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Opens the "Add" dialog by setting the `openAddDialog` state to true.
	 *
	 * This function is typically used as an event handler for UI elements
	 * that trigger the display of the add dialog in the house edit form.
	 */
	function handleClickAddOpen(): void {
		setOpenAddDialog(true)
	}

	/**
	 * Closes the "Add" dialog by setting its open state to false.
	 *
	 * This function is typically used as an event handler to close
	 * the dialog for adding new items or entries in the form.
	 */
	function handleCloseAdd(): void {
		setOpenAddDialog(false)
	}

	useEffect(() => {
		setName(house.name || '')
		setPostalCode(house.postalCode)
		setCity(house.city)
		setStreet(house.street)
		setHouseNumber(house.houseNumber)
		setEnteredImg(house.pictureLink)
	}, [house])

	useEffect(() => {
		if (!enteredImg) {
			setPreviewImg(undefined)
			return
		}
		if (typeof enteredImg === 'string') {
			setPreviewImg(`${import.meta.env.VITE_API_IP}/${enteredImg}?w=50&h=50&format=webp`)
			return
		}
		const fileReader = new FileReader()
		fileReader.onload = () => {
			setPreviewImg(fileReader.result)
		}
		fileReader.readAsDataURL(enteredImg)
	}, [enteredImg])

	/**
	 * Handles the change event for the house name input field.
	 *
	 * Updates the local state with the new value entered by the user.
	 *
	 * @param e - The change event from the input element.
	 */
	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setName(e.target.value)
	}
	/**
	 * Handles the change event for the postal code input field.
	 *
	 * Updates the postal code state with the current value from the input element.
	 *
	 * @param e - The change event triggered by the postal code input field.
	 */
	function onPostalCodeChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setPostalCode(e.target.value)
	}
	/**
	 * Handles the change event for the city input field.
	 *
	 * Updates the city state with the new value entered by the user.
	 *
	 * @param e - The change event from the city input field.
	 */
	function onCityChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setCity(e.target.value)
	}
	/**
	 * Handles the change event for the street input field.
	 * Updates the street state with the new value entered by the user.
	 *
	 * @param e - The change event from the street input element.
	 */
	function onStreetChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setStreet(e.target.value)
	}
	/**
	 * Handles the change event for the house number input field.
	 * Updates the house number state with the new value entered by the user.
	 *
	 * @param e - The change event from the house number input element.
	 */
	function onHouseNumberChangeHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		setHouseNumber(e.target.value)
	}

	/**
	 * Triggers the click event on the image picker input element.
	 *
	 * This function programmatically opens the file picker dialog by invoking
	 * the `click` method on the referenced image picker input element.
	 *
	 * @remarks
	 * Assumes that `imgPickerRef` is a valid React ref object pointing to an HTML input element.
	 */
	function pickImg(): void {
		imgPickerRef.current.click()
	}

	/**
	 * Handles the image file input change event.
	 *
	 * When a file is selected, this function updates the state with the selected image file.
	 *
	 * @param e - The change event from the HTML input element of type "file".
	 */
	function imgHandler(e: React.ChangeEvent<HTMLInputElement>): void {
		if (e.target.files && e.target.files[0]) {
			setEnteredImg(e.target.files[0])
		}
	}

	/**
	 * Handles the form submission event for editing house details.
	 *
	 * Prevents the default form submission behavior, constructs a data object
	 * containing the updated house information, and invokes the `editHouseHandler`
	 * callback with the updated data.
	 *
	 * @param e - The form submission event.
	 */
	function onSubmitHandler(e: React.FormEvent): void {
		e.preventDefault()
		const data = {
			id: house.id,
			name,
			postalCode,
			city,
			street,
			houseNumber,
			pictureLink: enteredImg,
		}
		editHouseHandler([data])
	}

	/**
	 * Handles the addition of a new house floor item or multiple items.
	 * Invokes the `addHouseFloorHandler` with the provided item(s) and closes the add dialog.
	 *
	 * @param item - The house floor data to add, either a single item or an array of items.
	 */
	function addItemHandler(item: IAddHouseFloorData | IAddHouseFloorData[]): void {
		addHouseFloorHandler(item)
		setOpenAddDialog(false)
	}

	return (
		<Box
			onSubmit={onSubmitHandler}
			component='form'
			sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
			noValidate
			autoComplete='off'>
			<Box sx={{ justifyContent: 'center', alignItems: 'center' }}>
				<Box>
					<TextField
						sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
						id='name'
						label='Name'
						onChange={onNameChangeHandler}
						value={name}
						required
					/>
					<TextField
						sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
						id='postalCode'
						label='Postal code'
						onChange={onPostalCodeChangeHandler}
						value={postalCode}
					/>
				</Box>
				<Box>
					<TextField
						sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
						id='city'
						label='City'
						onChange={onCityChangeHandler}
						value={city}
					/>
					<TextField
						sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
						id='street'
						label='Street'
						onChange={onStreetChangeHandler}
						value={street}
					/>
				</Box>
				<TextField
					sx={{ mt: '1rem', width: isMobile ? 200 : 400 }}
					id='houseNumber'
					label='House number'
					onChange={onHouseNumberChangeHandler}
					value={houseNumber}
				/>
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
							Choose picture!
						</Button>
					</div>
				</div>
				<Box>
					<TextField
						label='Created at'
						disabled
						value={house.createdAt ? house.createdAt.replace('T', ' ').replace('Z', ' ').split('.')[0] : ''}
					/>
					<TextField
						label='Updated At'
						disabled
						value={house.updatedAt ? house.updatedAt.replace('T', ' ').replace('Z', ' ').split('.')[0] : ''}
					/>
				</Box>
				<Box>
					<Button
						sx={{ m: 2 }}
						variant='contained'
						color='primary'
						size={isMobile ? 'small' : 'medium'}
						type='submit'
						disabled={!name.trim()}>
						Save Changes
					</Button>
					<Button
						sx={{ m: 2 }}
						variant='contained'
						color='primary'
						size={isMobile ? 'small' : 'medium'}
						type='button'
						onClick={handleClickAddOpen}>
						Add new floor
					</Button>
					<AddHouseFloorDialog
						isDashboard={true}
						dashboardData={house}
						edit={false}
						handleCloseAdd={handleCloseAdd}
						openAddDialog={openAddDialog}
						addItemHandler={addItemHandler}
					/>
				</Box>
			</Box>
		</Box>
	)
}
