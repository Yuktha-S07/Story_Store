export const SOUND_PATTERNS = {
  chime: [[523, 0], [659, 0.12]],
  pop: [[440, 0]],
  sparkle: [[659, 0], [784, 0.1], [988, 0.2]],
  pulse: [[220, 0], [330, 0.18]],
  whistle: [[880, 0], [1175, 0.12]],
}

export const STORAGE_KEY = 'story-store:notification-sound'
export const DEFAULT_SOUND = 'chime'

export function getSelectedSound() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored && SOUND_PATTERNS[stored] ? stored : DEFAULT_SOUND
}

export function playSound(soundName = getSelectedSound()) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return
  const audio = new AudioContext()
  if (audio.state === 'suspended') audio.resume()
  const patterns = SOUND_PATTERNS[soundName] || SOUND_PATTERNS[DEFAULT_SOUND]
  ;(patterns).forEach(([frequency, delay]) => {
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
  })
}
