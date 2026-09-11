import { computed, ref } from 'vue'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'

const STORAGE_KEY = 'spin-wheel-spins-v1'

const spins = ref([])
let started = false
let unsub = null

function loadLocalSpins() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* ignore */
  }
  return []
}

function saveLocalSpins(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function isZonkName(name) {
  return String(name || '')
    .toUpperCase()
    .includes('ZONK')
}

function startSpinLog() {
  if (started) return
  started = true

  if (!isFirebaseConfigured || !db) {
    spins.value = loadLocalSpins()
    return
  }

  const q = query(collection(db, 'spins'), orderBy('createdAt', 'desc'))
  unsub = onSnapshot(
    q,
    (snap) => {
      spins.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
    () => {
      spins.value = loadLocalSpins()
    },
  )
}

export function useSpinStats(prizes) {
  startSpinLog()

  function recordSpin({ prizeId, prizeName }) {
    const entry = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      prizeId,
      prizeName,
      createdAt: Date.now(),
    }

    if (!isFirebaseConfigured || !db) {
      spins.value = [entry, ...spins.value]
      saveLocalSpins(spins.value)
    }
    // Firebase: sudah ditulis di useSpin.commitWin
  }

  const totalSpins = computed(() => spins.value.length)

  const prizesUsed = computed(
    () => spins.value.filter((s) => !isZonkName(s.prizeName)).length,
  )

  const prizesRemaining = computed(() =>
    (prizes?.value || []).reduce((sum, p) => {
      if (isZonkName(p.name)) return sum
      return sum + Math.max(0, Number(p.stock) || 0)
    }, 0),
  )

  return {
    spins,
    totalSpins,
    prizesUsed,
    prizesRemaining,
    recordSpin,
  }
}
