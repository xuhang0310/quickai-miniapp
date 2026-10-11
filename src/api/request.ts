import { API_BASE, CLIENT } from '@/config'
import { publicError } from '@/utils/public'

/** 与网页版 cloudRequest() 相同的返回格式。 */
export interface ApiResult<T> {
  success: boolean
  data?: T
  error?: string
  status?: number
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

const TOKEN_KEY = 'quickai_token'

export function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token: string) {
  if (token) uni.setStorageSync(TOKEN_KEY, token)
  else uni.removeStorageSync(TOKEN_KEY)
}

function headers(json: boolean): Record<string, string> {
  const token = getToken()
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    'X-Client': CLIENT,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

function normalize<T>(status: number, body: unknown): ApiResult<T> {
  if (status === 401) setToken('')
  const payload = (body && typeof body === 'object' ? body : {}) as Record<string, any>
  if (status >= 200 && status < 300 && payload.success !== false) {
    return { success: true, data: ('data' in payload ? payload.data : payload) as T, status }
  }
  return {
    success: false,
    error: publicError(String(payload.error || payload.message || ''), `请求失败（${status}）`),
    status
  }
}

export function request<T>(
  path: string,
  options: { method?: Method; data?: Record<string, unknown>; base?: string } = {}
): Promise<ApiResult<T>> {
  const base = (options.base || API_BASE).replace(/\/$/, '')
  return new Promise(resolve => {
    uni.request({
      url: `${base}${path}`,
      method: options.method || 'GET',
      data: options.data,
      header: headers(true),
      timeout: 60_000,
      success: res => resolve(normalize<T>(res.statusCode, res.data)),
      fail: err => resolve({ success: false, error: err.errMsg || '网络错误，请稍后重试' })
    })
  })
}

/**
 * 把文件直接交给已签名的上传地址。
 * 不附带登录令牌，表单字段在前，文件字段名固定为 file，满足对象存储对字段顺序的要求。
 */
export function postSignedFile(
  url: string,
  filePath: string,
  formData: Record<string, string>
): Promise<ApiResult<null>> {
  return new Promise(resolve => {
    uni.uploadFile({
      url,
      filePath,
      name: 'file',
      formData,
      timeout: 120_000,
      success: res => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, status: res.statusCode })
          return
        }
        resolve({
          success: false,
          error: res.statusCode === 403 ? '图片上传授权已过期，请重新上传' : `图片直传失败（${res.statusCode}）`,
          status: res.statusCode
        })
      },
      fail: err => resolve({ success: false, error: err.errMsg || '图片直传失败，请检查网络后重试' })
    })
  })
}

/** 以 multipart/form-data 上传本地文件。 */
export function upload<T>(path: string, filePath: string, name = 'image'): Promise<ApiResult<T>> {
  return new Promise(resolve => {
    uni.uploadFile({
      url: `${API_BASE}${path}`,
      filePath,
      name,
      header: headers(false),
      timeout: 120_000,
      success: res => {
        let body: unknown = {}
        try {
          body = JSON.parse(res.data as string)
        } catch {
          body = {}
        }
        resolve(normalize<T>(res.statusCode, body))
      },
      fail: err => resolve({ success: false, error: err.errMsg || '上传失败，请稍后重试' })
    })
  })
}
