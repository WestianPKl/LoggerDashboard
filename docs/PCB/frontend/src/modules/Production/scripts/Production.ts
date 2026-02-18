import type { GridSortModel } from '@mui/x-data-grid'
import { ProductionOrdersClass } from './ProductionOrders'
import { ProductionOrderItemsClass } from './ProductionOrderItems'
import type { GridFilterModel } from '@mui/x-data-grid'

export interface IAddProductionOrderData {
	id?: number | undefined
	pcbId?: number | undefined
	quantity?: number | undefined
	status?: 'planned' | 'ready' | 'reserved' | 'in_assembly' | 'produced' | 'cancelled' | undefined
}

export interface IStatus {
	status?: 'planned' | 'ready' | 'reserved' | 'in_assembly' | 'produced' | 'cancelled' | undefined
}

export interface IAddProductionOrderItemsData {
	id?: number | undefined
	productionOrderId?: number | undefined
	inventoryId?: number | undefined
	qtyPerBoard?: number | undefined
	requiredQtyTotal?: number | undefined
	consumedQty?: number | undefined
	allowSubstitutes?: boolean | undefined
	designators?: string | undefined
	status?: 'ok' | 'low' | 'missing' | undefined
}

export interface IProductionOrderTableProps {
	productionOrders: ProductionOrdersClass[]
	initSort: GridSortModel
	initFilter: GridFilterModel
}

export interface IProductionOrderItemsTableProps {
	productionOrderItems: ProductionOrderItemsClass[]
	initSort: GridSortModel
	initFilter: GridFilterModel
}

export interface IAddProductionOrderProps {
	edit: boolean
	selectedItems?: ProductionOrdersClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddProductionOrderData[] | IAddProductionOrderData) => void
}

export interface IAddProductionOrderItemsProps {
	edit: boolean
	productionOrderId?: number
	selectedItems?: ProductionOrderItemsClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddProductionOrderItemsData[] | IAddProductionOrderItemsData) => void
}

export interface AvailabilityRow {
	inventoryId: number | undefined
	required: number | undefined
	available: number | undefined
	shortage?: number | undefined
	remaining?: number | undefined
	lowThreshold?: number | undefined
}

export interface ProduceResult {
	ok: boolean
	order: ProductionOrdersClass
	low?: AvailabilityRow[]
	missing?: AvailabilityRow[]
}

export interface RecheckResult {
	ok: boolean
	order: ProductionOrdersClass
	low: AvailabilityRow[]
	missing: AvailabilityRow[]
}
