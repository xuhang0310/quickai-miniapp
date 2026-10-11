import { JAVA_API_BASE } from '@/config'
import { request } from './request'

export interface User {
  id: number | string
  email?: string
  nickname: string
  avatar?: string
}

export interface LoginResult {
  token: string
  user: User
  is_new?: boolean
  isNew?: boolean
  registration_bonus?: number
}

/** 现有网页账号登录，开发期用于跑通流程。 */
export function loginWithEmail(email: string, password: string) {
  return request<LoginResult>('/api/auth/login', { method: 'POST', data: { email, password } })
}

/** 微信一键登录。code 来自 uni.login，请求发到 Java /api/v1/auth/wx-login。 */
export function loginWithWechat(code: string, referralCode?: string) {
  const data: Record<string, unknown> = { code }
  if (referralCode) data.referralCode = referralCode
  return request<LoginResult>('/api/v1/auth/wx-login', { method: 'POST', data, base: JAVA_API_BASE })
}

export function getMe() {
  return request<User>('/api/auth/me')
}
