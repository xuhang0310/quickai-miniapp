import { request, upload } from './request'

export interface CreativeTemplate {
  id: number
  title: string
  description: string
  prompt: string
  model: string
  size: string
  resolution: string
  reference_images: string[] | null
  cover_url: string | null
  category: string
  like_count: number
  use_count: number
  is_official: boolean
  created_at: string
}

export interface ImageTask {
  id: number
  template_id: number | null
  prompt: string
  model: string
  size: string
  resolution: string
  status: 'pending' | 'queued' | 'in_progress' | 'completed' | 'failed'
  progress: number
  result_url: string | null
  credits_charged: number
  error_message: string | null
  created_at: string
}

export interface GenerateImagePayload {
  prompt: string
  template_id?: number
  model?: string
  size?: string
  resolution?: string
  quality?: 'low' | 'medium' | 'high'
  reference_images?: string[]
}

export async function getTemplates(params: { page?: number; pageSize?: number; category?: string } = {}) {
  const result = await request<{ list?: CreativeTemplate[]; templates?: CreativeTemplate[]; total: number }>(
    '/api/creative/templates',
    { data: params }
  )
  if (!result.success || !result.data) return { ...result, data: undefined }
  return {
    ...result,
    data: { list: result.data.templates || result.data.list || [], total: result.data.total || 0 }
  }
}

export function getTemplate(id: number) {
  return request<CreativeTemplate>(`/api/creative/templates/${id}`)
}

export function generateImage(payload: GenerateImagePayload) {
  return request<{ task?: ImageTask } & Partial<ImageTask>>('/api/creative/generate', {
    method: 'POST',
    data: { n: 1, source_type: 'image-creation', ...payload }
  })
}

export function getImageTask(id: number) {
  return request<ImageTask>(`/api/creative/task/${id}`)
}

/** 上传参考图，返回可用于生成的图片地址。 */
export async function uploadImage(filePath: string) {
  const result = await upload<{ url?: string }>('/api/upload/image', filePath)
  if (result.success && !result.data?.url) {
    return { success: false, error: '上传成功但没有返回图片地址', status: result.status }
  }
  return result
}
