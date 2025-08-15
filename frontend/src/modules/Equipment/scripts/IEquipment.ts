import type { EquipmentClass } from './EquipmentClass'
import type { EquipmentModelClass } from './EquipmentModelClass'
import type { EquipmentTypeClass } from './EquipmentTypeClass'
import type { EquipmentVendorClass } from './EquipmentVendorClass'
import type { DataDefinitionClass } from '../../Data/scripts/DataDefinitionClass'

/**
 * Props for the Equipment Table component.
 *
 * @property equipment - An array of `EquipmentClass` instances to be displayed in the table.
 * @property adminPanel - Optional flag indicating if the table is rendered within the admin panel context.
 */
export interface IEquipmentTableProps {
	equipment: EquipmentClass[]
	adminPanel?: boolean
}
/**
 * Props for the Add Equipment dialog/component.
 *
 * @property edit - Indicates if the dialog is in edit mode.
 * @property selectedItems - Optional array of selected equipment items.
 * @property handleCloseAdd - Callback to close the Add dialog.
 * @property openAddDialog - Controls the visibility of the Add dialog.
 * @property addItemHandler - Handler function to add one or more equipment items.
 */
export interface IAddEquipmentProps {
	edit: boolean
	selectedItems?: EquipmentClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipment[] | IAddEquipment) => void
}

/**
 * Props for the Add Equipment Vendor dialog component.
 *
 * @property edit - Indicates if the dialog is in edit mode.
 * @property selectedItems - Optional array of selected equipment vendor items.
 * @property handleCloseAdd - Callback to close the add dialog.
 * @property openAddDialog - Controls whether the add dialog is open.
 * @property addItemHandler - Handler function to add one or more equipment vendor items.
 */
export interface IAddEquipmentVendorProps {
	edit: boolean
	selectedItems?: EquipmentVendorClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentVendor[] | IAddEquipmentVendor) => void
}

/**
 * Props for the Add Equipment Model dialog component.
 *
 * @property edit - Indicates whether the dialog is in edit mode.
 * @property selectedItems - Optional array of selected equipment model instances.
 * @property handleCloseAdd - Callback function to close the add dialog.
 * @property openAddDialog - Controls whether the add dialog is open.
 * @property addItemHandler - Handler function to add one or more equipment models.
 */
export interface IAddEquipmentModelProps {
	edit: boolean
	selectedItems?: EquipmentModelClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentModel[] | IAddEquipmentModel) => void
}

/**
 * Props for the Add Equipment Type dialog component.
 *
 * @property edit - Indicates if the dialog is in edit mode.
 * @property selectedItems - Optional array of selected equipment type instances.
 * @property handleCloseAdd - Callback to close the add dialog.
 * @property openAddDialog - Controls the visibility of the add dialog.
 * @property addItemHandler - Handler function to add one or more equipment types.
 */
export interface IAddEquipmentTypeProps {
	edit: boolean
	selectedItems?: EquipmentTypeClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentType[] | IAddEquipmentType) => void
}

/**
 * Represents the data required to add a new equipment item.
 *
 * @property {number} [id] - Optional unique identifier for the equipment.
 * @property {string | undefined} serialNumber - The serial number of the equipment.
 * @property {number | undefined} equVendorId - The ID of the equipment vendor.
 * @property {number | undefined} equModelId - The ID of the equipment model.
 * @property {number | undefined} equTypeId - The ID of the equipment type.
 * @property {DataDefinitionClass[] | undefined} dataDefinitions - An array of data definitions associated with the equipment.
 */
export interface IAddEquipment {
	id?: number
	serialNumber: string | undefined
	equVendorId: number | undefined
	equModelId: number | undefined
	equTypeId: number | undefined
	dataDefinitions: DataDefinitionClass[] | undefined
}

/**
 * Represents a vendor that can be associated with equipment.
 *
 * @property {number} [id] - The unique identifier of the vendor (optional).
 * @property {string | undefined} name - The name of the vendor.
 */
export interface IAddEquipmentVendor {
	id?: number
	name: string | undefined
}

/**
 * Represents the model used to add a new equipment item.
 *
 * @property {number} [id] - The unique identifier of the equipment. Optional, typically assigned by the backend.
 * @property {string | undefined} name - The name of the equipment. Required for creation.
 */
export interface IAddEquipmentModel {
	id?: number
	name: string | undefined
}

/**
 * Represents the data required to add a new equipment type.
 *
 * @property id - (Optional) The unique identifier of the equipment type.
 * @property name - The name of the equipment type, or undefined if not specified.
 */
export interface IAddEquipmentType {
	id?: number
	name: string | undefined
}

/**
 * Props for the Equipment Vendor Table component.
 *
 * @property equipmentVendor - An array of EquipmentVendorClass instances representing the equipment vendors to be displayed in the table.
 */
export interface IEquipmentVendorTableProps {
	equipmentVendor: EquipmentVendorClass[]
}

/**
 * Props for the Add Equipment Vendor component.
 *
 * @property edit - Indicates whether the component is in edit mode.
 * @property selectedItems - Optional array of selected equipment vendor items.
 * @property handleCloseAdd - Callback function to handle closing the add dialog.
 * @property openAddDialog - Boolean flag to control the visibility of the add dialog.
 * @property addItemHandler - Function to handle adding new equipment data, accepts either a single item or an array of items.
 */
export interface IAddEquipmentVendorProps {
	edit: boolean
	selectedItems?: EquipmentVendorClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentData[] | IAddEquipmentData) => void
}

/**
 * Represents the data required to add a new equipment item.
 *
 * @property {number} [id] - The unique identifier for the equipment. Optional.
 * @property {string | undefined} name - The name of the equipment. Can be undefined.
 */
export interface IAddEquipmentData {
	id?: number
	name: string | undefined
}

/**
 * Props for a component that displays a table of equipment models.
 *
 * @property equipmentModel - An array of `EquipmentModelClass` instances representing the equipment models to be displayed in the table.
 */
export interface IEquipmentModelTableProps {
	equipmentModel: EquipmentModelClass[]
}

/**
 * Props for the Add Equipment Model component.
 *
 * @property edit - Indicates whether the component is in edit mode.
 * @property selectedItems - Optional array of selected equipment model instances.
 * @property handleCloseAdd - Callback function to close the add dialog.
 * @property openAddDialog - Controls the visibility of the add dialog.
 * @property addItemHandler - Handler function to add one or more equipment items.
 */
export interface IAddEquipmentModelProps {
	edit: boolean
	selectedItems?: EquipmentModelClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentData[] | IAddEquipmentData) => void
}

/**
 * Props for a component that displays a table of equipment types.
 *
 * @property equipmentType - An array of `EquipmentTypeClass` instances representing the equipment types to display.
 */
export interface IEquipmentTypeTableProps {
	equipmentType: EquipmentTypeClass[]
}

/**
 * Props for the Add Equipment Type component.
 *
 * @property edit - Indicates if the component is in edit mode.
 * @property selectedItems - Optional array of selected equipment type instances.
 * @property handleCloseAdd - Callback to close the add dialog.
 * @property openAddDialog - Controls the visibility of the add dialog.
 * @property addItemHandler - Handler function to add one or more equipment items.
 */
export interface IAddEquipmentTypeProps {
	edit: boolean
	selectedItems?: EquipmentTypeClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentData[] | IAddEquipmentData) => void
}
