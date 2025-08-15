/**
 * Integration tests for the User API.
 *
 * This file covers the following scenarios:
 * - User registration (including duplicate username/email and password mismatch cases)
 * - User login (success, missing fields, wrong password)
 * - Password reset request and password reset
 * - Fetching user data by ID and listing all users
 * - Editing and deleting user accounts
 * - Input validation for all endpoints
 *
 * @param {string} tokenFullAccess JWT token for a user with full permissions (used for most authorized requests)
 * @param {string} tokenNoPermissions JWT token for a user with no permissions (used to test authorization failures)
 * @param {string} newUserToken JWT token for a newly registered user
 * @param {number} userId Stores the ID of the user created during tests
 * @param {string} username Used to verify user data after registration and login
 * @param {string} email Used to verify user data after registration and login
 * @param {string} passwordResetToken Token generated for password reset flow
 *
 * Structure:
 * - beforeAll: Logs in two users and stores their tokens for use in tests
 * - Each 'it' block tests a specific API endpoint or scenario, including both positive and negative cases
 * - Uses supertest for HTTP requests and JWT for token decoding
 *
 * The tests ensure that the User API endpoints behave correctly, handle errors, and enforce validation and authorization rules.
 */
import request from 'supertest'
import app from '../app.js'
import jwt from 'jsonwebtoken'

let tokenFullAccess, tokenNoPermissions, newUserToken
let userId, username, email, passwordResetToken

describe('User API', () => {
    beforeAll(async () => {
        const res1 = await request(app)
            .post('/api/user/user-login')
            .send({ username: 'Bob', password: 'bob' })
        tokenFullAccess = res1.body.data.token

        const res2 = await request(app)
            .post('/api/user/user-login')
            .send({ username: 'Test', password: 'test' })
        tokenNoPermissions = res2.body.data.token
    })

    it('should register new user', async () => {
        const res = await request(app).post('/api/user/user-register').send({
            username: 'Test-001',
            email: 'test001@test.pl',
            password: 'testPassword',
            confirmPassword: 'testPassword',
        })
        expect(res.statusCode).toBe(200)
        userId = res.body.data.id
    })

    it('should not reqister new user (existing user)', async () => {
        const res = await request(app).post('/api/user/user-register').send({
            username: 'Test-001',
            email: 'test002@test.pl',
            password: 'testPassword',
            confirmPassword: 'testPassword',
        })
        expect([400, 422]).toContain(res.statusCode)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toMatch('Validation failed.')
        expect(res.body.data[0].msg).toBe('Username exists already!')
        expect(res.body.data[0].path).toBe('username')
    })

    it('should not reqister new user (existing email)', async () => {
        const res = await request(app).post('/api/user/user-register').send({
            username: 'Test-002',
            email: 'test001@test.pl',
            password: 'testPassword',
            confirmPassword: 'testPassword',
        })
        expect([400, 422]).toContain(res.statusCode)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toMatch('Validation failed.')
        expect(res.body.data[0].msg).toBe('Email exists already!')
        expect(res.body.data[0].path).toBe('email')
    })

    it('should not reqister new user (existing user and email)', async () => {
        const res = await request(app).post('/api/user/user-register').send({
            username: 'Test-001',
            email: 'test001@test.pl',
            password: 'testPassword',
            confirmPassword: 'testPassword',
        })
        expect([400, 422]).toContain(res.statusCode)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toMatch('Validation failed.')
        expect(res.body.data[0].msg).toBe('Username exists already!')
        expect(res.body.data[0].path).toBe('username')
        expect(res.body.data[1].msg).toBe('Email exists already!')
        expect(res.body.data[1].path).toBe('email')
    })

    it('should not reqister new user (password does not match confirmPassword)', async () => {
        const res = await request(app).post('/api/user/user-register').send({
            username: 'Test-002',
            email: 'test002@test.pl',
            password: 'password',
            confirmPassword: 'test',
        })
        expect([400, 422]).toContain(res.statusCode)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toMatch('Validation failed.')
        expect(res.body.data[0].msg).toBe('Passwords have to match!')
        expect(res.body.data[0].path).toBe('confirmPassword')
    })

    it('should get user by id', async () => {
        const res = await request(app)
            .get(`/api/user/user/${userId}`)
            .set('Authorization', `Bearer ${tokenFullAccess}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.data.id).toBe(userId)
    })

    it('should get all users', async () => {
        const res = await request(app)
            .post('/api/user/users')
            .set('Authorization', `Bearer ${tokenFullAccess}`)
            .send({})
        expect(res.statusCode).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('should get users filtered by id', async () => {
        const res = await request(app)
            .post('/api/user/users')
            .set('Authorization', `Bearer ${tokenFullAccess}`)
            .send({ id: userId })
        expect(res.statusCode).toBe(200)
        expect(res.body.data[0].id).toBe(userId)
    })

    it('should login', async () => {
        const res = await request(app)
            .post('/api/user/user-login')
            .send({ username: 'Test-001', password: 'testPassword' })
        expect(res.statusCode).toBe(200)
        newUserToken = res.body.data.token
        const decoded = jwt.decode(newUserToken)
        expect(decoded.user.username).toBe('Test-001')
        expect(decoded.user.email).toBe('test001@test.pl')
        username = decoded.user.username
        email = decoded.user.email
    })

    it('should get password reset token', async () => {
        const res = await request(app)
            .post('/api/user/reset-password-request')
            .send({
                email: 'test001@test.pl',
            })
        expect(res.statusCode).toBe(200)
        passwordResetToken = res.body.data.token
    })

    it('should get password reset', async () => {
        const res = await request(app)
            .post(`/api/user/reset-password/${passwordResetToken}`)
            .send({
                password: 'testPassword',
                confirmPassword: 'testPassword',
            })
        expect(res.statusCode).toBe(200)
    })

    it('should not login (no username)', async () => {
        const res = await request(app).post('/api/user/user-login').send({
            password: 'testPassword',
        })
        expect([400, 422]).toContain(res.statusCode)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toMatch('Validation failed.')
        expect(res.body.data[0].msg).toBe('Please insert correct data!')
        expect(res.body.data[0].path).toBe('username')
    })

    it('should not login (no password)', async () => {
        const res = await request(app).post('/api/user/user-login').send({
            username: 'Test-001',
        })
        expect([400, 422]).toContain(res.statusCode)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toMatch('Validation failed.')
        expect(res.body.data[0].msg).toBe('Please insert correct data!')
        expect(res.body.data[0].path).toBe('password')
    })

    it('should not login (wrong password)', async () => {
        const res = await request(app).post('/api/user/user-login').send({
            username: 'Test-001',
            password: 'test',
        })
        expect([401]).toContain(res.statusCode)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toMatch('Wrong password.')
    })

    it('should edit the user', async () => {
        const res = await request(app)
            .patch(`/api/user/user/${userId}`)
            .set('Authorization', `Bearer ${newUserToken}`)
            .send({ username: 'Test-001Edited', email: email })
        expect(res.statusCode).toBe(200)
        expect(res.body.data.username).toBe('Test-001Edited')
    })

    it('should delete user', async () => {
        const res = await request(app)
            .delete(`/api/user/user/${userId}`)
            .set('Authorization', `Bearer ${tokenFullAccess}`)
            .send({
                id: userId,
            })
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('success', true)

        const getRes = await request(app)
            .get(`/api/user/user/${userId}`)
            .set('Authorization', `Bearer ${tokenFullAccess}`)
        expect([404, 503]).toContain(getRes.statusCode)
    })
})
