import * as CryptoJS from 'crypto-js'
import * as sm from 'sm-crypto'
import * as crypto from 'crypto'

export function encrypt(str: string) {
  //   MD5
  return CryptoJS.MD5(str).toString()
}

// 解密登录密码
export function decrypt(encryptedPassword: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

function sm3(data) {
  if (!data) {
    return ''
  }
  // 计算 SM3 哈希值
  const hash = sm.sm3(data)

  // 将十六进制字符串转换为字节数组
  const bytes = new Uint8Array(hash.match(/.{2}/g).map((byte) => parseInt(byte, 16)))

  // 转换为 Base64
  return Buffer.from(bytes).toString('base64')
}
export function generateSign(data) {
  // 1. 创建一个新对象，不包含 key 参数
  const paramMap = {}
  for (const [key, value] of Object.entries(data)) {
    if (key !== 'key') {
      paramMap[key] = value
    }
  }

  // 2. 按照键名升序排序并拼接参数
  const paramStr = Object.keys(paramMap)
    .sort()
    .map((key) => `${key}=${paramMap[key]}`)
    .join('&')

  // 3. 在最后拼接 key 参数
  const fullStr = `${paramStr}&key=${data.key}`
  // 4. 计算 SM3 签名
  return sm3(fullStr)
}

/**
 * 解密 jasypt 加密的 nacos 字段（PBEWITHHMACSHA512ANDAES_256）
 * @param {string} encryptedText - 形如 ENC(...) 或 base64 密文
 * @returns {string} - 明文
 */
export function decryptJasyptField(encryptedText: string): string {
  const saltSize = 16
  const ivSize = 16
  const iterations = 1000
  const password = process.env.JASYPT_ENCRYPTOR_PASSWORD ?? 'icarDevSitUat'

  // 剥离 ENC()
  const base64Text = encryptedText.replace(/^ENC\((.*)\)$/, '$1')
  const decoded = Buffer.from(base64Text, 'base64')
  const salt = decoded.slice(0, saltSize)
  const iv = decoded.slice(saltSize, saltSize + ivSize)
  const ciphertext = decoded.slice(saltSize + ivSize)
  const key = crypto.pbkdf2Sync(Buffer.from(password, 'utf-8'), salt, iterations, 32, 'sha512')
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(ciphertext)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString('utf-8')
}
