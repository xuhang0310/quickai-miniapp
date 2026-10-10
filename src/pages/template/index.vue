<template>
  <view class="page detail">
    <view v-if="loadError" class="card">
      <text>{{ loadError }}</text>
      <button class="btn-secondary retry" @tap="load">重试</button>
    </view>

    <template v-else-if="template">
      <view class="cover-wrap" :style="{ height: cover + 'rpx' }">
        <image v-if="template.cover_url" class="cover" :src="template.cover_url" mode="aspectFill" />
        <view v-else class="cover cover-empty">{{ template.title }}</view>
      </view>

      <view class="meta">
        <text class="title">{{ template.title }}</text>
        <text class="muted">{{ template.category || '灵感' }} · {{ template.use_count || 0 }} 人做过</text>
      </view>

      <text v-if="template.prompt" class="prompt">{{ template.prompt }}</text>

      <view class="uploader" @tap="pickImage">
        <image v-if="localPath" class="uploader-img" :src="localPath" mode="aspectFill" />
        <view v-else class="uploader-empty">
          <text class="uploader-label">换成你的商品图</text>
          <text class="muted">不上传则按模板描述直接生成</text>
        </view>
        <view v-if="uploading" class="uploader-mask">上传中</view>
      </view>
      <text v-if="uploadError" class="form-error">{{ uploadError }}</text>

      <job-result :running="running" :error="error" :task="task" @retry="submit" />
    </template>

    <view v-else class="card"><text class="muted">正在打开模板</text></view>

    <view v-if="template" class="dock">
      <button class="btn-primary" :loading="running" :disabled="running || uploading" @tap="submit">
        {{ running ? '生成中' : '做同款' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import JobResult from '@/components/job-result/job-result.vue'
import { getTemplate, uploadImage, type CreativeTemplate } from '@/api/creative'
import { coverHeight } from '@/constants/catalog'
import { useGenerate } from '@/composables/useGenerate'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { running, task, error, run } = useGenerate()
const template = ref<CreativeTemplate | null>(null)
const templateId = ref(0)
const loadError = ref('')
const localPath = ref('')
const remoteUrl = ref('')
const uploading = ref(false)
const uploadError = ref('')

const cover = computed(() => Math.min(coverHeight(template.value?.size || '1:1'), 720))

watch(() => task.value?.status, status => {
  if (status === 'completed') void userStore.refresh()
})

async function load() {
  if (!templateId.value) return
  loadError.value = ''
  const result = await getTemplate(templateId.value)
  if (!result.success || !result.data?.id) {
    loadError.value = result.error || '模板加载失败'
    return
  }
  template.value = result.data
  uni.setNavigationBarTitle({ title: result.data.title.slice(0, 12) || '做同款' })
}

function pickImage() {
  if (uploading.value || running.value) return
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: res => {
      const path = res.tempFilePaths[0]
      if (path) void uploadPicked(path)
    }
  })
}

async function uploadPicked(path: string) {
  if (!userStore.requireLogin()) return
  localPath.value = path
  remoteUrl.value = ''
  uploadError.value = ''
  uploading.value = true
  const result = await uploadImage(path)
  uploading.value = false
  if (!result.success || !result.data?.url) {
    localPath.value = ''
    uploadError.value = result.error || '上传失败，请换一张图片'
    return
  }
  remoteUrl.value = result.data.url
}

async function submit() {
  const current = template.value
  if (!current || running.value || uploading.value) return
  if (!userStore.requireLogin()) return
  await run({
    prompt: current.prompt,
    template_id: current.id,
    model: current.model || undefined,
    size: current.size || '1:1',
    resolution: current.resolution || '1K',
    reference_images: remoteUrl.value ? [remoteUrl.value] : undefined,
    source_type: 'image-creation'
  })
}

onLoad(query => {
  templateId.value = Number(query?.id || 0)
  if (!templateId.value) {
    loadError.value = '没有找到这个模板'
    return
  }
  void load()
})

onShareAppMessage(() => ({
  title: (template.value?.title || '做同款').slice(0, 32),
  path: `/pages/template/index?id=${templateId.value}`
}))
</script>

<style>
.detail {
  padding-bottom: 180rpx;
}

.cover-wrap {
  margin: 0 -28rpx;
  overflow: hidden;
  background: var(--sand);
}

.cover {
  width: 100%;
  height: 100%;
}

.cover-empty {
  display: flex;
  align-items: flex-end;
  padding: 28rpx;
  background: var(--text);
  color: var(--on-brand);
  font-size: 40rpx;
  font-weight: 700;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 24rpx;
}

.title {
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -1rpx;
}

.prompt {
  display: block;
  margin-top: 16rpx;
  color: var(--text-secondary);
  font-size: 26rpx;
  line-height: 1.6;
  max-height: 168rpx;
  overflow: hidden;
}

.uploader {
  position: relative;
  height: 200rpx;
  margin-top: 28rpx;
  overflow: hidden;
  background: var(--card);
  border: 2rpx solid var(--text);
}

.uploader-img,
.uploader-empty,
.uploader-mask {
  width: 100%;
  height: 100%;
}

.uploader-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.uploader-label {
  font-size: 30rpx;
  font-weight: 600;
}

.uploader-mask {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--scrim);
  color: var(--on-image);
}

.form-error {
  display: block;
  margin-top: 12rpx;
  color: var(--danger);
  font-size: 24rpx;
}

.retry {
  margin-top: 20rpx;
}

.dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
  background: var(--bg);
}
</style>
