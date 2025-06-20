import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
	baseUrl: import.meta.env.VITE_API_IP,
	prepareHeaders: headers => {
		const token = localStorage.getItem('token')
		if (token) {
			headers.set('Authorization', `Bearer ${token}`)
		} else {
			headers.delete('Authorization')
		}
		return headers
	},
})

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 0 })

export const api = createApi({
	reducerPath: 'splitApi',
	baseQuery: baseQueryWithRetry as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
	tagTypes: [
		'User',
		'UserData',
		'Equipment',
		'EquipmentModel',
		'EquipmentVendor',
		'EquipmentType',
		'ProcessType',
		'ProcessDefinition',
		'AdminPermission',
		'AdminFunctionality',
		'AdminObject',
		'AdminAccessLevel',
		'AdminRole',
		'AdminRoleUser',
		'House',
		'HouseFloor',
		'HouseLogger',
		'DataDefinition',
		'DataLog',
		'DataLastValue',
	],
	endpoints: () => ({}),
})

export const enhancedApi = api.enhanceEndpoints({
	endpoints: () => ({
		getPost: () => 'test',
	}),
})
