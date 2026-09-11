<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import SpinWheel from './components/SpinWheel.vue'
import PrizeEditor from './components/PrizeEditor.vue'
import PrizeResult from './components/PrizeResult.vue'
import LoginForm from './components/LoginForm.vue'
import { usePrizes } from './composables/usePrizes'
import { useSpin } from './composables/useSpin'
import { useAuth } from './composables/useAuth'
import { useSpinStats } from './composables/useSpinStats'

const { isAuthenticated, loginError, login, logout } = useAuth()

const {
  prizes,
  wheelPrizes,
  winnablePrizes,
  loading,
  error,
  isLocalMode,
  addPrize,
  updatePrize,
  adjustStock,
  removePrize,
} = usePrizes()

const { totalSpins, prizesUsed, prizesRemaining, recordSpin } =
  useSpinStats(prizes)

const { spinning, lastWinner, spinError, spin, finishSpin, clearWinner } =
  useSpin({ prizes, updatePrize, recordSpin })

const rotation = ref(0)
const animating = ref(false)
const presentation = ref(false)

const canSpin = computed(
  () =>
    !loading.value &&
    !animating.value &&
    !spinning.value &&
    !lastWinner.value &&
    winnablePrizes.value.length > 0,
)

function onLogin({ username, password }) {
  login(username, password)
}

function targetRotationFor(prize) {
  // Index harus dari tampilan roda (termasuk item stok 1)
  const list = wheelPrizes.value
  const index = list.findIndex((p) => p.id === prize.id)
  const n = list.length
  const slice = 360 / n
  const center = index * slice + slice / 2
  const jitter = (Math.random() - 0.5) * slice * 0.6
  const spins = 5 + Math.floor(Math.random() * 3)
  const current = rotation.value % 360
  const desired = (360 - (center + jitter) + 360) % 360
  const delta = (desired - current + 360) % 360
  return rotation.value + spins * 360 + delta
}

async function onSpin() {
  if (!canSpin.value) return
  const target = await spin(winnablePrizes.value)
  if (!target) return

  animating.value = true
  try {
    rotation.value = targetRotationFor(target)
    await new Promise((r) => setTimeout(r, 5000))
    await finishSpin(target)
  } finally {
    animating.value = false
  }
}

function onCloseResult() {
  clearWinner()
}

async function enterPresentation() {
  presentation.value = true
  try {
    await document.documentElement.requestFullscreen?.()
  } catch {
    /* browser boleh menolak; layout tetap full */
  }
}

async function exitPresentation() {
  presentation.value = false
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen()
    } catch {
      /* ignore */
    }
  }
}

function onFullscreenChange() {
  if (!document.fullscreenElement && presentation.value) {
    presentation.value = false
  }
}

function onKeydown(e) {
  if (e.key === 'Escape' && presentation.value && !document.fullscreenElement) {
    presentation.value = false
  }
}

async function onLogout() {
  if (presentation.value) await exitPresentation()
  logout()
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <LoginForm
    v-if="!isAuthenticated"
    :error="loginError"
    @login="onLogin"
  />

  <div v-else class="page" :class="{ presentation }">
    <div class="atmosphere" aria-hidden="true" />

    <header v-if="!presentation" class="hero">
      <img class="brand-logo" src="/logo-shiratha.png" alt="Shiratha" width="436" height="126" />
      <h1>Spin Wheel</h1>
      <p class="tagline">Hadiah berstok terbatas — stok berkurang otomatis saat menang.</p>
      <div class="hero-meta">
        <p v-if="isLocalMode" class="mode-badge">Mode lokal — stok & edit tersimpan di browser</p>
        <p v-else class="mode-badge live">Terhubung Firebase</p>
        <button type="button" class="logout-btn" @click="onLogout">Keluar</button>
      </div>
    </header>

    <header v-else class="hero hero-present">
      <img class="brand-logo" src="/logo-shiratha.png" alt="Shiratha" width="436" height="126" />
      <h1>Spin Wheel</h1>
    </header>

    <main class="layout" :class="{ 'layout-present': presentation }">
      <section class="stage">
        <SpinWheel
          :prizes="wheelPrizes"
          :rotation="rotation"
          :spinning="animating"
          :large="presentation"
        />

        <div class="actions">
          <button
            type="button"
            class="spin-btn"
            :disabled="!canSpin"
            @click="onSpin"
          >
            {{ animating || spinning ? 'Berputar…' : 'Spin' }}
          </button>

          <button
            v-if="!presentation"
            type="button"
            class="present-btn"
            @click="enterPresentation"
          >
            Full Layar
          </button>
          <button
            v-else
            type="button"
            class="present-btn exit"
            @click="exitPresentation"
          >
            Keluar Full Layar
          </button>
        </div>

        <p v-if="!winnablePrizes.length && !loading" class="hint">
          Semua hadiah sudah di stok cadangan (sisa 1) — masih tampil di roda, tapi tidak bisa terpilih. Tambah stok untuk lanjut spin.
        </p>
        <p v-if="spinError" class="err">{{ spinError }}</p>
        <p v-if="error" class="err">{{ error }}</p>
      </section>

      <PrizeEditor
        v-if="!presentation"
        :prizes="prizes"
        :prizes-remaining="prizesRemaining"
        :prizes-used="prizesUsed"
        :total-spins="totalSpins"
        @add="addPrize"
        @update="updatePrize"
        @adjust="adjustStock"
        @remove="removePrize"
      />
    </main>

    <PrizeResult :winner="lastWinner" @close="onCloseResult" />
  </div>
</template>

<style scoped>
.page {
  position: relative;
  min-height: 100svh;
  overflow-x: hidden;
}

.page.presentation {
  height: 100svh;
  min-height: 100svh;
  max-height: 100svh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.atmosphere {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, #f7f5f1 0%, #ffffff 42%, #ffffff 100%);
}

.hero {
  text-align: center;
  padding: 2rem 1.25rem 0.35rem;
}

.hero-present {
  flex-shrink: 0;
  width: 100%;
  padding: 1rem 1.25rem 0.35rem;
}

.brand-logo {
  display: block;
  width: min(260px, 70vw);
  height: auto;
  margin: 0 auto;
}

.hero-present .brand-logo {
  width: min(200px, 36vmin);
}

.hero h1 {
  margin: 0.65rem 0 0.45rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--shiratha-gold);
}

.hero-present h1 {
  margin: 0.35rem 0 0;
  font-size: 0.72rem;
}

.tagline {
  margin: 0 auto;
  max-width: 28rem;
  color: var(--shiratha-muted);
  font-size: 0.95rem;
}

.mode-badge {
  display: inline-block;
  margin: 0;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: var(--shiratha-teal);
}

.mode-badge.live {
  background: var(--shiratha-teal);
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  margin-top: 0.9rem;
}

.logout-btn {
  border: 1px solid var(--shiratha-line);
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--shiratha-ink);
  background: #fff;
  cursor: pointer;
}

.logout-btn:hover {
  border-color: var(--shiratha-gold);
  color: var(--shiratha-gold);
}

.layout {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1.75rem;
  max-width: 920px;
  margin: 0 auto;
  padding: 1.25rem 1.25rem 3rem;
}

.layout-present {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  padding: 0.5rem 1.5rem 1.5rem;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.stage {
  text-align: center;
  padding: 1.35rem 1rem 1.5rem;
  background: #fff;
  border: 1px solid var(--shiratha-line);
  border-radius: 24px;
  box-shadow: var(--shiratha-shadow);
}

.layout-present .stage {
  border: none;
  box-shadow: none;
  background: transparent;
  padding: 0;
  width: auto;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 0 1 auto;
}

.layout-present .actions {
  flex-shrink: 0;
  margin-top: 1.25rem;
  gap: 0.75rem;
}

.layout-present .spin-btn {
  min-width: 160px;
  padding: 0.95rem 2rem;
  font-size: 1.05rem;
}

.layout-present .present-btn {
  padding: 0.95rem 1.35rem;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: center;
  margin-top: 1.15rem;
}

.spin-btn {
  min-width: 150px;
  border: none;
  border-radius: 999px;
  padding: 0.9rem 1.8rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fff;
  background: var(--shiratha-gold);
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;
}

.spin-btn:hover:not(:disabled) {
  background: #957a4f;
}

.spin-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.present-btn {
  border: 1px solid var(--shiratha-line);
  border-radius: 999px;
  padding: 0.9rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--shiratha-ink);
  background: #fff;
  cursor: pointer;
}

.present-btn:hover {
  border-color: var(--shiratha-gold);
  color: var(--shiratha-gold);
}

.present-btn.exit {
  color: var(--shiratha-gold);
  border-color: rgba(166, 141, 95, 0.45);
}

.hint,
.err {
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
}

.hint {
  color: var(--shiratha-muted);
}

.err {
  color: #c45c4a;
}

@media (max-width: 860px) {
  .layout {
    padding: 1rem 0.85rem 2.5rem;
    gap: 1.25rem;
  }

  .hero {
    padding: 1.25rem 1rem 0.25rem;
  }

  .brand-logo {
    width: min(200px, 58vw);
  }

  .tagline {
    font-size: 0.88rem;
    padding-inline: 0.25rem;
  }

  .stage {
    padding: 1rem 0.75rem 1.25rem;
    border-radius: 20px;
  }

  .page:not(.presentation) .actions {
    flex-direction: column;
    align-items: stretch;
    margin-top: 1rem;
  }

  .page:not(.presentation) .spin-btn,
  .page:not(.presentation) .present-btn {
    width: 100%;
    min-width: 0;
  }

  .layout-present {
    padding: 0.35rem 1rem 1rem;
    max-width: 100%;
  }

  .layout-present .actions {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    max-width: 420px;
    justify-content: center;
  }

  .layout-present .spin-btn,
  .layout-present .present-btn {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .layout {
    padding: 0.75rem 0.65rem 2rem;
  }

  .hero h1 {
    letter-spacing: 0.2em;
  }

  .mode-badge {
    font-size: 0.7rem;
    padding: 0.3rem 0.7rem;
  }

  .hint,
  .err {
    font-size: 0.85rem;
  }
}
</style>
