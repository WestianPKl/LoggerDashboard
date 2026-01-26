import io from 'socket.io-client'

export const socket = io(import.meta.env.VITE_API_IP, {
	timeout: 5000,
	reconnectionAttempts: 3,
	reconnectionDelay: 1000,
})
