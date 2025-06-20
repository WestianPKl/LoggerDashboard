import type { EquipmentClass } from './EquipmentClass'
import type { EquipmentModelClass } from './EquipmentModelClass'
import type { EquipmentTypeClass } from './EquipmentTypeClass'
import type { EquipmentVendorClass } from './EquipmentVendorClass'
import type { DataDefinitionClass } from '../../Data/scripts/DataDefinitionClass'

export interface IEquipmentTableProps {
	equipment: EquipmentClass[]
	adminPanel?: boolean
}
export interface IAddEquipmentProps {
	edit: boolean
	selectedItems?: EquipmentClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipment[] | IAddEquipment) => void
}

export interface IAddEquipmentVendorProps {
	edit: boolean
	selectedItems?: EquipmentVendorClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentVendor[] | IAddEquipmentVendor) => void
}

export interface IAddEquipmentModelProps {
	edit: boolean
	selectedItems?: EquipmentModelClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentModel[] | IAddEquipmentModel) => void
}

export interface IAddEquipmentTypeProps {
	edit: boolean
	selectedItems?: EquipmentTypeClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentType[] | IAddEquipmentType) => void
}

export interface IAddEquipment {
	id?: number
	serialNumber: string | undefined
	equVendorId: number | undefined
	equModelId: number | undefined
	equTypeId: number | undefined
	dataDefinitions: DataDefinitionClass[] | undefined
}

export interface IAddEquipmentVendor {
	id?: number
	name: string | undefined
}

export interface IAddEquipmentModel {
	id?: number
	name: string | undefined
}

export interface IAddEquipmentType {
	id?: number
	name: string | undefined
}

export interface IEquipmentVendorTableProps {
	equipmentVendor: EquipmentVendorClass[]
}

export interface IAddEquipmentVendorProps {
	edit: boolean
	selectedItems?: EquipmentVendorClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentData[] | IAddEquipmentData) => void
}

export interface IAddEquipmentData {
	id?: number
	name: string | undefined
}

export interface IEquipmentModelTableProps {
	equipmentModel: EquipmentModelClass[]
}

export interface IAddEquipmentModelProps {
	edit: boolean
	selectedItems?: EquipmentModelClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentData[] | IAddEquipmentData) => void
}

export interface IEquipmentTypeTableProps {
	equipmentType: EquipmentTypeClass[]
}

export interface IAddEquipmentTypeProps {
	edit: boolean
	selectedItems?: EquipmentTypeClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddEquipmentData[] | IAddEquipmentData) => void
}
