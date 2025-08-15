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
import FunctionalityDefinition from '../model/adm/admFunctionalityDefinition.model.js'
import ObjectDefinition from '../model/adm/admObjectDefinition.model.js'
import AccessLevelDefinition from '../model/adm/admAccessLevelDefinitions.model.js'
import AdmRoles from '../model/adm/admRoles.model.js'
import AdmRolesUser from '../model/adm/admRolesUser.model.js'
import AdmPermissions from '../model/adm/admPermissions.js'
import User from '../model/users/user.model.js'

const Op = Sequelize.Op

/**
 * Handles the retrieval of admin functionality definitions.
 *
 * Checks if the user has the required 'READ' permission for 'adm'.
 * Decodes the query object from the request body and fetches matching
 * functionality definitions from the database.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends the HTTP response with the result or error.
 */
export async function getAdmFunctionalityDefinitions(req, res) {
    try {
        let permissionGranted = await checkPermission(req, 'adm', null, 'READ')
        if (!permissionGranted) return unauthorized(res)
        let queryObject = decodeSequelizeQuery(req.body)
        const data = await FunctionalityDefinition.findAll({
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
 * Retrieves a functionality definition by its ID for the admin module.
 *
 * @async
 * @function getAdmFunctionalityDefinition
 * @param {import('express').Request} req - Express request object, expects `admFunctionalityDefinitionId` in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the functionality definition data or an error message.
 */
export async function getAdmFunctionalityDefinition(req, res) {
    try {
        let permissionGranted = await checkPermission(req, 'adm', null, 'READ')
        if (!permissionGranted) return unauthorized(res)
        const admFunctionalityDefinitionId =
            req.params.admFunctionalityDefinitionId
        const data = await FunctionalityDefinition.findByPk(
            admFunctionalityDefinitionId
        )
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a new functionality definition for the admin module.
 *
 * Handles permission checks, request validation, and database transaction management.
 * Responds with appropriate HTTP status and messages based on the operation outcome.
 *
 * @async
 * @function addAdmFunctionalityDefinition
 * @param {import('express').Request} req - Express request object containing the functionality definition data.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends HTTP response with the result of the operation.
 */
export async function addAdmFunctionalityDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admFunctionalityDefinition',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const data = await FunctionalityDefinition.create(req.body, {
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
 * Updates an existing admFunctionalityDefinition record by its ID.
 *
 * @async
 * @function updateAdmFunctionalityDefinition
 * @param {import('express').Request} req - Express request object, expects `admFunctionalityDefinitionId` in params and `name`, `description` in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the result of the update operation.
 *
 * @throws {Error} Returns a 500 error response if an exception occurs during the process.
 *
 * @description
 * - Checks user permissions for updating admFunctionalityDefinition.
 * - Validates request body.
 * - Finds the functionality definition by primary key.
 * - Updates the name and description fields.
 * - Saves the changes within a transaction.
 * - Handles errors and transaction rollbacks.
 */
export async function updateAdmFunctionalityDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admFunctionalityDefinition',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const admFunctionalityDefinitionId =
            req.params.admFunctionalityDefinitionId
        const { name, description } = req.body
        const admFunctionalityDefinition =
            await FunctionalityDefinition.findByPk(admFunctionalityDefinitionId)
        if (!admFunctionalityDefinition)
            return serviceUnavailable(res, 'No such item.')
        admFunctionalityDefinition.name = name
        admFunctionalityDefinition.description = description
        const data = await admFunctionalityDefinition.save({ transaction: t })
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
 * Deletes a functionality definition from the database.
 *
 * @async
 * @function deleteAdmFunctionalityDefinition
 * @param {import('express').Request} req - Express request object containing the ID of the functionality definition to delete in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a response indicating the result of the delete operation.
 *
 * @throws {Error} If an error occurs during the transaction or database operation.
 */
export async function deleteAdmFunctionalityDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admFunctionalityDefinition',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        let data = await FunctionalityDefinition.destroy(
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
 * Handles the retrieval of admin object definitions.
 *
 * Checks user permissions, decodes the query from the request body, and fetches
 * object definitions from the database. Responds with the data if successful,
 * or with an appropriate error message otherwise.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the result or error.
 */
export async function getAdmObjectDefinitions(req, res) {
    try {
        let permissionGranted = await checkPermission(req, 'adm', null, 'READ')
        if (!permissionGranted) return unauthorized(res)
        let queryObject = decodeSequelizeQuery(req.body)
        const data = await ObjectDefinition.findAll({ where: queryObject })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves an Object Definition by its ID for the admin module.
 *
 * @async
 * @function getAdmObjectDefinition
 * @param {import('express').Request} req - Express request object, expects `admObjectDefinitionId` in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the object definition data or an error message.
 */
export async function getAdmObjectDefinition(req, res) {
    try {
        let permissionGranted = await checkPermission(req, 'adm', null, 'READ')
        if (!permissionGranted) return unauthorized(res)
        const admObjectDefinitionId = req.params.admObjectDefinitionId
        const data = await ObjectDefinition.findByPk(admObjectDefinitionId)
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a new Object Definition to the database within a transaction.
 *
 * @async
 * @function addAdmObjectDefinition
 * @param {import('express').Request} req - Express request object containing the body with object definition data.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the operation.
 *
 * @throws {Error} If an error occurs during the transaction or database operation.
 */
export async function addAdmObjectDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admObjectDefinition',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const data = await ObjectDefinition.create(req.body, { transaction: t })
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
 * Updates an existing AdmObjectDefinition record by its ID.
 *
 * @async
 * @function updateAdmObjectDefinition
 * @param {import('express').Request} req - Express request object, expects `admObjectDefinitionId` in params and `name`, `description` in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the update result or error information.
 *
 * @throws {Error} If a database or server error occurs.
 *
 * @description
 * - Checks user permission for WRITE access on 'admObjectDefinition'.
 * - Validates request body.
 * - Finds the object definition by primary key.
 * - Updates the name and description fields.
 * - Saves changes within a transaction.
 * - Handles errors and rolls back transaction if needed.
 */
export async function updateAdmObjectDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admObjectDefinition',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const admObjectDefinitionId = req.params.admObjectDefinitionId
        const { name, description } = req.body
        const admObjectDefinition = await ObjectDefinition.findByPk(
            admObjectDefinitionId
        )
        if (!admObjectDefinition)
            return serviceUnavailable(res, 'No such item.')
        admObjectDefinition.name = name
        admObjectDefinition.description = description
        const data = await admObjectDefinition.save({ transaction: t })
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
 * Deletes an ObjectDefinition entry from the database.
 *
 * @async
 * @function deleteAdmObjectDefinition
 * @param {import('express').Request} req - Express request object, expects `id` in `req.body`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the operation.
 *
 * @throws {Error} Returns a 500 Internal Server Error response if an exception occurs.
 *
 * @description
 * Checks user permissions for deleting an ObjectDefinition. If permitted and a valid ID is provided,
 * attempts to delete the entry within a transaction. Rolls back the transaction and returns an error
 * response if deletion fails or an error occurs.
 */
export async function deleteAdmObjectDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admObjectDefinition',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        let data = await ObjectDefinition.destroy(
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
 * Retrieves access level definitions based on the provided query object.
 *
 * @async
 * @function getAdmAccessLevelDefinitions
 * @param {import('express').Request} req - Express request object containing the query in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the retrieved data or an error message.
 */
export async function getAdmAccessLevelDefinitions(req, res) {
    try {
        let queryObject = decodeSequelizeQuery(req.body)
        const data = await AccessLevelDefinition.findAll({ where: queryObject })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves an Access Level Definition by its ID.
 *
 * @async
 * @function getAdmAccessLevelDefinition
 * @param {import('express').Request} req - Express request object, expects `admAccessLevelDefinitionId` in `req.params`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the access level definition data or an error message.
 *
 * @throws {Error} If an unexpected error occurs during the process.
 */
export async function getAdmAccessLevelDefinition(req, res) {
    try {
        let permissionGranted = await checkPermission(req, 'adm', null, 'READ')
        if (!permissionGranted) return unauthorized(res)
        const admAccessLevelDefinitionId = req.params.admAccessLevelDefinitionId
        const data = await AccessLevelDefinition.findByPk(
            admAccessLevelDefinitionId
        )
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a new Access Level Definition for admin users.
 *
 * Handles permission checks, request validation, and database transaction management.
 * Responds with appropriate HTTP status and messages based on the operation outcome.
 *
 * @async
 * @function addAdmAccessLevelDefinition
 * @param {import('express').Request} req - Express request object containing the access level definition data in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function addAdmAccessLevelDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admAccessLevelDefinition',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const data = await AccessLevelDefinition.create(req.body, {
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
 * Updates an Access Level Definition for the admin module.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object, expects `admAccessLevelDefinitionId` in params and `name`, `accessLevel` in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 *
 * @throws {Error} Returns 500 Internal Server Error if an exception occurs.
 */
export async function updateAdmAccessLevelDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admAccessLevelDefinition',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const admAccessLevelDefinitionId = req.params.admAccessLevelDefinitionId
        const { name, accessLevel } = req.body
        const admAccessLevelDefinition = await AccessLevelDefinition.findByPk(
            admAccessLevelDefinitionId
        )
        if (!admAccessLevelDefinition)
            return serviceUnavailable(res, 'No such item.')
        admAccessLevelDefinition.name = name
        admAccessLevelDefinition.accessLevel = accessLevel
        const data = await admAccessLevelDefinition.save({ transaction: t })
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
 * Deletes an Access Level Definition entry from the database.
 *
 * @async
 * @function deleteAdmAccessLevelDefinition
 * @param {import('express').Request} req - Express request object, expects `id` in `req.body`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the operation.
 *
 * @throws {Error} If an error occurs during the deletion process.
 *
 * @description
 * Checks user permissions for deleting an access level definition.
 * If permission is granted and a valid ID is provided, attempts to delete the entry within a transaction.
 * Rolls back the transaction and returns an error response if deletion fails or an exception occurs.
 */
export async function deleteAdmAccessLevelDefinition(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admAccessLevelDefinition',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        let data = await AccessLevelDefinition.destroy(
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
 * Retrieves administrative roles from the database.
 *
 * Checks if the requesting user has the required 'READ' permission for 'adm'.
 * Decodes the query object from the request body and fetches roles with related
 * 'createdBy', 'updatedBy', and 'users' associations.
 *
 * @async
 * @function getAdmRoles
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the retrieved data or an error message.
 */
export async function getAdmRoles(req, res) {
    try {
        let permissionGranted = await checkPermission(req, 'adm', null, 'READ')
        if (!permissionGranted) return unauthorized(res)
        let queryObject = decodeSequelizeQuery(req.body)
        const data = await AdmRoles.findAll({
            where: queryObject,
            include: ['createdBy', 'updatedBy', 'users'],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves an administrative role by its ID, including related createdBy, updatedBy, and users.
 * Checks if the requesting user has 'READ' permission for 'adm'.
 *
 * @async
 * @function getAdmRole
 * @param {import('express').Request} req - Express request object, expects admRoleId in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the role data or an error message.
 */
export async function getAdmRole(req, res) {
    try {
        let permissionGranted = await checkPermission(req, 'adm', null, 'READ')
        if (!permissionGranted) return unauthorized(res)
        const admRoleId = req.params.admRoleId
        const data = await AdmRoles.findByPk(admRoleId, {
            include: ['createdBy', 'updatedBy', 'users'],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a new admin role to the system.
 *
 * @async
 * @function addAdmRole
 * @param {import('express').Request} req - Express request object containing the role data in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating the result of the operation.
 *
 * @throws {Error} If an error occurs during the transaction or database operation.
 */
export async function addAdmRole(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admRole',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const user = getUserDetail(req)
        let queryObject = {
            ...req.body,
            createdById: user.id,
            updatedById: user.id,
        }
        const data = await AdmRoles.create(queryObject, { transaction: t })
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
 * Updates an admin role with the provided data.
 *
 * @async
 * @function updateAdmRole
 * @param {import('express').Request} req - Express request object containing parameters and body data.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 *
 * @throws {Error} Returns an internal server error response if an exception occurs.
 *
 * @description
 * - Checks if the user has permission to update admin roles.
 * - Validates the request body.
 * - Finds the admin role by ID and updates its name and description.
 * - Saves the changes within a transaction.
 * - Handles errors and sends appropriate HTTP responses.
 */
export async function updateAdmRole(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admRole',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const admRoleId = req.params.admRoleId
        const { name, description } = req.body
        const user = getUserDetail(req)
        const updatedById = user.id
        const admRole = await AdmRoles.findByPk(admRoleId)
        if (!admRole) return serviceUnavailable(res, 'No such item.')
        admRole.name = name
        admRole.description = description
        admRole.updatedById = updatedById
        const data = await admRole.save({ transaction: t })
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
 * Deletes an admin role by its ID.
 *
 * @async
 * @function deleteAdmRole
 * @param {import('express').Request} req - Express request object containing the role ID in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a response indicating the result of the deletion operation.
 *
 * @throws {Error} If an error occurs during the transaction or deletion process.
 */
export async function deleteAdmRole(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admRole',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        let data = await AdmRoles.destroy(
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
 * Retrieves users with administrative roles based on the provided query.
 *
 * @async
 * @function getAdmRoleUsers
 * @param {import('express').Request} req - Express request object containing the query in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the retrieved data or an error message.
 */
export async function getAdmRoleUsers(req, res) {
    try {
        let queryObject = decodeSequelizeQuery(req.body)
        const data = await AdmRolesUser.findAll({
            where: queryObject,
            include: ['role'],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a user to an admin role.
 *
 * This controller function checks permissions, validates the request body,
 * ensures the specified admin role and user exist, and then creates a new
 * AdmRolesUser entry within a transaction. Rolls back the transaction and
 * returns appropriate error responses if any step fails.
 *
 * @async
 * @function addAdmRoleUser
 * @param {import('express').Request} req - Express request object, expected to contain `body.roleId` and `body.userId`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function addAdmRoleUser(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admRoleUser',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const admRole = await AdmRoles.findByPk(req.body.roleId)
        if (!admRole) return serviceUnavailable(res, 'No such item.')
        const user = await User.findByPk(req.body.userId)
        if (!user) return serviceUnavailable(res, 'No such item.')
        const data = await AdmRolesUser.create(req.body, { transaction: t })
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
 * Deletes a user-role association from the AdmRolesUser table.
 *
 * @async
 * @function deleteAdmRoleUser
 * @param {import('express').Request} req - Express request object containing roleId and userId in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a response indicating the result of the deletion operation.
 *
 * @throws {Error} If an error occurs during the transaction or database operation.
 */
export async function deleteAdmRoleUser(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admRoleUser',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.roleId || !req.body.userId)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        let data = await AdmRolesUser.destroy(
            { where: { roleId: req.body.roleId, userId: req.body.userId } },
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
 * Adds a new admin permission to the system.
 *
 * This controller function validates the request, checks permissions, and creates a new
 * admin permission entry in the database within a transaction. It supports assigning permissions
 * to either a user or a role, and validates the existence of all referenced entities.
 *
 * @async
 * @function addAdmPermission
 * @param {import('express').Request} req - Express request object containing permission data in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function addAdmPermission(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admPermission',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        if (!req.body.userId && !req.body.roleId)
            return serviceUnavailable(res, 'No such item.')
        if (req.body.userId) {
            const user = await User.findByPk(req.body.userId)
            if (!user) return serviceUnavailable(res, 'No such item.')
        }
        if (req.body.roleId) {
            const admRole = await AdmRoles.findByPk(req.body.roleId)
            if (!admRole) return serviceUnavailable(res, 'No such item.')
        }
        const admFunctionalityDefinition =
            await FunctionalityDefinition.findByPk(
                req.body.admFunctionalityDefinitionId
            )
        if (!admFunctionalityDefinition)
            return serviceUnavailable(res, 'No such item.')
        if (req.body.admObjectDefinitionId) {
            const admObjectDefinition = await ObjectDefinition.findByPk(
                req.body.admObjectDefinitionId
            )
            if (!admObjectDefinition)
                return serviceUnavailable(res, 'No such item.')
        }
        const admAccessLevel = await AccessLevelDefinition.findByPk(
            req.body.admAccessLevelDefinitionId
        )
        if (!admAccessLevel) return serviceUnavailable(res, 'No such item.')
        const data = await AdmPermissions.create(req.body, { transaction: t })
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
 * Deletes an admin permission by ID.
 *
 * This function checks if the user has the required permission to delete an admin permission.
 * If authorized and a valid ID is provided in the request body, it attempts to delete the permission
 * within a transaction. Handles transaction commit/rollback and sends appropriate HTTP responses.
 *
 * @async
 * @function deleteAdmPermission
 * @param {import('express').Request} req - Express request object, expects `id` in `req.body`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends HTTP response with the result of the operation.
 */
export async function deleteAdmPermission(req, res) {
    const t = await sequelize.transaction()
    try {
        let permissionGranted = await checkPermission(
            req,
            'adm',
            'admPermission',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        let data = await AdmPermissions.destroy(
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
