import { body } from 'express-validator'
import User from '../api/model/users/user.model.js'

/**
 * Middleware for validating the 'username' field in the request body.
 * Ensures the username is not empty and trims whitespace.
 * Returns an error message if validation fails.
 */
export const usernameLogin = body('username', 'Please insert correct data!')
    .trim()
    .notEmpty()

/**
 * Express-validator middleware for validating the 'email' field in login requests.
 * Ensures the email field is not empty, is trimmed, and is a valid email address.
 *
 * @constant
 * @type {ValidationChain}
 * @name emailLogin
 * @throws {ValidationError} If the email is empty or not a valid email address.
 */
export const emailLogin = body('email', 'Please insert correct data!')
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage('Invalid email address')

/**
 * Express-validator middleware for validating the 'password' field in a request body.
 * Ensures that the password is not empty and has a minimum length of 3 characters.
 *
 * @constant
 * @type {ValidationChain}
 * @name passwordLogin
 * @throws {Error} If the password is empty or shorter than 3 characters.
 */
export const passwordLogin = body('password', 'Please insert correct data!')
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage('Password is too short (at least 3 characters)!')

/**
 * Validation chain for the 'username' field during user registration.
 * - Trims whitespace from the input.
 * - Ensures the username is not empty.
 * - Checks asynchronously if the username already exists in the database.
 *   Rejects with an error message if the username is taken.
 *
 * @type {import('express-validator').ValidationChain}
 */
export const usernameRegister = body('username')
    .trim()
    .notEmpty()
    .withMessage('Please insert correct data!')
    .custom(async (value) => {
        const userDoc = await User.findOne({ where: { username: value } })
        if (userDoc) {
            return Promise.reject('Username exists already!')
        }
    })

/**
 * Validation chain for user registration email field.
 *
 * - Ensures the email field is not empty.
 * - Trims whitespace from the input.
 * - Validates that the input is a properly formatted email address.
 * - Checks asynchronously if the email already exists in the database.
 *   - Rejects with an error message if the email is already registered.
 *
 * @type {import('express-validator').ValidationChain}
 */
export const emailRegister = body('email')
    .notEmpty()
    .trim()
    .isEmail()
    .withMessage('Invalid email address!')
    .custom(async (value) => {
        const userDoc = await User.findOne({ where: { email: value } })
        if (userDoc) {
            return Promise.reject('Email exists already!')
        }
    })

/**
 * Express-validator middleware for validating the 'password' field during registration.
 * Ensures the password is not empty and has a minimum length of 3 characters.
 *
 * @constant
 * @type {ValidationChain}
 * @returns {ValidationChain} Validation chain for password field.
 */
export const passwordRegister = body('password')
    .notEmpty()
    .withMessage('Please insert correct data!')
    .isLength({ min: 3 })
    .withMessage('Password is too short (at least 3 characters)!')

/**
 * Middleware for validating the 'confirmPassword' field during registration.
 * Ensures that the field is not empty and matches the 'password' field in the request body.
 *
 * @type {import('express').RequestHandler}
 * @throws {Error} If 'confirmPassword' does not match 'password'.
 */
export const confirmPasswordRegister = body(
    'confirmPassword',
    'Please insert correct data!'
)
    .notEmpty()
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match!')
        }
        return true
    })

/**
 * Middleware that validates the 'name' field in the request body.
 * Ensures that the 'name' field is not empty.
 * Returns an error message "Please insert correct data!" if validation fails.
 */
export const dataName = body('name', 'Please insert correct data!').notEmpty()
/**
 * Express-validator middleware that checks if the 'unit' field in the request body is not empty.
 * Returns an error message "Please insert correct data!" if validation fails.
 */
export const dataUnit = body('unit', 'Please insert correct data!').notEmpty()
/**
 * Middleware that validates the 'value' field in the request body.
 * Ensures that the 'value' field is not empty.
 *
 * @type {import('express').RequestHandler}
 * @returns {import('express-validator').ValidationChain}
 * @example
 * // Usage in an Express route
 * app.post('/endpoint', dataValue, (req, res) => { ... });
 */
export const dataValue = body('value', 'Please insert correct data!').notEmpty()
/**
 * Middleware that validates the 'description' field in the request body.
 * Ensures the field is not empty and returns an error message if validation fails.
 *
 * @type {import('express').RequestHandler}
 */
export const dataDescription = body(
    'description',
    'Please insert correct data!'
).notEmpty()
/**
 * Middleware that validates the 'dataDefinitionId' field in the request body.
 * Ensures the field is not empty and returns an error message if validation fails.
 *
 * @type {import('express').RequestHandler}
 */
export const dataDataDefinitionId = body(
    'dataDefinitionId',
    'Please insert correct data!'
).notEmpty()
/**
 * Express-validator middleware that checks if the 'dataLogId' field exists and is not empty in the request body.
 * Returns an error message "Please insert correct data!" if validation fails.
 */
export const dataDataLogId = body(
    'dataLogId',
    'Please insert correct data!'
).notEmpty()

/**
 * Middleware to validate the 'processTypeId' field in the request body.
 * Ensures that 'processTypeId' is not empty.
 *
 * @type {import('express').RequestHandler}
 * @returns {import('express-validator').ValidationChain}
 */
export const processProcessTypeId = body(
    'processTypeId',
    'Please insert correct data!'
).notEmpty()

// ADM / ADMIN
/**
 * Middleware that validates the 'accessLevel' field in the request body.
 * Ensures the field is not empty and returns an error message if validation fails.
 *
 * @type {import('express').RequestHandler}
 */
export const admAccessLevel = body(
    'accessLevel',
    'Please insert correct data!'
).notEmpty()
/**
 * Middleware to validate that the 'floorId' field exists and is not empty in the request body.
 * Returns an error message "Please insert correct data!" if validation fails.
 */
export const houseFloorId = body(
    'floorId',
    'Please insert correct data!'
).notEmpty()
/**
 * Middleware that validates the 'postalCode' field in the request body.
 * Ensures the field is not empty and returns an error message if validation fails.
 *
 * @type {import('express').RequestHandler}
 */
export const housePostalCode = body(
    'postalCode',
    'Please insert correct data!'
).notEmpty()
/**
 * Middleware that validates the 'street' field in the request body.
 * Ensures the field is not empty and returns an error message if validation fails.
 *
 * @type {import('express').RequestHandler}
 */
export const houseStreet = body(
    'street',
    'Please insert correct data!'
).notEmpty()
/**
 * Middleware to validate the 'houseNumber' field in the request body.
 * Ensures that the 'houseNumber' field is not empty.
 *
 * @type {import('express-validator').ValidationChain}
 */
export const houseNumber = body(
    'houseNumber',
    'Please insert correct data!'
).notEmpty()
/**
 * Middleware that validates the 'layout' field in the request body.
 * Ensures that the 'layout' field is not empty.
 *
 * @type {import('express').RequestHandler}
 * @throws {Error} If the 'layout' field is missing or empty, responds with an error message: "Please insert correct data!"
 */
export const houseLayout = body(
    'layout',
    'Please insert correct data!'
).notEmpty()
/**
 * Middleware to validate that the 'houseId' field is present and not empty in the request body.
 * Returns an error message "Please insert correct data!" if validation fails.
 */
export const houseHouseId = body(
    'houseId',
    'Please insert correct data!'
).notEmpty()
/**
 * Middleware for validating the 'roleId' field in the request body.
 * Ensures that 'roleId' is not empty.
 *
 * @type {import('express').RequestHandler}
 */
export const admRoleId = body(
    'roleId',
    'Please insert correct data!'
).notEmpty()
/**
 * Middleware that validates the 'userId' field in the request body.
 * Ensures that 'userId' is not empty.
 *
 * @type {import('express').RequestHandler}
 * @returns {import('express-validator').ValidationChain}
 */
export const admUserId = body(
    'userId',
    'Please insert correct data!'
).notEmpty()
/**
 * Middleware that validates the presence of the 'admFunctionalityDefinitionId' field in the request body.
 * Ensures the field is not empty and returns an error message if validation fails.
 *
 * @type {ValidationChain}
 * @returns {ValidationChain} Express-validator middleware for validating 'admFunctionalityDefinitionId'.
 */
export const admFunctionalityDefinitionId = body(
    'admFunctionalityDefinitionId',
    'Please insert correct data!'
).notEmpty()
/**
 * Express-validator middleware that checks if the 'admObjectDefinitionId' field
 * is present and not empty in the request body.
 *
 * @type {import('express-validator').ValidationChain}
 * @throws {Error} Will return an error message 'Please insert correct data!' if the field is empty.
 */
export const admObjectDefinitionId = body(
    'admObjectDefinitionId',
    'Please insert correct data!'
).notEmpty()
/**
 * Middleware that validates the 'admAccessLevelDefinitionId' field in the request body.
 * Ensures the field is not empty and returns an error message if validation fails.
 *
 * @type {import('express-validator').ValidationChain}
 */
export const admAccessLevelDefinitionId = body(
    'admAccessLevelDefinitionId',
    'Please insert correct data!'
).notEmpty()

/**
 * Middleware that validates the 'serialNumber' field in the request body.
 * Ensures that the 'serialNumber' field is not empty.
 *
 * @type {import('express').RequestHandler}
 */
export const equipmentSerialNumber = body('serialNumber').notEmpty()
/**
 * Middleware that validates the 'equVendorId' field in the request body.
 * Ensures the field is present and contains a numeric value.
 *
 * @type {import('express-validator').ValidationChain}
 */
export const equipmentVendor = body('equVendorId').notEmpty().isNumeric()
/**
 * Express-validator middleware that checks if the 'equModelId' field exists in the request body
 * and is a numeric value.
 *
 * @constant
 * @type {ValidationChain}
 * @name equipmentModel
 * @summary Validates that 'equModelId' is present and numeric in the request body.
 */
export const equipmentModel = body('equModelId').notEmpty().isNumeric()
/**
 * Express-validator middleware that checks if the 'equTypeId' field in the request body
 * is present and is a numeric value.
 *
 * @constant
 * @type {ValidationChain}
 */
export const equipmentType = body('equTypeId').notEmpty().isNumeric()

/**
 * Middleware that validates the presence of the 'equLoggerId' field in the request body.
 * Ensures that 'equLoggerId' is not empty.
 *
 * @type {import('express-validator').ValidationChain}
 */
export const houseEquLogger = body('equLoggerId').notEmpty()
/**
 * Middleware that validates the 'equSensorId' field in the request body.
 * Ensures that the 'equSensorId' is not empty.
 *
 * @type {import('express-validator').ValidationChain}
 */
export const equSensor = body('equSensorId').notEmpty()
/**
 * Middleware that validates the 'houseLoggerId' field in the request body.
 * Ensures that the 'houseLoggerId' is present and not empty.
 *
 * @type {import('express-validator').ValidationChain}
 */
export const houseLoggerId = body('houseLoggerId').notEmpty()

export const usernameReset = body('username')
    .trim()
    .notEmpty()
    .withMessage('Please insert correct data!')

/**
 * Express-validator middleware for validating the 'email' field in password reset requests.
 * Ensures the field is not empty, trims whitespace, and checks for a valid email format.
 * Returns an error message if validation fails.
 */
export const emailReset = body('email')
    .notEmpty()
    .trim()
    .isEmail()
    .withMessage('Invalid email address!')

/**
 * Validation middleware for the 'message' field in the request body.
 * Ensures that the 'message' field is not empty.
 * Returns an error message "Please insert correct data!" if validation fails.
 */
export const errorMessage = body(
    'message',
    'Please insert correct data!'
).notEmpty()
/**
 * Express-validator middleware that checks if the 'type' field in the request body is not empty.
 * If the field is empty, it returns an error message: 'Please insert correct data!'.
 *
 * @constant
 * @type {ValidationChain}
 */
export const errorType = body('type', 'Please insert correct data!').notEmpty()
/**
 * Middleware that validates the 'severity' field in the request body.
 * Ensures that the 'severity' field is not empty.
 *
 * @type {import('express').RequestHandler}
 * @returns {import('express').RequestHandler} Express middleware for validation.
 */
export const errorSeverity = body(
    'severity',
    'Please insert correct data!'
).notEmpty()
