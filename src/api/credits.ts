import { request } from './request'

export function getCreditBalance() {
  return request<{ balance: number }>('/api/credits/balance')
}
