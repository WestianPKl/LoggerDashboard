import { Sequelize } from 'sequelize'
import sequelize from '../../util/database.js'
import {
    internalServerError,
    serviceUnavailable,
    success,
    unauthorized,
    wrongValidation,
} from '../../util/responseHelper.js'
import { getIo } from '../../middleware/socket.js'
import { decodeSequelizeQuery } from '../../util/sequelizeTools.js'
import { checkPermission } from './permission.controller.js'
import { getUserDetail, generateAccessToken } from '../../libs/jwtToken.js'
import { validationResult } from 'express-validator'
import DataDefinitions from '../model/data/dataDefinitions.model.js'
import DataLastValue from '../model/data/dataLastValue.model.js'
import DataLogs from '../model/data/dataLogs.model.js'
import DataLastValueView from '../model/data/dataLastValueView.model.js'
import DataConnectedSensorView from '../model/data/dataConnectedSensorView.model.js'
import DataLogsView from '../model/data/dataLogsView.model.js'

const Op = Sequelize.Op

/**
 * Handles the retrieval of data definitions based on the provided query.
 *
 * @async
 * @function getDataDefinitions
 * @param {import('express').Request} req - Express request object containing user and query information.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the retrieved data definitions or an error message.
 *
 * @throws {Error} If an unexpected error occurs during the process.
 */
export async function getDataDefinitions(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await DataDefinitions.findAll({ where: queryObject })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves a data definition by its ID.
 *
 * @async
 * @function getDataDefinition
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a response with the data definition or an error message.
 */
export async function getDataDefinition(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const dataDefinitionId = req.params.dataDefinitionId
        const data = await DataDefinitions.findByPk(dataDefinitionId)
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a new data definition to the database.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object containing the data definition in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating the result of the operation.
 *
 * @throws {Error} If an error occurs during the transaction or database operation.
 *
 * @description
 * This controller function performs the following steps:
 * 1. Starts a new database transaction.
 * 2. Checks if the user has WRITE permission for data definitions.
 * 3. Validates the request body.
 * 4. Creates a new data definition record in the database within the transaction.
 * 5. Commits the transaction if successful, or rolls back on failure.
 * 6. Handles and logs errors, sending appropriate HTTP responses.
 */
export async function addDataDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            'dataDefinition',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const data = await DataDefinitions.create(req.body, { transaction: t })
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
 * Updates a data definition entry in the database.
 *
 * @async
 * @function updateDataDefinition
 * @param {import('express').Request} req - Express request object containing parameters and body data.
 * @param {import('express').Response} res - Express response object used to send responses.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the update operation.
 *
 * @throws {Error} Returns a 500 Internal Server Error response if an exception occurs.
 *
 * @description
 * - Checks user permission for updating data definitions.
 * - Validates request data.
 * - Updates the specified data definition if it exists.
 * - Uses a transaction to ensure atomicity.
 * - Handles and responds to various error cases.
 */
export async function updateDataDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            'dataDefinition',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const dataDefinitionId = req.params.dataDefinitionId
        const { name, unit, description } = req.body
        const dataDefinition = await DataDefinitions.findByPk(dataDefinitionId)
        if (!dataDefinition) return serviceUnavailable(res, 'No such item.')
        dataDefinition.name = name
        dataDefinition.unit = unit
        dataDefinition.description = description
        const data = await dataDefinition.save({ transaction: t })
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
 * Deletes a data definition entry from the database.
 *
 * @async
 * @function deleteDataDefinition
 * @param {import('express').Request} req - Express request object containing the ID of the data definition to delete in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a response indicating the result of the deletion operation.
 *
 * @throws Will send an internal server error response if an exception occurs during the process.
 */
export async function deleteDataDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            'dataDefinition',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        const data = await DataDefinitions.destroy(
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
 * Retrieves data logs based on the provided query in the request body.
 * Checks user permissions before querying the database.
 *
 * @async
 * @function getDataLogs
 * @param {import('express').Request} req - Express request object containing user and query information.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the retrieved data logs or an error message.
 */
export async function getDataLogs(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await DataLogs.findAll({
            where: queryObject,
            include: ['logger', 'sensor', 'definition'],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves a data log entry by its ID, including related logger, sensor, and definition information.
 * Checks user permissions before accessing the data.
 *
 * @async
 * @function getDataLog
 * @param {import('express').Request} req - Express request object, expects `params.dataLogId`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the data log or an error message.
 */
export async function getDataLog(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const dataLogId = req.params.dataLogId
        const data = await DataLogs.findByPk(dataLogId, {
            include: ['logger', 'sensor', 'definition'],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds one or multiple data log entries to the database.
 *
 * - Validates user permissions and request body.
 * - Supports both single and bulk data log creation.
 * - Updates the latest value for each data log entry.
 * - All operations are performed within a transaction.
 *
 * @async
 * @function addDataLog
 * @param {import('express').Request} req - Express request object containing data log(s) in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function addDataLog(req, res) {
    const t = await sequelize.transaction()
    try {
        const user = getUserDetail(req)
        if (user.username !== 'logger') {
            const permissionGranted = await checkPermission(
                req,
                'data',
                'dataLog',
                'WRITE'
            )
            if (!permissionGranted) return unauthorized(res)
        }
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        let addData = null
        let data = []
        let dataLastValue = null
        const dataLog = req.body
        if (Array.isArray(dataLog) && dataLog.length > 0) {
            await DataLastValue.destroy(
                {
                    where: {
                        equLoggerId: dataLog[0].equLoggerId,
                        equSensorId: dataLog[0].equSensorId,
                    },
                },
                { transaction: t }
            )
            for (const item of dataLog) {
                if (!item.definition) {
                    return serviceUnavailable(res, 'No data definition name.')
                }
                const definitionData = await DataDefinitions.findOne({
                    where: { name: item.definition },
                })
                const queryObject = {
                    ...item,
                    dataDefinitionId: definitionData.id,
                }
                addData = await DataLogs.create(queryObject, { transaction: t })
                dataLastValue = await DataLastValue.create(
                    {
                        dataLogId: addData.id,
                        equLoggerId: addData.equLoggerId,
                        equSensorId: addData.equSensorId,
                        dataDefinitionId: addData.dataDefinitionId,
                    },
                    { transaction: t }
                )
                data.push(addData)
            }
        } else {
            if (!req.body.definition) {
                return serviceUnavailable(res, 'No data definition name.')
            }
            const definitionData = await DataDefinitions.findOne({
                where: { name: req.body.definition },
            })
            const queryObject = {
                ...req.body,
                dataDefinitionId: definitionData.id,
            }
            addData = await DataLogs.create(queryObject, { transaction: t })
            data.push(addData)
            await DataLastValue.destroy(
                {
                    where: {
                        equLoggerId: addData.equLoggerId,
                        equSensorId: addData.equSensorId,
                        dataDefinitionId: addData.dataDefinitionId,
                    },
                },
                { transaction: t }
            )
            dataLastValue = await DataLastValue.create(
                {
                    dataLogId: addData.id,
                    equLoggerId: addData.equLoggerId,
                    equSensorId: addData.equSensorId,
                    dataDefinitionId: addData.dataDefinitionId,
                },
                { transaction: t }
            )
        }
        if (!data && !dataLastValue) {
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
 * Updates a DataLog entry by its ID.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object containing parameters and body data.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating the result of the update operation.
 *
 * @throws {Error} If an unexpected error occurs during the update process.
 *
 * @description
 * This controller function performs the following steps:
 * 1. Starts a database transaction.
 * 2. Checks if the user has WRITE permission for the dataLog resource.
 * 3. Validates the request body.
 * 4. Finds the DataLog entry by its ID.
 * 5. Updates the DataLog fields with the provided data.
 * 6. Saves the changes within the transaction.
 * 7. Commits the transaction and returns a success response.
 * 8. Handles errors and rolls back the transaction if necessary.
 */
export async function updateDataLog(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            'dataLog',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const dataLogId = req.params.dataLogId
        const { value, dataDefinitionId, equLoggerId, equSensorId, time } =
            req.body
        const dataLog = await DataLogs.findByPk(dataLogId)
        if (!dataLog) return serviceUnavailable(res, 'No such item.')
        dataLog.value = value
        dataLog.dataDefinitionId = dataDefinitionId
        dataLog.equLoggerId = equLoggerId
        dataLog.equSensorId = equSensorId
        dataLog.time = time
        const data = await dataLog.save({ transaction: t })
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
 * Deletes a data log entry and its associated last values from the database.
 *
 * @async
 * @function deleteDataLog
 * @param {import('express').Request} req - Express request object containing the data log ID in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a response indicating the result of the deletion operation.
 *
 * @throws {Error} If an error occurs during the transaction, responds with an internal server error.
 *
 * @description
 * This controller function performs the following steps:
 * 1. Checks if the user has permission to delete the data log.
 * 2. Validates that the data log ID is provided in the request body.
 * 3. Deletes all associated DataLastValue entries for the given data log ID.
 * 4. Deletes the DataLogs entry with the specified ID.
 * 5. Commits the transaction if successful, otherwise rolls back and sends an error response.
 */
export async function deleteDataLog(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            'dataLog',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        const dataLastValues = await DataLastValue.findAll({
            where: { dataLogId: req.body.id },
        })
        let lastValue = 1
        if (dataLastValues && dataLastValues.length > 0) {
            lastValue = await DataLastValue.destroy(
                { where: { dataLogId: req.body.id } },
                { transaction: t }
            )
        }
        const data = await DataLogs.destroy(
            { where: { id: req.body.id } },
            { transaction: t }
        )
        if (!data && !lastValue) {
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
 * Retrieves the latest values of data entries with related logger and log information.
 *
 * @async
 * @function getDataLastValues
 * @param {import('express').Request} req - Express request object containing user and query information.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the retrieved data or an error message.
 *
 * @throws {Error} If an unexpected error occurs during data retrieval.
 */
export async function getDataLastValues(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await DataLastValue.findAll({
            where: queryObject,
            include: [
                'logger',
                {
                    model: DataLogs,
                    as: 'log',
                    include: ['sensor', 'definition'],
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

/**
 * Retrieves the last value of data by its ID, including related logger and log information.
 * Checks user permissions before accessing the data.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object, expects `params.dataLastValueId`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the data or an error message.
 */
export async function getDataLastValue(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const dataLastValueId = req.params.dataLastValueId
        const data = await DataLastValue.findByPk(dataLastValueId, {
            include: [
                'logger',
                {
                    model: DataLogs,
                    as: 'log',
                    include: ['sensor', 'definition'],
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

/**
 * Adds a new DataLastValue entry to the database.
 *
 * This controller function handles the creation of a new DataLastValue record.
 * It performs permission checks, request validation, and manages the transaction.
 * On success, it emits a socket event to notify clients of the new data.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object containing the data to add.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the operation.
 */
export async function addDataLastValue(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            'dataLog',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const data = await DataLastValue.create(req.body, { transaction: t })
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
        if (io) io.sockets.emit(`loggerData_${data.equLoggerId}`, 'add')
        return success(res, 'Data added successfully', data)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Updates the dataLogId of a DataLastValue entry by its ID.
 *
 * @async
 * @function updateDataLastValue
 * @param {import('express').Request} req - Express request object, expects `params.dataLastValueId` and `body.dataLogId`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response with the result of the update operation.
 *
 * @throws {Error} If an unexpected error occurs during the update process.
 *
 * @description
 * - Checks user permission for writing to 'dataLog'.
 * - Validates request input.
 * - Finds the DataLastValue by primary key.
 * - Updates the dataLogId field and saves within a transaction.
 * - Handles errors and sends appropriate HTTP responses.
 */
export async function updateDataLastValue(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            'dataLog',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const dataLastValueId = req.params.dataLastValueId
        const dataLogId = req.body.dataLogId
        const dataLastValue = await DataLastValue.findByPk(dataLastValueId)
        if (!dataLastValue) return serviceUnavailable(res, 'No such item.')
        dataLastValue.dataLogId = dataLogId
        const data = await dataLastValue.save({ transaction: t })
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
 * Deletes a DataLastValue entry by its ID.
 *
 * @async
 * @function deleteDataLastValue
 * @param {import('express').Request} req - Express request object, expects `id` in `req.body`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the deletion.
 *
 * @throws {Error} If an error occurs during the transaction or deletion process.
 *
 * @description
 * Checks user permissions for deleting a data log entry. If permitted and a valid ID is provided,
 * attempts to delete the corresponding DataLastValue record within a transaction. Rolls back the transaction
 * and returns an error response if deletion fails or an exception occurs.
 */
export async function deleteDataLastValue(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            'dataLog',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        const data = await DataLastValue.destroy(
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
 * Handles the request to retrieve the latest values from the DataLastValueView.
 *
 * Checks user permissions before querying the database for the latest data values
 * based on the provided query object. Returns the data if successful, or an appropriate
 * error response if not.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object containing user and query data.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the result or error message.
 */
export async function getDataLastValuesView(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await DataLastValueView.findAll({ where: queryObject })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Handles the retrieval of data from the DataConnectedSensorView model.
 * Checks user permissions before querying the database with the decoded query object from the request body.
 * Responds with the retrieved data or an appropriate error message.
 *
 * @async
 * @function getDataConnectedSensorView
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the result or error.
 */
export async function getDataConnectedSensorView(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await DataConnectedSensorView.findAll({
            where: queryObject,
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Handles the retrieval of data logs from the DataLogsView.
 *
 * @async
 * @function getDataLogsView
 * @param {import('express').Request} req - Express request object containing user and query data.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the retrieved data logs or an error message.
 */
export async function getDataLogsView(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await DataLogsView.findAll({ where: queryObject })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves the latest values for a list of equipment loggers.
 *
 * @async
 * @function getLastValuesForLoggers
 * @param {import('express').Request} req - Express request object, expects `loggerIds` array in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the latest logger data or an error message.
 *
 * @throws {Error} If an unexpected error occurs during processing.
 */
export async function getLastValuesForLoggers(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'data',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const { loggerIds } = req.body
        if (!Array.isArray(loggerIds) || loggerIds.length === 0) {
            return serviceUnavailable(
                res,
                'Must be an array of equipment loggers IDs.'
            )
        }
        const data = await DataLastValueView.findAll({
            where: { equLoggerId: loggerIds },
            order: [['time', 'DESC']],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Handles the request to generate a data access token.
 *
 * Generates an access token with predefined user information and token type,
 * then responds with the token in JSON format.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response containing the generated token.
 */
export async function getDataToken(req, res) {
    const token = generateAccessToken({
        tokenType: 3,
        user: { id: 0, username: 'logger', email: '', password: '' },
    })
    res.status(200).json({ token })
}
