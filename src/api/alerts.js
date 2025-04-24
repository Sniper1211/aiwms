import request from '@/utils/request'

export function getAlerts(params) {
  return request({
    url: '/api/alerts',
    method: 'get',
    params
  })
}

export function processAlert(data) {
  return request({
    url: '/api/alerts/process',
    method: 'post',
    data
  })
}