import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
const PCBDetails = lazy(() => import('./components/PCBDetails'))
const PCBBomTable = lazy(() => import('./components/PCBBomTable'))
import { PCBClass } from './scripts/PCB'
import { Box } from '@mui/material'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { Await, useLoaderData, data, useRevalidator, type LoaderFunctionArgs, useParams } from 'react-router'
import { pcbApi, useUpdatePCBMutation } from '../../store/api/pcbApi'
import { socket } from '../../socket/socket'
import type { PCBBomItemsClass } from './scripts/PCBBomItems'
import type { IAddPCBData } from './scripts/PCBs'
import { useAppDispatch } from '../../store/hooks'
import type { GridSortModel } from '@mui/x-data-grid'
import type { GridFilterModel } from '@mui/x-data-grid'

export default function PCBDetailsView() {
	const dispatch = useAppDispatch()
	const { pcb, pcbBomItems } = useLoaderData() as {
		pcb: Promise<PCBClass>
		pcbBomItems: Promise<PCBBomItemsClass[]>
	}
	const { pcbId } = useParams<{ pcbId: string }>()

	const [sortModel, setSortModel] = useState<GridSortModel>([])
	const [filterModel, setFilterModel] = useState<GridFilterModel>({
		items: [],
	})

	const [updatePCB] = useUpdatePCBMutation()

	const revalidator = useRevalidator()

	useEffect(() => {
		function onAddPCBEvent(): void {
			revalidator.revalidate()
		}

		socket.on(`pcb-${pcbId}`, onAddPCBEvent)
		return () => {
			socket.off(`pcb-${pcbId}`, onAddPCBEvent)
		}
	}, [revalidator, pcbId])

	useEffect(() => {
		const savedSortModel = localStorage.getItem('pcbBomTableSortModel')
		const savedFilterModel = localStorage.getItem('pcbBomTableFilterModel')

		if (savedFilterModel) {
			try {
				const parsedFilterModel = JSON.parse(savedFilterModel)
				if (parsedFilterModel && typeof parsedFilterModel === 'object' && Array.isArray(parsedFilterModel.items)) {
					setFilterModel(parsedFilterModel)
				}
			} catch (err) {
				// pass
			}
		}

		if (savedSortModel) {
			try {
				const parsedSortModel = JSON.parse(savedSortModel)
				if (Array.isArray(parsedSortModel)) {
					setSortModel(parsedSortModel)
				}
			} catch (err) {
				// pass
			}
		}
	}, [])

	const editPCBHandler = useCallback(
		async (items: IAddPCBData | IAddPCBData[]): Promise<void> => {
			try {
				if (Array.isArray(items) && items.length >= 1) {
					await Promise.all(
						items.map(async item => {
							const formData = new FormData()

							formData.append('name', item.name || '')
							formData.append('revision', item.revision || '')
							formData.append('comment', item.comment || '')
							if (item.topUrl instanceof File) formData.append('topUrl', item.topUrl)
							if (item.bottomUrl instanceof File) formData.append('bottomUrl', item.bottomUrl)

							await updatePCB({ body: formData, id: item.id }).unwrap()
						}),
					)
					dispatch(showAlert({ message: 'PCB  edited', severity: 'success' }))
					revalidator.revalidate()
				}
			} catch (err: any) {
				const message = err?.data?.message || err?.message || 'Something went wrong'
				dispatch(showAlert({ message, severity: 'error' }))
			}
		},
		[updatePCB, dispatch, revalidator],
	)

	return (
		<Box sx={{ px: { xs: 1, md: 3 } }}>
			<Suspense fallback={<LoadingCircle />}>
				<Await resolve={pcb}>{pcbData => <PCBDetails pcb={pcbData} editPCBHandler={editPCBHandler} />}</Await>
				<Await resolve={pcbBomItems}>
					{pcbBomItemsData => (
						<PCBBomTable
							pcbId={parseInt(pcbId || '0')}
							pcbBomItems={pcbBomItemsData}
							initSort={sortModel}
							initFilter={filterModel}
						/>
					)}
				</Await>
			</Suspense>
		</Box>
	)
}

export async function loader({
	params,
}: LoaderFunctionArgs): Promise<Response | { pcb: PCBClass; pcbBomItems: PCBBomItemsClass[] }> {
	if (!params.pcbId) throw data('No PCB Id', { status: 400 })

	try {
		const pcbBomItems = await store
			.dispatch(pcbApi.endpoints.getPCBBomItems.initiate(parseInt(params.pcbId), { forceRefetch: true }))
			.unwrap()

		const pcb = await store
			.dispatch(pcbApi.endpoints.getPCB.initiate(parseInt(params.pcbId), { forceRefetch: true }))
			.unwrap()
		if (!pcbBomItems || !pcb) throw data('Data not Found', { status: 404 })

		return { pcb, pcbBomItems }
	} catch (err: any) {
		store.dispatch(
			showAlert({
				message: err?.data?.message || err?.message || 'Something went wrong!',
				severity: 'error',
			}),
		)
		throw err
	}
}
