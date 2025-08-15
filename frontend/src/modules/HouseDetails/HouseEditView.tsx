import type { IHouseEditViewProps } from './scripts/IHouseDetails'
import { Container, useMediaQuery, useTheme } from '@mui/material'
import HouseEditForm from './components/HouseEditForm'
import { useAppDispatch } from '../../store/hooks'
import type { IAddHouseData, IAddHouseFloorData } from '../House/scripts/IHouse'
import { showAlert } from '../../store/application-store'
import { useUpdateHouseMutation, useAddHouseFloorMutation } from '../../store/api/houseApi'
import { useRevalidator } from 'react-router'

/**
 * `HouseEditView` is a React component responsible for rendering the house editing interface.
 * It provides handlers for editing house details and adding new house floors, utilizing async
 * API mutations and Redux for state management and notifications.
 *
 * @param {IHouseEditViewProps} props - The props for the component.
 * @param {IHouseData} props.data - The house data to be edited.
 *
 * @remarks
 * - Uses `useAppDispatch` for Redux actions.
 * - Uses `useTheme` and `useMediaQuery` for responsive design.
 * - Uses `useRevalidator` to refresh data after mutations.
 * - Handles both single and multiple item submissions for editing and adding floors.
 * - Displays success or error alerts based on mutation results.
 *
 * @returns {JSX.Element} The rendered component containing the house edit form.
 */
export default function HouseEditView({ data }: IHouseEditViewProps) {
	const dispatch = useAppDispatch()
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const revalidator = useRevalidator()

	const [updateHouse] = useUpdateHouseMutation()
	const [addHouseFloor] = useAddHouseFloorMutation()

	/**
	 * Handles adding one or multiple house floors by sending form data to the server.
	 *
	 * @param item - A single `IAddHouseFloorData` object or an array of such objects representing the floors to add.
	 * @returns A promise that resolves when all floors have been added.
	 *
	 * @remarks
	 * - Converts the input to an array if it is not already.
	 * - For each floor, constructs a `FormData` object and appends the relevant fields.
	 * - Calls the `addHouseFloor` API for each floor in parallel.
	 * - On success, dispatches a success alert and triggers a revalidation.
	 * - On failure, dispatches an error alert with the error message.
	 */
	async function addHouseFloorHandler(item: IAddHouseFloorData[] | IAddHouseFloorData): Promise<void> {
		const itemsArr = Array.isArray(item) ? item : [item]
		try {
			await Promise.all(
				itemsArr.map(async i => {
					const formData = new FormData()
					if (i.name) formData.append('name', i.name)
					if (i.houseId) formData.append('houseId', `${i.houseId}`)
					if (i.layout) formData.append('layout', i.layout)
					await addHouseFloor(formData).unwrap()
				})
			)
			dispatch(showAlert({ message: 'New house floor(s) added', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Error adding floor'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	/**
	 * Handles editing one or multiple house records.
	 *
	 * Accepts either a single `IAddHouseData` object or an array of such objects.
	 * For each item, constructs a `FormData` payload with the house details and sends an update request.
	 * On success, shows a success alert and triggers a revalidation.
	 * On failure, shows an error alert with the relevant message.
	 *
	 * @param item - The house data to edit, either as a single object or an array of objects.
	 * @returns A promise that resolves when all updates are complete.
	 */
	async function editHouseHandler(item: IAddHouseData[] | IAddHouseData): Promise<void> {
		const itemsArr = Array.isArray(item) ? item : [item]
		try {
			await Promise.all(
				itemsArr.map(async i => {
					const formData = new FormData()
					if (i.name) formData.append('name', i.name)
					if (i.postalCode) formData.append('postalCode', i.postalCode)
					if (i.city) formData.append('city', i.city)
					if (i.street) formData.append('street', i.street)
					if (i.houseNumber) formData.append('houseNumber', i.houseNumber)
					if (i.pictureLink) formData.append('pictureLink', i.pictureLink)
					if (i.id) {
						await updateHouse({ body: formData, id: i.id }).unwrap()
					}
				})
			)
			dispatch(showAlert({ message: 'House(s) edited', severity: 'success' }))
			revalidator.revalidate()
		} catch (err: any) {
			const message = err?.data?.message || err?.message || 'Error editing house'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}

	return (
		<Container maxWidth={isMobile ? 'sm' : 'xl'} sx={{ textAlign: 'center' }}>
			<HouseEditForm house={data} addHouseFloorHandler={addHouseFloorHandler} editHouseHandler={editHouseHandler} />
		</Container>
	)
}
