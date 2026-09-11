import { computed, ref } from 'vue'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'
import { DEFAULT_PRIZES, createLocalId } from '../data/defaultPrizes'

const STORAGE_KEY = 'spin-wheel-prizes-v2'

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    /* ignore */
  }
  const seeded = DEFAULT_PRIZES.map((p, i) => ({
    id: createLocalId(),
    ...p,
    order: i,
    updatedAt: Date.now(),
  }))
  // Simpan segera supaya reload tidak regenerasi ulang / reset stok
  saveLocal(seeded)
  return seeded
}

function saveLocal(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const prizes = ref([])
const loading = ref(true)
const error = ref(null)
let unsub = null
let started = false

function startPrizes() {
  if (started) return
  started = true

  if (!isFirebaseConfigured || !db) {
    prizes.value = loadLocal()
    loading.value = false
    return
  }

  const q = query(collection(db, 'prizes'), orderBy('order', 'asc'))
  unsub = onSnapshot(
    q,
    (snap) => {
      prizes.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
      error.value = null
    },
    (err) => {
      error.value = err.message
      loading.value = false
    },
  )
}

export function usePrizes() {
  startPrizes()

  const spinablePrizes = computed(() =>
    prizes.value.filter((p) => p.active !== false && p.stock > 0),
  )

  async function addPrize({ name, stock, color }) {
    const payload = {
      name: String(name || '').trim(),
      stock: Math.max(0, Number(stock) || 0),
      color: color || '#E85D4C',
      active: true,
      order: prizes.value.length,
      updatedAt: Date.now(),
    }

    if (!payload.name) return

    if (!isFirebaseConfigured || !db) {
      prizes.value = [...prizes.value, { id: createLocalId(), ...payload }]
      saveLocal(prizes.value)
      return
    }

    await addDoc(collection(db, 'prizes'), {
      ...payload,
      updatedAt: serverTimestamp(),
    })
  }

  async function updatePrize(id, patch) {
    if (!isFirebaseConfigured || !db) {
      prizes.value = prizes.value.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
      )
      saveLocal(prizes.value)
      return
    }

    await updateDoc(doc(db, 'prizes', id), {
      ...patch,
      updatedAt: serverTimestamp(),
    })
  }

  async function adjustStock(id, delta) {
    const prize = prizes.value.find((p) => p.id === id)
    if (!prize) return
    const next = Math.max(0, (prize.stock || 0) + delta)
    await updatePrize(id, { stock: next })
  }

  async function removePrize(id) {
    if (!isFirebaseConfigured || !db) {
      prizes.value = prizes.value.filter((p) => p.id !== id)
      saveLocal(prizes.value)
      return
    }
    await deleteDoc(doc(db, 'prizes', id))
  }

  return {
    prizes,
    spinablePrizes,
    loading,
    error,
    isLocalMode: !isFirebaseConfigured,
    addPrize,
    updatePrize,
    adjustStock,
    removePrize,
  }
}
