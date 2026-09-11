<script setup>
import { reactive } from 'vue'

defineProps({
  prizes: { type: Array, required: true },
})

const emit = defineEmits(['add', 'update', 'adjust', 'remove'])

const form = reactive({
  name: '',
  stock: 5,
  color: '#A68D5F',
})

const colors = [
  '#C9A227',
  '#2F5D50',
  '#D4764E',
  '#1E3A5F',
  '#A68D5F',
  '#8B5E3C',
  '#4A7C6F',
  '#B85C38',
  '#6B8F71',
  '#3F4E63',
  '#C4A574',
  '#9C6B4F',
  '#5F7161',
  '#A67C52',
  '#6E6A63',
]

function submit() {
  if (!form.name.trim()) return
  emit('add', { name: form.name, stock: form.stock, color: form.color })
  form.name = ''
  form.stock = 5
}

function onName(prize, e) {
  emit('update', prize.id, { name: e.target.value })
}

function onColor(prize, e) {
  emit('update', prize.id, { color: e.target.value })
}

function onActive(prize, e) {
  emit('update', prize.id, { active: e.target.checked })
}

function onStock(prize, e) {
  const raw = e.target.value
  if (raw === '') return
  const next = Math.max(0, Math.min(9999, Math.floor(Number(raw)) || 0))
  e.target.value = String(next)
  if (next === prize.stock) return
  emit('update', prize.id, { stock: next })
}

function onStockBlur(prize, e) {
  if (e.target.value === '') {
    e.target.value = String(prize.stock ?? 0)
  }
}
</script>

<template>
  <section class="editor" aria-labelledby="editor-title">
    <div class="editor-head">
      <h2 id="editor-title">Kelola Hadiah</h2>
      <p>Siapa saja yang login bisa menambah, mengubah stok, warna, atau menghapus opsi.</p>
    </div>

    <form class="add-form" @submit.prevent="submit">
      <input
        v-model="form.name"
        type="text"
        placeholder="Nama barang"
        maxlength="40"
        required
      />
      <input v-model.number="form.stock" type="number" min="0" max="9999" aria-label="Stok" />
      <input v-model="form.color" type="color" aria-label="Warna" />
      <button type="submit" class="btn-primary">Tambah</button>
    </form>

    <div class="swatches" aria-hidden="true">
      <button
        v-for="c in colors"
        :key="c"
        type="button"
        class="swatch"
        :style="{ background: c }"
        @click="form.color = c"
      />
    </div>

    <ul class="prize-list">
      <li v-for="prize in prizes" :key="prize.id" class="prize-row">
        <span class="dot" :style="{ background: prize.color }" />
        <input
          class="name-input"
          :value="prize.name"
          @change="onName(prize, $event)"
        />
        <input
          class="color-input"
          type="color"
          :value="prize.color"
          @input="onColor(prize, $event)"
        />
        <div class="stock-ctrl">
          <button type="button" @click="emit('adjust', prize.id, -1)" aria-label="Kurangi stok">−</button>
          <input
            class="stock"
            type="number"
            min="0"
            max="9999"
            :value="prize.stock"
            aria-label="Stok"
            @change="onStock(prize, $event)"
            @blur="onStockBlur(prize, $event)"
          />
          <button type="button" @click="emit('adjust', prize.id, 1)" aria-label="Tambah stok">+</button>
        </div>
        <label class="active-toggle">
          <input
            type="checkbox"
            :checked="prize.active !== false"
            @change="onActive(prize, $event)"
          />
          Aktif
        </label>
        <button type="button" class="btn-danger" @click="emit('remove', prize.id)">Hapus</button>
      </li>
    </ul>

    <p v-if="!prizes.length" class="empty">Belum ada hadiah. Tambahkan di atas.</p>
  </section>
</template>

<style scoped>
.editor {
  text-align: left;
  background: #fff;
  border: 1px solid var(--shiratha-line);
  border-radius: 24px;
  padding: 1.35rem 1.35rem 1.5rem;
  box-shadow: var(--shiratha-shadow);
}

.editor-head h2 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--shiratha-ink);
}

.editor-head p {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: var(--shiratha-muted);
}

.add-form {
  display: grid;
  grid-template-columns: 1fr 72px 48px auto;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}

.add-form input[type='text'],
.add-form input[type='number'],
.name-input {
  border: 1px solid var(--shiratha-line);
  border-radius: 14px;
  padding: 0.6rem 0.75rem;
  font: inherit;
  background: #fff;
  color: var(--shiratha-ink);
}

.add-form input[type='color'],
.color-input {
  width: 100%;
  height: 42px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.swatch {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px var(--shiratha-line);
  cursor: pointer;
  padding: 0;
}

.prize-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prize-row {
  display: grid;
  grid-template-columns: 14px 1fr 40px auto auto auto;
  gap: 0.45rem;
  align-items: center;
  padding: 0.55rem 0.45rem;
  border-radius: 16px;
  background: var(--shiratha-bg-soft);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.stock-ctrl {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.stock-ctrl button {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid var(--shiratha-line);
  background: #fff;
  color: var(--shiratha-ink);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
}

.stock {
  width: 3.4rem;
  min-width: 3.4rem;
  text-align: center;
  font-weight: 700;
  color: var(--shiratha-ink);
  font-variant-numeric: tabular-nums;
  border: 1px solid var(--shiratha-line);
  border-radius: 10px;
  padding: 0.3rem 0.25rem;
  background: #fff;
  font: inherit;
  -moz-appearance: textfield;
}

.stock::-webkit-outer-spin-button,
.stock::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.active-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--shiratha-muted);
  white-space: nowrap;
}

.btn-primary,
.btn-danger {
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: var(--shiratha-ink);
  color: #fff;
}

.btn-danger {
  background: transparent;
  color: #c45c4a;
  border: 1px solid rgba(196, 92, 74, 0.35);
  padding: 0.4rem 0.7rem;
  font-size: 0.8rem;
}

.empty {
  margin: 0.75rem 0 0;
  color: var(--shiratha-muted);
  font-size: 0.9rem;
}

@media (max-width: 720px) {
  .add-form {
    grid-template-columns: 1fr 1fr;
  }

  .add-form button {
    grid-column: 1 / -1;
  }

  .prize-row {
    grid-template-columns: 14px 1fr 36px;
    grid-template-rows: auto auto;
  }

  .stock-ctrl {
    grid-column: 1 / 2;
  }

  .active-toggle {
    grid-column: 2 / 3;
  }

  .btn-danger {
    grid-column: 3 / 4;
    justify-self: end;
  }
}
</style>
