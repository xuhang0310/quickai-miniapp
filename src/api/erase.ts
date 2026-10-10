import { postSignedFile, request } from './request'
import { readFileSize } from '@/utils/imageFile'
import { publicError } from '@/utils/public'

export interface EraseJob {
  id: string
  status: string
  progress: number
  error?: string | null
}

interface UploadTicket {
  uploadUrl?: string
  publicUrl?: string
  objectKey?: string
  fields?: Record<string, string>
  uploadToken?: string
  reused?: boolean
  url?: string
}

export function readEraseJob(raw: unknown): EraseJob | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, any>
  const nested = row.job && typeof row.job === 'object'
    ? row.job
    : row.data && typeof row.data === 'object' && (row.data.id || row.data.job_id)
      ? row.data
      : row
  const id = String(nested.id || nested.job_id || '')
  if (!id) return null
  return {
    id,
    status: String(nested.status || nested.state || 'queued'),
    progress: Number(nested.progress || 0),
    error: nested.error ? String(nested.error) : null
  }
}

function usableKey(ticket: { url?: string; objectKey?: string; publicUrl?: string }) {
  const key = ticket.objectKey || ''
  const url = ticket.url || ticket.publicUrl || ''
  return key.startsWith('uploads/') && url.startsWith('https://')
}

/** 擦除原图和遮罩都走 purpose=erase 的直传，任务接口要的是对象键。 */
export async function uploadEraseImage(filePath: string, filename: string, contentType: string) {
  const size = await readFileSize(filePath)
  if (!size) return { success: false as const, error: '图片是空的，请重新选择' }
  const signed = await request<UploadTicket>('/api/upload/image-presign', {
    method: 'POST',
    data: { filename, contentType, size, purpose: 'erase' }
  })
  if (!signed.success || !signed.data) {
    return { success: false as const, error: publicError(signed.error, '获取上传授权失败') }
  }
  const ticket = signed.data
  if (ticket.reused && usableKey(ticket)) {
    return { success: true as const, data: { objectKey: ticket.objectKey as string } }
  }
  if (!ticket.uploadUrl?.startsWith('https://') || !ticket.objectKey || !ticket.fields?.policy || ticket.fields.key !== ticket.objectKey) {
    return { success: false as const, error: '图片上传授权无效，请重新上传' }
  }
  const fields: Record<string, string> = {}
  for (const [key, value] of Object.entries(ticket.fields)) fields[key] = String(value)
  const uploaded = await postSignedFile(ticket.uploadUrl, filePath, fields)
  if (!uploaded.success) return { success: false as const, error: publicError(uploaded.error, '图片直传失败，请重新上传') }
  if (ticket.uploadToken) {
    const done = await request<{ url: string; objectKey: string }>('/api/upload/image-complete', {
      method: 'POST',
      data: { uploadToken: ticket.uploadToken }
    })
    if (!done.success || !done.data?.objectKey) {
      return { success: false as const, error: publicError(done.error, '图片已上传但确认失败，请重试') }
    }
    return { success: true as const, data: { objectKey: done.data.objectKey } }
  }
  return { success: true as const, data: { objectKey: ticket.objectKey } }
}

export function createEraseJob(imageKey: string, maskKey: string, cropMargin: number) {
  return request<unknown>('/api/ecommerce/erase/jobs', {
    method: 'POST',
    data: { image_key: imageKey, mask_key: maskKey, crop_margin: cropMargin }
  })
}

export function getEraseJob(jobId: string) {
  return request<unknown>(`/api/ecommerce/erase/jobs/${encodeURIComponent(jobId)}`)
}

export function publishEraseJob(jobId: string) {
  return request<{ url?: string }>(`/api/ecommerce/erase/jobs/${encodeURIComponent(jobId)}/publish`, {
    method: 'POST',
    data: {}
  })
}
