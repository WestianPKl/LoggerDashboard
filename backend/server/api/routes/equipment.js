import '@babel/polyfill'
import express from 'express'
import {
    getEquTypes,
    getEquType,
    addEquType,
    updateEquType,
    deleteEquType,
    getEquVendors,
    getEquVendor,
    addEquVendor,
    updateEquVendor,
    deleteEquVendor,
    getEquModels,
    getEquModel,
    addEquModel,
    updateEquModel,
    deleteEquModel,
    getEquipments,
    getEquipmentsAdmin,
    getEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    restoreEquipment,
    getEquUnusedLoggers,
    addEquSensorFunction,
    deleteEquSensorFunction,
    deleteEquipmentForced,
} from '../controller/equipment.controller.js'
import {
    dataName,
    equipmentSerialNumber,
    equipmentVendor,
    equipmentModel,
    equipmentType,
} from '../../middleware/body-validation.js'
import validateToken from '../../middleware/jwtValidation.js'

/**
 * Express router for handling equipment-related API routes.
 * @type {import('express').Router}
 */
const router = express.Router()

router.post('/equ-types', validateToken, getEquTypes)
router.get('/equ-type/:equTypeId', validateToken, getEquType)
router.post('/equ-type', validateToken, [dataName], addEquType)
router.patch('/equ-type/:equTypeId', validateToken, [dataName], updateEquType)
router.delete('/equ-type/:equTypeId', validateToken, deleteEquType)
router.post('/equ-vendors', validateToken, getEquVendors)
router.get('/equ-vendor/:equVendorId', validateToken, getEquVendor)
router.post('/equ-vendor', validateToken, [dataName], addEquVendor)
router.patch(
    '/equ-vendor/:equVendorId',
    validateToken,
    [dataName],
    updateEquVendor
)
router.delete('/equ-vendor/:equVendorId', validateToken, deleteEquVendor)
router.post('/equ-models', validateToken, getEquModels)
router.get('/equ-model/:equModelId', validateToken, getEquModel)
router.post('/equ-model', validateToken, [dataName], addEquModel)
router.patch(
    '/equ-model/:equModelId',
    validateToken,
    [dataName],
    updateEquModel
)
router.delete('/equ-model/:equModelId', validateToken, deleteEquModel)
router.post('/equipments', validateToken, getEquipments)
router.post('/equipments-admin', validateToken, getEquipmentsAdmin)
router.get('/equipment/:equipmentId', validateToken, getEquipment)
router.post(
    '/equipment',
    validateToken,
    [equipmentSerialNumber, equipmentVendor, equipmentModel, equipmentType],
    addEquipment
)
router.patch(
    '/equipment/:equipmentId',
    validateToken,
    [equipmentSerialNumber, equipmentVendor, equipmentModel, equipmentType],
    updateEquipment
)
router.delete('/equipment/:equipmentId', validateToken, deleteEquipment)
router.delete(
    '/equipment-forced/:equipmentId',
    validateToken,
    deleteEquipmentForced
)
router.patch('/equipment-restore/:equipmentId', validateToken, restoreEquipment)
router.post('/equ-unused-loggers', validateToken, getEquUnusedLoggers)
router.post('/equ-sensor-function', validateToken, addEquSensorFunction)
router.delete(
    '/equ-sensor-function/:equSensorId',
    validateToken,
    deleteEquSensorFunction
)

export default router
