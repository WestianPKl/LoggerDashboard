import type { GridFilterModel, GridSortModel } from '@mui/x-data-grid'
import type { InventoryClass } from './Inventory'
import type { InventoryPackageClass } from './InventoryPackage'
import type { InventoryShopClass } from './InventoryShop'
import type { InventorySurfaceMountClass } from './InventorySurfaceMount'
import type { InventoryTypeClass } from './InventoryType'

export interface IAddInventoryData {
	id?: number | undefined
	name?: string | undefined
	manufacturerNumber?: string | undefined
	parameters?: string | undefined
	lowThreshold?: number | undefined
	stock?: number | undefined
	reason?: 'initial' | 'purchase' | 'production' | 'correction' | 'adjustment' | undefined
	comment?: string | undefined
	inventoryTypeId?: number | undefined
	inventoryPackageId?: number | undefined
	inventorySurfaceMountId?: number | undefined
	inventoryShopId?: number | undefined
}

export interface IAddInventoryAdditionalData {
	id?: number | undefined
	name?: string | undefined
}

export interface IUpdateInventoryAdditionalData {
	id: number
	name?: string | undefined
}

export interface IInventoryTableProps {
	inventory: InventoryClass[]
	initSort: GridSortModel
	initFilter: GridFilterModel
}

export interface IInventoryTypeTableProps {
	inventoryType: InventoryTypeClass[]
	initSort: GridSortModel
	initFilter: GridFilterModel
}

export interface IInventorySurfaceMountTableProps {
	inventorySurfaceMount: InventorySurfaceMountClass[]
	initSort: GridSortModel
	initFilter: GridFilterModel
}

export interface IInventoryPackageTableProps {
	inventoryPackage: InventoryPackageClass[]
	initSort: GridSortModel
	initFilter: GridFilterModel
}

export interface IInventoryShopTableProps {
	inventoryShop: InventoryShopClass[]
	initSort: GridSortModel
	initFilter: GridFilterModel
}

export interface IInventoryTableProps {
	inventory: InventoryClass[]
	initSort: GridSortModel
	initFilter: GridFilterModel
}

export interface IAddInventoryTypeProps {
	edit: boolean
	selectedItems?: InventoryTypeClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddInventoryAdditionalData[] | IAddInventoryAdditionalData) => void
}

export interface IAddInventorySurfaceMountProps {
	edit: boolean
	selectedItems?: InventorySurfaceMountClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddInventoryAdditionalData[] | IAddInventoryAdditionalData) => void
}

export interface IAddInventoryPackageProps {
	edit: boolean
	selectedItems?: InventoryPackageClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddInventoryAdditionalData[] | IAddInventoryAdditionalData) => void
}

export interface IAddInventoryShopProps {
	edit: boolean
	selectedItems?: InventoryShopClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddInventoryAdditionalData[] | IAddInventoryAdditionalData) => void
}

export interface IAddInventoryProps {
	edit: boolean
	selectedItems?: InventoryClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddInventoryData[] | IAddInventoryData, preventDialogClose?: boolean) => void
}
