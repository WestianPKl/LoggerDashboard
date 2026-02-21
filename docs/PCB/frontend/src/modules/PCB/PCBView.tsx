import { Suspense, lazy, useEffect, useState } from 'react'
const PCBTable = lazy(() => import('./components/PCBTable'))
import { PCBClass } from './scripts/PCB'
import { Box, Container, Typography } from '@mui/material'
import { store } from '../../store/store'
import { showAlert } from '../../store/application-store'
import LoadingCircle from '../../components/UI/LoadingCircle'
import { Await, useLoaderData, data, useRevalidator } from 'react-router'
import type { GridSortModel } from '@mui/x-data-grid'
import type { GridFilterModel } from '@mui/x-data-grid'
import { pcbApi } from '../../store/api/pcbApi'
import { socket } from '../../socket/socket'
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoardOutlined'

export default function PCBView() {
	const { pcbs } = useLoaderData() as {
		pcbs: Promise<PCBClass[]>
	}
	const [sortModel, setSortModel] = useState<GridSortModel>([])
	const [filterModel, setFilterModel] = useState<GridFilterModel>({
		items: [],
	})

	const revalidator = useRevalidator()

	useEffect(() => {
		function onAddPCBEvent(): void {
			revalidator.revalidate()
		}

		socket.on('pcb', onAddPCBEvent)
		return () => {
			socket.off('pcb', onAddPCBEvent)
		}
	}, [revalidator])

	useEffect(() => {
		const savedSortModel = localStorage.getItem('pcbTableSortModel')
		const savedFilterModel = localStorage.getItem('pcbTableFilterModel')

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

	return (
		<Box sx={{ px: { xs: 1, md: 3 } }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
				<Box
					sx={{
						width: 44,
						height: 44,
						borderRadius: 2,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#dcfce7',
						color: '#16a34a',
					}}>
					<DeveloperBoardIcon />
				</Box>
				<Box>
					<Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
						PCB
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						Zarządzaj płytkami drukowanymi i listami BOM
					</Typography>
				</Box>
			</Box>

			<Container maxWidth='xl' disableGutters>
				<Suspense fallback={<LoadingCircle />}>
					<Await resolve={pcbs}>
						{pcbsData => <PCBTable pcb={pcbsData} initSort={sortModel} initFilter={filterModel} />}
					</Await>
				</Suspense>
			</Container>
		</Box>
	)
}

export async function loader(): Promise<Response | { pcbs: PCBClass[] }> {
	try {
		const promise = await store.dispatch(pcbApi.endpoints.getPCBs.initiate({})).unwrap()
		if (!promise) {
			throw data('Data not Found', { status: 404 })
		}
		return { pcbs: promise }
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
