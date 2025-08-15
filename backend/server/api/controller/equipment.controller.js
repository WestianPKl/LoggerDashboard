import { Sequelize } from 'sequelize'
import sequelize from '../../util/database.js'
import {
    internalServerError,
    serviceUnavailable,
    success,
    unauthorized,
    wrongValidation,
} from '../../util/responseHelper.js'
import { decodeSequelizeQuery } from '../../util/sequelizeTools.js'
import { checkPermission } from './permission.controller.js'
import { getUserDetail } from '../../libs/jwtToken.js'
import { validationResult } from 'express-validator'
import EquType from '../model/equipment/equType.model.js'
import EquVendor from '../model/equipment/equVendor.model.js'
import EquModel from '../model/equipment/equModel.model.js'
import Equipment from '../model/equipment/equipment.model.js'
import EquUnusedLoggerView from '../model/equipment/equUnusedLogger.model.js'
import EquSensorFunctions from '../model/equipment/equSensorsFunctions.model.js'

const Op = Sequelize.Op

/**
 * Handles the retrieval of equipment types based on the provided query.
 *
 * @async
 * @function getEquTypes
 * @param {import('express').Request} req - Express request object, expects query parameters in req.body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the result or error message.
 *
 * @throws {Error} If an unexpected error occurs during processing.
 *
 * @description
 * - Checks if the user has 'READ' permission for equipment types.
 * - Decodes the query object from the request body.
 * - Retrieves equipment types from the database matching the query.
 * - Returns a success response with the data, or an error response if something fails.
 */
export async function getEquTypes(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await EquType.findAll({ where: queryObject })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves an equipment type by its ID.
 *
 * @async
 * @function getEquType
 * @param {import('express').Request} req - Express request object, expects `equTypeId` param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the equipment type data or an error message.
 *
 * @throws {Error} If an unexpected error occurs during the process.
 */
export async function getEquType(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const equTypeId = req.params.equTypeId
        const data = await EquType.findByPk(equTypeId)
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a new equipment type to the database.
 *
 * Handles permission checks, request validation, and transaction management.
 * Responds with appropriate status and messages based on the operation outcome.
 *
 * @async
 * @function addEquType
 * @param {import('express').Request} req - Express request object containing the equipment type data in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function addEquType(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equType',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const data = await EquType.create(req.body, { transaction: t })
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

/**
 * Updates an equipment type by its ID.
 *
 * @async
 * @function updateEquType
 * @param {import('express').Request} req - Express request object containing parameters and body data.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends an HTTP response with the result of the update operation.
 *
 * @throws {Error} If an unexpected error occurs during the update process.
 *
 * @description
 * - Checks user permissions for updating equipment types.
 * - Validates the request body.
 * - Finds the equipment type by its ID.
 * - Updates the equipment type's name if found.
 * - Handles transaction commit/rollback and sends appropriate HTTP responses.
 */
export async function updateEquType(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equType',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const equTypeId = req.params.equTypeId
        const name = req.body.name
        const equType = await EquType.findByPk(equTypeId)
        if (!equType) {
            await t.rollback()
            return serviceUnavailable(res, 'No such item.')
        }
        equType.name = name
        const data = await equType.save({ transaction: t })
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

/**
 * Deletes an equipment type by ID.
 *
 * @async
 * @function deleteEquType
 * @param {import('express').Request} req - Express request object, expects `id` in `req.body`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 *
 * @throws {Error} If an error occurs during the transaction or deletion process.
 *
 * @description
 * Checks user permissions before attempting to delete an equipment type from the database.
 * Performs the deletion within a transaction. Rolls back the transaction and returns an error
 * response if the operation fails at any step.
 */
export async function deleteEquType(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equType',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id) {
            await t.rollback()
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        }
        let data = await EquType.destroy(
            { where: { id: req.body.id } },
            { transaction: t }
        )
        if (!data) {
            await t.rollback()
            return serviceUnavailable(res, 'Retrieving data failed.')
        }
        await t.commit()
        return success(res, 'Data deleted successfully', data)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves equipment vendors based on the provided query in the request body.
 *
 * Checks user permissions before querying the database. If permission is denied,
 * responds with an unauthorized status. If data retrieval fails, responds with a
 * service unavailable status. On success, returns the retrieved data.
 *
 * @async
 * @function getEquVendors
 * @param {import('express').Request} req - Express request object containing the query in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends an HTTP response with the result of the operation.
 */
export async function getEquVendors(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await EquVendor.findAll({ where: queryObject })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves an equipment vendor by its ID.
 *
 * @async
 * @function getEquVendor
 * @param {import('express').Request} req - Express request object, expects `equVendorId` in `req.params`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the vendor data or an error message.
 */
export async function getEquVendor(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const equVendorId = req.params.equVendorId
        const data = await EquVendor.findByPk(equVendorId)
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a new equipment vendor to the database.
 *
 * @async
 * @function addEquVendor
 * @param {import('express').Request} req - Express request object containing the vendor data in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 *
 * @throws {Error} If an unexpected error occurs during the operation.
 *
 * @description
 * - Checks user permissions for adding an equipment vendor.
 * - Validates the request body.
 * - Creates a new equipment vendor within a transaction.
 * - Handles transaction commit/rollback and sends appropriate responses.
 */
export async function addEquVendor(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equVendor',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const data = await EquVendor.create(req.body, { transaction: t })
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

/**
 * Updates an existing equipment vendor's name by ID.
 *
 * @async
 * @function updateEquVendor
 * @param {import('express').Request} req - Express request object, expects `equVendorId` in params and `name` in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response with the result of the update operation.
 *
 * @throws {Error} If an unexpected error occurs during the update process.
 *
 * @description
 * - Checks user permission for updating equipment vendor.
 * - Validates request input.
 * - Finds the equipment vendor by primary key.
 * - Updates the vendor's name and saves the changes within a transaction.
 * - Handles errors and rolls back the transaction if necessary.
 */
export async function updateEquVendor(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equVendor',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const equVendorId = req.params.equVendorId
        const name = req.body.name
        const equVendor = await EquVendor.findByPk(equVendorId)
        if (!equVendor) {
            await t.rollback()
            return serviceUnavailable(res, 'No such item.')
        }
        equVendor.name = name
        const data = await equVendor.save({ transaction: t })
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

/**
 * Deletes an equipment vendor entry by ID.
 *
 * @async
 * @function deleteEquVendor
 * @param {import('express').Request} req - Express request object, expects `id` in `req.body`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a response indicating the result of the deletion operation.
 *
 * @throws Will handle and respond to errors such as missing permissions, missing ID, or database errors.
 */
export async function deleteEquVendor(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equVendor',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id) {
            await t.rollback()
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        }
        let data = await EquVendor.destroy(
            { where: { id: req.body.id } },
            { transaction: t }
        )
        if (!data) {
            await t.rollback()
            return serviceUnavailable(res, 'Retrieving data failed.')
        }
        await t.commit()
        return success(res, 'Data deleted successfully', data)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Handles the retrieval of equipment models based on the provided query.
 *
 * @async
 * @function getEquModels
 * @param {import('express').Request} req - Express request object containing user and query information.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the retrieved equipment models or an error message.
 *
 * @throws {Error} If an unexpected error occurs during the process.
 */
export async function getEquModels(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await EquModel.findAll({ where: queryObject })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves an equipment model by its ID.
 *
 * @async
 * @function getEquModel
 * @param {import('express').Request} req - Express request object, expects `equModelId` in `req.params`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the equipment model data if found, or an error message otherwise.
 *
 * @throws {Error} If an unexpected error occurs during the process.
 */
export async function getEquModel(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const equModelId = req.params.equModelId
        const data = await EquModel.findByPk(equModelId)
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a new equipment model to the database.
 *
 * Handles permission checks, request validation, and transaction management.
 * Responds with appropriate HTTP status and message based on the operation result.
 *
 * @async
 * @function addEquModel
 * @param {import('express').Request} req - Express request object containing the equipment model data in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the operation result.
 */
export async function addEquModel(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equModel',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const data = await EquModel.create(req.body, { transaction: t })
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

/**
 * Updates an existing equipment model by its ID.
 *
 * @async
 * @function updateEquModel
 * @param {import('express').Request} req - Express request object containing parameters and body data.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends an HTTP response with the result of the update operation.
 *
 * @throws {Error} If an unexpected error occurs during the update process.
 *
 * @description
 * - Checks user permissions for updating equipment models.
 * - Validates the request body.
 * - Finds the equipment model by its ID.
 * - Updates the model's name and saves the changes within a transaction.
 * - Handles errors and sends appropriate HTTP responses.
 */
export async function updateEquModel(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equModel',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const equModelId = req.params.equModelId
        const name = req.body.name
        const equModel = await EquModel.findByPk(equModelId)
        if (!equModel) {
            await t.rollback()
            return serviceUnavailable(res, 'No such item.')
        }
        equModel.name = name
        const data = await equModel.save({ transaction: t })
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

/**
 * Deletes an equipment model by its ID.
 *
 * @async
 * @function deleteEquModel
 * @param {import('express').Request} req - Express request object, expects `id` in `req.body`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the deletion.
 *
 * @throws Will handle and respond to errors such as missing permissions, missing ID, or database errors.
 */
export async function deleteEquModel(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equModel',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id) {
            await t.rollback()
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        }
        let data = await EquModel.destroy(
            { where: { id: req.body.id } },
            { transaction: t }
        )
        if (!data) {
            await t.rollback()
            return serviceUnavailable(res, 'Retrieving data failed.')
        }
        await t.commit()
        return success(res, 'Data deleted successfully', data)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves equipment records based on the request body criteria.
 *
 * - Checks if the user has 'READ' permission for equipment.
 * - Supports querying by an array of equipment IDs or by equipment type ID.
 * - Falls back to decoding a Sequelize query from the request body if no specific criteria are provided.
 * - Includes related models: vendor, model, type, createdBy, updatedBy, and dataDefinitions.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the result or error.
 */
export async function getEquipments(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        let queryObject
        if (Array.isArray(req.body) && req.body.length > 0) {
            queryObject = { id: req.body }
        } else if (req.body.equTypeId) {
            queryObject = { equTypeId: req.body.equTypeId }
        } else {
            queryObject = decodeSequelizeQuery(req.body)
        }
        const data = await Equipment.findAll({
            where: queryObject,
            include: [
                'vendor',
                'model',
                'type',
                'createdBy',
                'updatedBy',
                'dataDefinitions',
            ],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves equipment data for admin users based on the request body.
 *
 * - Checks if the user has 'READ' permission for equipment.
 * - Supports querying by an array of equipment IDs, equipment type ID, or a decoded Sequelize query.
 * - Includes related models: vendor, model, type, createdBy, updatedBy, and dataDefinitions.
 * - Returns a success response with the data, or appropriate error responses.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the result or error.
 */
export async function getEquipmentsAdmin(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        let queryObject
        if (Array.isArray(req.body) && req.body.length > 0) {
            queryObject = { id: req.body }
        } else if (req.body.equTypeId) {
            queryObject = { equTypeId: req.body.equTypeId }
        } else {
            queryObject = decodeSequelizeQuery(req.body)
        }
        const data = await Equipment.findAll({
            where: queryObject,
            paranoid: false,
            include: [
                'vendor',
                'model',
                'type',
                'createdBy',
                'updatedBy',
                'dataDefinitions',
            ],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves equipment details by ID, including related entities.
 *
 * @async
 * @function getEquipment
 * @param {import('express').Request} req - Express request object, expects `equipmentId` in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with equipment data or an error message.
 */
export async function getEquipment(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const equipmentId = req.params.equipmentId
        const data = await Equipment.findByPk(equipmentId, {
            include: [
                'vendor',
                'model',
                'type',
                'createdBy',
                'updatedBy',
                'dataDefinitions',
            ],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a new equipment entry to the database.
 *
 * This controller function handles the creation of a new equipment record, including validation,
 * permission checks, and optional association with sensor functions if the equipment type is 'Sensor'.
 * The operation is performed within a transaction to ensure atomicity.
 *
 * @async
 * @function addEquipment
 * @param {import('express').Request} req - Express request object containing equipment data in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function addEquipment(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equEquipment',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const user = getUserDetail(req)
        const dataDefinitions = req.body.dataDefinitions
        let queryObject = {
            ...req.body,
            createdById: user.id,
            updatedById: user.id,
        }
        const data = await Equipment.create(queryObject, { transaction: t })
        const sensor = await EquType.findByPk(req.body.equTypeId, { raw: true })
        if (
            sensor?.name === 'Sensor' &&
            Array.isArray(dataDefinitions) &&
            dataDefinitions.length > 0
        ) {
            for (const item of dataDefinitions) {
                await EquSensorFunctions.create(
                    { equSensorId: data.id, dataDefinitionId: item.id },
                    { transaction: t }
                )
            }
        }
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

/**
 * Updates an equipment record by its ID.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object containing equipmentId in params and updated data in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response with the update result.
 *
 * @throws {Error} Returns 500 Internal Server Error if an exception occurs.
 *
 * @description
 * - Checks user permission for updating equipment.
 * - Validates request body.
 * - Finds the equipment by ID.
 * - Updates equipment fields and associated sensor functions if applicable.
 * - Uses a transaction to ensure atomicity.
 * - Rolls back transaction and returns appropriate error responses on failure.
 */
export async function updateEquipment(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equEquipment',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const equipmentId = req.params.equipmentId
        const {
            serialNumber,
            equModelId,
            equVendorId,
            equTypeId,
            dataDefinitions,
        } = req.body
        const user = getUserDetail(req)
        const equipment = await Equipment.findByPk(equipmentId, {
            include: ['type'],
        })
        if (!equipment) {
            await t.rollback()
            return serviceUnavailable(res, 'No such item.')
        }
        equipment.serialNumber = serialNumber
        equipment.equModelId = equModelId
        equipment.equVendorId = equVendorId
        equipment.equTypeId = equTypeId
        equipment.updatedById = user.id
        await EquSensorFunctions.destroy(
            { where: { equSensorId: equipmentId } },
            { transaction: t }
        )
        if (
            equipment.type?.name === 'Sensor' &&
            Array.isArray(dataDefinitions) &&
            dataDefinitions.length > 0
        ) {
            for (const item of dataDefinitions) {
                await EquSensorFunctions.create(
                    { equSensorId: equipment.id, dataDefinitionId: item.id },
                    { transaction: t }
                )
            }
        }
        const data = await equipment.save({ transaction: t })
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

/**
 * Deletes an equipment record by its ID.
 *
 * This function checks user permissions, validates the request body for an equipment ID,
 * verifies the existence of the equipment, and performs a soft delete by setting `isDeleted` to 1.
 * It also updates the `updatedById` field and uses a transaction to ensure atomicity.
 *
 * @async
 * @function deleteEquipment
 * @param {import('express').Request} req - The Express request object, expected to contain the equipment ID in `req.body.id`.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the delete operation.
 */
export async function deleteEquipment(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equEquipment',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id) {
            await t.rollback()
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        }
        const equ = await Equipment.findByPk(req.body.id)
        if (!equ) {
            await t.rollback()
            return serviceUnavailable(
                res,
                'Deleting data failed - no equipment.'
            )
        }
        const data = await Equipment.destroy(
            { where: { id: req.body.id } },
            { transaction: t }
        )
        const user = getUserDetail(req)
        equ.updatedById = user.id
        equ.isDeleted = 1
        await equ.save({ transaction: t })
        if (!data) {
            await t.rollback()
            return serviceUnavailable(res, 'Retrieving data failed.')
        }
        await t.commit()
        return success(res, 'Data deleted successfully', data)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Restores a previously deleted Equipment record by its ID.
 *
 * This function checks user permissions, validates the request body,
 * restores the Equipment record (using Sequelize's paranoid mode),
 * updates audit fields, and commits the transaction.
 * Handles errors and rolls back the transaction if necessary.
 *
 * @async
 * @function restoreEquipment
 * @param {import('express').Request} req - Express request object, expects `body.id` for the Equipment ID.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response indicating success or failure.
 */
export async function restoreEquipment(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equEquipment',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id) {
            await t.rollback()
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        }
        const equ = await Equipment.findByPk(req.body.id, { paranoid: false })
        if (!equ) {
            await t.rollback()
            return serviceUnavailable(
                res,
                'Deleting data failed - no equipment.'
            )
        }
        const data = await Equipment.restore(
            { where: { id: req.body.id } },
            { transaction: t }
        )
        if (!data) {
            await t.rollback()
            return serviceUnavailable(res, 'Retrieving data failed.')
        }
        const user = getUserDetail(req)
        equ.updatedById = user.id
        equ.isDeleted = 0
        await equ.save({ transaction: t })
        await t.commit()
        return success(res, 'Data deleted successfully', data)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Forcefully deletes an equipment record by its ID.
 *
 * This function checks user permissions, validates the request body for an ID,
 * and then attempts to permanently delete the equipment record from the database
 * within a transaction. If any step fails, the transaction is rolled back and an
 * appropriate error response is returned.
 *
 * @async
 * @function deleteEquipmentForced
 * @param {import('express').Request} req - Express request object, expects `body.id` to specify the equipment ID.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function deleteEquipmentForced(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equEquipment',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id) {
            await t.rollback()
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        }
        let data = await Equipment.destroy(
            { where: { id: req.body.id }, force: true },
            { transaction: t }
        )
        if (!data) {
            await t.rollback()
            return serviceUnavailable(res, 'Retrieving data failed.')
        }
        await t.commit()
        return success(res, 'Data deleted successfully', data)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves a list of unused equipment loggers based on the provided query.
 *
 * @async
 * @function getEquUnusedLoggers
 * @param {import('express').Request} req - Express request object containing user and query information.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the retrieved data or an error message.
 *
 * @throws {Error} If an unexpected error occurs during the process.
 */
export async function getEquUnusedLoggers(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await EquUnusedLoggerView.findAll({ where: queryObject })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a new sensor function to the equipment.
 *
 * @async
 * @function addEquSensorFunction
 * @param {import('express').Request} req - Express request object containing the sensor function data in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends an HTTP response with the result of the operation.
 *
 * @throws {Error} Returns an internal server error response if an exception occurs.
 *
 * @description
 * - Checks user permissions for writing equipment data.
 * - Validates the request body.
 * - Verifies that the equipment exists and is of type 'Sensor'.
 * - Creates a new sensor function within a transaction.
 * - Handles transaction commit/rollback and sends appropriate HTTP responses.
 */
export async function addEquSensorFunction(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equEquipment',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const equSensor = await Equipment.findByPk(req.body.equSensorId, {
            include: ['vendor', 'model', 'type'],
        })
        if (!equSensor || equSensor.type?.name !== 'Sensor') {
            await t.rollback()
            return serviceUnavailable(res, 'No such item.')
        }
        const data = await EquSensorFunctions.create(req.body, {
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

/**
 * Deletes an equipment sensor function based on the provided equSensorId and dataDefinitionId.
 *
 * @async
 * @function deleteEquSensorFunction
 * @param {import('express').Request} req - Express request object containing equSensorId and dataDefinitionId in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the deletion operation.
 *
 * @throws {Error} Returns a 500 Internal Server Error response if an exception occurs.
 *
 * @description
 * - Checks user permission for deleting equipment sensor functions.
 * - Validates required IDs in the request body.
 * - Performs the deletion within a transaction.
 * - Rolls back the transaction and returns appropriate error responses on failure.
 * - Commits the transaction and returns a success response on successful deletion.
 */
export async function deleteEquSensorFunction(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'equ',
            'equEquipment',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.equSensorId || !req.body.dataDefinitionId) {
            await t.rollback()
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        }
        let data = await EquSensorFunctions.destroy(
            {
                where: {
                    equSensorId: req.body.equSensorId,
                    dataDefinitionId: req.body.dataDefinitionId,
                },
            },
            { transaction: t }
        )
        if (!data) {
            await t.rollback()
            return serviceUnavailable(res, 'Retrieving data failed.')
        }
        await t.commit()
        return success(res, 'Data deleted successfully', data)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}
