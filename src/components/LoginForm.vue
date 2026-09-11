<script setup>
import { reactive, ref } from 'vue'

defineProps({
  error: { type: String, default: '' },
})

const emit = defineEmits(['login'])

const form = reactive({
  username: '',
  password: '',
})

const showPass = ref(false)

function submit() {
  emit('login', { username: form.username, password: form.password })
}
</script>

<template>
  <div class="login-page">
    <form class="card" @submit.prevent="submit">
      <img class="brand-logo" src="/logo-shiratha.png" alt="Shiratha" width="436" height="126" />
      <h1>Spin Wheel</h1>
      <p class="sub">Masuk untuk mengelola & menjalankan undian</p>

      <label>
        Username
        <input
          v-model="form.username"
          type="text"
          autocomplete="username"
          required
          autofocus
        />
      </label>

      <label>
        Password
        <div class="pass-row">
          <input
            v-model="form.password"
            :type="showPass ? 'text' : 'password'"
            autocomplete="current-password"
            required
          />
          <button type="button" class="toggle" @click="showPass = !showPass">
            {{ showPass ? 'Sembunyi' : 'Lihat' }}
          </button>
        </div>
      </label>

      <p v-if="error" class="err" role="alert">{{ error }}</p>

      <button type="submit" class="submit">Masuk</button>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: linear-gradient(180deg, #f7f5f1 0%, #ffffff 55%);
}

.card {
  width: min(420px, 100%);
  background: #fff;
  border: 1px solid var(--shiratha-line);
  border-radius: 24px;
  padding: 2rem 1.6rem 1.6rem;
  text-align: left;
  box-shadow: var(--shiratha-shadow);
}

.brand-logo {
  display: block;
  width: min(220px, 70%);
  height: auto;
  margin: 0 auto 0.35rem;
}

.card h1 {
  margin: 0.45rem 0 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--shiratha-gold);
  text-align: center;
}

.sub {
  margin: 0 0 1.35rem;
  text-align: center;
  color: var(--shiratha-muted);
  font-size: 0.92rem;
}

label {
  display: block;
  margin-bottom: 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--shiratha-ink);
}

input {
  display: block;
  width: 100%;
  margin-top: 0.4rem;
  border: 1px solid var(--shiratha-line);
  border-radius: 14px;
  padding: 0.75rem 0.9rem;
  font: inherit;
  background: #fff;
  color: var(--shiratha-ink);
}

.pass-row {
  display: flex;
  gap: 0.45rem;
  align-items: stretch;
}

.pass-row input {
  flex: 1;
}

.toggle {
  border: 1px solid var(--shiratha-line);
  border-radius: 14px;
  background: #fff;
  color: var(--shiratha-muted);
  padding: 0 0.8rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.err {
  margin: 0 0 0.75rem;
  color: #c45c4a;
  font-size: 0.88rem;
}

.submit {
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: var(--shiratha-gold);
  cursor: pointer;
}

.submit:hover {
  background: #957a4f;
}
</style>
