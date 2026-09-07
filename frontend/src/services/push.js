import api from './api'

const SW_PATH = '/sw.js'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

export async function registerServiceWorker() {
  if (!isPushSupported()) return null
  if (!('serviceWorker' in navigator)) return null
  const registration = await navigator.serviceWorker.register(SW_PATH)
  await navigator.serviceWorker.ready
  return registration
}

export async function getExistingSubscription() {
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

async function fetchVapidPublicKey() {
  const response = await api.get('/api/push/vapid-public-key')
  const key = response.data?.publicKey
  if (!key) throw new Error('VAPID public key is not configured')
  return key
}

async function saveSubscription(subscription) {
  const json = subscription.toJSON()
  await api.post('/api/push/subscriptions', json)
}

async function removeSubscription(subscription) {
  const endpoint = encodeURIComponent(subscription.endpoint)
  await api.delete(`/api/push/subscriptions?endpoint=${endpoint}`)
}

export async function requestPushPermission() {
  if (!isPushSupported()) {
    return { status: 'unsupported' }
  }

  await registerServiceWorker()

  if (Notification.permission === 'denied') {
    return { status: 'denied' }
  }
  if (Notification.permission !== 'granted') {
    const result = await Notification.requestPermission()
    if (result !== 'granted') return { status: 'denied' }
  }

  try {
    const publicKey = await fetchVapidPublicKey()
    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
    }
    await saveSubscription(subscription)
    return { status: 'granted', subscription }
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return { status: 'error' }
  }
}

export async function unsubscribeFromPush() {
  if (!isPushSupported()) return { status: 'unsupported' }
  try {
    const subscription = await getExistingSubscription()
    if (subscription) {
      await removeSubscription(subscription)
      await subscription.unsubscribe()
    }
    return { status: 'disabled' }
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
    return { status: 'error' }
  }
}

export async function getPushStatus() {
  if (!isPushSupported()) return { supported: false, enabled: false }
  if (Notification.permission === 'denied') return { supported: true, enabled: false, denied: true }
  const subscription = await getExistingSubscription()
  if (!subscription) return { supported: true, enabled: false }
  return { supported: true, enabled: true }
}