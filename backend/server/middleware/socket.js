import { Server } from 'socket.io'

let io = null

const ioMock = {
    sockets: { emit: () => {} },
}

/**
 * Initializes and configures a Socket.IO server instance with CORS settings.
 *
 * @param {import('http').Server} server - The HTTP server to attach Socket.IO to.
 * @returns {import('socket.io').Server} The initialized Socket.IO server instance.
 */
export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_ORIGIN?.split(',') || [
                'http://localhost:5173',
                'http://192.168.18.6:3000',
            ],
        },
    })
    return io
}

/**
 * Retrieves the initialized Socket.io instance.
 *
 * @throws {Error} If Socket.io is not initialized and not in test environment.
 * @returns {Object} The Socket.io instance, or a mock object with an `emit` method in test environment.
 */
export function getIo() {
    if (!io) {
        if (process.env.NODE_ENV === 'test')
            return { sockets: { emit: () => {} } }
        throw new Error('Socket.io not initialized')
    }
    return io
}
