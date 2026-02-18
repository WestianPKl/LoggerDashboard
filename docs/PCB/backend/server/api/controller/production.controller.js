import sequelize from '../../util/database.js'
import {
	internalServerError,
	serviceUnavailable,
	success,
	wrongValidation,
} from '../../util/responseHelper.js'
import { decodeSequelizeQuery } from '../../util/sequelizeTools.js'
import { validationResult } from 'express-validator'
import ProductionOrders from '../model/production/productionOrders.model.js'
import ProductionOrderItems from '../model/production/productionOrderItems.model.js'
import PCB from '../model/pcb/pcb.model.js'
import InventoryStock from '../model/inventory/inventoryStock.model.js'
import InventoryStockMovement from '../model/inventory/inventoryStockMovement.model.js'

export async function getProductionOrders(req, res) {
	try {
		const queryObject = decodeSequelizeQuery(req.body)

		const data = await ProductionOrders.findAll({
			where: queryObject,
			include: ['pcb'],
		})

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')

		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getProductionOrder(req, res) {
	try {
		const productionOrderId = req.params.productionOrderId

		const data = await ProductionOrders.findByPk(productionOrderId, {
			include: ['pcb'],
		})

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')

		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function addProductionOrder(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const data = await ProductionOrders.create(req.body, { transaction: t })

		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Retrieving data failed.')
		}

		await t.commit()
		return success(res, 'Data added successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function updateProductionOrder(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const productionOrderId = req.params.productionOrderId
		const pcbId = req.body.pcbId
		const quantity = req.body.quantity
		const status = req.body.status
		const productionOrder = await ProductionOrders.findByPk(
			productionOrderId,
			{ transaction: t, lock: t.LOCK.UPDATE }
		)

		if (!productionOrder) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		productionOrder.pcbId = pcbId ?? productionOrder.pcbId
		productionOrder.quantity = quantity ?? productionOrder.quantity
		productionOrder.status = status ?? productionOrder.status
		const data = await productionOrder.save({ transaction: t })

		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Retrieving data failed.')
		}

		await t.commit()
		return success(res, 'Data updated successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function deleteProductionOrder(req, res) {
	const t = await sequelize.transaction()
	try {
		if (!req.params.productionOrderId) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed - no ID.')
		}
		const productionOrder = await ProductionOrders.findByPk(
			req.params.productionOrderId
		)

		if (!productionOrder) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		let data = await ProductionOrders.destroy({
			where: { id: productionOrder.id },
			transaction: t,
		})

		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed.')
		}

		await t.commit()
		return success(res, 'Data deleted successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getProductionOrderItems(req, res) {
	try {
		const queryObject = decodeSequelizeQuery(req.body)

		const data = await ProductionOrderItems.findAll({
			where: queryObject,
			include: ['productionOrder', 'inventory'],
		})

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getProductionOrderItem(req, res) {
	try {
		const productionOrderItemId = req.params.productionOrderItemId

		const data = await ProductionOrderItems.findByPk(
			productionOrderItemId,
			{
				include: ['productionOrder', 'inventory'],
			}
		)

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function addProductionOrderItem(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const data = await ProductionOrderItems.create(req.body, {
			transaction: t,
		})

		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Retrieving data failed.')
		}

		await t.commit()
		return success(res, 'Data added successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function updateProductionOrderItem(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const productionOrderItemId = req.params.productionOrderItemId
		const productionOrderId = req.body.productionOrderId
		const inventoryId = req.body.inventoryId
		const qtyPerBoard = req.body.qtyPerBoard
		const requiredQtyTotal = req.body.requiredQtyTotal
		const consumedQty = req.body.consumedQty
		const allowSubstitute = req.body.allowSubstitute
		const designators = req.body.designators
		const status = req.body.status
		const productionOrderItem = await ProductionOrderItems.findByPk(
			productionOrderItemId,
			{ transaction: t, lock: t.LOCK.UPDATE }
		)

		if (!productionOrderItem) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		productionOrderItem.productionOrderId =
			productionOrderId ?? productionOrderItem.productionOrderId
		productionOrderItem.inventoryId =
			inventoryId ?? productionOrderItem.inventoryId
		productionOrderItem.qtyPerBoard =
			qtyPerBoard ?? productionOrderItem.qtyPerBoard
		productionOrderItem.requiredQtyTotal =
			requiredQtyTotal ?? productionOrderItem.requiredQtyTotal
		productionOrderItem.consumedQty =
			consumedQty ?? productionOrderItem.consumedQty
		productionOrderItem.allowSubstitute =
			allowSubstitute ?? productionOrderItem.allowSubstitute
		productionOrderItem.designators =
			designators ?? productionOrderItem.designators
		productionOrderItem.status = status ?? productionOrderItem.status
		const data = await productionOrderItem.save({ transaction: t })

		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Retrieving data failed.')
		}

		await t.commit()
		return success(res, 'Data updated successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function deleteProductionOrderItem(req, res) {
	const t = await sequelize.transaction()
	try {
		if (!req.params.productionOrderItemId) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed - no ID.')
		}
		const productionOrderItem = await ProductionOrderItems.findByPk(
			req.params.productionOrderItemId
		)

		if (!productionOrderItem) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		let data = await ProductionOrderItems.destroy({
			where: { id: productionOrderItem.id },
			transaction: t,
		})
		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed.')
		}
		await t.commit()
		return success(res, 'Data deleted successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function addProductionOrders(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const pcbId = Number(req.body.pcbId)
		const quantity = Number(req.body.quantity)

		if (!Number.isInteger(quantity) || quantity <= 0) {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'Quantity must be a positive integer.',
					param: 'quantity',
					location: 'body',
				},
			])
		}

		if (!Number.isInteger(pcbId) || pcbId <= 0) {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'pcbId must be a positive integer.',
					param: 'pcbId',
					location: 'body',
				},
			])
		}

		const pcb = await PCB.findByPk(pcbId, {
			transaction: t,
			lock: t.LOCK.UPDATE,
			include: ['bomItems'],
		})

		if (!pcb) {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'No such PCB.',
					param: 'pcbId',
					location: 'body',
				},
			])
		}

		if (!pcb.bomItems || pcb.bomItems.length === 0) {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'PCB has no BOM items.',
					param: 'pcbId',
					location: 'body',
				},
			])
		}

		const productionOrder = await ProductionOrders.create(
			{
				pcbId: pcbId,
				quantity: quantity,
				status: 'planned',
			},
			{ transaction: t }
		)

		if (!productionOrder) {
			await t.rollback()
			return serviceUnavailable(res, 'Creating production order failed.')
		}

		const productionOrderItemsData = pcb.bomItems.map((bomItem) => ({
			productionOrderId: productionOrder.id,
			inventoryId: bomItem.inventoryId,
			qtyPerBoard: bomItem.qtyPerBoard,
			requiredQtyTotal: bomItem.qtyPerBoard * quantity,
			consumedQty: 0,
			allowSubstitute: bomItem.allowSubstitute,
			designators: bomItem.designators,
			status: 'ok',
		}))

		const productionOrderItems = await ProductionOrderItems.bulkCreate(
			productionOrderItemsData,
			{ transaction: t, validate: true }
		)

		if (productionOrderItems.length !== productionOrderItemsData.length) {
			await t.rollback()
			return serviceUnavailable(
				res,
				'Creating production order items failed.'
			)
		}

		const createdOrder = await ProductionOrders.findByPk(
			productionOrder.id,
			{
				transaction: t,
				include: ['pcb', 'productionOrderItems'],
			}
		)

		await t.commit()
		return success(
			res,
			'Production order created successfully',
			createdOrder
		)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function produce(req, res) {
	const t = await sequelize.transaction()
	try {
		const productionOrderId = Number(req.params.productionOrderId)

		if (!Number.isInteger(productionOrderId) || productionOrderId <= 0) {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'productionOrderId must be a positive integer.',
					param: 'productionOrderId',
					location: 'params',
				},
			])
		}

		const productionOrder = await ProductionOrders.findByPk(
			productionOrderId,
			{
				transaction: t,
				lock: t.LOCK.UPDATE,
				include: [
					{
						association: 'productionOrderItems',
						include: [{ association: 'inventory' }],
					},
				],
			}
		)

		if (!productionOrder) {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'No such production order.',
					param: 'productionOrderId',
					location: 'params',
				},
			])
		}

		if (productionOrder.status === 'produced') {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'Production order is already produced.',
					param: 'productionOrderId',
					location: 'params',
				},
			])
		}

		if (productionOrder.status === 'cancelled') {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'Production order is cancelled.',
					param: 'productionOrderId',
					location: 'params',
				},
			])
		}

		const items = productionOrder.productionOrderItems ?? []
		if (items.length === 0) {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'Production order has no items.',
					param: 'productionOrderId',
					location: 'params',
				},
			])
		}

		const requiredByInventoryId = new Map()
		const itemByInventoryId = new Map()

		for (const it of items) {
			const invId = it.inventoryId
			const reqQty = Number(it.requiredQtyTotal) || 0
			requiredByInventoryId.set(
				invId,
				(requiredByInventoryId.get(invId) ?? 0) + reqQty
			)
			if (!itemByInventoryId.has(invId)) itemByInventoryId.set(invId, it)
		}

		const inventoryIds = Array.from(requiredByInventoryId.keys())

		const stocks = await InventoryStock.findAll({
			where: { inventoryId: inventoryIds },
			transaction: t,
			lock: t.LOCK.UPDATE,
		})
		const stockByInvId = new Map(stocks.map((s) => [s.inventoryId, s]))

		const missing = []
		const low = []

		for (const [invId, required] of requiredByInventoryId.entries()) {
			const stockRow = stockByInvId.get(invId)
			const available = stockRow ? stockRow.quantity : 0

			const it = itemByInventoryId.get(invId)
			const lowThreshold = it?.inventory?.lowThreshold ?? 0

			if (available < required) {
				missing.push({
					inventoryId: invId,
					required,
					available,
					shortage: required - available,
				})
			} else {
				const remaining = available - required
				if (lowThreshold > 0 && remaining < lowThreshold) {
					low.push({
						inventoryId: invId,
						required,
						available,
						remaining,
						lowThreshold,
					})
				}
			}
		}

		if (missing.length > 0) {
			await t.rollback()
			return success(res, 'Missing parts for production order.', {
				ok: false,
				missing,
				low,
			})
		}

		for (const [invId, required] of requiredByInventoryId.entries()) {
			const stockRow = stockByInvId.get(invId)
			if (!stockRow) {
				await t.rollback()
				return serviceUnavailable(
					res,
					`Stock row missing for inventoryId=${invId}`
				)
			}

			stockRow.quantity -= required
			await stockRow.save({ transaction: t })

			await InventoryStockMovement.create(
				{
					inventoryId: invId,
					delta: -required,
					reason: 'production',
					note: `PO#${productionOrderId}`,
				},
				{ transaction: t }
			)
		}

		for (const it of items) {
			it.consumedQty = it.requiredQtyTotal
			it.status = 'ok'
			await it.save({ transaction: t })
		}

		productionOrder.status = 'produced'
		const data = await productionOrder.save({ transaction: t })

		await t.commit()
		return success(res, 'Production order produced successfully', {
			ok: true,
			order: data,
			low,
		})
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function recheck(req, res) {
	const t = await sequelize.transaction()
	try {
		const productionOrderId = Number(req.params.productionOrderId)

		if (!Number.isInteger(productionOrderId) || productionOrderId <= 0) {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'productionOrderId must be a positive integer.',
					param: 'productionOrderId',
					location: 'params',
				},
			])
		}

		const productionOrder = await ProductionOrders.findByPk(
			productionOrderId,
			{
				transaction: t,
				lock: t.LOCK.UPDATE,
				include: [
					{
						association: 'productionOrderItems',
						include: [{ association: 'inventory' }],
					},
				],
			}
		)

		if (!productionOrder) {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'No such production order.',
					param: 'productionOrderId',
					location: 'params',
				},
			])
		}

		if (
			productionOrder.status === 'produced' ||
			productionOrder.status === 'cancelled'
		) {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: `Cannot recheck production order in status '${productionOrder.status}'.`,
					param: 'productionOrderId',
					location: 'params',
				},
			])
		}

		const items = productionOrder.productionOrderItems ?? []
		if (items.length === 0) {
			await t.rollback()
			return wrongValidation(res, 'Validation failed.', [
				{
					msg: 'Production order has no items.',
					param: 'productionOrderId',
					location: 'params',
				},
			])
		}

		const requiredByInventoryId = new Map()
		const itemByInventoryId = new Map()
		for (const it of items) {
			const invId = it.inventoryId
			const reqQty = Number(it.requiredQtyTotal) || 0
			requiredByInventoryId.set(
				invId,
				(requiredByInventoryId.get(invId) ?? 0) + reqQty
			)
			if (!itemByInventoryId.has(invId)) itemByInventoryId.set(invId, it)
		}

		const inventoryIds = Array.from(requiredByInventoryId.keys())

		const stocks = await InventoryStock.findAll({
			where: { inventoryId: inventoryIds },
			transaction: t,
			lock: t.LOCK.UPDATE,
		})
		const stockByInvId = new Map(stocks.map((s) => [s.inventoryId, s]))

		const missing = []
		const low = []
		const statusByInvId = new Map()

		for (const [invId, required] of requiredByInventoryId.entries()) {
			const stockRow = stockByInvId.get(invId)
			const available = stockRow ? stockRow.quantity : 0
			const it = itemByInventoryId.get(invId)
			const lowThreshold = it?.inventory?.lowThreshold ?? 0

			if (available < required) {
				statusByInvId.set(invId, 'missing')
				missing.push({
					inventoryId: invId,
					required,
					available,
					shortage: required - available,
				})
			} else {
				const remaining = available - required
				if (lowThreshold > 0 && remaining < lowThreshold) {
					statusByInvId.set(invId, 'low')
					low.push({
						inventoryId: invId,
						required,
						available,
						remaining,
						lowThreshold,
					})
				} else {
					statusByInvId.set(invId, 'ok')
				}
			}
		}

		for (const it of items) {
			const newStatus = statusByInvId.get(it.inventoryId) ?? 'ok'
			it.status = newStatus
			await it.save({ transaction: t })
		}

		productionOrder.status = missing.length > 0 ? 'planned' : 'ready'
		const data = await productionOrder.save({ transaction: t })

		await t.commit()
		return success(res, 'Production order rechecked successfully', {
			ok: missing.length === 0,
			order: data,
			missing,
			low,
		})
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}
