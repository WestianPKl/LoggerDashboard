import { api } from './api'
import { ProductionOrdersClass } from '../../modules/Production/scripts/ProductionOrders'
import { ProductionOrderItemsClass } from '../../modules/Production/scripts/ProductionOrderItems'
import type {
	IAddProductionOrderData,
	IAddProductionOrderItemsData,
	ProduceResult,
	RecheckResult,
} from '../../modules/Production/scripts/Production'

export const productionApi = api.injectEndpoints({
	endpoints: build => ({
		getProductionOrders: build.query<ProductionOrdersClass[], any>({
			query: (body: any) => ({
				url: 'api/production/production-orders',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: ProductionOrdersClass[] }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['ProductionOrders'],
		}),
		getProductionOrder: build.query<ProductionOrdersClass, number>({
			query: (id: number) => ({
				url: `api/production/production-order/${id}`,
			}),
			transformResponse: (response: { data: ProductionOrdersClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['ProductionOrders'],
		}),
		addProductionOrder: build.mutation<ProductionOrdersClass, IAddProductionOrderData>({
			query: (body: IAddProductionOrderData) => ({
				url: 'api/production/production-order',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: ProductionOrdersClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['ProductionOrders'],
		}),
		updateProductionOrder: build.mutation<ProductionOrdersClass, IAddProductionOrderData>({
			query: (body: IAddProductionOrderData) => ({
				url: `api/production/production-order/${body.id}`,
				method: 'PATCH',
				body,
			}),
			transformResponse: (response: { data: ProductionOrdersClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['ProductionOrders'],
		}),
		deleteProductionOrder: build.mutation<ProductionOrdersClass, any>({
			query: (body: any) => ({
				url: `api/production/production-order/${body.id}`,
				method: 'DELETE',
				body,
			}),
			transformResponse: (response: { data: ProductionOrdersClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['ProductionOrders'],
		}),

		getProductionOrderItems: build.query<ProductionOrderItemsClass[], any>({
			query: (body: any) => ({
				url: 'api/production/production-order-items',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: ProductionOrderItemsClass[] }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['ProductionOrderItems'],
		}),
		getProductionOrderItem: build.query<ProductionOrderItemsClass, number>({
			query: (id: number) => ({
				url: `api/production/production-order-item/${id}`,
			}),
			transformResponse: (response: { data: ProductionOrderItemsClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['ProductionOrderItems'],
		}),
		addProductionOrderItem: build.mutation<ProductionOrderItemsClass, IAddProductionOrderItemsData>({
			query: (body: IAddProductionOrderItemsData) => ({
				url: 'api/production/production-order-item',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: ProductionOrderItemsClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['ProductionOrderItems'],
		}),
		updateProductionOrderItem: build.mutation<ProductionOrderItemsClass, IAddProductionOrderItemsData>({
			query: (body: IAddProductionOrderItemsData) => ({
				url: `api/production/production-order-item/${body.id}`,
				method: 'PATCH',
				body,
			}),
			transformResponse: (response: { data: ProductionOrderItemsClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['ProductionOrderItems'],
		}),
		deleteProductionOrderItem: build.mutation<ProductionOrderItemsClass, any>({
			query: (body: any) => ({
				url: `api/production/production-order-item/${body.id}`,
				method: 'DELETE',
				body,
			}),
			transformResponse: (response: { data: ProductionOrderItemsClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['ProductionOrderItems'],
		}),
		addProductionOrders: build.mutation<ProductionOrdersClass, IAddProductionOrderData>({
			query: (body: IAddProductionOrderData) => ({
				url: 'api/production/production-orders/order',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: ProductionOrdersClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['ProductionOrders'],
		}),
		produce: build.mutation<ProduceResult, any>({
			query: (body: any) => ({
				url: `api/production/production-orders/${body.productionOrderId}/produce`,
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: ProduceResult }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['ProductionOrders'],
		}),
		recheck: build.mutation<RecheckResult, any>({
			query: (body: any) => ({
				url: `api/production/production-orders/${body.productionOrderId}/recheck`,
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: RecheckResult }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['ProductionOrders'],
		}),
		getErrorProne: build.query<{ success: boolean }, void>({
			query: () => 'error-prone',
		}),
	}),
})

export const {
	useGetProductionOrdersQuery,
	useGetProductionOrderQuery,
	useAddProductionOrderMutation,
	useUpdateProductionOrderMutation,
	useDeleteProductionOrderMutation,
	useGetProductionOrderItemsQuery,
	useGetProductionOrderItemQuery,
	useAddProductionOrderItemMutation,
	useUpdateProductionOrderItemMutation,
	useDeleteProductionOrderItemMutation,
	useGetErrorProneQuery,
	useAddProductionOrdersMutation,
	useProduceMutation,
	useRecheckMutation,
} = productionApi
