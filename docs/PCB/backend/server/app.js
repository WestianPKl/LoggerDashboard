import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import { notFound, internalServerError } from './util/responseHelper.js'
import cors from 'cors'
import fs from 'fs'
import morgan from 'morgan'
import compression from 'compression'
import inventoryRouter from './api/routes/inventory.js'
import pcbRouter from './api/routes/pcb.js'
import productionRouter from './api/routes/production.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(
	cors({
		origin: process.env.FRONTEND_ORIGIN?.split(',') || [
			'http://localhost:5173',
			'http://192.168.18.6:5173',
			'http://192.168.18.6:3000',
			'http://192.168.18.75:9001/',
		],
		credentials: true,
	})
)

app.use(compression())

const accessLogStream = fs.createWriteStream(
	path.join(__dirname, 'access.log'),
	{ flags: 'a' }
)
if (process.env.NODE_ENV !== 'production') {
	app.use(morgan('dev'))
}
app.use(morgan('combined', { stream: accessLogStream }))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: false, limit: '10mb' }))
app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, '../public')))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/inventory', inventoryRouter)
app.use('/api/pcb', pcbRouter)
app.use('/api/production', productionRouter)

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '../dist-frontend')))
	app.get(/(.*)/, (req, res) => {
		res.sendFile(path.join(__dirname, '../dist-frontend', 'index.html'))
	})
}

app.use((req, res) => {
	return notFound(res, 'Not found')
})

app.use((err, req, res) => {
	return internalServerError(res, 'Error has occured.', err)
})

export default app
