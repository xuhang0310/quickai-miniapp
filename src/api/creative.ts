import { MP_IMAGE_MODEL } from '@/config'
import { readTask } from '@/utils/task'
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
  is_official: boolean | number
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
  size?: string
  resolution?: string
  quality?: 'low' | 'medium' | 'high'
  reference_images?: string[]
  source_type?: string
}

/** 这些模型的参考图字段是 image_urls，其余用 reference_images。与网页版保持一致。 */
const IMAGE_URL_MODELS = new Set([
  'gemini-nano-banana-2.1',
  'gemini-nano-banana-2.1-vip',
  'nano-banana-pro',
  'nano-banana-pro-vip',
  'nano-banana2',
  'gemini-3-pro-image-preview',
  'gemini-3-pro-image-preview-vip',
  'gemini-3.1-flash-image-preview'
])

export async function getTemplates(params: { page?: number; pageSize?: number; category?: string; search?: string } = {}) {
  const data: Record<string, unknown> = {}
  if (params.page) data.page = params.page
  if (params.pageSize) data.pageSize = params.pageSize
  if (params.category) data.category = params.category
  if (params.search) data.search = params.search
  const result = await request<{ list?: CreativeTemplate[]; templates?: CreativeTemplate[]; total: number }>(
    '/api/creative/templates',
    { data }
  )
  if (!result.success || !result.data) return { ...result, data: undefined }
  return {
    ...result,
    data: { list: result.data.templates || result.data.list || [], total: result.data.total || 0 }
  }
}

export async function getTemplate(id: number) {
  const result = await request<CreativeTemplate & { template?: CreativeTemplate }>(`/api/creative/templates/${id}`)
  if (!result.success || !result.data) return { ...result, data: undefined }
  const template = result.data.template?.id ? result.data.template : result.data
  return { ...result, data: { ...template, model: '' } }
}

export function generateImage(payload: GenerateImagePayload) {
  const model = MP_IMAGE_MODEL
  const refs = (payload.reference_images || []).filter(url => /^https?:\/\//i.test(url))
  const data: Record<string, unknown> = {
    n: 1,
    source_type: payload.source_type || 'image-creation',
    prompt: payload.prompt,
    model
  }
  if (payload.template_id) data.template_id = payload.template_id
  if (payload.size) data.size = payload.size
  if (payload.resolution) data.resolution = payload.resolution
  if (payload.quality) data.quality = payload.quality
  if (refs.length) {
    if (IMAGE_URL_MODELS.has(model)) data.image_urls = refs
    else data.reference_images = refs
  }
  return request<{ task?: ImageTask } & Partial<ImageTask>>('/api/creative/generate', {
    method: 'POST',
    data
  })
}

export function getImageTask(id: number) {
  return request<ImageTask>(`/api/creative/task/${id}`)
}

export async function getImageTasks(params: { page?: number; pageSize?: number } = {}) {
  const result = await request<{ tasks?: ImageTask[]; list?: ImageTask[]; total?: number }>('/api/creative/tasks', {
    data: params
  })
  if (!result.success || !result.data) return { ...result, data: undefined }
  const list = (result.data.tasks || result.data.list || [])
    .map(item => readTask(item))
    .filter((item): item is ImageTask => Boolean(item))
  return { ...result, data: { list, total: result.data.total || list.length } }
}

/** 上传参考图，返回可用于生成的图片地址。 */
export async function uploadImage(filePath: string) {
  const result = await upload<{ url?: string }>('/api/upload/image', filePath)
  if (result.success && !result.data?.url) {
    return { success: false, error: '上传成功但没有返回图片地址', status: result.status }
  }
  return result
}
