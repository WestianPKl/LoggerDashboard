import express from 'express'
import {
	getProductionOrders,
	getProductionOrder,
	addProductionOrder,
	updateProductionOrder,
	deleteProductionOrder,
	getProductionOrderItems,
	getProductionOrderItem,
	addProductionOrderItem,
	updateProductionOrderItem,
	deleteProductionOrderItem,
	addProductionOrders,
	produce,
	recheck,
} from '../controller/production.controller.js'

const router = express.Router()

router.post('/production-orders', getProductionOrders)
router.get('/production-order/:productionOrderId', getProductionOrder)
router.post('/production-order', addProductionOrder)
router.patch('/production-order/:productionOrderId', updateProductionOrder)
router.delete('/production-order/:productionOrderId', deleteProductionOrder)

router.post('/production-order-items', getProductionOrderItems)
router.get(
	'/production-order-item/:productionOrderItemId',
	getProductionOrderItem
)
router.post('/production-order-item', addProductionOrderItem)
router.patch(
	'/production-order-item/:productionOrderItemId',
	updateProductionOrderItem
)
router.delete(
	'/production-order-item/:productionOrderItemId',
	deleteProductionOrderItem
)

router.post('/production-orders/order', addProductionOrders)
router.post('/production-orders/:productionOrderId/produce', produce)
router.post('/production-orders/:productionOrderId/recheck', recheck)

export default router
