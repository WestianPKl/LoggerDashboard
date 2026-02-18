import { createBrowserRouter } from 'react-router'
import RootView from '../modules/Application/RootView'
import MainMenuView from '../modules/Application/MainMenuView'
import InventoryMainView from '../modules/Inventory/InventoryMainView'
import InventoryView, { loader as InventoryViewLoader } from '../modules/Inventory/InventoryView'
import InventoryTypeView, { loader as InventoryTypeViewLoader } from '../modules/Inventory/InventoryTypeView'
import InventorySurfaceMountView, {
	loader as InventorySurfaceMountViewLoader,
} from '../modules/Inventory/InventorySurfaceMountView'
import InventoryPackageView, { loader as InventoryPackageViewLoader } from '../modules/Inventory/InventoryPackageView'
import InventoryShopView, { loader as InventoryShopViewLoader } from '../modules/Inventory/InventoryShopView'
import PCBView, { loader as PCBViewLoader } from '../modules/PCB/PCBView'
import PCBDetailsView, { loader as PCBDetailsViewLoader } from '../modules/PCB/PCBDetailsView'
import ProductionView, { loader as ProductionViewLoader } from '../modules/Production/ProductionView'
import ProductionDetailsView, {
	loader as ProductionDetailsViewLoader,
} from '../modules/Production/ProductionDetailsView'
import NotFoundView from '../modules/Application/NotFoundView'
import ErrorView from '../modules/Application/ErrorView'
import LoadingCircle from '../components/UI/LoadingCircle'

export const router = createBrowserRouter([
	{
		id: 'root',
		path: '/',
		Component: RootView,
		ErrorBoundary: ErrorView,
		HydrateFallback: LoadingCircle,
		children: [
			{
				index: true,
				Component: MainMenuView,
			},
			{
				path: '/inventory',
				Component: InventoryMainView,
				id: 'inventory',
				children: [
					{ index: true, Component: InventoryView, loader: InventoryViewLoader },
					{ path: 'inventory', Component: InventoryView, loader: InventoryViewLoader },
					{ path: 'inventory-type', Component: InventoryTypeView, loader: InventoryTypeViewLoader },
					{
						path: 'inventory-surface-mount',
						Component: InventorySurfaceMountView,
						loader: InventorySurfaceMountViewLoader,
					},
					{ path: 'inventory-packages', Component: InventoryPackageView, loader: InventoryPackageViewLoader },
					{ path: 'inventory-shop', Component: InventoryShopView, loader: InventoryShopViewLoader },
				],
			},
			{
				path: '/pcb',
				Component: PCBView,
				loader: PCBViewLoader,
				id: 'pcb',
			},
			{
				path: '/pcb/:pcbId',
				Component: PCBDetailsView,
				loader: PCBDetailsViewLoader,
				id: 'pcb-details',
			},
			{
				path: '/production',
				Component: ProductionView,
				loader: ProductionViewLoader,
				id: 'production',
			},
			{
				path: '/production/:productionOrderId',
				Component: ProductionDetailsView,
				loader: ProductionDetailsViewLoader,
				id: 'production-details',
			},
			{
				path: '*',
				Component: NotFoundView,
				id: 'not-found',
			},
		],
	},
])
