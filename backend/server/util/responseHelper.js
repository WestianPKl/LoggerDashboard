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

export function unauthorized(
	res,
	msg = 'Access forbidden. Not enough permissions.'
) {
	return res.status(401).json({
		success: false,
		message: msg,
	})
}

export function notFound(res, msg = 'Not found.') {
	return res.status(404).json({
		success: false,
		message: msg,
	})
}

export function badRequest(res, msg = 'Bad request.', data = {}) {
	const resp = {
		success: false,
		message: msg,
	}
	if (data && Object.keys(data).length > 0) resp.data = data
	return res.status(400).json(resp)
}

export function wrongValidation(res, msg = 'Validation failed.', data = {}) {
	const resp = {
		success: false,
		message: msg,
	}
	if (data && Object.keys(data).length > 0) resp.data = data
	return res.status(422).json(resp)
}

export function serviceUnavailable(res, msg = 'Service unavailable.') {
	return res.status(503).json({
		success: false,
		message: msg,
	})
}

export function success(res, msg = 'OK', data) {
	const resp = {
		success: true,
		message: msg,
	}
	if (data !== undefined) resp.data = data
	return res.status(200).json(resp)
}

export function created(res, msg = 'Resource created.', data) {
	const resp = {
		success: true,
		message: msg,
	}
	if (data !== undefined) resp.data = data
	return res.status(201).json(resp)
}
