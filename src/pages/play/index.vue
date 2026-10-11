<template>
  <view class="page detail">
    <view v-if="missing" class="card"><text>没有找到这个玩法</text></view>
    <template v-else-if="play">
      <view :class="['hero', { fun: play.layout === 'fun' }]">
        <template v-if="play.layout === 'fun'">
          <image class="hero-img" :src="play.after" mode="aspectFill" />
          <image class="inset" :src="play.before" mode="aspectFill" />
        </template>
        <template v-else>
          <view class="half">
            <image class="hero-img" :src="play.before" mode="aspectFill" />
            <text class="badge">{{ play.beforeLabel }}</text>
          </view>
          <view class="half">
            <image class="hero-img" :src="play.after" mode="aspectFill" />
            <text class="badge">{{ play.afterLabel }}</text>
          </view>
          <view class="cut" />
        </template>
      </view>

      <step-list :steps="play.steps" />

      <view class="uploader" @tap="pickImage">
        <image v-if="localPath" class="uploader-img" :src="localPath" mode="aspectFill" />
        <view v-else class="uploader-empty">
          <text class="uploader-label">换上你的照片</text>
          <text class="muted">相册或拍照，人脸清楚</text>
        </view>
        <view v-if="uploading" class="uploader-mask">上传中</view>
      </view>
      <text v-if="uploadError" class="form-error">{{ uploadError }}</text>
      <text v-if="!localPath" class="sample-link" @tap="useSample">用示例图试一次</text>

      <job-result :running="running" :error="error" :task="task" @retry="submit" />
    </template>

    <view v-if="play" class="dock">
      <button class="btn-primary" :loading="running" :disabled="running || uploading" @tap="submit">
        {{ running ? '生成中' : play.action }}
      </button>
      <text class="hint">{{ play.hint }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import JobResult from '@/components/job-result/job-result.vue'
import StepList from '@/components/step-list/step-list.vue'
import { uploadImage } from '@/api/creative'
import { useGenerate } from '@/composables/useGenerate'
import { closestFrame, findPlay, type Play } from '@/constants/plays'
import { useUserStore } from '@/stores/user'
import { readImageInfo, uploadableImagePath } from '@/utils/imageFile'

const userStore = useUserStore()
const { running, task, error, run } = useGenerate()
const play = ref<Play | null>(null)
const missing = ref(false)
const localPath = ref('')
const remoteUrl = ref('')
const frame = ref('3:4')
const uploading = ref(false)
const uploadError = ref('')

watch(() => task.value?.status, status => {
  if (status === 'completed') void userStore.refresh()
})

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
  try {
    const info = await readImageInfo(path)
    frame.value = closestFrame(info.width, info.height)
    const filePath = await uploadableImagePath(info.path || path)
    const result = await uploadImage(filePath)
    if (!result.success || !result.data?.url) {
      localPath.value = ''
      uploadError.value = result.error || '上传失败，请换一张图片'
      return
    }
    remoteUrl.value = result.data.url
  } catch (err) {
    localPath.value = ''
    uploadError.value = err instanceof Error ? err.message : '上传失败，请换一张图片'
  } finally {
    uploading.value = false
  }
}

async function useSample() {
  const current = play.value
  if (!current || uploading.value || running.value || localPath.value) return
  await uploadPicked(current.before)
}

async function submit() {
  const current = play.value
  if (!current?.prompt || running.value || uploading.value) return
  if (!userStore.requireLogin()) return
  if (!remoteUrl.value) {
    uploadError.value = '请先换上你的照片'
    return
  }
  await run({
    prompt: current.prompt,
    size: frame.value,
    resolution: current.resolution || '1K',
    quality: 'medium',
    reference_images: [remoteUrl.value],
    source_type: 'image-creation'
  })
}

onLoad(query => {
  const found = findPlay(String(query?.id || ''))
  if (!found || found.kind !== 'generate') {
    missing.value = true
    return
  }
  play.value = found
  uni.setNavigationBarTitle({ title: found.title })
})

onShareAppMessage(() => ({
  title: play.value?.title || '换上你的照片',
  path: `/pages/play/index?id=${play.value?.id || ''}`
}))
</script>

<style>
.detail {
  padding-bottom: 220rpx;
}

.hero {
  position: relative;
  display: flex;
  height: 520rpx;
  overflow: hidden;
  border-radius: 36rpx;
  background: var(--sand);
}

.hero.fun {
  display: block;
}

.half {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
}

.hero-img {
  width: 100%;
  height: 100%;
}

.cut {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4rpx;
  margin-left: -2rpx;
  background: #fff;
}

.badge {
  position: absolute;
  left: 16rpx;
  bottom: 16rpx;
  padding: 0 16rpx;
  height: 40rpx;
  line-height: 40rpx;
  border-radius: 20rpx;
  background: rgba(0, 0, 0, 0.58);
  color: #fff;
  font-size: 22rpx;
}

.inset {
  position: absolute;
  left: 16rpx;
  bottom: 16rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  border: 4rpx solid #fff;
}

.uploader {
  position: relative;
  height: 280rpx;
  margin-top: 12rpx;
  overflow: hidden;
  border-radius: 32rpx;
  background: var(--card);
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
  gap: 8rpx;
}

.uploader-label {
  font-size: 32rpx;
  font-weight: 700;
}

.uploader-mask {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--scrim);
  color: #fff;
}

.form-error,
.sample-link {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
}

.form-error {
  color: var(--danger);
}

.sample-link {
  color: var(--text);
  font-weight: 700;
}

.dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
  background: var(--bg);
}

.hint {
  display: block;
  margin-top: 12rpx;
  text-align: center;
  color: var(--text-muted);
  font-size: 24rpx;
}
</style>
