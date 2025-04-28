import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    userInfo: null
  }),
  actions: {
    setToken(newToken) {
      this.token = newToken
      // 触发路由重定向等状态变更
      localStorage.setItem('token', newToken)
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token
  }
})