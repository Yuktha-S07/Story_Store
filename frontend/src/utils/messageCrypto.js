const DB_NAME = 'story-store-keys'
const STORE = 'keys'
const DB_VERSION = 1
const KDF_INFO = 'storystore-msg-v1'

const enc = new TextEncoder()
const dec = new TextDecoder()

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGet(key) {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
      req.oncomplete = () => db.close
    })
  } catch {
    return null
  }
}

async function idbSet(key, value) {
  const db = await openDb()
  return await new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export function bufToB64(buf) {
  const b = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i])
  return btoa(s)
}

export function b64ToBuf(b64) {
  const bin = atob(b64)
  const b = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i)
  return b.buffer
}

export function publicKeyString(publicJwk) {
  return JSON.stringify(publicJwk)
}

export async function importPublicKey(publicJwk) {
  return crypto.subtle.importKey(
    'jwk',
    publicJwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )
}

async function deriveAesKey(sharedBits, iv) {
  const base = await crypto.subtle.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: iv, info: enc.encode(KDF_INFO) },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function ensureKeyPair(userId) {
  if (!userId) return null
  try {
    const existing = await idbGet(`enc-${userId}`)
    if (existing && existing.privateJwk) {
      const privateKey = await crypto.subtle.importKey(
        'jwk',
        existing.privateJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveBits']
      )
      return { privateKey, publicJwk: existing.publicJwk }
    }

    const kp = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
    const privateJwk = await crypto.subtle.exportKey('jwk', kp.privateKey)
    const publicJwk = await crypto.subtle.exportKey('jwk', kp.publicKey)
    const publicOnly = { kty: publicJwk.kty, crv: publicJwk.crv, x: publicJwk.x, y: publicJwk.y }
    await idbSet(`enc-${userId}`, { privateJwk, publicJwk: publicOnly })
    return { privateKey: kp.privateKey, publicJwk: publicOnly }
  } catch (err) {
    console.warn('Encryption setup failed:', err)
    return null
  }
}

export async function encryptMessage({ content, myPrivateKey, myPublicJwk, peerPublicJwk }) {
  const peerKey = await importPublicKey(peerPublicJwk)
  const sharedBits = await crypto.subtle.deriveBits({ name: 'ECDH', public: peerKey }, myPrivateKey, 256)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const aesKey = await deriveAesKey(sharedBits, iv)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, enc.encode(content))
  return {
    content: bufToB64(ciphertext),
    iv: bufToB64(iv),
    is_encrypted: true,
    sender_public_key: publicKeyString(myPublicJwk),
  }
}

export async function decryptMessage({ ciphertext, iv, myPrivateKey, peerPublicJwk }) {
  try {
    const peerKey = await importPublicKey(peerPublicJwk)
    const sharedBits = await crypto.subtle.deriveBits({ name: 'ECDH', public: peerKey }, myPrivateKey, 256)
    const aesKey = await deriveAesKey(sharedBits, b64ToBuf(iv))
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64ToBuf(iv) }, aesKey, b64ToBuf(ciphertext))
    return dec.decode(plaintext)
  } catch (err) {
    console.warn('Failed to decrypt message:', err)
    return '[Unable to decrypt this message]'
  }
}