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
import { getUserDetail } from '../../libs/jwtToken.js'
import { validationResult } from 'express-validator'
import HouseLogger from '../model/house/houseLogger.model.js'
import Equipment from '../model/equipment/equipment.model.js'
import House from '../model/house/house.model.js'
import HouseFloors from '../model/house/houseFloors.model.js'
import { deleteFile } from '../../middleware/file.js'
import path from 'path'
import sharp from 'sharp'

const Op = Sequelize.Op

/**
 * Retrieves a list of houses from the database based on the provided query.
 * Checks user permissions before fetching data.
 *
 * @async
 * @function getHouses
 * @param {import('express').Request} req - Express request object containing query parameters and user info.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the list of houses or an error message.
 */
export async function getHouses(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await House.findAll({
            where: queryObject,
            include: ['createdBy', 'updatedBy'],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves a house by its ID, including its floors, loggers, and related equipment details.
 * Checks user permissions before accessing the data.
 *
 * @async
 * @function getHouse
 * @param {import('express').Request} req - Express request object, expects `houseId` in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the house data or an error message.
 */
export async function getHouse(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const houseId = req.params.houseId
        const data = await House.findByPk(houseId, {
            include: [
                {
                    model: HouseFloors,
                    as: 'floors',
                    include: [
                        {
                            model: HouseLogger,
                            as: 'loggers',
                            include: [
                                {
                                    model: Equipment,
                                    as: 'logger',
                                    include: ['vendor', 'model'],
                                },
                            ],
                        },
                    ],
                },
                'createdBy',
                'updatedBy',
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
 * Adds a new house entry to the database.
 *
 * Handles file upload for house pictures, validates request data, checks user permissions,
 * and emits a socket event upon successful creation. Rolls back the transaction on error.
 *
 * @async
 * @function addHouse
 * @param {import('express').Request} req - Express request object, containing house data and optional file upload.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the operation.
 */
export async function addHouse(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            'houseHouse',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const user = getUserDetail(req)
        let pictureLink = null
        let pictureLinkBig = null
        if (req.file !== undefined) {
            user.pictureLinkBig = req.file.path
            const ext = path.extname(req.file.filename)
            const thumbPath = req.file.path.replace(ext, `.thumb${ext}`)
            await sharp(req.file.path)
                .resize({
                    width: 300,
                    height: 300,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .toFile(thumbPath)
            pictureLink = thumbPath
        }
        let queryObject = {
            ...req.body,
            pictureLink: pictureLink,
            pictureLinkBig: pictureLinkBig,
            createdById: user.id,
            updatedById: user.id,
        }
        const data = await House.create(queryObject, { transaction: t })
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
        if (io) io.sockets.emit('house', 'add')
        return success(res, 'Data added successfully', data)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Updates an existing house record with new data.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object, containing house data in the body and houseId in params. May include a file upload.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response with the result of the update operation.
 *
 * @throws {Error} Returns a 500 Internal Server Error response if an unexpected error occurs.
 *
 * @description
 * - Checks user permissions for updating a house.
 * - Validates request data.
 * - Updates house fields and handles optional image upload (including thumbnail generation).
 * - Deletes old images if a new one is uploaded.
 * - Saves changes within a transaction.
 * - Emits a socket event on successful update.
 * - Handles and responds to various error conditions.
 */
export async function updateHouse(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            'houseHouse',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const houseId = req.params.houseId
        const { name, postalCode, city, street, houseNumber } = req.body
        const user = getUserDetail(req)
        const house = await House.findByPk(houseId)
        if (!house) return serviceUnavailable(res, 'No such item.')
        house.name = name
        house.postalCode = postalCode
        house.city = city
        house.street = street
        house.houseNumber = houseNumber
        house.updatedById = user.id

        if (req.file !== undefined) {
            if (house.pictureLink) {
                try {
                    deleteFile(house.pictureLink)
                } catch (err) {
                    console.log('Picture (thumb) delete error:', err)
                }
            }
            if (house.pictureLink) {
                try {
                    deleteFile(house.pictureLink)
                } catch (err) {
                    console.log('PictureBig delete error:', err)
                }
            }
            house.pictureLinkBig = req.file.path
            const ext = path.extname(req.file.filename)
            const thumbPath = req.file.path.replace(ext, `.thumb${ext}`)
            await sharp(req.file.path)
                .resize({
                    width: 300,
                    height: 300,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .toFile(thumbPath)

            house.pictureLink = thumbPath
        }

        const data = await house.save({ transaction: t })
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
        if (io) io.sockets.emit('house', 'update')
        return success(res, 'Data updated successfully', data)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Deletes a house record from the database.
 *
 * This function checks user permissions, deletes associated picture files if present,
 * and removes the house entry from the database within a transaction. Emits a socket event
 * on successful deletion.
 *
 * @async
 * @function deleteHouse
 * @param {import('express').Request} req - Express request object, expects `body.id` for the house ID.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the operation.
 */
export async function deleteHouse(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            'houseHouse',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        const house = await House.findOne({ where: { id: req.body.id } })
        if (house && house.pictureLink) {
            try {
                deleteFile(house.pictureLink)
            } catch (err) {
                console.log(err)
            }
        }

        if (house && house.pictureLinkBig) {
            try {
                deleteFile(house.pictureLinkBig)
            } catch (err) {
                console.log(err)
            }
        }

        const data = await House.destroy(
            { where: { id: req.body.id } },
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
        if (io) io.sockets.emit('house', 'delete')
        return success(res, 'Data deleted successfully', data)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves house floor data based on the provided query in the request body.
 * Checks user permissions before querying the database.
 *
 * @async
 * @function getHouseFloors
 * @param {import('express').Request} req - Express request object containing user and query data.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the retrieved data or an error message.
 */
export async function getHouseFloors(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await HouseFloors.findAll({
            where: queryObject,
            include: ['house'],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Retrieves a specific house floor by its ID, including its associated house.
 *
 * @async
 * @function getHouseFloor
 * @param {import('express').Request} req - Express request object, expects `houseFloorId` in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Returns a response with the house floor data if found and permission is granted.
 *
 * @throws {Error} Returns an internal server error response if an exception occurs.
 */
export async function getHouseFloor(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const houseFloorId = req.params.houseFloorId
        const data = await HouseFloors.findByPk(houseFloorId, {
            include: ['house'],
        })
        if (!data) return serviceUnavailable(res, 'Retrieving data failed.')
        return success(res, 'Data retrieved successfully', data)
    } catch (err) {
        console.log(err)
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Adds a new house floor to the database.
 *
 * Handles file upload for layout images, generates a thumbnail, validates input,
 * checks user permissions, and creates a new HouseFloor record within a transaction.
 *
 * @async
 * @function addHouseFloor
 * @param {import('express').Request} req - Express request object, containing body, file, and user info.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response with the operation result.
 */
export async function addHouseFloor(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            'houseFloor',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const user = getUserDetail(req)
        let layout = null
        let layoutBig = null
        if (req.file !== undefined) {
            user.layoutBig = req.file.path
            const ext = path.extname(req.file.filename)
            const thumbPath = req.file.path.replace(ext, `.thumb${ext}`)
            await sharp(req.file.path)
                .resize({
                    width: 800,
                    height: 800,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .toFile(thumbPath)

            layout = thumbPath
        }
        let queryObject = {
            ...req.body,
            layout: layout,
            layoutBig: layoutBig,
            createdById: user.id,
            updatedById: user.id,
        }
        const data = await HouseFloors.create(queryObject, { transaction: t })
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
 * Updates a house floor entry in the database.
 *
 * This controller function handles updating the details of a house floor, including its name, associated house,
 * and layout images. It performs permission checks, request validation, and manages file uploads for layout images.
 * If a new layout image is provided, it deletes the old images, saves the new one, and generates a thumbnail.
 * All operations are performed within a transaction.
 *
 * @async
 * @function updateHouseFloor
 * @param {import('express').Request} req - Express request object, expects `houseFloorId` param and body with `name` and `houseId`. Optionally includes a file upload.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function updateHouseFloor(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            'houseFloor',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const houseFloorId = req.params.houseFloorId
        const { name, houseId } = req.body
        const user = getUserDetail(req)
        const houseFloor = await HouseFloors.findByPk(houseFloorId)
        if (!houseFloor) return serviceUnavailable(res, 'No such item.')
        houseFloor.name = name
        houseFloor.houseId = houseId
        houseFloor.updatedById = user.id

        if (req.file !== undefined) {
            if (houseFloor.layout) {
                try {
                    deleteFile(houseFloor.layout)
                } catch (err) {
                    console.log('Layout (thumb) delete error:', err)
                }
            }
            if (houseFloor.layoutBig) {
                try {
                    deleteFile(houseFloor.layoutBig)
                } catch (err) {
                    console.log('LayoutBig delete error:', err)
                }
            }
            houseFloor.layoutBig = req.file.path
            const ext = path.extname(req.file.filename)
            const thumbPath = req.file.path.replace(ext, `.thumb${ext}`)
            await sharp(req.file.path)
                .resize({
                    width: 800,
                    height: 800,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .toFile(thumbPath)

            houseFloor.layout = thumbPath
        }
        const data = await houseFloor.save({ transaction: t })
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
 * Updates the position (posX, posY) of multiple logger records in the database.
 *
 * @async
 * @param {Array<{id: number, posX: number, posY: number}>} loggers - An array of logger objects containing the id and new position coordinates.
 * @returns {Promise<void>} Resolves when all logger positions have been updated.
 */
async function updateLoggerPosition(loggers) {
    if (Array.isArray(loggers) && loggers.length > 0) {
        for (const e of loggers) {
            let logger = await HouseLogger.findByPk(e.id)
            if (logger) {
                logger.posX = e.posX
                logger.posY = e.posY
                await logger.save()
            }
        }
    }
}

/**
 * Updates the layout details of a house floor, including position, zoom, and associated loggers.
 *
 * @async
 * @function updateHouseFloorLayout
 * @param {import('express').Request} req - Express request object containing houseFloorId in params and layout data in body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 *
 * @throws {Error} Returns an internal server error response if an exception occurs.
 *
 * @description
 * - Checks user permission for updating house floor layout.
 * - Validates request body.
 * - Updates house floor layout properties (x, y, zoom, posX, posY).
 * - Updates logger positions.
 * - Handles transaction commit/rollback and sends appropriate responses.
 */
export async function updateHouseFloorLayout(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            'houseFloor',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const houseFloorId = req.params.houseFloorId
        const { x, y, loggers, zoom, posX, posY } = req.body
        const user = getUserDetail(req)
        const houseFloor = await HouseFloors.findByPk(houseFloorId)
        if (!houseFloor) return serviceUnavailable(res, 'No such item.')
        houseFloor.updatedById = user.id
        houseFloor.x = x
        houseFloor.y = y
        houseFloor.zoom = zoom
        houseFloor.posX = posX
        houseFloor.posY = posY
        const data = await houseFloor.save({ transaction: t })
        await updateLoggerPosition(loggers)
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
 * Deletes a house floor entry from the database, including associated layout files.
 *
 * @async
 * @function deleteHouseFloor
 * @param {import('express').Request} req - Express request object, expects `body.id` for the house floor ID.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the deletion.
 *
 * @throws {Error} If an error occurs during the transaction or file deletion.
 *
 * @description
 * - Checks user permissions for deleting a house floor.
 * - Validates the presence of the house floor ID in the request body.
 * - Deletes associated layout files if they exist.
 * - Removes the house floor record from the database within a transaction.
 * - Handles transaction commit/rollback and sends appropriate HTTP responses.
 */
export async function deleteHouseFloor(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            'houseFloor',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        const houseFloor = await HouseFloors.findOne({
            where: { id: req.body.id },
        })
        if (houseFloor && houseFloor.layout) {
            try {
                deleteFile(houseFloor.layout)
            } catch (err) {
                console.log(err)
            }
        }
        if (houseFloor && houseFloor.layoutBig) {
            try {
                deleteFile(houseFloor.layoutBig)
            } catch (err) {
                console.log(err)
            }
        }
        const data = await HouseFloors.destroy(
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
 * Retrieves house logger data based on the provided query and user permissions.
 *
 * @async
 * @function getHouseLoggers
 * @param {import('express').Request} req - Express request object containing user and query information.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response with the retrieved data or an error message.
 */
export async function getHouseLoggers(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const queryObject = decodeSequelizeQuery(req.body)
        const data = await HouseLogger.findAll({
            where: queryObject,
            include: [
                {
                    model: Equipment,
                    as: 'logger',
                    include: ['vendor', 'model', 'type'],
                },
                'floor',
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
 * Retrieves a house logger by its ID, including related equipment and floor information.
 * Checks user permissions before accessing the data.
 *
 * @async
 * @function getHouseLogger
 * @param {import('express').Request} req - Express request object, expects `houseLoggerId` in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the house logger data or an error message.
 */
export async function getHouseLogger(req, res) {
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            null,
            'READ'
        )
        if (!permissionGranted) return unauthorized(res)
        const houseLoggerId = req.params.houseLoggerId
        const data = await HouseLogger.findByPk(houseLoggerId, {
            include: [
                {
                    model: Equipment,
                    as: 'logger',
                    include: ['vendor', 'model', 'type'],
                },
                'floor',
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
 * Adds a new HouseLogger entry to the database.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object containing the logger data in the body.
 * @param {import('express').Response} res - Express response object used to send the response.
 * @returns {Promise<void>} Sends a JSON response indicating success or failure.
 *
 * @throws {Error} Returns an internal server error response if an exception occurs.
 *
 * @description
 * - Checks user permissions for adding a house logger.
 * - Validates the request body.
 * - Verifies the existence and type of the associated Equipment.
 * - Creates a new HouseLogger entry within a transaction.
 * - Rolls back the transaction and returns an error if creation fails.
 * - On success, commits the transaction and returns the created logger with related data.
 */
export async function addHouseLogger(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            'houseLogger',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const equLogger = await Equipment.findByPk(req.body.equLoggerId, {
            include: ['vendor', 'model', 'type'],
        })
        if (!equLogger || !equLogger.type || equLogger.type.name !== 'Logger') {
            return serviceUnavailable(res, 'No such item.')
        }
        const data = await HouseLogger.create(req.body, { transaction: t })
        if (!data) {
            await t.rollback()
            return serviceUnavailable(res, 'Retrieving data failed.')
        }
        await t.commit()
        const logger = await HouseLogger.findByPk(data.id, {
            include: [
                {
                    model: Equipment,
                    as: 'logger',
                    include: ['vendor', 'model', 'type'],
                },
                'floor',
            ],
        })
        return success(res, 'Data added successfully', logger)
    } catch (err) {
        console.log(err)
        if (t) await t.rollback()
        return internalServerError(res, 'Error has occured.', err)
    }
}

/**
 * Updates a HouseLogger entry with new equipment, floor, and position data.
 *
 * @async
 * @function updateHouseLogger
 * @param {import('express').Request} req - Express request object containing parameters and body data.
 * @param {import('express').Response} res - Express response object used to send responses.
 * @returns {Promise<void>} Sends an HTTP response with the result of the update operation.
 *
 * @throws {Error} Returns a 500 Internal Server Error if an unexpected error occurs.
 *
 * @description
 * - Checks user permissions for updating a house logger.
 * - Validates request data.
 * - Verifies existence of the HouseLogger, HouseFloor, and Equipment (must be of type 'Logger').
 * - Updates the HouseLogger with new equipment, floor, and position.
 * - Uses a transaction to ensure atomicity.
 * - Handles and responds to various error conditions.
 */
export async function updateHouseLogger(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            'houseLogger',
            'WRITE'
        )
        if (!permissionGranted) return unauthorized(res)
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return wrongValidation(res, 'Validation failed.', errors.array())
        const houseLoggerId = req.params.houseLoggerId
        const { equLoggerId, houseFloorId, posX, posY } = req.body
        const houseLogger = await HouseLogger.findByPk(houseLoggerId)
        if (!houseLogger) return serviceUnavailable(res, 'No such item.')
        const houseFloor = await HouseFloors.findByPk(houseFloorId)
        if (!houseFloor) return serviceUnavailable(res, 'No such item.')
        const equLogger = await Equipment.findByPk(equLoggerId, {
            include: ['vendor', 'model', 'type'],
        })
        if (!equLogger || !equLogger.type || equLogger.type.name !== 'Logger') {
            return serviceUnavailable(res, 'No such item.')
        }
        houseLogger.equLoggerId = equLoggerId
        houseLogger.houseFloorId = houseFloorId
        houseLogger.posX = posX
        houseLogger.posY = posY
        const data = await houseLogger.save({ transaction: t })
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
 * Deletes a house logger entry by ID.
 *
 * @async
 * @function deleteHouseLogger
 * @param {import('express').Request} req - Express request object, expects `id` in `req.body`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends an HTTP response indicating the result of the deletion.
 *
 * @throws {Error} If an error occurs during the transaction or deletion process.
 */
export async function deleteHouseLogger(req, res) {
    const t = await sequelize.transaction()
    try {
        const permissionGranted = await checkPermission(
            req,
            'house',
            'houseLogger',
            'DELETE'
        )
        if (!permissionGranted) return unauthorized(res)
        if (!req.body.id)
            return serviceUnavailable(res, 'Deleting data failed - no ID.')
        const data = await HouseLogger.destroy(
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
