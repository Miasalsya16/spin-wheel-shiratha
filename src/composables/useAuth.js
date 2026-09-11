import { computed, ref } from 'vue'

const AUTH_KEY = 'spin-wheel-auth'

// Kredensial statis — ubah lewat .env (VITE_LOGIN_USER / VITE_LOGIN_PASS)
const USER = import.meta.env.VITE_LOGIN_USER || 'shiratha'
const PASS = import.meta.env.VITE_LOGIN_PASS || 'spinwheel2026'

const loggedIn = ref(localStorage.getItem(AUTH_KEY) === '1')
const loginError = ref('')

export function useAuth() {
  const isAuthenticated = computed(() => loggedIn.value)

  function login(username, password) {
    loginError.value = ''
    const u = String(username || '').trim()
    const p = String(password || '')

    if (u === USER && p === PASS) {
      localStorage.setItem(AUTH_KEY, '1')
      loggedIn.value = true
      return true
    }

    loginError.value = 'Username atau password salah'
    return false
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY)
    loggedIn.value = false
  }

  return {
    isAuthenticated,
    loginError,
    login,
    logout,
  }
}
