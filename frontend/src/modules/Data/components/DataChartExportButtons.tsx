import { Button, CircularProgress, FormControlLabel, Stack, Switch, useMediaQuery, useTheme } from '@mui/material'
import type { IDataChartExportButtonsProps } from '../scripts/IData'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

/**
 * Renders a set of export and control buttons for a data chart, including:
 * - Export to PNG
 * - Export data to Excel
 * - Refresh data (with loading indicator)
 * - Toggle auto-refresh
 *
 * @component
 * @param exportChartImage - Callback to export the chart as an image (PNG).
 * @param chartData - Array of chart data objects to be exported.
 * @param refreshData - Callback to refresh the chart data.
 * @param loading - Boolean indicating if data is currently loading.
 * @param autoRefreshEnabled - Boolean indicating if auto-refresh is enabled.
 * @param range - The current data range (used in exported file names).
 * @param setAutoRefreshEnabled - Callback to toggle auto-refresh state.
 *
 * @remarks
 * - Uses Material UI components for layout and controls.
 * - Exports Excel files using the `xlsx` and `file-saver` libraries.
 * - Responsive layout adapts to mobile screens.
 */
export default function DataChartExportButtons({
	exportChartImage,
	chartData,
	refreshData,
	loading,
	autoRefreshEnabled,
	range,
	setAutoRefreshEnabled,
}: IDataChartExportButtonsProps) {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	/**
	 * Exports the current chart data to an Excel (.xlsx) file.
	 *
	 * The exported file includes columns for Datetime, Temperature, Humidity, Pressure, Altitude,
	 * LoggerId, SensorId, and Events. The data is formatted as a worksheet and saved using the
	 * specified date range in the filename.
	 *
	 * @remarks
	 * - Uses the XLSX library to generate the Excel file.
	 * - Uses the saveAs function to trigger the file download.
	 *
	 * @throws May throw errors if the XLSX or saveAs libraries are not available or if file generation fails.
	 */
	function exportToExcel(): void {
		const wsData = [
			[
				'Datetime',
				'Temperature (°C)',
				'Humidity (%)',
				'Pressure (hPA)',
				'Altitude (m)',
				'LoggerId',
				'SensorId',
				'Events',
			],
		]
		chartData.forEach((d: any) => {
			wsData.push([
				new Date(d.timestamp).toLocaleString(),
				d.temperature,
				d.humidity,
				d.atmPressure,
				d.altitude,
				d.equLoggerId,
				d.equSensorId,
				d.event || '',
			])
		})
		const worksheet = XLSX.utils.aoa_to_sheet(wsData)
		const workbook = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
		const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
		saveAs(blob, `data_${range}.xlsx`)
	}

	/**
	 * Toggles the auto-refresh feature for the data chart.
	 *
	 * This function inverts the current state of `autoRefreshEnabled`,
	 * updates the state accordingly, and persists the new value in
	 * localStorage under the key 'auto_refresh'.
	 */
	function handleAutoRefreshToggle(): void {
		const newValue = !autoRefreshEnabled
		setAutoRefreshEnabled(newValue)
		localStorage.setItem('auto_refresh', String(newValue))
	}

	return (
		<Stack
			direction={isMobile ? 'column' : 'row'}
			spacing={isMobile ? 0 : 2}
			flexWrap='wrap'
			alignItems='center'
			mb={2}>
			<Button
				sx={{ mb: isMobile ? 1 : 0 }}
				size={isMobile ? 'small' : 'medium'}
				variant='contained'
				onClick={exportChartImage}>
				Export to PNG
			</Button>
			<Button
				sx={{ mb: isMobile ? 1 : 0 }}
				size={isMobile ? 'small' : 'medium'}
				variant='contained'
				onClick={exportToExcel}>
				Export data to Excel
			</Button>
			<Button
				sx={{ mb: isMobile ? 1 : 0 }}
				size={isMobile ? 'small' : 'medium'}
				variant='contained'
				color='success'
				onClick={refreshData}
				disabled={loading}
				startIcon={loading ? <CircularProgress size={18} color='inherit' /> : null}>
				Refresh data
			</Button>
			<FormControlLabel
				control={
					<Switch
						size={isMobile ? 'small' : 'medium'}
						checked={autoRefreshEnabled}
						onChange={handleAutoRefreshToggle}
						color='primary'
					/>
				}
				label='Auto-refresh'
			/>
		</Stack>
	)
}
