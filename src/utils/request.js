import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from './auth'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据后端约定的状态码进行处理
    if (res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      
      // 处理特定错误码
      if (res.code === 401) {
        // token过期或无效
        removeToken()
        window.location.reload()
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  error => {
    console.error('响应错误：', error)
    ElMessage({
      message: error.message || '网络错误',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

// 封装GET请求
export const get = (url, params) => {
  return service({
    url,
    method: 'get',
    params
  })
}

// 封装POST请求
export const post = (url, data) => {
  return service({
    url,
    method: 'post',
    data
  })
}

// 封装PUT请求
export const put = (url, data) => {
  return service({
    url,
    method: 'put',
    data
  })
}

// 封装DELETE请求
export const del = (url, params) => {
  return service({
    url,
    method: 'delete',
    params
  })
}

export default service