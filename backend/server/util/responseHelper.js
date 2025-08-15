/**
 * Sends a standardized 500 Internal Server Error response.
 *
 * @param {import('express').Response} res - The Express response object.
 * @param {string} [log=''] - Optional log message to output to the console.
 * @param {any} [err] - Optional error object to log and include in the response (only in non-production environments).
 * @returns {import('express').Response} The response object with the error JSON.
 */
export function internalServerError(res, log = '', err) {
    if (log && err) {
        console.error('SERVER ERROR:', log, err)
    }
    return res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        ...(process.env.NODE_ENV !== 'production' && err ? { data: err } : {}),
    })
}

/**
 * Sends a 401 Unauthorized response with a custom or default message.
 *
 * @param {import('express').Response} res - The Express response object.
 * @param {string} [msg='Access forbidden. Not enough permissions.'] - Optional custom error message.
 * @returns {import('express').Response} The response object with the 401 status and JSON payload.
 */
export function unauthorized(
    res,
    msg = 'Access forbidden. Not enough permissions.'
) {
    return res.status(401).json({
        success: false,
        message: msg,
    })
}

/**
 * Sends a 404 Not Found JSON response with a customizable message.
 *
 * @param {import('express').Response} res - The Express response object.
 * @param {string} [msg='Not found.'] - Optional custom message for the response.
 * @returns {import('express').Response} The response object with the 404 status and JSON payload.
 */
export function notFound(res, msg = 'Not found.') {
    return res.status(404).json({
        success: false,
        message: msg,
    })
}

/**
 * Sends a 400 Bad Request response with a standardized JSON structure.
 *
 * @param {import('express').Response} res - The Express response object.
 * @param {string} [msg='Bad request.'] - Optional custom error message.
 * @param {Object} [data={}] - Optional additional data to include in the response.
 * @returns {import('express').Response} The response object with the JSON payload.
 */
export function badRequest(res, msg = 'Bad request.', data = {}) {
    const resp = {
        success: false,
        message: msg,
    }
    if (data && Object.keys(data).length > 0) resp.data = data
    return res.status(400).json(resp)
}

/**
 * Sends a standardized JSON response for validation errors.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {string} [msg='Validation failed.'] - Optional custom error message.
 * @param {Object} [data={}] - Optional additional data to include in the response.
 * @returns {import('express').Response} The response object with status 422 and error details.
 */
export function wrongValidation(res, msg = 'Validation failed.', data = {}) {
    const resp = {
        success: false,
        message: msg,
    }
    if (data && Object.keys(data).length > 0) resp.data = data
    return res.status(422).json(resp)
}

/**
 * Sends a 503 Service Unavailable response with a JSON payload.
 *
 * @param {import('express').Response} res - The Express response object.
 * @param {string} [msg='Service unavailable.'] - Optional custom message to include in the response.
 * @returns {import('express').Response} The response object with the 503 status and JSON body.
 */
export function serviceUnavailable(res, msg = 'Service unavailable.') {
    return res.status(503).json({
        success: false,
        message: msg,
    })
}

/**
 * Sends a standardized success response with a message and optional data.
 *
 * @param {import('express').Response} res - The Express response object.
 * @param {string} [msg='OK'] - The success message to send.
 * @param {*} [data] - Optional data to include in the response.
 * @returns {import('express').Response} The response object with the JSON payload.
 */
export function success(res, msg = 'OK', data) {
    const resp = {
        success: true,
        message: msg,
    }
    if (data !== undefined) resp.data = data
    return res.status(200).json(resp)
}

/**
 * Sends a 201 Created HTTP response with a success message and optional data.
 *
 * @param {import('express').Response} res - The Express response object.
 * @param {string} [msg='Resource created.'] - Optional custom success message.
 * @param {*} [data] - Optional data to include in the response.
 * @returns {import('express').Response} The response object with the JSON payload.
 */
export function created(res, msg = 'Resource created.', data) {
    const resp = {
        success: true,
        message: msg,
    }
    if (data !== undefined) resp.data = data
    return res.status(201).json(resp)
}
