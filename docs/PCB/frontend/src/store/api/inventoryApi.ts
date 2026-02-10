import { api } from './api'
import { InventoryClass } from '../../modules/Inventory/scripts/Inventory'
import { InventoryTypeClass } from '../../modules/Inventory/scripts/InventoryType'
import { InventorySurfaceMountClass } from '../../modules/Inventory/scripts/InventorySurfaceMount'
import { InventoryPackageClass } from '../../modules/Inventory/scripts/InventoryPackage'
import { InventoryShopClass } from '../../modules/Inventory/scripts/InventoryShop'
import type { IAddInventoryData, IAddInventoryAdditionalData } from '../../modules/Inventory/scripts/inventories'

export const inventoryApi = api.injectEndpoints({
	endpoints: build => ({
		getInventories: build.query<InventoryClass[], any>({
			query: (body: any) => ({
				url: 'api/inventory/inventories',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: InventoryClass[] }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['Inventory'],
		}),
		getInventory: build.query<InventoryClass, number>({
			query: (id: number) => ({
				url: `api/inventory/inventory/${id}`,
			}),
			transformResponse: (response: { data: InventoryClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['Inventory'],
		}),
		addInventory: build.mutation<InventoryClass, IAddInventoryData>({
			query: (body: IAddInventoryData) => ({
				url: 'api/inventory/inventory',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: InventoryClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['Inventory'],
		}),
		updateInventory: build.mutation<InventoryClass, IAddInventoryData>({
			query: (body: IAddInventoryData) => ({
				url: `api/inventory/inventory/${body.id}`,
				method: 'PATCH',
				body,
			}),
			transformResponse: (response: { data: InventoryClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['Inventory'],
		}),
		deleteInventory: build.mutation<InventoryClass, any>({
			query: (body: any) => ({
				url: `api/inventory/inventory/${body.id}`,
				method: 'DELETE',
				body,
			}),
			transformResponse: (response: { data: InventoryClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['Inventory'],
		}),

		getInventoryTypes: build.query<InventoryTypeClass[], any>({
			query: (body: any) => ({
				url: 'api/inventory/inventory-types',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: InventoryTypeClass[] }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['InventoryType'],
		}),
		getInventoryType: build.query<InventoryTypeClass, number>({
			query: (id: number) => ({
				url: `api/inventory/inventory-type/${id}`,
			}),
			transformResponse: (response: { data: InventoryTypeClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['InventoryType'],
		}),
		addInventoryType: build.mutation<InventoryTypeClass, IAddInventoryAdditionalData>({
			query: (body: IAddInventoryAdditionalData) => ({
				url: 'api/inventory/inventory-type',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: InventoryTypeClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventoryType'],
		}),
		updateInventoryType: build.mutation<InventoryTypeClass, IAddInventoryAdditionalData>({
			query: (body: IAddInventoryAdditionalData) => ({
				url: `api/inventory/inventory-type/${body.id}`,
				method: 'PATCH',
				body,
			}),
			transformResponse: (response: { data: InventoryTypeClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventoryType'],
		}),
		deleteInventoryType: build.mutation<InventoryTypeClass, any>({
			query: (body: any) => ({
				url: `api/inventory/inventory-type/${body.id}`,
				method: 'DELETE',
				body,
			}),
			transformResponse: (response: { data: InventoryTypeClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventoryType'],
		}),
		getInventorySurfaceMounts: build.query<InventorySurfaceMountClass[], any>({
			query: (body: any) => ({
				url: 'api/inventory/inventory-surface-mounts',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: InventorySurfaceMountClass[] }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['InventorySurfaceMount'],
		}),
		getInventorySurfaceMount: build.query<InventorySurfaceMountClass, number>({
			query: (id: number) => ({
				url: `api/inventory/inventory-surface-mount/${id}`,
			}),
			transformResponse: (response: { data: InventorySurfaceMountClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['InventorySurfaceMount'],
		}),
		addInventorySurfaceMount: build.mutation<InventorySurfaceMountClass, IAddInventoryAdditionalData>({
			query: (body: IAddInventoryAdditionalData) => ({
				url: 'api/inventory/inventory-surface-mount',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: InventorySurfaceMountClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventorySurfaceMount'],
		}),
		updateInventorySurfaceMount: build.mutation<InventorySurfaceMountClass, IAddInventoryAdditionalData>({
			query: (body: IAddInventoryAdditionalData) => ({
				url: `api/inventory/inventory-surface-mount/${body.id}`,
				method: 'PATCH',
				body,
			}),
			transformResponse: (response: { data: InventorySurfaceMountClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventorySurfaceMount'],
		}),
		deleteInventorySurfaceMount: build.mutation<InventorySurfaceMountClass, any>({
			query: (body: any) => ({
				url: `api/inventory/inventory-surface-mount/${body.id}`,
				method: 'DELETE',
				body,
			}),
			transformResponse: (response: { data: InventorySurfaceMountClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventorySurfaceMount'],
		}),

		getInventoryPackages: build.query<InventoryPackageClass[], any>({
			query: (body: any) => ({
				url: 'api/inventory/inventory-packages',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: InventoryPackageClass[] }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['InventoryPackage'],
		}),
		getInventoryPackage: build.query<InventoryPackageClass, number>({
			query: (id: number) => ({
				url: `api/inventory/inventory-package/${id}`,
			}),
			transformResponse: (response: { data: InventoryPackageClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['InventoryPackage'],
		}),
		addInventoryPackage: build.mutation<InventoryPackageClass, IAddInventoryAdditionalData>({
			query: (body: IAddInventoryAdditionalData) => ({
				url: 'api/inventory/inventory-package',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: InventoryPackageClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventoryPackage'],
		}),
		updateInventoryPackage: build.mutation<InventoryPackageClass, IAddInventoryAdditionalData>({
			query: (body: IAddInventoryAdditionalData) => ({
				url: `api/inventory/inventory-package/${body.id}`,
				method: 'PATCH',
				body,
			}),
			transformResponse: (response: { data: InventoryPackageClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventoryPackage'],
		}),
		deleteInventoryPackage: build.mutation<InventoryPackageClass, any>({
			query: (body: any) => ({
				url: `api/inventory/inventory-package/${body.id}`,
				method: 'DELETE',
				body,
			}),
			transformResponse: (response: { data: InventoryPackageClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventoryPackage'],
		}),
		getInventoryShops: build.query<InventoryShopClass[], any>({
			query: (body: any) => ({
				url: 'api/inventory/inventory-shops',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: InventoryShopClass[] }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['InventoryShop'],
		}),
		getInventoryShop: build.query<InventoryShopClass, number>({
			query: (id: number) => ({
				url: `api/inventory/inventory-shop/${id}`,
			}),
			transformResponse: (response: { data: InventoryShopClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['InventoryShop'],
		}),
		addInventoryShop: build.mutation<InventoryShopClass, IAddInventoryAdditionalData>({
			query: (body: IAddInventoryAdditionalData) => ({
				url: 'api/inventory/inventory-shop',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: InventoryShopClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventoryShop'],
		}),
		updateInventoryShop: build.mutation<InventoryShopClass, IAddInventoryAdditionalData>({
			query: (body: IAddInventoryAdditionalData) => ({
				url: `api/inventory/inventory-shop/${body.id}`,
				method: 'PATCH',
				body,
			}),
			transformResponse: (response: { data: InventoryShopClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventoryShop'],
		}),
		deleteInventoryShop: build.mutation<InventoryShopClass, any>({
			query: (body: any) => ({
				url: `api/inventory/inventory-shop/${body.id}`,
				method: 'DELETE',
				body,
			}),
			transformResponse: (response: { data: InventoryShopClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['InventoryShop'],
		}),
		getErrorProne: build.query<{ success: boolean }, void>({
			query: () => 'error-prone',
		}),
	}),
})

export const {
	useGetInventoriesQuery,
	useGetInventoryQuery,
	useAddInventoryMutation,
	useUpdateInventoryMutation,
	useDeleteInventoryMutation,
	useGetInventoryTypesQuery,
	useGetInventoryTypeQuery,
	useAddInventoryTypeMutation,
	useUpdateInventoryTypeMutation,
	useDeleteInventoryTypeMutation,
	useGetInventorySurfaceMountsQuery,
	useGetInventorySurfaceMountQuery,
	useAddInventorySurfaceMountMutation,
	useUpdateInventorySurfaceMountMutation,
	useDeleteInventorySurfaceMountMutation,
	useGetInventoryPackagesQuery,
	useGetInventoryPackageQuery,
	useAddInventoryPackageMutation,
	useUpdateInventoryPackageMutation,
	useDeleteInventoryPackageMutation,
	useGetInventoryShopsQuery,
	useGetInventoryShopQuery,
	useAddInventoryShopMutation,
	useUpdateInventoryShopMutation,
	useDeleteInventoryShopMutation,
	useGetErrorProneQuery,
} = inventoryApi
