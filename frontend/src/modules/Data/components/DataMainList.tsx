import { ListItemText, Typography, useMediaQuery, useTheme, ListItemAvatar, Tooltip } from '@mui/material'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import SpeedIcon from '@mui/icons-material/Speed'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import type { IDataMainListProps } from '../scripts/IData'

/**
 * Maps data type keys to their corresponding Material UI icon components.
 *
 * @remarks
 * This mapping is used to associate specific data types (such as "temperature", "humidity", and "atmPressure")
 * with their representative icons for display purposes in the UI.
 *
 * @example
 * // Access the icon for temperature
 * const temperatureIcon = iconMap['temperature'];
 *
 * @typeParam string - The key representing the data type.
 * @typeParam React.ReactNode - The icon component associated with the data type.
 */
const iconMap: Record<string, React.ReactNode> = {
	temperature: <ThermostatIcon />,
	humidity: <WaterDropIcon />,
	atmPressure: <SpeedIcon />,
}

/**
 * Returns the input string with the first character capitalized.
 *
 * @param parameter - The string to capitalize. If undefined or empty, returns an empty string.
 * @returns The capitalized string, or an empty string if the input is falsy.
 */
function getLabel(parameter?: string): string {
	if (!parameter) return ''
	return parameter.charAt(0).toUpperCase() + parameter.slice(1)
}

/**
 * Renders a list item displaying sensor data with an icon, value, and optional tooltip.
 *
 * @param {IDataMainListProps} props - The props for the DataMainList component.
 * @param {LastValueType} props.lastValue - The latest sensor value object containing parameter, value, unit, equSensorId, and time.
 *
 * @returns {JSX.Element} The rendered list item with sensor information.
 *
 * @remarks
 * - Displays an icon based on the sensor parameter.
 * - Shows a tooltip with sensor ID and timestamp on non-mobile devices.
 * - On mobile devices, only the value and unit are shown.
 */
export default function DataMainList({ lastValue }: IDataMainListProps) {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	return (
		<>
			<ListItemAvatar>{iconMap[lastValue.parameter || ''] || null}</ListItemAvatar>
			<ListItemText>
				{!isMobile ? (
					<Tooltip title={`Sensor: ID${lastValue.equSensorId ?? ''} Time: ${lastValue.time ?? ''}`}>
						<Typography variant='body2'>
							{`${getLabel(lastValue.parameter)}: ${lastValue.value ?? '-'}${lastValue.unit ?? ''}`}
						</Typography>
					</Tooltip>
				) : (
					<Typography variant='body2'>{`${lastValue.value ?? '-'}${lastValue.unit ?? ''}`}</Typography>
				)}
			</ListItemText>
		</>
	)
}
