<template>
  <view class="page detail">
    <view class="preview">
      <image class="preview-img" :src="localPath || example" mode="aspectFill" />
      <text :class="['mark', place]">{{ shownText }}</text>
      <text class="badge">预览</text>
    </view>

    <view class="panel">
      <text class="panel-title">水印文字</text>
      <input v-model="text" class="field" maxlength="20" placeholder="快客出品" placeholder-class="search-placeholder" />
      <view class="places">
        <text
          v-for="item in places"
          :key="item.id"
          :class="['place', { on: item.id === place }]"
          @tap="place = item.id"
        >{{ item.label }}</text>
      </view>
    </view>

    <view v-if="!localPath" class="pick" @tap="pickImage">
      <text class="pick-label">换上你的照片</text>
      <text class="muted">先看预览，保存时才叠到原图上</text>
    </view>
    <text v-else class="change" @tap="pickImage">更换照片</text>

    <step-list :steps="steps" />
    <text v-if="error" class="form-error">{{ error }}</text>

    <canvas id="exporter" canvas-id="exporter" type="2d" class="exporter" />

    <view class="dock">
      <button class="btn-primary" :loading="saving" :disabled="saving" @tap="save">加上水印</button>
      <text class="hint">在手机上完成，不消耗积分</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import StepList from '@/components/step-list/step-list.vue'
import { canvasToFile, loadCanvasImage, queryCanvas } from '@/utils/canvas'
import { fitSize, readImageInfo } from '@/utils/imageFile'
import { saveLocalImage } from '@/utils/media'

const proxy = getCurrentInstance()?.proxy
const example = '/static/plays/clean.jpg'
const steps = ['上传照片，输入一行字', '选位置，马上看到预览', '直接叠到原图上，不重新生成']
const places = [
  { id: 'bl' as const, label: '左下' },
  { id: 'br' as const, label: '右下' },
  { id: 'mid' as const, label: '居中' }
]
const text = ref('快客出品')
const place = ref<'bl' | 'br' | 'mid'>('br')
const localPath = ref('')
const saving = ref(false)
const error = ref('')
const shownText = computed(() => text.value.trim() || '快客出品')

function pickImage() {
  if (saving.value) return
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: res => {
      const path = res.tempFilePaths[0]
      if (!path) return
      localPath.value = path
      error.value = ''
    }
  })
}

async function save() {
  if (saving.value) return
  if (!localPath.value) {
    error.value = '请先换上你的照片'
    return
  }
  const line = shownText.value
  saving.value = true
  error.value = ''
  try {
    const info = await readImageInfo(localPath.value)
    const fitted = fitSize(info.width, info.height)
    const stage = await queryCanvas(proxy, '#exporter')
    stage.node.width = fitted.width
    stage.node.height = fitted.height
    const ctx = stage.node.getContext('2d')
    const image = await loadCanvasImage(stage.node, info.path)
    ctx.clearRect(0, 0, fitted.width, fitted.height)
    ctx.drawImage(image as CanvasImageSource, 0, 0, fitted.width, fitted.height)
    const fontSize = Math.max(22, Math.round(fitted.width * 0.045))
    ctx.font = `700 ${fontSize}px sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'bottom'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
    ctx.shadowBlur = Math.round(fontSize * 0.28)
    const pad = Math.round(fitted.width * 0.045)
    const width = ctx.measureText(line).width
    let x = pad
    let y = fitted.height - pad
    if (place.value === 'br') x = fitted.width - pad - width
    if (place.value === 'mid') {
      x = (fitted.width - width) / 2
      y = fitted.height / 2
      ctx.textBaseline = 'middle'
    }
    ctx.fillText(line, x, y)
    const file = await canvasToFile(stage.node, proxy, 'jpg')
    await saveLocalImage(file)
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (!message.includes('auth deny') && !message.includes('authorize')) {
      error.value = message || '保存失败，请稍后重试'
    }
  } finally {
    saving.value = false
  }
}

onShareAppMessage(() => ({ title: '给照片加一行字', path: '/pages/stamp/index' }))
</script>

<style>
.detail {
  padding-bottom: 220rpx;
}

.preview {
  position: relative;
  height: 640rpx;
  overflow: hidden;
  border-radius: 36rpx;
  background: var(--sand);
}

.preview-img {
  width: 100%;
  height: 100%;
}

.mark {
  position: absolute;
  color: #fff;
  font-size: 40rpx;
  font-weight: 800;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.45);
}

.mark.bl {
  left: 28rpx;
  bottom: 28rpx;
}

.mark.br {
  right: 28rpx;
  bottom: 28rpx;
}

.mark.mid {
  left: 0;
  right: 0;
  top: 50%;
  text-align: center;
  transform: translateY(-50%);
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

.mark.bl {
  bottom: 72rpx;
}

.panel {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 32rpx;
  background: var(--card);
}

.panel-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.field {
  height: 80rpx;
  margin-top: 8rpx;
  border-bottom: 2rpx solid var(--line);
  font-size: 32rpx;
}

.places {
  display: flex;
  gap: 36rpx;
  margin-top: 20rpx;
}

.place {
  color: var(--text-muted);
  font-size: 28rpx;
}

.place.on {
  color: var(--text);
  font-weight: 700;
  box-shadow: inset 0 -4rpx 0 var(--text);
}

.pick {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  margin-top: 20rpx;
  padding: 28rpx;
  border-radius: 32rpx;
  background: var(--card);
}

.pick-label,
.change {
  font-size: 32rpx;
  font-weight: 700;
}

.change {
  display: block;
  margin-top: 20rpx;
}

.form-error {
  display: block;
  margin-top: 16rpx;
  color: var(--danger);
  font-size: 26rpx;
}

.exporter {
  position: fixed;
  left: -4000px;
  top: 0;
  width: 8px;
  height: 8px;
  pointer-events: none;
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
