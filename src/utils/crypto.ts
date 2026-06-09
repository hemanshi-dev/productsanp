import CryptoJS from 'crypto-js'

// Get encryption key from environment variable or use a default (for development only)
const getEncryptionKey = (): string => {
  const key = import.meta.env.VITE_ENCRYPTION_KEY
  if (!key) {
    console.warn('VITE_ENCRYPTION_KEY not set, using default key (not secure for production)')
    return 'default-encryption-key-change-in-production'
  }
  return key
}

/**
 * Encrypts a string using AES encryption
 * @param text - The text to encrypt
 * @returns Encrypted string
 */
export const encrypt = (text: string): string => {
  try {
    const key = getEncryptionKey()
    const encrypted = CryptoJS.AES.encrypt(text, key).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypts an encrypted string using AES decryption
 * @param encryptedText - The encrypted text to decrypt
 * @returns Decrypted string
 */
export const decrypt = (encryptedText: string): string => {
  try {
    const key = getEncryptionKey()
    const bytes = CryptoJS.AES.decrypt(encryptedText, key)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    
    if (!decrypted) {
      throw new Error('Failed to decrypt data - invalid key or corrupted data')
    }
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Hashes a string using SHA256
 * @param text - The text to hash
 * @returns Hashed string
 */
export const hash = (text: string): string => {
  return CryptoJS.SHA256(text).toString()
}

/**
 * Generates a random salt
 * @returns Random salt string
 */
export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(128/8).toString()
}

/**
 * Hashes a string with a salt
 * @param text - The text to hash
 * @param salt - The salt to use
 * @returns Hashed string with salt
 */
export const hashWithSalt = (text: string, salt: string): string => {
  return CryptoJS.SHA256(text + salt).toString()
}

