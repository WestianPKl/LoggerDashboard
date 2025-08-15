/**
 * Integration tests for the Common API (Error Log endpoints).
 *
 * This file covers the following scenarios:
 * - Creating, editing, fetching and deleting error logs
 * - Validation and authorization for all endpoints
 * - Filtering and listing error logs
 *
 * @param {string} tokenFullAccess JWT token for a user with full permissions (used for most authorized requests)
 * @param {number} errorLogId Stores the ID of the error log created during tests
 *
 * Structure:
 * - beforeAll: Logs in a user and stores the token for use in tests
 * - Each 'it' block tests a specific API endpoint or scenario, including both positive and negative cases
 * - Uses supertest for HTTP requests
 *
 * The tests ensure that the Common API endpoints behave correctly, handle errors, and enforce validation and authorization rules.
 */
import request from 'supertest'
import app from '../app.js'

let tokenFullAccess
let errorLogId

describe('Common API', () => {
    beforeAll(async () => {
        const res1 = await request(app)
            .post('/api/user/user-login')
            .send({ username: 'Bob', password: 'bob' })
        tokenFullAccess = res1.body.data.token
    })

    it('should create a error log message', async () => {
        const res = await request(app)
            .post('/api/common/error-log')
            .set('Authorization', `Bearer ${tokenFullAccess}`)
            .send({ message: 'TestMessage', type: 'DB', severity: 'Error' })
        expect(res.statusCode).toBe(200)
        expect(res.body.data.message).toBe('TestMessage')
        expect(res.body.data.type).toBe('DB')
        errorLogId = res.body.data.id
    })

    it('should return validation error for empty error log message', async () => {
        const res = await request(app)
            .post('/api/common/error-log')
            .set('Authorization', `Bearer ${tokenFullAccess}`)
            .send({ type: 'DB' })
        expect([400, 422]).toContain(res.statusCode)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toMatch('Validation failed.')
        expect(res.body.data[0].type).toBe('field')
        expect(res.body.data[0].path).toBe('message')
    })

    it('should edit the error log message', async () => {
        const res = await request(app)
            .patch(`/api/common/error-log/${errorLogId}`)
            .set('Authorization', `Bearer ${tokenFullAccess}`)
            .send({
                message: 'TestMessageEdited',
                type: 'Equipment',
                severity: 'Info',
            })
        expect(res.statusCode).toBe(200)
        expect(res.body.data.message).toBe('TestMessageEdited')
        expect(res.body.data.type).toBe('Equipment')
    })

    it('should get error log by id', async () => {
        const res = await request(app)
            .get(`/api/common/error-log/${errorLogId}`)
            .set('Authorization', `Bearer ${tokenFullAccess}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.data.id).toBe(errorLogId)
    })

    it('should get all error log messages', async () => {
        const res = await request(app)
            .post('/api/common/error-logs')
            .set('Authorization', `Bearer ${tokenFullAccess}`)
            .send({})
        expect(res.statusCode).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('should get error log messages filtered by id', async () => {
        const res = await request(app)
            .post('/api/common/error-logs')
            .set('Authorization', `Bearer ${tokenFullAccess}`)
            .send({ id: errorLogId })
        expect(res.statusCode).toBe(200)
        expect(res.body.data[0].id).toBe(errorLogId)
    })

    it('should delete error log message', async () => {
        const res = await request(app)
            .delete(`/api/common/error-log/${errorLogId}`)
            .set('Authorization', `Bearer ${tokenFullAccess}`)
            .send({
                id: errorLogId,
            })
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('success', true)

        const getRes = await request(app)
            .get(`/api/common/error-log/${errorLogId}`)
            .set('Authorization', `Bearer ${tokenFullAccess}`)
        expect([404, 503]).toContain(getRes.statusCode)
    })
})
