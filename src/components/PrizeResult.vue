<script setup>
defineProps({
  winner: { type: Object, default: null },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="winner" class="overlay" role="dialog" aria-modal="true" @click.self="emit('close')">
    <div class="card">
      <p class="eyebrow">Hasil spin</p>
      <h2>{{ winner.name }}</h2>
      <p class="sub">
        Stok tersisa: <strong>{{ winner.stock }}</strong>
      </p>
      <span class="chip" :style="{ background: winner.color }" />
      <button type="button" @click="emit('close')">Tutup</button>
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
  background: rgba(43, 43, 43, 0.45);
}

.card {
  width: min(360px, 100%);
  background: #fff;
  border: 1px solid var(--shiratha-line);
  color: var(--shiratha-ink);
  border-radius: 24px;
  padding: 1.7rem 1.5rem;
  text-align: center;
  box-shadow: var(--shiratha-shadow);
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--shiratha-gold);
}

.card h2 {
  margin: 0.45rem 0 0.35rem;
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--shiratha-ink);
}

.sub {
  margin: 0 0 1rem;
  color: var(--shiratha-muted);
}

.chip {
  display: inline-block;
  width: 42px;
  height: 6px;
  border-radius: 999px;
  margin-bottom: 1.1rem;
}

.card button {
  border: none;
  border-radius: 999px;
  background: var(--shiratha-gold);
  color: #fff;
  font: inherit;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}
</style>
