import io from 'socket.io-client'

console.log(import.meta.env.VITE_API_IP)
export const socket = io(import.meta.env.VITE_API_IP)

socket.on('connect', () => {
	console.log('WebSocket connected')
})
socket.on('disconnect', () => {
	console.log('WebSocket disconnected')
})
socket.on('error', (err: any) => {
	console.error('WebSocket error:', err)
})
