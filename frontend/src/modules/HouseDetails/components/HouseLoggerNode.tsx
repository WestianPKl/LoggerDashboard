import { useEffect, useState, memo } from 'react'
import { Card, Typography } from '@mui/material'
import { useReactFlow } from '@xyflow/react'
import { useGetDataLastValuesViewQuery, useGetDataConnectedSensorViewQuery } from '../../../store/api/dataApi'
import HouseDetailsLoggerNodeDialog from './HouseDetailsLoggerNodeDialog'
import HouseDetailsLoggerNewNodeDialog from './HouseDetailsLoggerNewNodeDialog'
import { useAddHouseLoggerMutation, useDeleteHouseLoggerMutation } from '../../../store/api/houseApi'
import { useAppDispatch } from '../../../store/hooks'
import { showAlert } from '../../../store/application-store'
import LoadingCircle from '../../../components/UI/LoadingCircle'
import type { IAddHouseLoggerData } from '../../House/scripts/IHouse'
import type { IHouseLoggerData, IHouseLoggerNode } from '../scripts/IHouseDetails'
import { socket } from '../../../socket/socket'
import { skipToken } from '@reduxjs/toolkit/query'
import { useRevalidator } from 'react-router'
import type { DataLastValueViewClass } from '../../Data/scripts/DataLastValueViewClass'

export default memo(
	({
		id,
		data,
		positionAbsoluteX,
		positionAbsoluteY,
	}: {
		id: string
		data: IHouseLoggerNode
		positionAbsoluteX: number
		positionAbsoluteY: number
	}) => {
		const {
			data: lastValueData = [],
			isLoading: lastValueLoading,
			error: lastValueError,
			refetch: refetchLastValue,
			isUninitialized: lastValueUninitialized,
		} = useGetDataLastValuesViewQuery(
			data.houseLoggerId && data.floorId ? { houseLoggerId: data.houseLoggerId, houseFloorId: data.floorId } : skipToken
		)

		const {
			data: connectedSensors = [],
			isLoading: connectedSensorsLoading,
			error: connectedSensorsError,
			refetch: refetchConnectedSensors,
			isUninitialized: connectedSensorsUninitialized,
		} = useGetDataConnectedSensorViewQuery(
			data.houseLoggerId && data.floorId ? { houseLoggerId: data.houseLoggerId, houseFloorId: data.floorId } : skipToken
		)

		const [detailsDialog, setDetailsDialog] = useState(false)
		const [lastValue, setLastValue] = useState<DataLastValueViewClass[]>([])
		const [statusColors, setStatusColors] = useState('success.main')
		const [loggerData, setLoggerData] = useState<IHouseLoggerData>({ floorId: undefined, id: undefined })
		const [editMode, setEditMode] = useState<boolean>(data.editMode)
		const [equLoggerId, setEquLoggerId] = useState<number>(data.equLoggerId)
		const [socketEvents, setSocketEvents] = useState<string>('')
		const revalidator = useRevalidator()

		const [addHouseLogger] = useAddHouseLoggerMutation()
		const [deleteHouseLogger] = useDeleteHouseLoggerMutation()
		const dispatch = useAppDispatch()
		const { setNodes, getNode } = useReactFlow()

		useEffect(() => {
			let statuses: boolean[] = []
			if (lastValueData.length > 0) {
				lastValueData.forEach(e => {
					if (e.time) {
						const lastValueDate = new Date(e.time)
						const currentDate = new Date()
						const timeAgo = currentDate.getTime() - lastValueDate.getTime()
						if (timeAgo < 1800000) {
							statuses.push(true)
						} else {
							statuses.push(false)
						}
					}
				})
				let checker = (arr: boolean[]) => arr.every(v => v === true)
				if (!checker(statuses)) {
					setStatusColors('error.main')
				} else {
					setStatusColors('success.main')
				}
				setLastValue(lastValueData)
			} else {
				statuses.push(false)
				setStatusColors('error.main')
			}
		}, [lastValueData])

		useEffect(() => {
			function onRefreshDataEvent(value: any) {
				setSocketEvents(socketEvents.concat(value))
				if (!lastValueUninitialized) refetchLastValue()
				if (!connectedSensorsUninitialized) refetchConnectedSensors()
			}
			socket.on(`loggerData_${data.equLoggerId}`, onRefreshDataEvent)
			return () => {
				socket.off(`loggerData_${data.equLoggerId}`, onRefreshDataEvent)
			}
		}, [
			socketEvents,
			data.equLoggerId,
			refetchLastValue,
			refetchConnectedSensors,
			lastValueUninitialized,
			connectedSensorsUninitialized,
		])

		useEffect(() => {
			setLoggerData(
				editMode
					? {
							floorId: data.floorId,
							id: equLoggerId,
							serialNumber: data.label,
							equVendor: data.equVendor,
							equModel: data.equModel,
							houseLoggerId: data.houseLoggerId,
					  }
					: {
							floorId: data.floorId,
							id: equLoggerId,
					  }
			)
		}, [editMode, data, equLoggerId])

		useEffect(() => {
			const err = lastValueError || connectedSensorsError
			if (err) {
				const message = (err as any)?.data?.message || (err as any)?.message || 'Something went wrong'
				dispatch(showAlert({ message, severity: 'error' }))
			}
		}, [lastValueError, connectedSensorsError, dispatch])

		async function addItemHandler(item: IAddHouseLoggerData | IAddHouseLoggerData[]) {
			try {
				setDetailsDialog(false)
				if (!Array.isArray(item)) {
					let x = positionAbsoluteX
					let y = positionAbsoluteY
					if (data.id) {
						const node = getNode(data.id)
						if (node?.position?.x) x = node.position.x
						if (node?.position?.y) y = node.position.y
					}
					item['posX'] = x
					item['posY'] = y
					const logger = await addHouseLogger(item).unwrap()
					setLoggerData({
						floorId: logger.houseFloorId,
						id: logger.equLoggerId,
						houseLoggerId: logger.id,
						serialNumber: logger.logger?.serialNumber,
						equModel: logger.logger?.model?.name,
						equVendor: logger.logger?.vendor?.name,
					})
					if (logger.equLoggerId) setEquLoggerId(logger.equLoggerId)
					data.editMode = true
					setEditMode(true)
					if (!lastValueUninitialized) refetchLastValue()
					if (!connectedSensorsUninitialized) refetchConnectedSensors()
				}
				dispatch(showAlert({ message: 'New house logger added', severity: 'success' }))
				revalidator.revalidate()
			} catch (err: any) {
				const message = err?.data?.message || err?.message || 'Something went wrong'
				dispatch(showAlert({ message, severity: 'error' }))
			}
		}

		function onDoubleClickHandler(e: any) {
			if (e.detail > 1) setDetailsDialog(true)
		}

		async function handleClickDeleteNode(data: any) {
			try {
				if (data.houseLoggerId) {
					await deleteHouseLogger({ id: data.houseLoggerId }).unwrap()
					setNodes(nodes => nodes.filter(node => node.id !== id))
					dispatch(showAlert({ message: 'Logger node deleted', severity: 'success' }))
					revalidator.revalidate()
				} else {
					setNodes(nodes => nodes.filter(node => node.id !== id))
				}
			} catch (err: any) {
				const message = err?.data?.message || err?.message || 'Something went wrong'
				dispatch(showAlert({ message, severity: 'error' }))
			}
		}

		if (lastValueLoading || connectedSensorsLoading) return <LoadingCircle />

		return (
			<Card
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					width: 60,
					height: 60,
					backgroundColor: statusColors,
				}}
				onClick={onDoubleClickHandler}>
				<Typography variant='body2'>
					{editMode
						? `ID${equLoggerId}`.length > 7
							? `ID${equLoggerId}`.substring(0, 6) + '...'
							: `ID${equLoggerId}`
						: `ID-N`}
				</Typography>
				{editMode && (
					<HouseDetailsLoggerNodeDialog
						editModeProps={data.editModeProps}
						loggerData={loggerData}
						connectedSensors={connectedSensors}
						lastValueData={lastValue}
						onCloseDialog={() => setDetailsDialog(false)}
						detailsDialog={detailsDialog}
						handleClickDeleteNode={handleClickDeleteNode}
					/>
				)}
				{!editMode && (
					<HouseDetailsLoggerNewNodeDialog
						loggerData={loggerData}
						addItemHandler={addItemHandler}
						onCloseDialog={() => setDetailsDialog(false)}
						detailsDialog={detailsDialog}
						handleClickDeleteNode={handleClickDeleteNode}
					/>
				)}
			</Card>
		)
	}
)
