import '@babel/polyfill'
import app from '../app.js'
import http from 'http'
import 'dotenv/config'
import { initSocket } from '../middleware/socket.js'

/**
 * Determines the port number to use for the server based on the current environment.
 * In production, it uses the value of process.env.PORT_PROD or defaults to '8000'.
 * In other environments, it uses process.env.PORT_DEV or defaults to '3000'.
 * The selected value is then normalized by the normalizePort function.
 *
 * @constant {number|string} port - The normalized port number or named pipe for the server to listen on.
 */
const port = normalizePort(
    process.env.NODE_ENV === 'production'
        ? process.env.PORT_PROD || '8000'
        : process.env.PORT_DEV || '3000'
)
app.set('port', port)

/**
 * Creates an HTTP server instance using the provided Express application.
 * @type {import('http').Server}
 */
const server = http.createServer(app)
server.listen(port)
server.on('error', onError)
server.on('listening', () => {
    const addr = server.address()
    console.log(
        `Server listening on ${typeof addr === 'string' ? addr : addr?.port}`
    )
})

initSocket(server)

/**
 * Normalizes a port into a number, string, or false.
 *
 * @param {string|number} val - The port value to normalize.
 * @returns {number|string|false} The normalized port number, named pipe string, or false if invalid.
 */
function normalizePort(val) {
    const port = parseInt(val, 10)
    if (isNaN(port)) return val
    if (port >= 0) return port
    return false
}

/**
 * Handles server errors during startup, specifically errors related to listening on a port.
 * Logs appropriate error messages and exits the process for known error codes.
 *
 * @param {NodeJS.ErrnoException} error - The error object thrown during server startup.
 * @throws Will re-throw the error if it is not related to 'listen' syscall or is an unknown error code.
 */
function onError(error) {
    if (error.syscall !== 'listen') throw error
    switch (error.code) {
        case 'EACCES':
            console.error(`${port} requires elevated privileges`)
            process.exit(1)
        case 'EADDRINUSE':
            console.error(`${port} is already in use`)
            process.exit(1)
        default:
            throw error
    }
}
