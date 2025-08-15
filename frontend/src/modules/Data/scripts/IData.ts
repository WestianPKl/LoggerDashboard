import type { EquipmentClass } from '../../Equipment/scripts/EquipmentClass'
import type { DataLastValueViewClass } from './DataLastValueViewClass'

/**
 * Props for the main data component.
 *
 * @property equipment - The equipment instance associated with the data.
 * @property lastValues - An array of the latest value views for the equipment.
 */
export interface IDataMainProps {
	equipment: EquipmentClass
	lastValues: DataLastValueViewClass[]
}

/**
 * Props for the main data list component.
 *
 * @property lastValue - The latest value to be displayed in the data list, represented by a `DataLastValueViewClass` instance.
 */
export interface IDataMainListProps {
	lastValue: DataLastValueViewClass
}

/**
 * Props for a chart range selection component.
 *
 * @property range - The currently selected range as a string.
 * @property handleRangeChange - Callback invoked when the range changes, receives the new range as a string.
 * @property handleReset - Callback invoked to reset the range selection.
 */
export interface IDataChartRangeButtonsProps {
	range: string
	handleRangeChange: (range: string) => void
	handleReset: () => void
}

/**
 * Props for the chart export buttons component.
 *
 * @property {ISensorData[]} chartData - The data displayed in the chart.
 * @property {() => void} exportChartImage - Function to export the chart as an image.
 * @property {string} range - The selected data range for the chart.
 * @property {() => void} refreshData - Function to refresh the chart data.
 * @property {boolean} loading - Indicates if the data is currently loading.
 * @property {(enabled: boolean) => void} setAutoRefreshEnabled - Function to enable or disable auto-refresh.
 * @property {boolean} autoRefreshEnabled - Indicates if auto-refresh is enabled.
 */
export interface IDataChartExportButtonsProps {
	chartData: ISensorData[]
	exportChartImage: () => void
	range: string
	refreshData: () => void
	loading: boolean
	setAutoRefreshEnabled: (enabled: boolean) => void
	autoRefreshEnabled: boolean
}

/**
 * Represents a single sensor data record collected from a logger device.
 *
 * @property timestamp - The ISO 8601 formatted date and time when the data was recorded.
 * @property temperature - The measured temperature value in degrees Celsius.
 * @property humidity - The measured relative humidity percentage.
 * @property atmPressure - (Optional) The measured atmospheric pressure in hPa.
 * @property altitude - (Optional) The calculated or measured altitude in meters.
 * @property equSensorId - The unique identifier of the sensor that collected the data.
 * @property equLoggerId - The unique identifier of the logger device.
 * @property event - (Optional) An event description or code associated with this data record.
 */
export interface ISensorData {
	timestamp: string
	temperature: number
	humidity: number
	atmPressure?: number
	altitude?: number
	equSensorId: number
	equLoggerId: number
	event?: string
}

/**
 * Represents a marker for an event on a chart or data visualization.
 *
 * @property name - The name or identifier of the event marker.
 * @property xAxis - The value on the x-axis where the event marker should be placed.
 * @property label - An object containing label formatting options.
 * @property label.formatter - A string specifying the formatter for the label.
 */
export interface IEventMarker {
	name: string
	xAxis: string
	label: { formatter: string }
}
