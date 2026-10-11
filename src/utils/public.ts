const LEAK = /gpt-image-2(?:-official)?|openai|nano-banana|gemini|claude|dall-?e|\bgpt\b/gi

/** 接口报错可能带出内部名称，展示前去掉。 */
export function publicError(message: string | undefined, fallback: string) {
  LEAK.lastIndex = 0
  const cleaned = String(message || '')
    .replace(LEAK, '')
    .replace(/[（(]\s*[）)]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,，。:：\-]+|[\s,，。:：\-]+$/g, '')
    .trim()
  return cleaned || fallback
}
