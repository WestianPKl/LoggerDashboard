import express from 'express'
import {
	getPCBs,
	getPCB,
	addPCB,
	updatePCB,
	deletePCB,
	getPCBBomItems,
	getPCBBomItem,
	addPCBBomItem,
	updatePCBBomItem,
	deletePCBBomItem,
} from '../controller/pcb.controller.js'
import { imageUpload } from '../../middleware/file.js'

const router = express.Router()

router.post('/pcbs', getPCBs)
router.get('/pcb/:pcbId', getPCB)
router.post(
	'/pcb',
	imageUpload.fields([
		{ name: 'topUrl', maxCount: 1 },
		{ name: 'bottomUrl', maxCount: 1 },
	]),
	addPCB
)
router.patch(
	'/pcb/:pcbId',
	imageUpload.fields([
		{ name: 'topUrl', maxCount: 1 },
		{ name: 'bottomUrl', maxCount: 1 },
	]),
	updatePCB
)
router.delete('/pcb/:pcbId', deletePCB)

router.post('/pcb-bom-items', getPCBBomItems)
router.get('/pcb-bom-item/:pcbBomItemId', getPCBBomItem)
router.post('/pcb-bom-item', addPCBBomItem)
router.patch('/pcb-bom-item/:pcbBomItemId', updatePCBBomItem)
router.delete('/pcb-bom-item/:pcbBomItemId', deletePCBBomItem)

export default router
