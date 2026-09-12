/** Sound efek spin / menang — Web Audio API (tanpa file MP3). */

let audioCtx = null
let muted = false
let zonkStyle = localStorage.getItem('spin-wheel-zonk-sound') || 'playful'
const activeSources = new Set()

export const ZONK_SOUND_OPTIONS = [
  { id: 'playful', label: 'Playful (disarankan)' },
  { id: 'buzzer', label: 'Buzzer game show' },
  { id: 'boing', label: 'Boing kartun' },
]

function getCtx() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!audioCtx) audioCtx = new AC()
  return audioCtx
}

async function unlock() {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      /* ignore */
    }
  }
}

function stopAll() {
  for (const node of activeSources) {
    try {
      node.stop?.()
    } catch {
      /* already stopped */
    }
  }
  activeSources.clear()
}

function track(node) {
  activeSources.add(node)
  node.onended = () => activeSources.delete(node)
  return node
}

function tone(ctx, { freq, start, dur, type = 'sine', gain = 0.12, slideTo }) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, slideTo),
      start + dur,
    )
  }
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(g)
  g.connect(ctx.destination)
  track(osc)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

/** Noise pendek untuk buzzer */
function noiseBurst(ctx, time, dur = 0.12, gain = 0.05) {
  const len = Math.floor(ctx.sampleRate * dur)
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  }
  const src = ctx.createBufferSource()
  const g = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 420
  filter.Q.value = 1.2
  src.buffer = buffer
  g.gain.setValueAtTime(gain, time)
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(ctx.destination)
  track(src)
  src.start(time)
  src.stop(time + dur + 0.02)
}

/** Klik singkat seperti gigi roda */
function click(ctx, time, volume = 0.1) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(920, time)
  osc.frequency.exponentialRampToValueAtTime(180, time + 0.045)
  g.gain.setValueAtTime(0.0001, time)
  g.gain.exponentialRampToValueAtTime(volume, time + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.055)
  osc.connect(g)
  g.connect(ctx.destination)
  track(osc)
  osc.start(time)
  osc.stop(time + 0.07)
}

function isZonkName(name) {
  return String(name || '')
    .toUpperCase()
    .includes('ZONK')
}

/** ZONK: soft + playful, cocok event booth */
function zonkPlayful(ctx, now) {
  // Intro “tut-tut” lalu frase turun yang lebih panjang
  tone(ctx, {
    freq: 520,
    start: now,
    dur: 0.14,
    type: 'square',
    gain: 0.05,
  })
  tone(ctx, {
    freq: 400,
    start: now + 0.16,
    dur: 0.16,
    type: 'square',
    gain: 0.048,
  })
  tone(ctx, {
    freq: 320,
    start: now + 0.36,
    dur: 0.28,
    type: 'triangle',
    gain: 0.07,
    slideTo: 240,
  })
  tone(ctx, {
    freq: 260,
    start: now + 0.62,
    dur: 0.38,
    type: 'sine',
    gain: 0.08,
    slideTo: 180,
  })
  // Bounce penutup
  tone(ctx, {
    freq: 190,
    start: now + 0.95,
    dur: 0.45,
    type: 'sine',
    gain: 0.065,
    slideTo: 280,
  })
  tone(ctx, {
    freq: 140,
    start: now + 1.25,
    dur: 0.55,
    type: 'triangle',
    gain: 0.05,
    slideTo: 95,
  })
}

/** ZONK: buzzer game show klasik */
function zonkBuzzer(ctx, now) {
  noiseBurst(ctx, now, 0.18, 0.055)
  tone(ctx, {
    freq: 150,
    start: now,
    dur: 0.4,
    type: 'sawtooth',
    gain: 0.07,
  })
  tone(ctx, {
    freq: 168,
    start: now,
    dur: 0.4,
    type: 'sawtooth',
    gain: 0.05,
  })
  noiseBurst(ctx, now + 0.42, 0.16, 0.045)
  tone(ctx, {
    freq: 125,
    start: now + 0.42,
    dur: 0.45,
    type: 'square',
    gain: 0.06,
  })
  tone(ctx, {
    freq: 105,
    start: now + 0.88,
    dur: 0.55,
    type: 'sawtooth',
    gain: 0.055,
    slideTo: 70,
  })
  tone(ctx, {
    freq: 90,
    start: now + 1.2,
    dur: 0.5,
    type: 'triangle',
    gain: 0.04,
    slideTo: 60,
  })
}

/** ZONK: boing kartun */
function zonkBoing(ctx, now) {
  tone(ctx, {
    freq: 620,
    start: now,
    dur: 0.4,
    type: 'sine',
    gain: 0.1,
    slideTo: 110,
  })
  tone(ctx, {
    freq: 880,
    start: now + 0.03,
    dur: 0.22,
    type: 'triangle',
    gain: 0.04,
    slideTo: 160,
  })
  tone(ctx, {
    freq: 280,
    start: now + 0.38,
    dur: 0.35,
    type: 'sine',
    gain: 0.08,
    slideTo: 95,
  })
  tone(ctx, {
    freq: 200,
    start: now + 0.7,
    dur: 0.4,
    type: 'triangle',
    gain: 0.07,
    slideTo: 70,
  })
  // Echo bounce
  tone(ctx, {
    freq: 360,
    start: now + 1.05,
    dur: 0.35,
    type: 'sine',
    gain: 0.055,
    slideTo: 85,
  })
  tone(ctx, {
    freq: 140,
    start: now + 1.35,
    dur: 0.5,
    type: 'sine',
    gain: 0.045,
    slideTo: 55,
  })
}

export function useSounds() {
  function setMuted(value) {
    muted = Boolean(value)
    if (muted) stopAll()
  }

  function isMuted() {
    return muted
  }

  function getZonkStyle() {
    return zonkStyle
  }

  function setZonkStyle(id) {
    const ok = ZONK_SOUND_OPTIONS.some((o) => o.id === id)
    zonkStyle = ok ? id : 'playful'
    localStorage.setItem('spin-wheel-zonk-sound', zonkStyle)
  }

  /** Putar tick selama animasi spin (default 5 detik), melambat di akhir. */
  async function playSpin(durationMs = 5000) {
    if (muted) return
    await unlock()
    const ctx = getCtx()
    if (!ctx) return

    stopAll()
    const now = ctx.currentTime
    const duration = durationMs / 1000

    tone(ctx, {
      freq: 220,
      start: now,
      dur: 0.35,
      type: 'sawtooth',
      gain: 0.045,
      slideTo: 90,
    })

    let t = 0.05
    while (t < duration - 0.08) {
      const p = t / duration
      const interval = 0.04 + p * p * 0.28
      const vol = 0.07 + (1 - p) * 0.05
      click(ctx, now + t, vol)
      t += interval
    }

    click(ctx, now + duration - 0.04, 0.14)
  }

  function stopSpin() {
    stopAll()
  }

  async function playWin() {
    if (muted) return
    await unlock()
    const ctx = getCtx()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      tone(ctx, {
        freq,
        start: now + i * 0.11,
        dur: 0.35,
        type: 'triangle',
        gain: 0.11,
      })
      tone(ctx, {
        freq: freq * 2,
        start: now + i * 0.11 + 0.02,
        dur: 0.22,
        type: 'sine',
        gain: 0.035,
      })
    })
    for (let i = 0; i < 6; i++) {
      tone(ctx, {
        freq: 1200 + i * 180,
        start: now + 0.45 + i * 0.07,
        dur: 0.12,
        type: 'sine',
        gain: 0.04,
      })
    }
  }

  async function playZonk(style = zonkStyle) {
    if (muted) return
    await unlock()
    const ctx = getCtx()
    if (!ctx) return

    const now = ctx.currentTime
    if (style === 'buzzer') zonkBuzzer(ctx, now)
    else if (style === 'boing') zonkBoing(ctx, now)
    else zonkPlayful(ctx, now)
  }

  async function previewZonk(style) {
    await playZonk(style || zonkStyle)
  }

  async function playResult(prizeName) {
    if (isZonkName(prizeName)) await playZonk()
    else await playWin()
  }

  return {
    unlock,
    playSpin,
    stopSpin,
    playWin,
    playZonk,
    previewZonk,
    playResult,
    setMuted,
    isMuted,
    getZonkStyle,
    setZonkStyle,
    ZONK_SOUND_OPTIONS,
  }
}
