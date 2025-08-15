/**
 * @file api.ts
 *
 * This file sets up the base API configuration for the application using Redux Toolkit Query.
 * It defines the base query with authentication header handling, configures retry logic, and exports the main API instance.
 *
 * @param {string} baseUrl - The base URL for all API requests, taken from environment variables.
 * @param {function} prepareHeaders - Prepares headers for each request, including the Authorization header if a token is present in localStorage.
 * @param {object} tagTypes - List of tag types used for cache management and invalidation in RTK Query endpoints.
 * @param {object} endpoints - Placeholder for endpoints, to be injected in feature-specific API files.
 *
 * Exports:
 * - api: The main API instance for endpoint injection.
 * - enhancedApi: An enhanced version of the API with a sample endpoint.
 */
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
