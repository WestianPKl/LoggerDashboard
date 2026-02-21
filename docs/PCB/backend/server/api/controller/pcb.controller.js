import sequelize from '../../util/database.js'
import {
	internalServerError,
	serviceUnavailable,
	success,
	wrongValidation,
} from '../../util/responseHelper.js'
import { decodeSequelizeQuery } from '../../util/sequelizeTools.js'
import { validationResult } from 'express-validator'
import PCB from '../model/pcb/pcb.model.js'
import PCBBomItems from '../model/pcb/pcbBomItems.model.js'
import { getIo } from '../../middleware/socket.js'
import path from 'path'
import { deleteFile } from '../../middleware/file.js'
import Inventory from '../model/inventory/inventory.model.js'

export async function getPCBs(req, res) {
	try {
		const queryObject = decodeSequelizeQuery(req.body)

		const data = await PCB.findAll({
			where: queryObject,
			include: ['bomItems', 'productionOrders'],
		})

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')

		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getPCB(req, res) {
	try {
		const pcbId = req.params.pcbId

		const data = await PCB.findByPk(pcbId, {
			include: ['bomItems', 'productionOrders'],
		})

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')

		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function addPCB(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		let topUrl, bottomUrl

		if (req.files) {
			if (req.files.topUrl) {
				topUrl = path.join('uploads', req.files.topUrl[0].filename)
			}
			if (req.files.bottomUrl) {
				bottomUrl = path.join(
					'uploads',
					req.files.bottomUrl[0].filename
				)
			}
		}

		const data = await PCB.create(
			{ ...req.body, topUrl, bottomUrl },
			{ transaction: t }
		)

		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Retrieving data failed.')
		}

		await t.commit()

		let io
		try {
			io = getIo()
		} catch {
			io = null
		}
		if (io) {
			io.sockets.emit('pcb', 'add')
		}

		return success(res, 'Data added successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function updatePCB(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const pcbId = req.params.pcbId
		const name = req.body.name
		const revision = req.body.revision
		const comment = req.body.comment
		const verified = req.body.verified
		const pcb = await PCB.findByPk(pcbId, {
			transaction: t,
			lock: t.LOCK.UPDATE,
		})

		if (!pcb) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		pcb.name = name ?? pcb.name
		pcb.revision = revision ?? pcb.revision
		pcb.comment = comment ?? null
		pcb.verified = verified ?? pcb.verified

		if (req.files?.topUrl) {
			if (pcb.topUrl) deleteFile(pcb.topUrl)
			pcb.topUrl = path.join('uploads', req.files.topUrl[0].filename)
		}

		if (req.files?.bottomUrl) {
			if (pcb.bottomUrl) deleteFile(pcb.bottomUrl)
			pcb.bottomUrl = path.join(
				'uploads',
				req.files.bottomUrl[0].filename
			)
		}

		const data = await pcb.save({ transaction: t })

		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Retrieving data failed.')
		}

		await t.commit()

		let io
		try {
			io = getIo()
		} catch {
			io = null
		}
		if (io) {
			io.sockets.emit('pcb', 'update')
		}

		return success(res, 'Data updated successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function deletePCB(req, res) {
	const t = await sequelize.transaction()
	try {
		if (!req.params.pcbId) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed - no ID.')
		}
		const pcb = await PCB.findByPk(req.params.pcbId)

		if (!pcb) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		if (pcb.topUrl) {
			try {
				deleteFile(pcb.topUrl)
			} catch (err) {
				console.log(err)
			}
		}

		if (pcb.bottomUrl) {
			try {
				deleteFile(pcb.bottomUrl)
			} catch (err) {
				console.log(err)
			}
		}

		let data = await PCB.destroy({
			where: { id: pcb.id },
			transaction: t,
		})

		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed.')
		}

		await t.commit()

		let io
		try {
			io = getIo()
		} catch {
			io = null
		}
		if (io) {
			io.sockets.emit('pcb', 'delete')
		}

		return success(res, 'Data deleted successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getPCBBomItems(req, res) {
	try {
		const queryObject = decodeSequelizeQuery(req.body)

		const data = await PCBBomItems.findAll({
			where: queryObject,
			include: [
				'pcb',
				{
					model: Inventory,
					as: 'inventory',
					include: ['surfaceMount', 'package', 'shop', 'type'],
				},
			],
		})

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getPCBBomItem(req, res) {
	try {
		const pcbBomItemId = req.params.pcbBomItemId

		const data = await PCBBomItems.findByPk(pcbBomItemId, {
			include: ['pcb', 'inventory'],
		})

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function addPCBBomItem(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const data = await PCBBomItems.create(req.body, { transaction: t })

		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Retrieving data failed.')
		}

		let io
		try {
			io = getIo()
		} catch {
			io = null
		}
		if (io) {
			io.sockets.emit(`pcb-${data.pcbId}`, 'add')
		}

		await t.commit()
		return success(res, 'Data added successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function updatePCBBomItem(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const pcbBomItemId = req.params.pcbBomItemId
		const pcbId = req.body.pcbId
		const inventoryId = req.body.inventoryId
		const qtyPerBoard = req.body.qtyPerBoard
		const designators = req.body.designators
		const valueSpec = req.body.valueSpec
		const allowSubstitute = req.body.allowSubstitute
		const comment = req.body.comment
		const pcbBomItem = await PCBBomItems.findByPk(pcbBomItemId, {
			transaction: t,
			lock: t.LOCK.UPDATE,
		})

		if (!pcbBomItem) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		pcbBomItem.pcbId = pcbId ?? pcbBomItem.pcbId
		pcbBomItem.inventoryId = inventoryId ?? pcbBomItem.inventoryId
		pcbBomItem.qtyPerBoard = qtyPerBoard ?? pcbBomItem.qtyPerBoard
		pcbBomItem.designators = designators ?? pcbBomItem.designators
		pcbBomItem.valueSpec = valueSpec ?? pcbBomItem.valueSpec
		pcbBomItem.allowSubstitute = allowSubstitute
		pcbBomItem.comment = comment ?? null
		const data = await pcbBomItem.save({ transaction: t })

		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Retrieving data failed.')
		}

		await t.commit()

		let io
		try {
			io = getIo()
		} catch {
			io = null
		}
		if (io) {
			io.sockets.emit(`pcb-${data.pcbId}`, 'update')
		}

		return success(res, 'Data updated successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function deletePCBBomItem(req, res) {
	const t = await sequelize.transaction()
	try {
		if (!req.params.pcbBomItemId) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed - no ID.')
		}
		const pcbBomItem = await PCBBomItems.findByPk(req.params.pcbBomItemId)

		if (!pcbBomItem) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		let data = await PCBBomItems.destroy({
			where: { id: pcbBomItem.id },
			transaction: t,
		})
		if (!data) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed.')
		}
		await t.commit()

		let io
		try {
			io = getIo()
		} catch {
			io = null
		}
		if (io) {
			io.sockets.emit(`pcb-${data.pcbId}`, 'delete')
		}

		return success(res, 'Data deleted successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}
