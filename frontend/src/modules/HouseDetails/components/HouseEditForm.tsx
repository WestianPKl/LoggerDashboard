import { useState, useEffect, useRef } from 'react'
import { Button, Box, TextField, useMediaQuery, useTheme } from '@mui/material'
import type { IHouseEditFormProps } from './../scripts/IHouseDetails'
import type { IAddHouseFloorData } from '../../House/scripts/IHouse'
import classes from '../../House/components/AddHouseDialog.module.css'
import AddHouseFloorDialog from '../../House/components/AddHouseFloorDialog'

export default function HouseEditForm({ house, addHouseFloorHandler, editHouseHandler }: IHouseEditFormProps) {
	const [name, setName] = useState<string | undefined>('')
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

	function handleClickAddOpen() {
		setOpenAddDialog(true)
	}

	function handleCloseAdd() {
		setOpenAddDialog(false)
	}

	useEffect(() => {
		setName(house.name)
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

	function onNameChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
		setName(e.target.value)
	}
	function onPostalCodeChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
		setPostalCode(e.target.value)
	}
	function onCityChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
		setCity(e.target.value)
	}
	function onStreetChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
		setStreet(e.target.value)
	}
	function onHouseNumberChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
		setHouseNumber(e.target.value)
	}

	function pickImg() {
		imgPickerRef.current.click()
	}

	function imgHandler(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files[0]) {
			setEnteredImg(e.target.files[0])
		}
	}

	function onSubmitHandler(e: React.FormEvent) {
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

	function addItemHandler(item: IAddHouseFloorData | IAddHouseFloorData[]) {
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
					<Button sx={{ m: 2 }} variant='contained' color='primary' size={isMobile ? 'small' : 'medium'} type='submit'>
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
