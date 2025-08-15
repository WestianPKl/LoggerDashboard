/**
 * @file userApi.ts
 *
 * This file defines API endpoints for user authentication and user management using Redux Toolkit Query.
 * It provides endpoints for login, registration, fetching users, updating user data, and password reset operations.
 *
 * @param {UserLoginClass} UserLoginClass - The class representing the user login response.
 * @param {ILoginData} ILoginData - The interface for login credentials.
 * @param {IRegisterData} IRegisterData - The interface for registration data.
 * @param {UserClass} UserClass - The class representing a user entity.
 *
 * Endpoints:
 * - login: Authenticates a user and returns login data.
 * - register: Registers a new user.
 * - getUsers: Retrieves a list of users.
 * - getUser: Fetches a single user by ID.
 * - updateUser: Updates user data for a given user ID.
 * - passwordResetToken: Requests a password reset token for a user.
 * - passwordReset: Resets a user's password using a token.
 * - getErrorProne: Example endpoint for error handling demonstration.
 *
 * Exports:
 * - React hooks for each endpoint for use in components.
 */
import { api } from './api'
import type { UserLoginClass } from '../../modules/User/scripts/UserLoginClass'
import type { ILoginData, IRegisterData } from '../../modules/User/scripts/UserInterface'
import type { UserClass } from '../../modules/User/scripts/UserClass'

export const userApi = api.injectEndpoints({
	endpoints: build => ({
		login: build.mutation<UserLoginClass, ILoginData>({
			query: (credentials: ILoginData) => ({
				url: 'api/user/user-login',
				method: 'POST',
				body: credentials,
			}),
			transformResponse: (response: { data: UserLoginClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['User'],
		}),
		register: build.mutation<UserClass, IRegisterData>({
			query: (credentials: IRegisterData) => ({
				url: 'api/user/user-register',
				method: 'POST',
				body: credentials,
			}),
			transformResponse: (response: { data: UserClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['User'],
		}),
		getUsers: build.query<UserClass[], any>({
			query: (body: any) => ({
				url: `api/user/users`,
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: UserClass[] }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['UserData'],
		}),
		getUser: build.query<UserClass, number>({
			query: (id: number) => ({
				url: `api/user/user/${id}`,
				method: 'GET',
			}),
			transformResponse: (response: { data: UserClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			providesTags: ['UserData'],
		}),

		updateUser: build.mutation<UserClass, { body: any; id: number }>({
			query: ({ body, id }: { body: any; id: number }) => ({
				url: `api/user/user/${id}`,
				method: 'PATCH',
				body,
			}),
			transformResponse: (response: { data: UserClass }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['UserData'],
		}),

		passwordResetToken: build.mutation<{ email: string }, any>({
			query: (body: any) => ({
				url: 'api/user/reset-password-request',
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: { email: string } }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['User'],
		}),

		passwordReset: build.mutation<{ email: string }, any>({
			query: (body: any) => ({
				url: `api/user/reset-password/${body.token}`,
				method: 'POST',
				body,
			}),
			transformResponse: (response: { data: { email: string } }) => response.data,
			transformErrorResponse: (response: { status: number; data: { message: string } }) => {
				return { status: response.status, message: response.data.message }
			},
			invalidatesTags: ['User'],
		}),
		getErrorProne: build.query<{ success: boolean }, void>({
			query: () => 'error-prone',
		}),
	}),
})

export const {
	useLoginMutation,
	useRegisterMutation,
	useGetErrorProneQuery,
	useGetUsersQuery,
	useGetUserQuery,
	useUpdateUserMutation,
	usePasswordResetTokenMutation,
	usePasswordResetMutation,
} = userApi

export const {
	endpoints: { login, register, getUser },
} = userApi
