<template>
  <view v-if="visible" class="job card">
    <image v-if="imageUrl" class="job-image" :src="imageUrl" mode="widthFix" @tap="preview" />
    <view v-else class="job-pending">
      <view v-if="running" class="job-bar"><view class="job-bar-fill" /></view>
      <text class="job-status">{{ statusText }}</text>
    </view>
    <text v-if="error && imageUrl" class="job-error">{{ error }}</text>
    <view v-if="imageUrl" class="job-actions">
      <button class="btn-secondary job-btn" @tap="save">保存到相册</button>
      <button class="btn-primary job-btn" @tap="emit('retry')">再来一张</button>
    </view>
    <button v-else-if="error && !running" class="btn-secondary job-btn" @tap="emit('retry')">重试</button>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ImageTask } from '@/api/creative'
import { saveRemoteImage } from '@/utils/media'

const props = defineProps<{
  running: boolean
  error: string
  task: ImageTask | null
}>()

const emit = defineEmits<{ retry: [] }>()

const imageUrl = computed(() => props.task?.result_url || '')
const visible = computed(() => props.running || Boolean(props.error) || Boolean(imageUrl.value))
const statusText = computed(() => {
  if (props.error && !imageUrl.value) return props.error
  const status = props.task?.status
  if (status === 'queued' || status === 'pending') return '排队中，通常需要几十秒'
  if (status === 'in_progress') return `正在生成 ${props.task?.progress || 0}%`
  if (props.running) return '正在提交'
  return '处理中'
})

function preview() {
  if (!imageUrl.value) return
  uni.previewImage({ urls: [imageUrl.value], current: imageUrl.value })
}

async function save() {
  if (!imageUrl.value) return
  try {
    await saveRemoteImage(imageUrl.value)
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (!message.includes('auth deny') && !message.includes('authorize')) {
      uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.job {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 28rpx;
}

.job-image {
  width: 100%;
  border-radius: 4rpx;
  background: var(--sand);
}

.job-pending {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 12rpx 0 4rpx;
}

.job-bar {
  height: 8rpx;
  border-radius: 8rpx;
  background: var(--line);
  overflow: hidden;
}

.job-bar-fill {
  width: 40%;
  height: 100%;
  border-radius: 8rpx;
  background: var(--brand-strong);
  animation: job-slide 1.2s ease-in-out infinite;
}

.job-status {
  color: var(--text-secondary);
  font-size: 26rpx;
}

.job-error {
  color: var(--danger);
  font-size: 24rpx;
}

.job-actions {
  display: flex;
  gap: 16rpx;
}

.job-btn {
  flex: 1;
  width: auto;
}

@keyframes job-slide {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(280%); }
}
</style>
