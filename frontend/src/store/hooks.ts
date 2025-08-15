import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

/**
 * Custom hook that returns the application's typed `dispatch` function.
 *
 * This hook is a strongly-typed version of Redux's `useDispatch`, ensuring that
 * dispatched actions conform to the `AppDispatch` type defined in your store.
 *
 * @returns {AppDispatch} The Redux store's dispatch function, typed for the application.
 *
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(someAction());
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/**
 * A typed version of the `useSelector` hook, preconfigured with the application's `RootState`.
 *
 * Use this hook to access values from the Redux store with full TypeScript type safety.
 *
 * @example
 * ```tsx
 * const value = useAppSelector(state => state.someSlice.value);
 * ```
 */
export const useAppSelector = useSelector.withTypes<RootState>()
