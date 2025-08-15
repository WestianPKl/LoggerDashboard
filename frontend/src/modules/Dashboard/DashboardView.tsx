import { useEffect } from 'react'
import type { HouseClass } from '../House/scripts/HouseClass'
import { Box, Grid, Typography } from '@mui/material'
import { socket } from '../../socket/socket'
import DashboardCard from './components/DashboardCard'
import { useRevalidator } from 'react-router'

/**
 * Renders the main dashboard view displaying a list of houses.
 *
 * @param houses - An array of `HouseClass` instances to be displayed in the dashboard.
 *
 * This component listens for the 'house' event on a socket connection and triggers a revalidation
 * of the data when the event occurs. It displays each house using the `DashboardCard` component
 * within a responsive grid layout.
 */
export default function DashboardView({ houses }: { houses: HouseClass[] }) {
	const revalidator = useRevalidator()

	useEffect(() => {
		function onAddHouseEvent(): void {
			revalidator.revalidate()
		}
		socket.on('house', onAddHouseEvent)
		return () => {
			socket.off('house', onAddHouseEvent)
		}
	}, [])

	return (
		<>
			<Box>
				<Typography variant='h5'>Main dashboard</Typography>
			</Box>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignContent: 'center',
					textAlign: 'center',
				}}>
				<Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12 }}>
					{houses.map((ele: HouseClass) => (
						<DashboardCard key={ele.id} data={ele} />
					))}
				</Grid>
			</Box>
		</>
	)
}
