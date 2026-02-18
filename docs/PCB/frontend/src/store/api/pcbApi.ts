import { api } from './api'
import { PCBClass } from '../../modules/PCB/scripts/PCB'
import { PCBBomItemsClass } from '../../modules/PCB/scripts/PCBBomItems'
import type { IAddPCBBomItemsData } from '../../modules/PCB/scripts/PCBs'

export const pcbApi = api.injectEndpoints({
	endpoints: build => ({
		getPCBs: build.query<PCBClass[], any>({
			query: (body: any) => ({
				url: 'api/pcb/pcbs',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: PCBClass[] }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['PCB'],
		}),
		getPCB: build.query<PCBClass, number>({
			query: (id: number) => ({
				url: `api/pcb/pcb/${id}`,
			}),
			transformResponse: (response: { data: PCBClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['PCB'],
		}),
		addPCB: build.mutation<PCBClass, FormData>({
			query: (body: FormData) => ({
				url: 'api/pcb/pcb',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: PCBClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['PCB'],
		}),
		updatePCB: build.mutation<PCBClass, { body: FormData; id: number | undefined }>({
			query: ({ body, id }) => ({
				url: `api/pcb/pcb/${id}`,
				method: 'PATCH',
				body,
			}),
			transformResponse: (response: { data: PCBClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['PCB'],
		}),
		deletePCB: build.mutation<PCBClass, any>({
			query: (body: any) => ({
				url: `api/pcb/pcb/${body.id}`,
				method: 'DELETE',
				body,
			}),
			transformResponse: (response: { data: PCBClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['PCB'],
		}),

		getPCBBomItems: build.query<PCBBomItemsClass[], any>({
			query: (body: any) => ({
				url: 'api/pcb/pcb-bom-items',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: PCBBomItemsClass[] }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['PCBBomItems'],
		}),
		getPCBBomItem: build.query<PCBBomItemsClass, number>({
			query: (id: number) => ({
				url: `api/pcb/pcb-bom-item/${id}`,
			}),
			transformResponse: (response: { data: PCBBomItemsClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['PCBBomItems'],
		}),
		addPCBBomItem: build.mutation<PCBBomItemsClass, IAddPCBBomItemsData>({
			query: (body: IAddPCBBomItemsData) => ({
				url: 'api/pcb/pcb-bom-item',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: PCBBomItemsClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['PCBBomItems'],
		}),
		updatePCBBomItem: build.mutation<PCBBomItemsClass, IAddPCBBomItemsData>({
			query: (body: IAddPCBBomItemsData) => ({
				url: `api/pcb/pcb-bom-item/${body.id}`,
				method: 'PATCH',
				body,
			}),
			transformResponse: (response: { data: PCBBomItemsClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['PCBBomItems'],
		}),
		deletePCBBomItem: build.mutation<PCBBomItemsClass, any>({
			query: (body: any) => ({
				url: `api/pcb/pcb-bom-item/${body.id}`,
				method: 'DELETE',
				body,
			}),
			transformResponse: (response: { data: PCBBomItemsClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['PCBBomItems'],
		}),
		getErrorProne: build.query<{ success: boolean }, void>({
			query: () => 'error-prone',
		}),
	}),
})

export const {
	useGetPCBsQuery,
	useGetPCBQuery,
	useAddPCBMutation,
	useUpdatePCBMutation,
	useDeletePCBMutation,
	useGetPCBBomItemsQuery,
	useGetPCBBomItemQuery,
	useAddPCBBomItemMutation,
	useUpdatePCBBomItemMutation,
	useDeletePCBBomItemMutation,
	useGetErrorProneQuery,
} = pcbApi
