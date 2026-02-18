import sequelize from '../../util/database.js'
import {
	internalServerError,
	serviceUnavailable,
	success,
	wrongValidation,
} from '../../util/responseHelper.js'
import { decodeSequelizeQuery } from '../../util/sequelizeTools.js'
import { validationResult } from 'express-validator'
import Inventory from '../model/inventory/inventory.model.js'
import InventoryPackage from '../model/inventory/inventoryPackage.model.js'
import InventoryShop from '../model/inventory/inventoryShop.model.js'
import InventorySurfaceMount from '../model/inventory/inventorySurfaceMount.model.js'
import InventoryType from '../model/inventory/inventoryType.model.js'
import InventoryStock from '../model/inventory/inventoryStock.model.js'
import InventoryStockMovement from '../model/inventory/inventoryStockMovement.model.js'
import { getIo } from '../../middleware/socket.js'

export async function getInventoryTypes(req, res) {
	try {
		const queryObject = decodeSequelizeQuery(req.body)

		const data = await InventoryType.findAll({ where: queryObject })

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')

		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getInventoryType(req, res) {
	try {
		const inventoryTypeId = req.params.inventoryTypeId

		const data = await InventoryType.findByPk(inventoryTypeId)

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')

		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function addInventoryType(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const data = await InventoryType.create(req.body, { transaction: t })

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
			io.sockets.emit('inventory', 'add')
		}

		return success(res, 'Data added successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function updateInventoryType(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const inventoryTypeId = req.params.inventoryTypeId
		const name = req.body.name
		const inventoryType = await InventoryType.findByPk(inventoryTypeId)

		if (!inventoryType) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		inventoryType.name = name
		const data = await inventoryType.save({ transaction: t })

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
			io.sockets.emit('inventory', 'update')
		}

		return success(res, 'Data updated successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function deleteInventoryType(req, res) {
	const t = await sequelize.transaction()
	try {
		if (!req.params.inventoryTypeId) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed - no ID.')
		}
		const inventoryType = await InventoryType.findByPk(
			req.params.inventoryTypeId
		)

		if (!inventoryType) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		let data = await InventoryType.destroy({
			where: { id: inventoryType.id },
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
			io.sockets.emit('inventory', 'delete')
		}

		return success(res, 'Data deleted successfully', data)
	} catch (err) {
		console.log(err)
		if (t) await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getInventoryPackages(req, res) {
	try {
		const queryObject = decodeSequelizeQuery(req.body)

		const data = await InventoryPackage.findAll({ where: queryObject })

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getInventoryPackage(req, res) {
	try {
		const inventoryPackageId = req.params.inventoryPackageId

		const data = await InventoryPackage.findByPk(inventoryPackageId)

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function addInventoryPackage(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const data = await InventoryPackage.create(req.body, { transaction: t })

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

export async function updateInventoryPackage(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const inventoryPackageId = req.params.inventoryPackageId
		const name = req.body.name
		const inventoryPackage =
			await InventoryPackage.findByPk(inventoryPackageId)

		if (!inventoryPackage) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		inventoryPackage.name = name
		const data = await inventoryPackage.save({ transaction: t })

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

export async function deleteInventoryPackage(req, res) {
	const t = await sequelize.transaction()
	try {
		if (!req.params.inventoryPackageId) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed - no ID.')
		}
		const inventoryPackage = await InventoryPackage.findByPk(
			req.params.inventoryPackageId
		)

		if (!inventoryPackage) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		let data = await InventoryPackage.destroy({
			where: { id: inventoryPackage.id },
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

export async function getInventorySurfaceMounts(req, res) {
	try {
		const queryObject = decodeSequelizeQuery(req.body)

		const data = await InventorySurfaceMount.findAll({ where: queryObject })

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getInventorySurfaceMount(req, res) {
	try {
		const inventorySurfaceMountId = req.params.inventorySurfaceMountId

		const data = await InventorySurfaceMount.findByPk(
			inventorySurfaceMountId
		)

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function addInventorySurfaceMount(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const data = await InventorySurfaceMount.create(req.body, {
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

export async function updateInventorySurfaceMount(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const inventorySurfaceMountId = req.params.inventorySurfaceMountId
		const name = req.body.name
		const inventorySurfaceMount = await InventorySurfaceMount.findByPk(
			inventorySurfaceMountId
		)

		if (!inventorySurfaceMount) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		inventorySurfaceMount.name = name
		const data = await inventorySurfaceMount.save({ transaction: t })

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

export async function deleteInventorySurfaceMount(req, res) {
	const t = await sequelize.transaction()
	try {
		if (!req.params.inventorySurfaceMountId) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed - no ID.')
		}

		const inventorySurfaceMount = await InventorySurfaceMount.findByPk(
			req.params.inventorySurfaceMountId
		)

		if (!inventorySurfaceMount) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		let data = await InventorySurfaceMount.destroy({
			where: { id: inventorySurfaceMount.id },
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

export async function getInventoryShops(req, res) {
	try {
		const queryObject = decodeSequelizeQuery(req.body)

		const data = await InventoryShop.findAll({ where: queryObject })

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getInventoryShop(req, res) {
	try {
		const inventoryShopId = req.params.inventoryShopId

		const data = await InventoryShop.findByPk(inventoryShopId)

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function addInventoryShop(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const data = await InventoryShop.create(req.body, {
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

export async function updateInventoryShop(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const inventoryShopId = req.params.inventoryShopId
		const name = req.body.name
		const inventoryShop = await InventoryShop.findByPk(inventoryShopId)

		if (!inventoryShop) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		inventoryShop.name = name
		const data = await inventoryShop.save({ transaction: t })

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

export async function deleteInventoryShop(req, res) {
	const t = await sequelize.transaction()
	try {
		if (!req.params.inventoryShopId) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed - no ID.')
		}
		const inventoryShop = await InventoryShop.findByPk(
			req.params.inventoryShopId
		)

		if (!inventoryShop) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		let data = await InventoryShop.destroy({
			where: { id: inventoryShop.id },
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

export async function getInventories(req, res) {
	try {
		const queryObject = decodeSequelizeQuery(req.body)

		const data = await Inventory.findAll({
			where: queryObject,
			include: [
				'type',
				'package',
				'surfaceMount',
				'shop',
				'stock',
				'stockMovements',
			],
		})

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function getInventory(req, res) {
	try {
		const inventoryId = req.params.inventoryId

		const data = await Inventory.findByPk(inventoryId, {
			include: [
				'type',
				'package',
				'surfaceMount',
				'shop',
				'stock',
				'stockMovements',
			],
		})

		if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
		return success(res, 'Data retrieved successfully', data)
	} catch (err) {
		console.log(err)
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function addInventory(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const data = await Inventory.create(req.body, {
			transaction: t,
		})

		const newStock = await InventoryStock.create(
			{
				inventoryId: data.id,
				quantity: req.body.stock ?? 0,
			},
			{ transaction: t }
		)

		const stockMovement = await InventoryStockMovement.create(
			{
				inventoryId: data.id,
				delta: req.body.stock ?? 0,
				reason: 'initial',
				note: req.body.note,
			},
			{ transaction: t }
		)

		if (!data || !newStock || !stockMovement) {
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

export async function updateInventory(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const inventoryId = req.params.inventoryId
		const inventory = await Inventory.findByPk(inventoryId, {
			transaction: t,
			lock: t.LOCK.UPDATE,
		})

		if (!inventory) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		inventory.name = req.body.name ?? inventory.name
		inventory.manufacturerNumber =
			req.body.manufacturerNumber ?? inventory.manufacturerNumber
		inventory.parameters = req.body.parameters ?? inventory.parameters
		inventory.lowThreshold = req.body.lowThreshold ?? inventory.lowThreshold
		inventory.comment = req.body.comment ?? inventory.comment
		inventory.inventoryTypeId =
			req.body.inventoryTypeId ?? inventory.inventoryTypeId
		inventory.inventorySurfaceMountId =
			req.body.inventorySurfaceMountId ??
			inventory.inventorySurfaceMountId
		inventory.inventoryPackageId =
			req.body.inventoryPackageId ?? inventory.inventoryPackageId
		inventory.inventoryShopId =
			req.body.inventoryShopId ?? inventory.inventoryShopId
		const data = await inventory.save({ transaction: t })

		if (req.body.stock !== undefined && req.body.stock !== null) {
			const stock = await InventoryStock.findByPk(inventoryId, {
				transaction: t,
				lock: t.LOCK.UPDATE,
			})

			if (!stock) {
				await InventoryStock.create(
					{ inventoryId: data.id, quantity: req.body.stock },
					{ transaction: t }
				)

				await InventoryStockMovement.create(
					{
						inventoryId: data.id,
						delta: req.body.stock,
						reason: 'initial',
						note: req.body.note,
					},
					{ transaction: t }
				)
			} else {
				const newQty = req.body.stock
				const delta = newQty - stock.quantity

				if (delta !== 0) {
					await InventoryStockMovement.create(
						{
							inventoryId: data.id,
							delta,
							reason: req.body.reason ?? 'correction',
							note: req.body.note,
						},
						{ transaction: t }
					)
				}

				stock.quantity = newQty
				await stock.save({ transaction: t })
			}
		}

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

export async function deleteInventory(req, res) {
	const t = await sequelize.transaction()
	try {
		if (!req.params.inventoryId) {
			await t.rollback()
			return serviceUnavailable(res, 'Deleting data failed - no ID.')
		}
		const inventory = await Inventory.findByPk(req.params.inventoryId)

		if (!inventory) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		let data = await Inventory.destroy({
			where: { id: inventory.id },
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

export async function setInventoryStock(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const inventoryId = req.params.inventoryId
		const newQty = Number(req.body.quantity)

		if (newQty < 0) {
			await t.rollback()
			return wrongValidation(res, 'Stock cannot be negative.')
		}

		const stock = await InventoryStock.findByPk(inventoryId, {
			transaction: t,
			lock: t.LOCK.UPDATE,
		})

		if (!stock) {
			const created = await InventoryStock.create(
				{ inventoryId, quantity: newQty },
				{ transaction: t }
			)

			if (newQty !== 0) {
				await InventoryStockMovement.create(
					{
						inventoryId,
						delta: newQty,
						reason: 'initial',
						note: req.body.note,
					},
					{ transaction: t }
				)
			}

			await t.commit()
			return success(res, 'Stock set successfully', created)
		}

		const delta = newQty - stock.quantity
		if (delta !== 0) {
			await InventoryStockMovement.create(
				{
					inventoryId,
					delta,
					reason: req.body.reason ?? 'correction',
					note: req.body.note,
				},
				{ transaction: t }
			)
		}

		stock.quantity = newQty
		const data = await stock.save({ transaction: t })

		await t.commit()
		return success(res, 'Stock set successfully', data)
	} catch (err) {
		console.log(err)
		await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}

export async function adjustInventoryStock(req, res) {
	const t = await sequelize.transaction()
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty())
			return wrongValidation(res, 'Validation failed.', errors.array())

		const inventoryId = req.params.inventoryId
		const delta = Number(req.body.delta)

		if (!Number.isFinite(delta) || !Number.isInteger(delta)) {
			await t.rollback()
			return wrongValidation(res, 'Delta must be an integer.')
		}

		const stock = await InventoryStock.findByPk(inventoryId, {
			transaction: t,
			lock: t.LOCK.UPDATE,
		})

		if (!stock) {
			await t.rollback()
			return serviceUnavailable(res, 'No such item.')
		}

		if (stock.quantity + delta < 0) {
			await t.rollback()
			return wrongValidation(res, 'Stock cannot be negative.')
		}

		if (delta !== 0) {
			await InventoryStockMovement.create(
				{
					inventoryId,
					delta,
					reason: req.body.reason ?? 'adjustment',
					note: req.body.note,
				},
				{ transaction: t }
			)

			stock.quantity += delta
			const data = await stock.save({ transaction: t })

			await t.commit()
			return success(res, 'Stock adjusted successfully', data)
		}

		await t.commit()
		return success(res, 'No changes', stock)
	} catch (err) {
		console.log(err)
		await t.rollback()
		return internalServerError(res, 'Error has occured.', err)
	}
}
