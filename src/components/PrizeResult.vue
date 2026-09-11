<script setup>
import { computed } from 'vue'

const props = defineProps({
  winner: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const isZonk = computed(() =>
  String(props.winner?.name || '')
    .trim()
    .toUpperCase()
    .includes('ZONK'),
)

const isMinala = computed(() =>
  String(props.winner?.name || '')
    .toLowerCase()
    .includes('minala'),
)

const isAqobah = computed(() =>
  String(props.winner?.name || '')
    .toLowerCase()
    .includes('aqobah'),
)

const isKanomas = computed(() =>
  String(props.winner?.name || '')
    .toLowerCase()
    .includes('kanomas'),
)

const isJasindo = computed(() =>
  String(props.winner?.name || '')
    .toLowerCase()
    .includes('jasindo'),
)

const isTreetan = computed(() =>
  String(props.winner?.name || '')
    .toLowerCase()
    .includes('treetan'),
)

const partnerLogo = computed(() => {
  // Logo custom dari produk (upload) diprioritaskan
  if (props.winner?.logo) return props.winner.logo

  if (isMinala.value) return '/logo-minala.png'
  if (isAqobah.value) return '/logo-aqobah.png'
  if (isKanomas.value) return '/logo-kanomas.png'
  if (isJasindo.value) return '/logo-jasindo.png'
  if (isTreetan.value) return '/logo-treetan.png'
  return null
})

const partnerAlt = computed(() => {
  if (props.winner?.logo) return props.winner.name || 'Logo'
  if (isMinala.value) return 'Minala'
  if (isAqobah.value) return 'Aqobah'
  if (isKanomas.value) return 'Kanomas'
  if (isJasindo.value) return 'Jasindo'
  if (isTreetan.value) return 'Treetan'
  return ''
})

const hasCustomLogo = computed(() => Boolean(props.winner?.logo))
const useTallBadge = computed(
  () => hasCustomLogo.value || isMinala.value || isKanomas.value,
)
const useWideBadge = computed(
  () =>
    !hasCustomLogo.value &&
    (isTreetan.value || isJasindo.value || isAqobah.value),
)

const confetti = computed(() => {
  const colors = [
    '#a68d5f',
    '#c4b08a',
    '#2d4f4f',
    '#e8c97a',
    '#d4a574',
    '#5a8f8f',
    '#f0d9a0',
    '#2b2b2b',
    '#C9A227',
    '#D4764E',
  ]
  return Array.from({ length: 48 }, (_, i) => ({
    id: i,
    left: `${2 + ((i * 21) % 96)}%`,
    delay: `${(i % 16) * 0.18}s`,
    duration: `${4.8 + (i % 7) * 0.35}s`,
    color: colors[i % colors.length],
    size: `${7 + (i % 5) * 2}px`,
    rotate: `${(i * 53) % 360}deg`,
    drift: `${(i % 2 === 0 ? -1 : 1) * (18 + (i % 8) * 10)}px`,
  }))
})
</script>

<template>
  <div
    v-if="winner"
    class="overlay"
    :class="{ zonk: isZonk }"
    role="dialog"
    aria-modal="true"
    @click.self="emit('close')"
  >
    <div v-if="!isZonk" class="confetti" aria-hidden="true">
      <span
        v-for="piece in confetti"
        :key="piece.id"
        class="piece"
        :style="{
          left: piece.left,
          background: piece.color,
          width: piece.size,
          height: piece.size,
          animationDelay: piece.delay,
          animationDuration: piece.duration,
          '--rot': piece.rotate,
          '--drift': piece.drift,
        }"
      />
    </div>

    <div class="card" :class="{ win: !isZonk, miss: isZonk }">
      <div class="burst" aria-hidden="true" />
      <div
        class="badge"
        :class="{
          'badge-logo': !!partnerLogo,
          'badge-wide': useWideBadge,
          'badge-tall': useTallBadge,
        }"
        :style="partnerLogo ? undefined : { background: winner.color || 'var(--shiratha-gold)' }"
      >
        <span class="badge-ring" />
        <span class="badge-ring ring-2" />
        <span class="badge-ring ring-3" />
        <img
          v-if="partnerLogo"
          class="partner-logo"
          :src="partnerLogo"
          :alt="partnerAlt"
        />
        <span v-else class="badge-icon">{{ isZonk ? '😢' : '★' }}</span>
      </div>

      <p class="eyebrow">{{ isZonk ? 'Hampir saja' : 'Selamat!' }}</p>
      <h2>{{ winner.name }}</h2>
      <p class="msg">
        {{
          isZonk
            ? 'Belum beruntung kali ini. Coba spin lagi!'
            : 'Kamu memenangkan hadiah ini'
        }}
      </p>
      <p v-if="!isZonk" class="sub">
        Stok tersisa: <strong>{{ winner.stock }}</strong>
      </p>

      <button type="button" class="cta" @click="emit('close')">
        {{ isZonk ? 'Coba Lagi' : 'Ambil Hadiah' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgba(20, 18, 14, 0.72);
  backdrop-filter: blur(3px);
  animation: overlay-in 0.28s ease both;
  overflow: hidden;
}

.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.piece {
  position: absolute;
  top: -12px;
  border-radius: 3px;
  opacity: 0;
  pointer-events: none;
  animation-name: confetti-fall;
  animation-timing-function: cubic-bezier(0.2, 0.7, 0.3, 1);
  animation-iteration-count: 2;
  animation-fill-mode: both;
}

.card {
  position: relative;
  width: min(440px, 94vw);
  background: #fff;
  border: 1px solid var(--shiratha-line);
  color: var(--shiratha-ink);
  border-radius: 28px;
  padding: 2.4rem 1.85rem 1.9rem;
  text-align: center;
  box-shadow: 0 28px 70px rgba(20, 18, 14, 0.28);
  overflow: hidden;
  z-index: 2;
  pointer-events: auto;
  animation: card-pop 0.55s cubic-bezier(0.18, 0.9, 0.32, 1.25) both;
}

.card.win {
  border-color: rgba(166, 141, 95, 0.45);
}

.card.miss {
  animation: card-soft 0.4s ease both;
}

.burst {
  position: absolute;
  inset: -40% -20% auto;
  height: 220px;
  background: radial-gradient(
    circle at 50% 80%,
    rgba(166, 141, 95, 0.22),
    transparent 62%
  );
  pointer-events: none;
  animation: burst-pulse 2.2s ease-in-out infinite;
}

.card.miss .burst {
  background: radial-gradient(
    circle at 50% 80%,
    rgba(109, 104, 117, 0.16),
    transparent 62%
  );
  animation: none;
}

.badge {
  position: relative;
  width: 84px;
  height: 84px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  box-shadow: 0 10px 24px rgba(166, 141, 95, 0.35);
  pointer-events: none;
  animation: badge-bounce 0.7s cubic-bezier(0.18, 0.9, 0.32, 1.35) 0.12s both;
}

.badge.badge-logo {
  width: 112px;
  height: 112px;
  background: #fff;
  border: 1px solid var(--shiratha-line);
  box-shadow: 0 12px 28px rgba(43, 43, 43, 0.12);
}

.badge.badge-wide {
  width: 168px;
  height: 96px;
  border-radius: 20px;
}

.badge.badge-tall {
  width: 132px;
  height: 148px;
  border-radius: 24px;
}

.badge.badge-tall .partner-logo {
  width: 88%;
  height: 88%;
}

.badge.badge-wide .badge-ring,
.badge.badge-wide .badge-ring.ring-2,
.badge.badge-wide .badge-ring.ring-3 {
  border-radius: 24px;
}

.badge.badge-tall .badge-ring,
.badge.badge-tall .badge-ring.ring-2,
.badge.badge-tall .badge-ring.ring-3 {
  border-radius: 28px;
}

.partner-logo {
  width: 82%;
  height: 70%;
  object-fit: contain;
  display: block;
}

.badge-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(166, 141, 95, 0.45);
  pointer-events: none;
  animation: ring-expand 2.4s ease-out 0.15s infinite;
}

.badge-ring.ring-2 {
  animation-delay: 0.85s;
  border-color: rgba(201, 162, 39, 0.4);
}

.badge-ring.ring-3 {
  animation-delay: 1.55s;
  border-color: rgba(47, 93, 80, 0.35);
}

.card.miss .badge-ring {
  border-color: rgba(109, 104, 117, 0.3);
  animation: none;
}

.badge-icon {
  font-size: 1.85rem;
  line-height: 1;
  animation: star-spin 0.8s ease 0.25s both;
}

.card.miss .badge {
  background: #e8e4dc;
  color: #5c5348;
  box-shadow: 0 8px 20px rgba(43, 43, 43, 0.1);
}

.card.miss .badge-icon {
  animation: none;
  font-size: 2.2rem;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--shiratha-gold);
  animation: fade-up 0.45s ease 0.18s both;
}

.card.miss .eyebrow {
  color: var(--shiratha-muted);
}

.card h2 {
  margin: 0.45rem 0 0.4rem;
  font-size: clamp(1.75rem, 5.5vw, 2.15rem);
  font-weight: 800;
  color: var(--shiratha-ink);
  animation: fade-up 0.45s ease 0.24s both;
}

.card.win h2 {
  background: linear-gradient(120deg, #2b2b2b 20%, #a68d5f 50%, #2b2b2b 80%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation:
    fade-up 0.45s ease 0.24s both,
    shine 3.2s linear 0.4s infinite;
}

.msg {
  margin: 0 0 0.45rem;
  color: var(--shiratha-muted);
  font-size: 0.95rem;
  animation: fade-up 0.45s ease 0.3s both;
}

.sub {
  margin: 0 0 1.15rem;
  color: var(--shiratha-muted);
  font-size: 0.9rem;
  animation: fade-up 0.45s ease 0.34s both;
}

.cta {
  border: none;
  border-radius: 999px;
  background: var(--shiratha-gold);
  color: #fff;
  font: inherit;
  font-weight: 700;
  padding: 0.95rem 2rem;
  cursor: pointer;
  min-width: 180px;
  font-size: 1.05rem;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
  animation: fade-up 0.45s ease 0.4s both;
}

.cta:hover {
  background: #957a4f;
  transform: translateY(-1px);
}

.card.miss .cta {
  background: var(--shiratha-ink);
}

.card.miss .cta:hover {
  background: #444;
}

.card.miss .msg {
  margin-bottom: 1.15rem;
}

@keyframes overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes card-pop {
  0% {
    opacity: 0;
    transform: scale(0.72) translateY(28px);
  }
  70% {
    opacity: 1;
    transform: scale(1.04) translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes card-soft {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes badge-bounce {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }
  60% {
    opacity: 1;
    transform: scale(1.15);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes ring-expand {
  0% {
    opacity: 0.9;
    transform: scale(0.7);
  }
  100% {
    opacity: 0;
    transform: scale(1.55);
  }
}

@keyframes star-spin {
  from {
    transform: rotate(-40deg) scale(0.6);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

@keyframes burst-pulse {
  0%,
  100% {
    opacity: 0.75;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes confetti-fall {
  0% {
    opacity: 0;
    transform: translate3d(0, -10px, 0) rotate(0deg);
  }
  8% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--drift), 110vh, 0) rotate(var(--rot));
  }
}

@media (max-width: 480px) {
  .overlay {
    padding: 0.85rem;
    align-items: end;
    place-items: unset;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .card {
    width: 100%;
    padding: 1.75rem 1.15rem 1.35rem;
    border-radius: 22px 22px 18px 18px;
    max-height: min(92svh, 640px);
    overflow-y: auto;
  }

  .badge.badge-wide {
    width: min(148px, 70vw);
    height: 84px;
  }

  .badge.badge-tall {
    width: min(112px, 42vw);
    height: 124px;
  }

  .badge.badge-logo:not(.badge-wide):not(.badge-tall) {
    width: 96px;
    height: 96px;
  }

  .cta {
    width: 100%;
    min-width: 0;
  }
}
</style>
