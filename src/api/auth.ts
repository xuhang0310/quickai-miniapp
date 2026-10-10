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
  registration_bonus?: number
}

/** 现有网页账号登录，开发期用于跑通流程。 */
export function loginWithEmail(email: string, password: string) {
  return request<LoginResult>('/api/auth/login', { method: 'POST', data: { email, password } })
}

/** 微信一键登录。后端接口待实现，契约见 docs/PLAN.md 第 5 节。 */
export function loginWithWechat(code: string, inviteCode?: string) {
  return request<LoginResult>('/api/auth/wechat-mini/login', {
    method: 'POST',
    data: { code, invite_code: inviteCode }
  })
}

export function getMe() {
  return request<User>('/api/auth/me')
}
