import CryptoJS from 'crypto-js'

// Token相关操作
export const getToken = () => {
  return localStorage.getItem('token')
}

export const setToken = (token) => {
  localStorage.setItem('token', token)
}

export const removeToken = () => {
  localStorage.removeItem('token')
}

// 密码加密
export const encryptPassword = (password) => {
  return CryptoJS.SHA256(password).toString()
}

// 检查用户权限
export const checkPermission = (permission) => {
  const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]')
  return userPermissions.includes(permission)
}

// 保存用户信息
export const setUserInfo = (userInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

// 获取用户信息
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo')
  return userInfo ? JSON.parse(userInfo) : null
}

// 清除用户信息
export const clearUserInfo = () => {
  localStorage.removeItem('userInfo')
  localStorage.removeItem('permissions')
  removeToken()
}