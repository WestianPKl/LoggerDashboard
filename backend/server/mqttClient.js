import mqtt from 'mqtt'

const MQTT_URL = process.env.MQTT_URL || 'mqtt://127.0.0.1:1883'
const MQTT_USER = process.env.MQTT_USER || 'pico_user'
const MQTT_PASS = process.env.MQTT_PASS || 'HASLO'

export const mqttClient = mqtt.connect(MQTT_URL, {
	username: MQTT_USER,
	password: MQTT_PASS,
	reconnectPeriod: 2000,
	keepalive: 30,
	clean: true,
})

mqttClient.on('reconnect', () => console.log('[MQTT] reconnecting...'))
mqttClient.on('error', (e) => console.log('[MQTT] error:', e.message))

mqttClient.on('connect', () => {
	console.log('[MQTT] connected:', MQTT_URL)
	mqttClient.subscribe('devices/+/status', { qos: 0 }, (err) => {
		if (err) console.log('[MQTT] subscribe error:', err.message)
		else console.log('[MQTT] subscribed to devices/+/status')
	})
})

mqttClient.on('message', async (topic, payload) => {
	const s = payload.toString('utf8')
	console.log('[MQTT]', topic, s)

	try {
		const obj = JSON.parse(s)
		console.log('[JSON]', obj)
	} catch (err) {
		console.error('[NOT JSON]', err)
	}
})
