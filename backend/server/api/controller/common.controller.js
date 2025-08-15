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
import { validationResult } from 'express-validator'
import ErrorLog from '../model/errorLog.model.js'

const Op = Sequelize.Op

/**
 * Retrieves error logs based on the provided query object in the request body.
 *
 * @async
 * @function getErrorLogs
 * @param {import('express').Request} req - Express request object containing the query in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the retrieved error logs or an error message.
 */
export async function getErrorLogs(req, res) {
    try {
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await ErrorLog.findAll({ where: queryObject })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves an error log entry by its ID.
 *
 * @async
 * @function getErrorLog
 * @param {import('express').Request} req - Express request object, expects `errorLogId` param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the error log data or an error message.
 */
export async function getErrorLog(req, res) {
    try {
        const errorLogId = req.params.errorLogId
        const data = await ErrorLog.findByPk(errorLogId)
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Handles the addition of a new error log entry.
 *
 * Validates the incoming request, creates a new error log entry in the database within a transaction,
 * and returns the appropriate response based on the operation's outcome.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object containing the error log data in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function addErrorLog(req, res) {
    const t = await sequelize.transaction()
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const data = await ErrorLog.create(req.body, { transaction: t })
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
 * Updates an existing error log entry in the database.
 *
 * @async
 * @function updateErrorLog
 * @param {import('express').Request} req - Express request object containing parameters and body data.
 * @param {import('express').Response} res - Express response object used to send responses.
 * @returns {Promise<void>} Sends a JSON response indicating the result of the update operation.
 *
 * @throws Will handle and respond to validation errors, missing error log, or database errors.
 */
export async function updateErrorLog(req, res) {
    const t = await sequelize.transaction()
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const errorLogId = req.params.errorLogId
        const message = req.body.message
        const details = req.body.details
        const type = req.body.type
        const severity = req.body.severity
        const equipmentId = req.body.equipmentId
        const errorLog = await ErrorLog.findByPk(errorLogId)
        if (!errorLog) {
            await t.rollback()
            return serviceUnavailable(res, 'No such item.')
        }
        errorLog.message = message
        errorLog.details = details
        errorLog.type = type
        errorLog.severity = severity
        errorLog.equipmentId = equipmentId
        const data = await errorLog.save({ transaction: t })
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
 * Deletes an error log entry by its ID.
 *
 * @async
 * @function deleteErrorLog
 * @param {import('express').Request} req - Express request object, expects `id` in the request body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function deleteErrorLog(req, res) {
    const t = await sequelize.transaction()
    try {
        if (!req.body.id) {
            await t.rollback()
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        }
        let data = await ErrorLog.destroy(
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
