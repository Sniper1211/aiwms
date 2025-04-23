import { defineStore } from 'pinia'
import { ref } from 'vue'
import { encryptPassword, setToken, setUserInfo, clearUserInfo } from '../utils/auth'
import { post } from '../utils/request'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref('')
  const permissions = ref([])

  // 登录
  const login = async (username, password) => {
    try {
      const encryptedPassword = encryptPassword(password)
      const res = await post('/auth/login', {
        username,
        password: encryptedPassword
      })
      
      const { token: userToken, permissions: userPermissions, ...userData } = res.data
      
      // 保存用户信息和token
      token.value = userToken
      userInfo.value = userData
      permissions.value = userPermissions
      
      setToken(userToken)
      setUserInfo(userData)
      localStorage.setItem('permissions', JSON.stringify(userPermissions))
      
      return true
    } catch (error) {
      console.error('登录失败：', error)
      return false
    }
  }

  // 登出
  const logout = () => {
    clearUserInfo()
    userInfo.value = null
    token.value = ''
    permissions.value = []
  }

  // 获取用户信息
  const getUserProfile = async () => {
    try {
      const res = await post('/user/profile')
      userInfo.value = res.data
      return res.data
    } catch (error) {
      console.error('获取用户信息失败：', error)
      return null
    }
  }

  return {
    userInfo,
    token,
    permissions,
    login,
    logout,
    getUserProfile
  }
})