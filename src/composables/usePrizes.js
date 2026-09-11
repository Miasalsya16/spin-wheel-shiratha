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
import {
  DEFAULT_PRIZES,
  PRIZE_COLORS_BY_NAME,
  createLocalId,
  normalizePrizeName,
  isZonkName,
  mergeZonkPrizes,
} from '../data/defaultPrizes'

const STORAGE_KEY = 'spin-wheel-prizes-v2'
const COLORS_VERSION_KEY = 'spin-wheel-colors-v4'
const NAMES_VERSION_KEY = 'spin-wheel-names-v4'
const ZONK_MERGE_KEY = 'spin-wheel-zonk-merge-v1'

function applyBrandColors(list) {
  return list.map((p) => {
    const name = normalizePrizeName(p.name)
    if (isZonkName(name)) return { ...p, name: 'ZONK', color: '#57534E' }
    const mapped = PRIZE_COLORS_BY_NAME[name.toLowerCase()]
    return mapped ? { ...p, name, color: mapped } : { ...p, name }
  })
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) {
        let list = parsed
        const colorsApplied = localStorage.getItem(COLORS_VERSION_KEY) === '1'
        const namesApplied = localStorage.getItem(NAMES_VERSION_KEY) === '1'
        const zonkMerged = localStorage.getItem(ZONK_MERGE_KEY) === '1'

        if (!colorsApplied || !namesApplied) {
          list = applyBrandColors(list)
          localStorage.setItem(COLORS_VERSION_KEY, '1')
          localStorage.setItem(NAMES_VERSION_KEY, '1')
        }

        const zonkCount = list.filter((p) => isZonkName(p.name)).length
        if (!zonkMerged || zonkCount !== 1) {
          list = mergeZonkPrizes(list)
          localStorage.setItem(ZONK_MERGE_KEY, '1')
          // bersihkan flag spread lama
          localStorage.removeItem('spin-wheel-zonk-spread-v1')
          localStorage.removeItem('spin-wheel-zonk-spread-v2')
        }

        saveLocal(list)
        return list
      }
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
  saveLocal(seeded)
  localStorage.setItem(COLORS_VERSION_KEY, '1')
  localStorage.setItem(NAMES_VERSION_KEY, '1')
  localStorage.setItem(ZONK_MERGE_KEY, '1')
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

  const wheelPrizes = computed(() =>
    // Tampil di roda selama masih ada stok (termasuk sisa 1)
    prizes.value.filter((p) => p.active !== false && p.stock > 0),
  )

  const winnablePrizes = computed(() =>
    // Bisa diundi hanya jika stok > 1 (sisa 1 tidak boleh terpilih)
    prizes.value.filter((p) => p.active !== false && p.stock > 1),
  )

  async function addPrize({ name, stock, color, logo }) {
    const payload = {
      name: String(name || '').trim(),
      stock: Math.max(0, Number(stock) || 0),
      color: color || '#A68D5F',
      logo: logo || '',
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
    wheelPrizes,
    winnablePrizes,
    loading,
    error,
    isLocalMode: !isFirebaseConfigured,
    addPrize,
    updatePrize,
    adjustStock,
    removePrize,
  }
}
