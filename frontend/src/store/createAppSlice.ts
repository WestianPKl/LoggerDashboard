import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit'

/**
 * Creates a customized slice creator for the application using the provided configuration.
 *
 * This function utilizes `buildCreateSlice` to generate a slice creator with custom async thunk creators.
 * The resulting `createAppSlice` can be used to define Redux slices with enhanced async logic.
 *
 * @see buildCreateSlice
 * @see asyncThunkCreator
 *
 * @example
 * const mySlice = createAppSlice({
 *   name: 'example',
 *   initialState: {},
 *   reducers: {},
 *   extraReducers: (builder) => { ... }
 * });
 */
export const createAppSlice = buildCreateSlice({
	creators: { asyncThunk: asyncThunkCreator },
})
