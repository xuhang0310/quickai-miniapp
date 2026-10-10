import { onUnload } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { generateImage, getImageTask, type GenerateImagePayload, type ImageTask } from '@/api/creative'
import { readTask } from '@/utils/task'
import { publicError } from '@/utils/public'

const POLL_MS = 3000
const MAX_POLLS = 60

/** 提交生图并轮询到完成或失败。离开页面时停止轮询。 */
export function useGenerate() {
  const running = ref(false)
  const task = ref<ImageTask | null>(null)
  const error = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null
  let stopped = false

  function clearTimer() {
    if (timer) clearTimeout(timer)
    timer = null
  }

  function stop() {
    stopped = true
    running.value = false
    clearTimer()
  }

  function reset() {
    stop()
    stopped = false
    task.value = null
    error.value = ''
  }

  async function poll(id: number, attempt = 0) {
    if (stopped) return
    const result = await getImageTask(id)
    if (stopped) return
    const next = result.success ? readTask(result.data) : null
    if (!next) {
      if (attempt >= 5) {
        running.value = false
        error.value = publicError(result.error, '查询生成结果失败')
        return
      }
      timer = setTimeout(() => void poll(id, attempt + 1), POLL_MS)
      return
    }
    task.value = next
    if (next.status === 'completed' || next.status === 'failed') {
      running.value = false
      if (next.status === 'failed') error.value = publicError(next.error_message || '', '生成失败')
      return
    }
    if (attempt >= MAX_POLLS) {
      running.value = false
      error.value = '生成时间较长，可稍后在「我的」查看'
      return
    }
    timer = setTimeout(() => void poll(id, attempt + 1), POLL_MS)
  }

  async function run(payload: GenerateImagePayload) {
    clearTimer()
    stopped = false
    running.value = true
    error.value = ''
    task.value = null
    const result = await generateImage(payload)
    if (stopped) return false
    const created = result.success ? readTask(result.data) : null
    if (!result.success || !created?.id) {
      running.value = false
      error.value = publicError(result.error, '生成失败，请稍后重试')
      return false
    }
    task.value = created
    if (created.status === 'completed' || created.status === 'failed') {
      running.value = false
      if (created.status === 'failed') error.value = publicError(created.error_message || '', '生成失败')
      return created.status === 'completed'
    }
    void poll(created.id)
    return true
  }

  onUnload(stop)

  return { running, task, error, run, reset }
}
