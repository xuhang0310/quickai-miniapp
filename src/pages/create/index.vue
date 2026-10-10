<template>
  <view class="page">
    <view class="switch">
      <view :class="['switch-item', { on: mode === 'product' }]" @tap="mode = 'product'">商品图</view>
      <view :class="['switch-item', { on: mode === 'free' }]" @tap="mode = 'free'">自由创作</view>
    </view>

    <view class="uploader" @tap="pickImage">
      <image v-if="localPath" class="uploader-img" :src="localPath" mode="aspectFill" />
      <view v-else class="uploader-empty">
        <text class="uploader-plus">+</text>
        <text class="uploader-label">{{ mode === 'product' ? '上传商品照片' : '上传参考图，可选' }}</text>
        <text class="muted">相册或拍照，主体清楚</text>
      </view>
      <view v-if="uploading" class="uploader-mask">上传中</view>
      <text v-if="localPath && !uploading" class="uploader-change">更换</text>
    </view>
    <text v-if="uploadError" class="form-error">{{ uploadError }}</text>

    <template v-if="mode === 'product'">
      <text class="label">图种</text>
      <view class="kinds">
        <view
          v-for="kind in kinds"
          :key="kind.key"
          :class="['kind', { on: kind.key === currentKind }]"
          @tap="currentKind = kind.key"
        >
          <text class="kind-title">{{ kind.title }}</text>
          <text class="kind-hint">{{ kind.hint }}</text>
        </view>
      </view>
      <text class="label">商品名称</text>
      <input v-model="productName" class="field" placeholder="例如：香薰蜡烛" placeholder-class="search-placeholder" />
      <text class="label">卖点，可选</text>
      <input v-model="points" class="field" placeholder="材质、颜色、适合谁用" placeholder-class="search-placeholder" />
    </template>

    <template v-else>
      <text class="label">描述画面</text>
      <textarea
        v-model="prompt"
        class="area"
        maxlength="800"
        placeholder="写清主体、场景、光线和风格"
        placeholder-class="search-placeholder"
      />
      <text class="label">比例</text>
      <view class="ratios">
        <view
          v-for="item in ratios"
          :key="item"
          :class="['ratio', { on: item === ratio }]"
          @tap="ratio = item"
        >{{ item }}</view>
      </view>
    </template>

    <button class="btn-primary submit" :loading="running" :disabled="running || uploading" @tap="submit">
      {{ running ? '生成中' : '生成图片' }}
    </button>
    <text class="muted fee">按平台规则消耗积分，失败不会重复扣费</text>

    <job-result :running="running" :error="error" :task="task" @retry="submit" />
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import JobResult from '@/components/job-result/job-result.vue'
import { uploadImage } from '@/api/creative'
import { PRODUCT_KINDS, buildProductPrompt, takePendingKind, type ProductKindKey } from '@/constants/catalog'
import { useGenerate } from '@/composables/useGenerate'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { running, task, error, run } = useGenerate()
const kinds = PRODUCT_KINDS
const ratios = ['1:1', '3:4', '4:3', '9:16']

const mode = ref<'product' | 'free'>('product')
const currentKind = ref<ProductKindKey>('white')
const productName = ref('')
const points = ref('')
const prompt = ref('')
const ratio = ref('1:1')
const localPath = ref('')
const remoteUrl = ref('')
const uploading = ref(false)
const uploadError = ref('')

watch(() => task.value?.status, status => {
  if (status === 'completed') void userStore.refresh()
})

onShow(() => {
  const kind = takePendingKind()
  if (!kind) return
  mode.value = 'product'
  currentKind.value = kind
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
  if (running.value || uploading.value) return
  if (!userStore.requireLogin()) return
  uploadError.value = ''
  if (mode.value === 'product') {
    if (!remoteUrl.value) {
      uploadError.value = '请先上传商品照片'
      return
    }
    await run({
      prompt: buildProductPrompt(currentKind.value, productName.value, points.value),
      size: '1:1',
      resolution: '1K',
      quality: 'medium',
      reference_images: [remoteUrl.value],
      source_type: 'ecommerce'
    })
    return
  }
  const text = prompt.value.trim()
  if (text.length < 2) {
    uni.showToast({ title: '先写一下想要的画面', icon: 'none' })
    return
  }
  await run({
    prompt: text,
    size: ratio.value,
    resolution: '1K',
    quality: 'medium',
    reference_images: remoteUrl.value ? [remoteUrl.value] : undefined,
    source_type: 'image-creation'
  })
}
</script>

<style>
.switch {
  display: flex;
  gap: 40rpx;
  margin: 8rpx 0 28rpx;
  border-bottom: 1rpx solid var(--line);
}

.switch-item {
  height: 80rpx;
  line-height: 80rpx;
  color: var(--text-muted);
  font-size: 32rpx;
}

.switch-item.on {
  color: var(--text);
  font-weight: 700;
  box-shadow: inset 0 -4rpx 0 var(--text);
}

.uploader {
  position: relative;
  height: 520rpx;
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
  gap: 8rpx;
}

.uploader-plus {
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 12rpx;
  background: var(--text);
  color: var(--on-brand);
  font-size: 48rpx;
  line-height: 68rpx;
  text-align: center;
}

.uploader-label {
  font-size: 32rpx;
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
  font-size: 28rpx;
}

.uploader-change {
  position: absolute;
  right: 16rpx;
  bottom: 16rpx;
  padding: 8rpx 16rpx;
  background: var(--on-brand);
  color: var(--text);
  font-size: 22rpx;
}

.form-error {
  display: block;
  margin-top: 12rpx;
  color: var(--danger);
  font-size: 24rpx;
}

.label {
  display: block;
  margin: 36rpx 0 8rpx;
  color: var(--text-muted);
  font-size: 22rpx;
  letter-spacing: 2rpx;
}

.kinds {
  display: flex;
  flex-direction: column;
}

.kind {
  padding: 22rpx 0;
  border-bottom: 1rpx solid var(--line);
}

.kind.on {
  box-shadow: inset 6rpx 0 0 var(--text);
  padding-left: 16rpx;
}

.kind.on .kind-title {
  font-weight: 700;
}

.kind-title,
.kind-hint {
  display: block;
}

.kind-title {
  font-size: 28rpx;
  font-weight: 600;
}

.kind-hint {
  margin-top: 4rpx;
  color: var(--text-muted);
  font-size: 22rpx;
}

.field,
.area {
  width: 100%;
  padding: 0;
  border: none;
  border-bottom: 2rpx solid var(--text);
  border-radius: 0;
  background: transparent;
  font-size: 32rpx;
}

.field {
  height: 88rpx;
}

.area {
  height: 200rpx;
  padding-top: 20rpx;
  padding-bottom: 20rpx;
}

.ratios {
  display: flex;
  gap: 12rpx;
}

.ratio {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-bottom: 2rpx solid var(--line);
  color: var(--text-muted);
  font-size: 26rpx;
}

.ratio.on {
  border-bottom-color: var(--text);
  color: var(--text);
  font-weight: 700;
}

.submit {
  margin-top: 36rpx;
}

.fee {
  display: block;
  margin-top: 12rpx;
  text-align: center;
}
</style>
