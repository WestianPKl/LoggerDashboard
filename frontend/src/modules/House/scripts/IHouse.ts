import type { HouseClass } from './HouseClass'
import type { HouseFloorClass } from './HouseFloorClass'
import type { HouseLoggerClass } from './HouseLoggerClass'

/**
 * Props for a table component displaying a list of houses.
 *
 * @property houses - An array of `HouseClass` instances to be displayed in the table.
 */
export interface IHouseTableProps {
	houses: HouseClass[]
}
/**
 * Props for the Add House dialog component.
 *
 * @property edit - Indicates whether the dialog is in edit mode.
 * @property selectedItems - Optional array of selected house items for editing.
 * @property handleCloseAdd - Callback to close the Add House dialog.
 * @property openAddDialog - Controls the visibility of the Add House dialog.
 * @property addItemHandler - Handler function to add one or more house items.
 */
export interface IAddHouseProps {
	edit: boolean
	selectedItems?: HouseClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddHouseData[] | IAddHouseData) => void
}

/**
 * Props for the Add House Floor component.
 *
 * @property edit - Indicates if the component is in edit mode.
 * @property isDashboard - (Optional) Specifies if the component is used within the dashboard context.
 * @property dashboardData - (Optional) Data for the dashboard, represented by a `HouseClass` instance.
 * @property selectedItems - (Optional) Array of selected house floor items.
 * @property handleCloseAdd - Callback function to handle closing the add dialog.
 * @property openAddDialog - Controls whether the add dialog is open.
 * @property addItemHandler - Handler function to add one or more house floor items.
 */
export interface IAddHouseFoorProps {
	edit: boolean
	isDashboard?: boolean
	dashboardData?: HouseClass
	selectedItems?: HouseFloorClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddHouseFloorData[] | IAddHouseFloorData) => void
}

/**
 * Props for the Add House Logger component.
 *
 * @property edit - Indicates whether the component is in edit mode.
 * @property selectedItems - Optional array of selected house logger items.
 * @property handleCloseAdd - Callback to close the add dialog.
 * @property openAddDialog - Controls the visibility of the add dialog.
 * @property addItemHandler - Handler function to add one or more house logger items.
 */
export interface IAddHouseLoggerProps {
	edit: boolean
	selectedItems?: HouseLoggerClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddHouseLoggerData[] | IAddHouseLoggerData) => void
}

/**
 * Represents the data required to add a new house.
 *
 * @property {number} [id] - The unique identifier of the house (optional).
 * @property {string | undefined} name - The name of the house.
 * @property {string | undefined} postalCode - The postal code of the house's location.
 * @property {string | undefined} city - The city where the house is located.
 * @property {string | undefined} street - The street address of the house.
 * @property {string | undefined} houseNumber - The house number.
 * @property {string | Blob | undefined} pictureLink - A link or Blob representing the house's picture.
 */
export interface IAddHouseData {
	id?: number
	name: string | undefined
	postalCode: string | undefined
	city: string | undefined
	street: string | undefined
	houseNumber: string | undefined
	pictureLink: string | Blob | undefined
}

/**
 * Represents the data required to add a floor to a house.
 *
 * @property {number} [id] - The unique identifier of the floor (optional, typically assigned by the backend).
 * @property {string | undefined} name - The name of the floor.
 * @property {string | File | undefined} layout - The layout of the floor, which can be a string (e.g., URL or base64) or a File object.
 * @property {number | undefined} houseId - The identifier of the house to which this floor belongs.
 */
export interface IAddHouseFloorData {
	id?: number
	name: string | undefined
	layout: string | File | undefined
	houseId: number | undefined
}

/**
 * Represents the data required to add a logger to a house.
 *
 * @property {number} [id] - Optional unique identifier for the logger entry.
 * @property {number | undefined} equLoggerId - The equipment logger's unique identifier.
 * @property {number | undefined} houseFloorId - The unique identifier of the house floor where the logger is placed.
 * @property {number | undefined} [posX] - Optional X coordinate position of the logger on the floor plan.
 * @property {number | undefined} [posY] - Optional Y coordinate position of the logger on the floor plan.
 */
export interface IAddHouseLoggerData {
	id?: number
	equLoggerId: number | undefined
	houseFloorId: number | undefined
	posX?: number | undefined
	posY?: number | undefined
}

/**
 * Represents the data required to add a sensor to a house.
 *
 * @property {number} [id] - Optional unique identifier for the house sensor data.
 * @property {number | undefined} equSensorId - The equipment sensor ID associated with the house. Can be undefined.
 */
export interface IAddHouseSensorData {
	id?: number
	equSensorId: number | undefined
}

/**
 * Represents the data required to add a house sensor function.
 *
 * @property {number} [id] - Optional unique identifier for the sensor function.
 * @property {string | undefined} name - The name of the sensor function.
 */
export interface IAddHouseSensorFunctionData {
	id?: number
	name: string | undefined
}

/**
 * Props for the HouseTable component.
 *
 * @property houses - An array of HouseClass instances to be displayed in the table.
 */
export interface IHouseTableProps {
	houses: HouseClass[]
}

/**
 * Props for the HouseFloorTable component.
 *
 * @property houseFloors - An array of HouseFloorClass instances representing the floors of a house.
 */
export interface IHouseFloorTableProps {
	houseFloors: HouseFloorClass[]
}

/**
 * Props for the HouseLoggerTable component.
 *
 * @property houseLoggers - An array of HouseLoggerClass instances to be displayed in the table.
 */
export interface IHouseLoggerTableProps {
	houseLoggers: HouseLoggerClass[]
}
