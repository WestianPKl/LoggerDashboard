import {
	Box,
	Button,
	Dialog,
	useMediaQuery,
	useTheme,
	Card,
	CardContent,
	CardHeader,
	Typography,
	List,
	ListItem,
	IconButton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import HouseDetailsLoggerNodeList from './HouseDetailsLoggerNodeList'
import type { IHouseDetailsLoggerNodeDialogProps } from '../scripts/IHouseDetails'
import { canDelete } from '../../../store/auth-actions'
import { useAppSelector } from '../../../store/hooks'
import { useNavigate } from 'react-router'

/**
 * Displays a dialog with detailed information about a logger node in a house.
 *
 * This component shows logger details, connected sensors, and the latest sensor values.
 * It provides options to delete the node (if permitted), navigate to the logger's data page,
 * and close the dialog. The UI adapts for mobile screens.
 *
 * @param loggerData - The logger node data to display.
 * @param lastValueData - Array of the latest value data for the logger's sensors.
 * @param connectedSensors - List of sensors connected to the logger.
 * @param detailsDialog - Boolean indicating if the dialog is open.
 * @param onCloseDialog - Callback to close the dialog.
 * @param handleClickDeleteNode - Callback to delete the logger node.
 * @param editModeProps - If present, enables edit/delete actions.
 *
 * @returns A dialog component displaying logger node details and actions.
 */
export default function HouseDetailsLoggerNodeDialog({
	loggerData,
	lastValueData,
	connectedSensors,
	detailsDialog,
	onCloseDialog,
	handleClickDeleteNode,
	editModeProps,
}: IHouseDetailsLoggerNodeDialogProps) {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const navigate = useNavigate()

	/**
	 * Handles the click event for navigating to the data logger details page.
	 * Navigates to the route `/data/data-logger/{loggerData.id}` using the `navigate` function.
	 */
	function onDataClick(): void {
		navigate(`/data/data-logger/${loggerData.id}`)
	}

	const isDeletable = useAppSelector(state => canDelete('house', 'houseFloor')(state))

	return (
		<Dialog open={detailsDialog} onClose={onCloseDialog} closeAfterTransition={false}>
			<Card sx={{ maxWidth: 345 }}>
				{editModeProps && isDeletable && (
					<Box sx={{ m: 0, p: 0, display: 'flex', justifyContent: 'end' }}>
						<IconButton
							sx={{ ml: '0.3rem' }}
							color='error'
							type='button'
							size={isMobile ? 'small' : 'medium'}
							onClick={() => handleClickDeleteNode(loggerData)}>
							<DeleteIcon />
						</IconButton>
					</Box>
				)}

				<CardHeader
					sx={{ textAlign: 'center' }}
					title={<Typography variant='h6'>{`Logger ID${loggerData.id}`}</Typography>}
					subheader={
						<>
							<Typography variant='body1'>{`${loggerData.equVendor} ${loggerData.equModel} S/N ${loggerData.serialNumber}`}</Typography>
							{connectedSensors.length > 0 && (
								<>
									<Typography variant='body2'>Connected sensors:</Typography>
									{connectedSensors.map(e => (
										<Typography
											variant='body2'
											key={
												e.equSensorId
											}>{`ID${e.equSensorId} ${e.sensorVendor} ${e.sensorModel} ${e.sensorSerialNumber}`}</Typography>
									))}
								</>
							)}
						</>
					}
				/>
				<CardContent>
					{lastValueData.length > 0 && <Typography variant='body2'>Last values:</Typography>}
					<Box sx={{ marginTop: 0, marginBottom: '1rem', textAlign: 'center' }}>
						{lastValueData.length > 0 && (
							<List sx={{ margin: 0, padding: 0 }}>
								{lastValueData.map(item => (
									<ListItem sx={{ margin: 0, padding: 0 }} key={item.id}>
										<HouseDetailsLoggerNodeList lastValue={item} />
									</ListItem>
								))}
							</List>
						)}
						{lastValueData.length === 0 && <Typography>No data</Typography>}
					</Box>
					<Box sx={{ margin: 0, padding: 0, display: 'flex', justifyContent: 'end' }}>
						{lastValueData.length > 0 && (
							<Button sx={{ mr: 1 }} variant='outlined' size={isMobile ? 'small' : 'medium'} onClick={onDataClick}>
								Data
							</Button>
						)}
						<Button variant='outlined' size={isMobile ? 'small' : 'medium'} onClick={onCloseDialog}>
							Close
						</Button>
					</Box>
				</CardContent>
			</Card>
		</Dialog>
	)
}
