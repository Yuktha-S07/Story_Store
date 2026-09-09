/* Story Store service worker - handles web push notifications */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

const SOUND_PATTERNS = {
  chime: [[523, 0], [659, 0.12]],
  pop: [[440, 0]],
  sparkle: [[659, 0], [784, 0.1], [988, 0.2]],
  pulse: [[220, 0], [330, 0.18]],
  whistle: [[880, 0], [1175, 0.12]],
}

function playNotificationSound(soundName) {
  try {
    const AudioContext = self.AudioContext || self.webkitAudioContext
    if (!AudioContext) {
      return Promise.resolve()
    }
    const audio = new AudioContext()
    if (audio.state === 'suspended') audio.resume()
    const patterns = SOUND_PATTERNS[soundName] || SOUND_PATTERNS.chime
    for (const [frequency, delay] of patterns) {
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, audio.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(0.08, audio.currentTime + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + delay + 0.28)
      oscillator.connect(gain)
      gain.connect(audio.destination)
      oscillator.start(audio.currentTime + delay)
      oscillator.stop(audio.currentTime + delay + 0.3)
    }
    return new Promise((resolve) => {
      const remaining = Math.max(...patterns.map(([, delay]) => delay)) + 0.35
      setTimeout(resolve, Math.round(remaining * 1000))
    })
  } catch (err) {
    return Promise.resolve()
  }
}

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (err) {
    data = { body: event.data ? event.data.text() : '' }
  }

  const options = {
    body: data.body || 'You have a new Story Store notification.',
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.svg',
    tag: data.tag || 'story-store',
    renotify: Boolean(data.tag),
    data: {
      url: data.url || '/',
      sound: data.sound || 'chime',
    },
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || 'Story Store', options),
      playNotificationSound(data.sound),
    ])
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = (event.notification.data && event.notification.data.url) || '/'

  const open = async () => {
    const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of windowClients) {
      if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
        client.navigate(url)
        return client.focus()
      }
    }
    return clients.openWindow(url)
  }

  event.waitUntil(open())
})

self.addEventListener('notificationclose', (event) => {
  // Reserved for future analytics
})