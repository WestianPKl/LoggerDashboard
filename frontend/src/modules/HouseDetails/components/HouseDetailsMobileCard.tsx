import { useEffect, useState } from 'react'
import { Card, CardContent, Typography, Box, Badge, List, ListItem } from '@mui/material'
import { useGetDataLastValuesViewQuery, useGetDataConnectedSensorViewQuery } from '../../../store/api/dataApi'
import { socket } from '../../../socket/socket'
import HouseDetailsLoggerNodeList from './HouseDetailsLoggerNodeList'
import type { IHouseDetailsMobileCardProps } from '../scripts/IHouseDetails'
import LoadingCircle from '../../../components/UI/LoadingCircle'
import { showAlert } from '../../../store/application-store'
import { useAppDispatch } from '../../../store/hooks'

export default function HouseDetailsMobileCard({ logger, floorId, houseLoggerId }: IHouseDetailsMobileCardProps) {
	const [socketTrigger, setSocketTrigger] = useState(0)
	const dispatch = useAppDispatch()

	const {
		data: dataLastValue = [],
		isLoading: dataLastValueIsLoading,
		error: dataLastValueError,
		refetch: refetchLastValue,
	} = useGetDataLastValuesViewQuery({ houseFloorId: floorId, houseLoggerId }, { refetchOnMountOrArgChange: true })
	const {
		data: dataConnectedSensors = [],
		isLoading: dataConnectedSensorsIsLoading,
		error: dataConnectedSensorsError,
		refetch: refetchConnectedSensors,
	} = useGetDataConnectedSensorViewQuery({ houseFloorId: floorId, houseLoggerId }, { refetchOnMountOrArgChange: true })

	const [isActive, setIsActive] = useState(true)

	useEffect(() => {
		function onRefreshDataEvent() {
			setSocketTrigger(t => t + 1)
		}
		socket.on(`loggerData_${logger.id}`, onRefreshDataEvent)
		return () => {
			socket.off(`loggerData_${logger.id}`, onRefreshDataEvent)
		}
	}, [logger.id])

	useEffect(() => {
		refetchLastValue()
		refetchConnectedSensors()
	}, [socketTrigger])

	useEffect(() => {
		if (!dataLastValue) return
		let statuses: boolean[] = []
		dataLastValue.forEach(e => {
			if (e.time) {
				const lastValueDate = new Date(e.time)
				const currentDate = new Date()
				const duration = lastValueDate.getTime() - currentDate.getTime()
				if (duration > -1800000) statuses.push(true)
				else statuses.push(false)
			}
		})
		if (dataLastValue.length === 0) statuses.push(false)
		let checker = (arr: boolean[]) => arr.includes(true)
		setIsActive(checker(statuses))
	}, [dataLastValue])

	useEffect(() => {
		const err = dataLastValueError || dataConnectedSensorsError
		if (err) {
			const message = (err as any)?.data?.message || (err as any)?.message || 'Something went wrong'
			dispatch(showAlert({ message, severity: 'error' }))
		}
	}, [dataLastValueError, dataConnectedSensorsError, dispatch])

	const isLoading = dataLastValueIsLoading || dataConnectedSensorsIsLoading

	return (
		<>
			{isLoading && <LoadingCircle />}
			{!isLoading && (
				<Card sx={{ width: 300, maxWidth: 300 }}>
					<CardContent>
						<Box sx={{ display: 'flex', justifyContent: 'end' }}>
							<Badge color={isActive ? 'success' : 'error'} badgeContent=' ' variant='dot' />
						</Box>
						<Typography gutterBottom variant='h5' component='div'>
							{`ID${logger.id} ${logger.vendor?.name} ${logger.model?.name}`}
						</Typography>
						<Box sx={{ marginTop: 0, textAlign: 'center' }}>
							{dataLastValue.length > 0 && dataConnectedSensors[0] && (
								<List sx={{ margin: 0, padding: 0 }}>
									{dataLastValue.map(item => (
										<ListItem key={item.id} sx={{ padding: 0, textAlign: 'center' }}>
											{item.equSensorId === dataConnectedSensors[0].equSensorId && (
												<HouseDetailsLoggerNodeList lastValue={item} />
											)}
										</ListItem>
									))}
								</List>
							)}
						</Box>
						{dataLastValue.length === 0 && !dataConnectedSensors[0] && <Typography>No data</Typography>}
					</CardContent>
				</Card>
			)}
		</>
	)
}
