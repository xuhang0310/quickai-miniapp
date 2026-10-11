import type { ImageTask } from '@/api/creative'
import { publicError } from '@/utils/public'

function readUrl(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const row = value as Record<string, unknown>
    const url = row.url || row.image_url || row.result_url
    if (typeof url === 'string') return url
  }
  return ''
}

/** 把生成接口和任务查询里不稳定的字段收成同一种任务。 */
export function readTask(raw: unknown): ImageTask | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, any>
  const nested = row.task && typeof row.task === 'object' ? row.task : row
  const id = Number(nested.id || 0)
  if (!id && !nested.status && !nested.result_url) return null

  let result = readUrl(nested.result_url) || readUrl(nested.output_url) || readUrl(nested.image_url)
  if (!result && Array.isArray(nested.images) && nested.images.length) result = readUrl(nested.images[0])
  if (!result && Array.isArray(nested.urls) && nested.urls.length) result = readUrl(nested.urls[0])

  const status = String(nested.status || (result ? 'completed' : 'pending'))
  return {
    id,
    template_id: nested.template_id ?? null,
    prompt: String(nested.prompt || ''),
    model: '',
    size: String(nested.size || ''),
    resolution: String(nested.resolution || ''),
    status: (status === 'generating' ? 'in_progress' : status) as ImageTask['status'],
    progress: Number(nested.progress || 0),
    result_url: result || null,
    credits_charged: Number(nested.credits_charged || 0),
    error_message: nested.error_message ? publicError(String(nested.error_message), '生成失败') : null,
    created_at: String(nested.created_at || '')
  }
}
