import type { DataConnectedSensorViewClass } from '../../Data/scripts/DataConnectedSensorViewClass'
import type { DataLastValueViewClass } from '../../Data/scripts/DataLastValueViewClass'
import type { HouseFloorClass } from '../../House/scripts/HouseFloorClass'
import type { EquipmentClass } from '../../Equipment/scripts/EquipmentClass'
import type { HouseClass } from '../../House/scripts/HouseClass'
import type { IAddHouseData, IAddHouseFloorData, IAddHouseLoggerData } from '../../House/scripts/IHouse'

/**
 * Props for a component representing a specific floor in house details.
 *
 * @property floor - The floor information, represented by a `HouseFloorClass` instance.
 * @property houseId - (Optional) The unique identifier of the house to which the floor belongs.
 */
export interface IHouseDetailsFloorProps {
	floor: HouseFloorClass
	houseId?: number | undefined
}

/**
 * Represents a node in a house details structure.
 *
 * @property id - The unique identifier of the node, or undefined if not set.
 * @property position - The coordinates of the node, with `x` and `y` values that may be undefined.
 * @property data - The data associated with the node, containing a `label` that may be undefined.
 */
export interface IHouseNode {
	id: number | undefined
	position: { x: number | undefined; y: number | undefined }
	data: { label: string | undefined }
}
/**
 * Props for the HouseDetails floor tree component.
 *
 * @property floorId - The unique identifier of the floor, or undefined if not set.
 * @property floorViewport - The viewport settings for the floor, including x and y coordinates and zoom level.
 * @property editMode - Indicates whether the floor tree is in edit mode.
 * @property floor - The instance of the HouseFloorClass representing the floor.
 */
export interface IHouseDetailsFloorTreeProps {
	floorId: number | undefined
	floorViewport: { x: number; y: number; zoom: number }
	editMode: boolean
	floor: HouseFloorClass
}

/**
 * Props for the Logger Node Dialog component in the House Details module.
 *
 * @property loggerData - The logger data associated with the node.
 * @property lastValueData - Array of last value data for the logger.
 * @property connectedSensors - Array of sensors connected to the logger node.
 * @property detailsDialog - Flag indicating whether the details dialog is open.
 * @property onCloseDialog - Callback function to close the dialog.
 * @property handleClickDeleteNode - Callback function invoked when deleting a node.
 * @property editModeProps - Flag indicating if the dialog is in edit mode.
 */
export interface IHouseDetailsLoggerNodeDialogProps {
	loggerData: IHouseLoggerData
	lastValueData: DataLastValueViewClass[]
	connectedSensors: DataConnectedSensorViewClass[]
	detailsDialog: boolean
	onCloseDialog: () => void
	handleClickDeleteNode: (data: any) => void
	editModeProps: boolean
}

/**
 * Props for the New Logger Node Dialog component in House Details.
 *
 * @property loggerData - The logger data associated with the house.
 * @property detailsDialog - Controls the visibility of the dialog.
 * @property onCloseDialog - Callback invoked when the dialog is closed.
 * @property addItemHandler - Handler to add one or more logger data items.
 * @property handleClickDeleteNode - Handler invoked when a node is deleted.
 */
export interface IHouseDetailsNewLoggerNodeDialogProps {
	loggerData: IHouseLoggerData
	detailsDialog: boolean
	onCloseDialog: () => void
	addItemHandler: (item: IAddHouseLoggerData[] | IAddHouseLoggerData) => void
	handleClickDeleteNode: (data: any) => void
}

/**
 * Props for the House Details Logger Node List component.
 *
 * @property lastValue - The most recent value data, represented by an instance of DataLastValueViewClass.
 */
export interface IHouseDetailsLoggerNodeListProps {
	lastValue: DataLastValueViewClass
}

/**
 * Props for the mobile card component displaying house details.
 *
 * @property logger - The logger equipment associated with the house.
 * @property floorId - The ID of the floor where the house is located, or undefined if not specified.
 * @property houseLoggerId - The unique identifier for the house logger, or undefined if not specified.
 */
export interface IHouseDetailsMobileCardProps {
	logger: EquipmentClass
	floorId: number | undefined
	houseLoggerId: number | undefined
}

/**
 * Props for the House Edit View component.
 *
 * @property data - An instance of the HouseClass containing the details of the house to be edited.
 */
export interface IHouseEditViewProps {
	data: HouseClass
}

/**
 * Represents a logger node associated with a house, including equipment and floor details.
 *
 * @property {string} [id] - Optional unique identifier for the logger node.
 * @property {string} label - Display label for the logger node.
 * @property {number} houseLoggerId - Identifier for the house logger.
 * @property {number} equLoggerId - Identifier for the equipment logger.
 * @property {string} equModel - Model name or number of the equipment.
 * @property {string} equVendor - Vendor or manufacturer of the equipment.
 * @property {number} floorId - Identifier for the floor where the equipment is located.
 * @property {boolean} editMode - Indicates if the logger node is in edit mode.
 * @property {boolean} editModeProps - Indicates if the properties of the logger node are in edit mode.
 */
export interface IHouseLoggerNode {
	id?: string
	label: string
	houseLoggerId: number
	equLoggerId: number
	equModel: string
	equVendor: string
	floorId: number
	editMode: boolean
	editModeProps: boolean
}

/**
 * Represents the data structure for a house logger device.
 *
 * @property floorId - The unique identifier of the floor where the logger is located.
 * @property id - The unique identifier of the house logger data entry.
 * @property serialNumber - (Optional) The serial number of the logger device.
 * @property equVendor - (Optional) The vendor or manufacturer of the equipment.
 * @property equModel - (Optional) The model of the equipment.
 * @property houseLoggerId - (Optional) The unique identifier of the house logger.
 */
export interface IHouseLoggerData {
	floorId: number | undefined
	id: number | undefined
	serialNumber?: string
	equVendor?: string
	equModel?: string
	houseLoggerId?: number
}

/**
 * Props for the house edit form component.
 *
 * @property house - The current house instance to be edited.
 * @property editHouseHandler - Async handler function to edit house details. Accepts either a single or an array of `IAddHouseData` items.
 * @property addHouseFloorHandler - Async handler function to add a floor to the house. Accepts either a single or an array of `IAddHouseFloorData` items.
 */
export interface IHouseEditFormProps {
	house: HouseClass
	editHouseHandler: (item: IAddHouseData[] | IAddHouseData) => Promise<void>
	addHouseFloorHandler: (item: IAddHouseFloorData[] | IAddHouseFloorData) => Promise<void>
}
