import type { IDataMainProps } from '../scripts/IData'
import { useNavigate } from 'react-router'
import { lazy, Suspense, useMemo } from 'react'
const DataMainList = lazy(() => import('./DataMainList'))
import { Card, CardContent, CardActionArea, Typography, Box, Badge, List, ListItem } from '@mui/material'

/**
 * Renders a card component displaying the main information for a specific equipment data logger.
 * Shows the equipment's ID, vendor, and model, along with a status badge indicating if the logger is active
 * (based on the recency of its last value). Displays a list of the latest parameter values or a "No data" message
 * if none are available. Navigates to the detailed data logger page on click.
 *
 * @param {IDataMainProps} props - The props for the DataMain component.
 * @param {Equipment} props.equipment - The equipment object containing logger details.
 * @param {LastValue[]} props.lastValues - An array of last value objects associated with equipment loggers.
 *
 * @returns {JSX.Element} The rendered DataMain card component.
 */
export default function DataMain({ equipment, lastValues }: IDataMainProps) {
	const navigate = useNavigate()

	const lastValueData = useMemo(
		() => lastValues.filter(lv => lv.equLoggerId === equipment.id),
		[lastValues, equipment.id]
	)

	const isActive = useMemo(() => {
		if (!lastValueData.length) return false
		return lastValueData.some(e => {
			if (e.time) {
				const lastValueDate = new Date(e.time)
				const currentDate = new Date()
				return lastValueDate.getTime() - currentDate.getTime() > -1800000
			}
			return false
		})
	}, [lastValueData])

	/**
	 * Handles the click event for a data item.
	 * Navigates to the data logger page for the selected equipment.
	 *
	 * @remarks
	 * This function uses the `navigate` function to redirect the user
	 * to the route corresponding to the selected equipment's data logger.
	 *
	 * @returns {void}
	 */
	function dataClickHandler(): void {
		navigate(`/data/data-logger/${equipment.id}`)
	}

	return (
		<Card sx={{ width: 300, maxWidth: 300 }} onClick={dataClickHandler}>
			<CardActionArea sx={{ width: '100%', height: '100%' }} onClick={dataClickHandler}>
				<CardContent>
					<Box sx={{ display: 'flex', justifyContent: 'end' }}>
						<Badge color={isActive ? 'success' : 'error'} badgeContent=' ' variant='dot'></Badge>
					</Box>
					<Typography gutterBottom variant='h5' component='div'>
						{`ID${equipment.id} ${equipment.vendor?.name ?? ''} ${equipment.model?.name ?? ''}`}
					</Typography>
					<Box sx={{ marginTop: 0, textAlign: 'center' }}>
						{lastValueData.length > 0 ? (
							<List sx={{ margin: 0, padding: 0 }}>
								{lastValueData.map(item => (
									<ListItem
										key={`${item.equLoggerId}-${item.parameter ?? item.id ?? Math.random()}`}
										sx={{ padding: 0, textAlign: 'center' }}>
										<Suspense fallback={<div>Loading...</div>}>
											<DataMainList lastValue={item} />
										</Suspense>
									</ListItem>
								))}
							</List>
						) : (
							<Typography>No data</Typography>
						)}
					</Box>
				</CardContent>
			</CardActionArea>
		</Card>
	)
}
