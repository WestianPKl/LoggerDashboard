import fs from 'fs'
import multer from 'multer'
import { v1 } from 'uuid'

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

/**
 * Creates a folder at the specified path if it does not already exist.
 *
 * @param {string} path - The directory path to create.
 */
export function createFolder(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true })
    }
}

/**
 * Multer storage configuration for handling file uploads.
 *
 * Uses disk storage to save files in the 'uploads/' directory.
 * The destination folder is created if it does not exist.
 * Filenames are generated using a UUID (v1) and the appropriate file extension
 * based on the MIME type.
 *
 * @type {import('multer').StorageEngine}
 * @property {Function} destination - Callback to determine upload folder.
 * @property {Function} filename - Callback to determine uploaded file name.
 */
export const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        createFolder('uploads/')
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const ext = MIME_TYPE_MAP[file.mimetype]
        if (!ext) return cb(new Error('Unsupported file type'), null)
        cb(null, `${v1()}.${ext}`)
    },
})

/**
 * Filters uploaded files based on their MIME type.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} file - The file object to be filtered, containing file metadata.
 * @param {Function} cb - Callback function to indicate if the file is accepted or rejected.
 *   - If the file is valid, call cb(null, true).
 *   - If the file is invalid, call cb(new Error('Invalid mime type!'), false).
 */
function fileFilter(req, file, cb) {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]
    cb(isValid ? null : new Error('Invalid mime type!'), isValid)
}

/**
 * Multer middleware for handling image uploads.
 *
 * @constant
 * @type {import('multer').Multer}
 * @property {Object} limits - Limits for uploaded files (e.g., file size).
 * @property {import('multer').StorageEngine} storage - Storage engine configuration for uploaded files.
 * @property {import('multer').Options['fileFilter']} fileFilter - Function to control which files are accepted.
 *
 * @example
 * app.post('/upload', imageUpload.single('image'), (req, res) => {
 *   // Handle uploaded image
 * });
 */
export const imageUpload = multer({
    limits: 500000,
    storage: fileStorage,
    fileFilter: fileFilter,
})

/**
 * Deletes a file at the specified file path.
 *
 * @param {string} filePath - The path to the file to be deleted.
 * @returns {void}
 */
export function deleteFile(filePath) {
    if (!filePath) {
        console.error('deleteFile: filePath is undefined!')
        return
    }
    fs.unlink(filePath, (err) => {
        if (err) console.error('Could not delete file:', err)
    })
}
