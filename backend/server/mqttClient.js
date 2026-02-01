import mqtt from 'mqtt'
import Equipment from './api/model/equipment/equipment.model.js'
import sequelize from './util/database.js'
import DataLastValue from './api/model/data/dataLastValue.model.js'
import DataDefinitions from './api/model/data/dataDefinitions.model.js'
import DataLogs from './api/model/data/dataLogs.model.js'
import EquStats from './api/model/equipment/equStats.model.js'
import { getIo } from './middleware/socket.js'

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
	const t = await sequelize.transaction()

	try {
		const dataLog = []
		const obj = JSON.parse(s)
		const logger = await Equipment.findOne({
			where: { serialNumber: obj.sn_contr },
		})
		const sensor = await Equipment.findOne({
			where: { serialNumber: `${obj.sn_contr}-1` },
		})

		if (!logger || !sensor) {
			console.warn('[MQTT] Logger or sensor not found for:', obj.sn_contr)
			await t.rollback()
			return
		}
		const date = new Date(obj.ts).toLocaleString('sv-SE', {
			timeZone: 'Europe/Warsaw',
		})
		if (obj.t) {
			dataLog.push({
				time: date,
				value: obj.t,
				definition: 'temperature',
				equLoggerId: logger.id,
				equSensorId: sensor.id,
			})
		}
		if (obj.h) {
			dataLog.push({
				time: date,
				value: obj.h,
				definition: 'humidity',
				equLoggerId: logger.id,
				equSensorId: sensor.id,
			})
		}
		if (obj.p) {
			dataLog.push({
				time: date,
				value: obj.p,
				definition: 'atmPressure',
				equLoggerId: logger.id,
				equSensorId: sensor.id,
			})
		}
		if (obj.v) {
			dataLog.push({
				time: date,
				value: obj.v,
				definition: 'voltage',
				equLoggerId: logger.id,
				equSensorId: sensor.id,
			})
		}

		const equStatsLogs = {
			equipmentId: logger.id,
			lastSeen: date,
			snContr: obj.sn_contr,
			fwContr: obj.fw_contr,
			hwContr: obj.hw_contr,
			buildContr: obj.build_contr,
			prodContr: obj.prod_contr,
			snCom: obj.sn_pico,
			fwCom: obj.fw_pico,
			hwCom: obj.hw_pico,
			buildCom: obj.build_pico,
			prodCom: obj.prod_pico,
			ipAddress: obj.ip_address,
		}

		if (Array.isArray(dataLog) && dataLog.length > 0) {
			await DataLastValue.destroy({
				where: {
					equLoggerId: dataLog[0].equLoggerId,
					equSensorId: dataLog[0].equSensorId,
				},
				transaction: t,
			})
			for (const item of dataLog) {
				if (!item.definition) {
					await t.rollback()
					return
				}
				const definitionData = await DataDefinitions.findOne({
					where: { name: item.definition },
				})
				if (!definitionData) {
					console.warn(
						'[MQTT] Definition not found:',
						item.definition
					)
					await t.rollback()
					return
				}
				const queryObject = {
					...item,
					dataDefinitionId: definitionData.id,
				}
				const addData = await DataLogs.create(queryObject, {
					transaction: t,
				})
				await DataLastValue.create(
					{
						dataLogId: addData.id,
						equLoggerId: addData.equLoggerId,
						equSensorId: addData.equSensorId,
						dataDefinitionId: addData.dataDefinitionId,
					},
					{ transaction: t }
				)
			}
		}
		if (equStatsLogs.equipmentId) {
			await EquStats.destroy({
				where: {
					equipmentId: equStatsLogs.equipmentId,
				},
				transaction: t,
			})

			await EquStats.create(equStatsLogs, { transaction: t })
		}

		await t.commit()
		let io
		try {
			io = getIo()
		} catch {
			io = null
		}
		if (io) io.sockets.emit(`logger_${logger.id}`, 'refresh')
		if (io) io.sockets.emit(`loggerData_${logger.id}`, 'refresh')
	} catch (err) {
		await t.rollback()
		console.error('[MQTT] Error processing message:', err)
	}
})
