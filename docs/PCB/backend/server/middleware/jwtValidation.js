import { verifyToken } from '../libs/jwtToken.js'

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
		console.error(err)
		return res.status(401).json({
			success: false,
			message: 'Unauthorized access - token is not valid.',
		})
	}
}
