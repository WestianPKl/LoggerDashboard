import { verifyToken } from '../libs/jwtToken.js'

/**
 * Express middleware to validate JWT tokens from the Authorization header.
 *
 * Checks for the presence of a Bearer token in the Authorization header,
 * verifies its validity, and attaches the decoded user information to the request object.
 * Responds with 401 Unauthorized if the token is missing, invalid, or expired.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
export default function validateToken(req, res, next) {
    const authHeader = req.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access - token missing.',
        })
    }
    const token = authHeader.split(' ')[1]
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access - token does not exist.',
        })
    }
    try {
        const decoded = verifyToken(token)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access - token is not valid.',
        })
    }
}
