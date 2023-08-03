const secretKey = process.env.app_key
const algorithm = "aes-256-cbc"
const { genSaltSync, hashSync, compare } = require('bcrypt')
const {createCipheriv, createDecipheriv} = require('crypto')
const randomString = (length) => {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	let result = ''
	for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
	return result
}
const hash = text => hashSync(text, genSaltSync(16), null)
const compareHash = (text, pass) => new Promise(resolve => compare(text, pass, (b,attempt) => resolve(attempt)))
const encrypt = (text) => {
    const iv = randomString(16)
    const vector = Buffer.from(iv, 'utf8')
    const cipher = createCipheriv(algorithm, secretKey, vector)
    let content = cipher.update(text, "utf-8", "hex")
    content += cipher.final("hex")
    return {content, iv}
}

const decrypt = ({content, iv}) => {
    const vector = Buffer.from(iv, 'utf8')
    const decipher = createDecipheriv(algorithm, secretKey, vector)
    let text = decipher.update(content, "hex", "utf-8")
    text += decipher.final("utf8")
    return text
}
const CryptographyTools = {
    hash,
    compareHash,
    encrypt,
    decrypt,
}
module.exports = CryptographyTools