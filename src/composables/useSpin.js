import { ref } from 'vue'
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'

export function useSpin({ prizes, updatePrize }) {
  const spinning = ref(false)
  const lastWinner = ref(null)
  const spinError = ref(null)

  function pickWeighted(list) {
    const total = list.reduce((sum, p) => sum + Math.max(0, p.stock), 0)
    if (total <= 0) return null
    let r = Math.random() * total
    for (const p of list) {
      r -= Math.max(0, p.stock)
      if (r <= 0) return p
    }
    return list[list.length - 1]
  }

  async function commitWin(prize) {
    if (!isFirebaseConfigured || !db) {
      const current = prizes.value.find((p) => p.id === prize.id)
      if (!current || current.stock < 1) {
        throw new Error('Stok habis, silakan spin lagi')
      }
      await updatePrize(prize.id, { stock: current.stock - 1 })
      return { ...current, stock: current.stock - 1 }
    }

    const prizeRef = doc(db, 'prizes', prize.id)
    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(prizeRef)
      if (!snap.exists()) throw new Error('Hadiah tidak ditemukan')
      const data = snap.data()
      if (!data.active || (data.stock || 0) < 1) {
        throw new Error('Stok habis, silakan spin lagi')
      }
      tx.update(prizeRef, {
        stock: data.stock - 1,
        updatedAt: serverTimestamp(),
      })
      return { id: snap.id, ...data, stock: data.stock - 1 }
    })

    await addDoc(collection(db, 'spins'), {
      prizeId: prize.id,
      prizeName: prize.name,
      createdAt: serverTimestamp(),
    })

    return result
  }

  async function spin(spinableList) {
    if (spinning.value) return null
    spinError.value = null

    if (!spinableList.length) {
      spinError.value = 'Tidak ada hadiah dengan stok tersedia'
      return null
    }

    const target = pickWeighted(spinableList)
    if (!target) {
      spinError.value = 'Tidak ada hadiah dengan stok tersedia'
      return null
    }

    spinning.value = true
    try {
      // Animasi dijalankan di komponen; commit stok setelah animasi selesai
      return target
    } catch (err) {
      spinError.value = err.message || 'Gagal spin'
      spinning.value = false
      return null
    }
  }

  async function finishSpin(prize) {
    try {
      const won = await commitWin(prize)
      lastWinner.value = won
      return won
    } catch (err) {
      spinError.value = err.message || 'Gagal mengurangi stok'
      lastWinner.value = null
      return null
    } finally {
      spinning.value = false
    }
  }

  function clearWinner() {
    lastWinner.value = null
  }

  return {
    spinning,
    lastWinner,
    spinError,
    spin,
    finishSpin,
    clearWinner,
    pickWeighted,
  }
}
