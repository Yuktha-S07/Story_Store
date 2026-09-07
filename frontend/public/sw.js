/* Story Store service worker - handles web push notifications */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

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
    },
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Story Store', options))
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