import nodemailer from 'nodemailer'
import 'dotenv/config'

/**
 * Nodemailer transporter configured to use Gmail's SMTP service.
 *
 * @constant
 * @type {import('nodemailer').Transporter}
 * @see {@link https://nodemailer.com/smtp/}
 *
 * @property {string} service - The email service to use ('Gmail').
 * @property {string} host - The SMTP host ('smtp.gmail.com').
 * @property {number} port - The port to connect to (587).
 * @property {boolean} secure - If true, uses TLS; false for STARTTLS.
 * @property {Object} auth - Authentication object.
 * @property {string} auth.user - Gmail username, from environment variable GMAIL_USER.
 * @property {string} auth.pass - Gmail password, from environment variable GMAIL_PASSWORD.
 */
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
})

/**
 * Sends an email using the configured Gmail transporter.
 *
 * @async
 * @function
 * @param {string} toAddress - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text content of the email.
 * @param {string} [html] - Optional HTML content for the email.
 * @returns {Promise<Object>} The result info from the email sending operation.
 * @throws {Error} If Gmail configuration is missing or sending fails.
 */
export async function sendEmail(toAddress, subject, text, html) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
        throw new Error('No gmail config in .env!')
    }
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: toAddress,
        subject,
        text,
    }
    if (html) {
        mailOptions.html = html
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent: ', info.response)
        return info
    } catch (error) {
        console.error('Email error:', error)
        throw error
    }
}
