import type { GridSortModel } from '@mui/x-data-grid'
import { PCBClass } from './PCB'
import { PCBBomItemsClass } from './PCBBomItems'
import type { GridFilterModel } from '@mui/x-data-grid'

export interface IAddPCBData {
	id?: number | undefined
	name?: string | undefined
	revision?: string | undefined
	comment?: string | undefined
	topUrl?: string | Blob | undefined
	bottomUrl?: string | Blob | undefined
}

export interface IAddPCBBomItemsData {
	id?: number | undefined
	pcbId?: number | undefined
	inventoryId?: number | undefined
	qtyPerBoard?: number | undefined
	designators?: string | undefined
	valueSpec?: string | undefined
	allowSubstitutes?: boolean | undefined
	comment?: string | undefined
}

export interface IPCBTableProps {
	pcb: PCBClass[]
	initSort: GridSortModel
	initFilter: GridFilterModel
}

export interface IPCBBomTableProps {
	pcbId?: number | undefined
	pcbBomItems: PCBBomItemsClass[]
	initSort: GridSortModel
	initFilter: GridFilterModel
}

export interface IAddPCBProps {
	edit: boolean
	selectedItems?: PCBClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddPCBData[] | IAddPCBData) => void
}

export interface IAddPCBBomItemsProps {
	edit: boolean
	pcbId?: number | undefined
	selectedItems?: PCBBomItemsClass[]
	handleCloseAdd: () => void
	openAddDialog: boolean
	addItemHandler: (item: IAddPCBBomItemsData[] | IAddPCBBomItemsData) => void
}
