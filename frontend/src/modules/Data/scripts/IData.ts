import type { EquipmentClass } from '../../Equipment/scripts/EquipmentClass'
import type { DataLastValueViewClass } from './DataLastValueViewClass'

export interface IDataMainProps {
	equipment: EquipmentClass
	lastValues: DataLastValueViewClass[]
}

export interface IDataMainListProps {
	lastValue: DataLastValueViewClass
}

export interface IDataChartRangeButtonsProps {
	range: string
	handleRangeChange: (range: string) => void
	handleReset: () => void
}

export interface IDataChartExportButtonsProps {
	chartData: ISensorData[]
	exportChartImage: () => void
	range: string
	refreshData: () => void
	loading: boolean
	setAutoRefreshEnabled: (enabled: boolean) => void
	autoRefreshEnabled: boolean
}

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

export interface IEventMarker {
	name: string
	xAxis: string
	label: { formatter: string }
}
