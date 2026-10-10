import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getMe, loginWithEmail, type LoginResult, type User } from '@/api/auth'
import { getCreditBalance } from '@/api/credits'
import { getToken, setToken } from '@/api/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const user = ref<User | null>(null)
  const balance = ref<number | null>(null)
  const isLoggedIn = computed(() => Boolean(token.value))

  function applyLogin(result: LoginResult) {
    setToken(result.token)
    token.value = result.token
    user.value = result.user
  }

  async function loginByEmail(email: string, password: string) {
    const result = await loginWithEmail(email, password)
    if (result.success && result.data?.token) {
      applyLogin(result.data)
      await refresh()
    }
    return result
  }

  function logout() {
    setToken('')
    token.value = ''
    user.value = null
    balance.value = null
  }

  /** 刷新用户信息与积分；token 失效时退出登录。 */
  async function refresh() {
    if (!token.value) return
    const [me, credits] = await Promise.all([getMe(), getCreditBalance()])
    if (me.status === 401) {
      logout()
      return
    }
    if (me.success && me.data) user.value = me.data
    if (credits.success && credits.data) balance.value = credits.data.balance
  }

  /** 需要登录的操作先调用；未登录时跳转登录页并返回 false。 */
  function requireLogin() {
    if (isLoggedIn.value) return true
    uni.navigateTo({ url: '/pages/login/index' })
    return false
  }

  return { token, user, balance, isLoggedIn, applyLogin, loginByEmail, logout, refresh, requireLogin }
})
