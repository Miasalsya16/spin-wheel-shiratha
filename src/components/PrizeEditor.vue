<script setup>
import { reactive, ref } from 'vue'

defineProps({
  prizes: { type: Array, required: true },
  prizesRemaining: { type: Number, default: 0 },
  prizesUsed: { type: Number, default: 0 },
  totalSpins: { type: Number, default: 0 },
})

const emit = defineEmits(['add', 'update', 'adjust', 'remove'])

const form = reactive({
  name: '',
  stock: 5,
  color: '#A68D5F',
  logo: '',
})

const logoInput = ref(null)

const colors = [
  '#E6A817',
  '#0D9488',
  '#E11D48',
  '#1D4ED8',
  '#CA8A04',
  '#9A3412',
  '#059669',
  '#C026D3',
  '#0284C7',
  '#312E81',
  '#F97316',
  '#BE123C',
  '#4D7C0F',
  '#7C3AED',
  '#57534E',
]

function readLogoFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File harus gambar'))
      return
    }
    if (file.size > 1.5 * 1024 * 1024) {
      reject(new Error('Ukuran logo max 1.5MB'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 480
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject(new Error('Gagal baca gambar'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('Gagal baca file'))
    reader.readAsDataURL(file)
  })
}

async function onFormLogo(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    form.logo = await readLogoFile(file)
  } catch (err) {
    alert(err.message || 'Gagal upload logo')
    e.target.value = ''
  }
}

function clearFormLogo() {
  form.logo = ''
  if (logoInput.value) logoInput.value.value = ''
}

async function submit() {
  if (!form.name.trim()) return
  emit('add', {
    name: form.name,
    stock: form.stock,
    color: form.color,
    logo: form.logo,
  })
  form.name = ''
  form.stock = 5
  form.logo = ''
  if (logoInput.value) logoInput.value.value = ''
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
      <p>
        Tambah hadiah, atur stok & warna. Logo opsional saat menambah — muncul di popup saat menang
        (partner bawaan tetap otomatis dari nama).
      </p>
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

    <div class="logo-add">
      <label class="logo-btn">
        <input
          ref="logoInput"
          type="file"
          accept="image/*"
          hidden
          @change="onFormLogo"
        />
        {{ form.logo ? 'Ganti logo' : 'Upload logo (opsional)' }}
      </label>
      <div v-if="form.logo" class="logo-preview-wrap">
        <img :src="form.logo" alt="Preview logo" class="logo-preview" />
        <button type="button" class="logo-clear" @click="clearFormLogo">Hapus</button>
      </div>
    </div>

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
        <div class="row-top">
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
        </div>

        <div class="row-bottom">
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
        </div>
      </li>
    </ul>

    <p v-if="!prizes.length" class="empty">Belum ada hadiah. Tambahkan di atas.</p>

    <div class="stats">
      <div class="stat">
        <span class="stat-label">Sisa hadiah</span>
        <strong class="stat-value">{{ prizesRemaining }}</strong>
      </div>
      <div class="stat">
        <span class="stat-label">Hadiah terpakai</span>
        <strong class="stat-value">{{ prizesUsed }}</strong>
      </div>
      <div class="stat">
        <span class="stat-label">Total spin</span>
        <strong class="stat-value">{{ totalSpins }}</strong>
      </div>
    </div>
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

.logo-add {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.85rem;
}

.logo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1px dashed rgba(166, 141, 95, 0.55);
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--shiratha-gold);
  background: #fff;
  cursor: pointer;
}

.logo-preview-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.logo-preview {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 10px;
  border: 1px solid var(--shiratha-line);
  background: #fff;
}

.logo-clear {
  border: 1px solid var(--shiratha-line);
  background: #fff;
  color: var(--shiratha-muted);
  cursor: pointer;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 600;
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem 0.65rem;
  padding: 0.65rem 0.6rem;
  border-radius: 16px;
  background: var(--shiratha-bg-soft);
}

.row-top {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr) 40px;
  gap: 0.45rem;
  align-items: center;
  flex: 1 1 220px;
  min-width: 0;
}

.row-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  flex: 1 1 220px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stock-ctrl {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
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
  flex-shrink: 0;
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
  margin-left: auto;
}

.empty {
  margin: 0.75rem 0 0;
  color: var(--shiratha-muted);
  font-size: 0.9rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
  margin-top: 1.15rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--shiratha-line);
}

.stat {
  background: var(--shiratha-bg-soft);
  border-radius: 16px;
  padding: 0.85rem 0.7rem;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--shiratha-muted);
  margin-bottom: 0.3rem;
}

.stat-value {
  display: block;
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--shiratha-ink);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 720px) {
  .editor {
    padding: 1.1rem 0.95rem 1.25rem;
    border-radius: 20px;
  }

  .stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.45rem;
  }

  .stat {
    padding: 0.7rem 0.4rem;
  }

  .stat-label {
    font-size: 0.62rem;
    letter-spacing: 0.02em;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .add-form {
    grid-template-columns: 1fr 72px 48px;
  }

  .add-form button {
    grid-column: 1 / -1;
  }

  .prize-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
    padding: 0.85rem 0.7rem;
  }

  .row-top {
    flex: none;
    width: 100%;
  }

  .row-bottom {
    flex: none;
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-danger {
    margin-left: auto;
  }
}

@media (max-width: 420px) {
  .row-bottom {
    flex-wrap: wrap;
  }

  .stock-ctrl {
    width: 100%;
    justify-content: space-between;
  }

  .stock-ctrl button {
    width: 40px;
    height: 40px;
  }

  .stock {
    flex: 1;
    width: auto;
    max-width: none;
    min-width: 4rem;
    height: 40px;
  }

  .active-toggle {
    margin-right: auto;
  }

  .btn-danger {
    margin-left: 0;
    flex: 1;
    padding: 0.55rem 0.7rem;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 1.35rem;
  }
}
</style>
