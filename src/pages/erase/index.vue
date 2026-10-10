<template>
  <view class="page detail">
    <view v-if="missing" class="card"><text>没有找到这个玩法</text></view>
    <template v-else-if="play">
      <view v-if="!localPath" class="hero">
        <view class="half">
          <image class="hero-img" :src="play.before" mode="aspectFill" />
          <text v-if="play.sampleMark" class="sample">样图水印</text>
          <text class="badge">{{ play.beforeLabel }}</text>
        </view>
        <view class="half">
          <image class="hero-img" :src="play.after" mode="aspectFill" />
          <text class="badge">{{ play.afterLabel }}</text>
        </view>
        <view class="cut" />
      </view>

      <view v-else class="stage">
        <canvas
          id="paint"
          canvas-id="paint"
          type="2d"
          class="paint"
          disable-scroll
          @touchstart="onStart"
          @touchmove.stop.prevent="onMove"
          @touchend="onEnd"
          @touchcancel="onEnd"
        />
      </view>
      <canvas id="exporter" canvas-id="exporter" type="2d" class="exporter" />

      <view v-if="localPath" class="tools">
        <text :class="['tool', { off: !strokes.length }]" @tap="undo">撤销</text>
        <text class="tool" @tap="clearMask">清除</text>
        <text class="tool" @tap="pickImage">更换</text>
        <slider
          class="slider"
          :value="brush"
          min="18"
          max="72"
          activeColor="#111111"
          backgroundColor="#e6e6ea"
          block-size="18"
          @change="onBrush"
        />
      </view>

      <step-list :steps="play.steps" />
      <text v-if="error" class="form-error">{{ error }}</text>
      <text v-else-if="statusText" class="status">{{ statusText }}</text>

      <view v-if="resultUrl" class="result">
        <image class="result-img" :src="resultUrl" mode="widthFix" @tap="preview" />
        <button class="btn-secondary save" @tap="save">保存到相册</button>
      </view>
    </template>

    <view v-if="play" class="dock">
      <button class="btn-primary" :loading="running" :disabled="running" @tap="submit">
        {{ localPath ? play.action : '上传照片' }}
      </button>
      <text class="hint">{{ play.hint }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import { onLoad, onShareAppMessage, onUnload } from '@dcloudio/uni-app'
import StepList from '@/components/step-list/step-list.vue'
import { createEraseJob, getEraseJob, publishEraseJob, readEraseJob, uploadEraseImage } from '@/api/erase'
import { findPlay, type Play } from '@/constants/plays'
import { useUserStore } from '@/stores/user'
import {
  containRect,
  loadCanvasImage,
  paintStroke,
  queryCanvas,
  canvasToFile,
  type CanvasImage,
  type CanvasNode,
  type Stroke,
  type ViewBox
} from '@/utils/canvas'
import { fitSize, readImageInfo } from '@/utils/imageFile'
import { saveRemoteImage } from '@/utils/media'
import { publicError } from '@/utils/public'

const userStore = useUserStore()
const proxy = getCurrentInstance()?.proxy
const play = ref<Play | null>(null)
const missing = ref(false)
const localPath = ref('')
const brush = ref(36)
const strokes = ref<Stroke[]>([])
const running = ref(false)
const error = ref('')
const statusText = ref('')
const resultUrl = ref('')

let imgW = 0
let imgH = 0
let viewW = 0
let viewH = 0
let box: ViewBox = { x: 0, y: 0, w: 1, h: 1 }
let board: CanvasNode | null = null
let boardCtx: CanvasRenderingContext2D | null = null
let photo: CanvasImage | null = null
let drawing: Stroke | null = null
let timer: ReturnType<typeof setTimeout> | null = null
let stopped = false

function onBrush(event: { detail?: { value?: number } }) {
  brush.value = Number(event.detail?.value || brush.value)
}

function pickImage() {
  if (running.value) return
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: res => {
      const path = res.tempFilePaths[0]
      if (path) void prepare(path)
    }
  })
}

async function prepare(path: string) {
  error.value = ''
  resultUrl.value = ''
  strokes.value = []
  drawing = null
  localPath.value = path
  await nextPaint()
  try {
    const info = await readImageInfo(path)
    const stage = await queryCanvas(proxy, '#paint')
    if (!stage.width || !stage.height) throw new Error('画布还没准备好，请重试')
    imgW = info.width
    imgH = info.height
    viewW = stage.width
    viewH = stage.height
    box = containRect(viewW, viewH, imgW, imgH)
    const dpr = uni.getSystemInfoSync().pixelRatio || 1
    stage.node.width = Math.round(viewW * dpr)
    stage.node.height = Math.round(viewH * dpr)
    boardCtx = stage.node.getContext('2d')
    boardCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    board = stage.node
    photo = await loadCanvasImage(stage.node, info.path)
    render()
  } catch (err) {
    localPath.value = ''
    error.value = err instanceof Error ? err.message : '这张图片打不开'
  }
}

function nextPaint() {
  return new Promise<void>(resolve => setTimeout(resolve, 40))
}

function render() {
  if (!boardCtx || !photo) return
  const ctx = boardCtx
  ctx.clearRect(0, 0, viewW, viewH)
  ctx.drawImage(photo as CanvasImageSource, box.x, box.y, box.w, box.h)
  const scale = box.w / imgW
  for (const stroke of strokes.value) {
    paintStroke(ctx, stroke, 'rgba(255, 59, 48, 0.45)', scale, box.h / imgH)
  }
}

function pointOf(event: any) {
  const touch = event?.touches?.[0] || event?.changedTouches?.[0]
  if (!touch || typeof touch.x !== 'number' || !box.w || !box.h) return null
  const x = ((touch.x - box.x) / box.w) * imgW
  const y = ((touch.y - box.y) / box.h) * imgH
  if (x < 0 || y < 0 || x > imgW || y > imgH) return null
  return { x, y }
}

function onStart(event: any) {
  if (!localPath.value || running.value) return
  const point = pointOf(event)
  if (!point) return
  drawing = { size: (brush.value / box.w) * imgW, points: [point] }
  strokes.value.push(drawing)
  render()
}

function onMove(event: any) {
  if (!drawing) return
  const point = pointOf(event)
  if (!point) return
  const last = drawing.points[drawing.points.length - 1]
  if (Math.hypot(point.x - last.x, point.y - last.y) < 2) return
  drawing.points.push(point)
  render()
}

function onEnd() {
  drawing = null
}

function undo() {
  if (running.value || !strokes.value.length) return
  strokes.value.pop()
  render()
}

function clearMask() {
  if (running.value) return
  strokes.value = []
  drawing = null
  render()
}

async function exportPair() {
  const fitted = fitSize(imgW, imgH)
  const stage = await queryCanvas(proxy, '#exporter')
  stage.node.width = fitted.width
  stage.node.height = fitted.height
  const ctx = stage.node.getContext('2d')
  const image = await loadCanvasImage(stage.node, localPath.value)
  ctx.clearRect(0, 0, fitted.width, fitted.height)
  ctx.drawImage(image as CanvasImageSource, 0, 0, fitted.width, fitted.height)
  const source = await canvasToFile(stage.node, proxy, 'jpg')
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, fitted.width, fitted.height)
  const scale = fitted.width / imgW
  for (const stroke of strokes.value) paintStroke(ctx, stroke, '#ffffff', scale, fitted.height / imgH)
  const mask = await canvasToFile(stage.node, proxy, 'png')
  return { source, mask }
}

function stopPoll() {
  stopped = true
  if (timer) clearTimeout(timer)
  timer = null
}

async function waitJob(id: string) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (stopped) throw new Error('已离开页面')
    const result = await getEraseJob(id)
    const job = result.success ? readEraseJob(result.data) : null
    if (!job) {
      if (attempt >= 4) throw new Error(publicError(result.error, '查询处理结果失败'))
    } else {
      statusText.value = job.progress ? `正在处理 ${job.progress}%` : '正在处理涂抹区域'
      if (job.status === 'completed' || job.status === 'succeeded' || job.status === 'success') return job
      if (job.status === 'failed' || job.status === 'error') throw new Error(publicError(job.error || '', '处理失败'))
    }
    await new Promise<void>(resolve => {
      timer = setTimeout(resolve, 2000)
    })
  }
  throw new Error('处理时间较长，请稍后重试')
}

async function submit() {
  if (!play.value || running.value) return
  if (!localPath.value) {
    pickImage()
    return
  }
  if (!strokes.value.length) {
    error.value = '请先涂住要处理的区域'
    return
  }
  if (!userStore.requireLogin()) return
  running.value = true
  stopped = false
  error.value = ''
  resultUrl.value = ''
  statusText.value = '正在准备图片'
  try {
    const files = await exportPair()
    statusText.value = '正在上传'
    const margin = Math.round(Math.max(96, Math.min(512, ((brush.value / Math.max(box.w, 1)) * imgW) * 2.5)))
    const [image, mask] = await Promise.all([
      uploadEraseImage(files.source, 'source.jpg', 'image/jpeg'),
      uploadEraseImage(files.mask, 'mask.png', 'image/png')
    ])
    if (!image.success) throw new Error(image.error)
    if (!mask.success) throw new Error(mask.error)
    statusText.value = '正在提交'
    const created = await createEraseJob(image.data.objectKey, mask.data.objectKey, margin)
    const job = created.success ? readEraseJob(created.data) : null
    if (!job) throw new Error(publicError(created.error, '提交失败，请稍后重试'))
    await waitJob(job.id)
    if (stopped) return
    statusText.value = '正在保存结果'
    const published = await publishEraseJob(job.id)
    if (!published.success || !published.data?.url) throw new Error(publicError(published.error, '结果保存失败'))
    resultUrl.value = published.data.url
    statusText.value = ''
  } catch (err) {
    if (!stopped) error.value = publicError(err instanceof Error ? err.message : '', '处理失败，请稍后重试')
    statusText.value = ''
  } finally {
    running.value = false
  }
}

function preview() {
  if (!resultUrl.value) return
  uni.previewImage({ urls: [resultUrl.value], current: resultUrl.value })
}

async function save() {
  if (!resultUrl.value) return
  try {
    await saveRemoteImage(resultUrl.value)
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (!message.includes('auth deny') && !message.includes('authorize')) {
      uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' })
    }
  }
}

onLoad(query => {
  const found = findPlay(String(query?.id || ''))
  if (!found || found.kind !== 'erase') {
    missing.value = true
    return
  }
  play.value = found
  uni.setNavigationBarTitle({ title: found.title })
})

onUnload(() => {
  stopPoll()
})

onShareAppMessage(() => ({
  title: play.value?.title || '涂掉不要的地方',
  path: `/pages/erase/index?id=${play.value?.id || ''}`
}))
</script>

<style>
.detail {
  padding-bottom: 220rpx;
}

.hero,
.stage {
  position: relative;
  height: 720rpx;
  overflow: hidden;
  border-radius: 36rpx;
  background: var(--sand);
}

.hero {
  display: flex;
}

.half {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
}

.hero-img,
.paint {
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

.sample {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 42%;
  text-align: center;
  color: rgba(255, 255, 255, 0.92);
  font-size: 36rpx;
  font-weight: 800;
  transform: rotate(-16deg);
}

.exporter {
  position: fixed;
  left: -4000px;
  top: 0;
  width: 8px;
  height: 8px;
  pointer-events: none;
}

.tools {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-top: 16rpx;
}

.tool {
  font-size: 26rpx;
  font-weight: 700;
}

.tool.off {
  color: var(--text-muted);
  font-weight: 400;
}

.slider {
  flex: 1;
  margin: 0;
}

.form-error,
.status {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
}

.form-error {
  color: var(--danger);
}

.status {
  color: var(--text-secondary);
}

.result {
  margin-top: 24rpx;
}

.result-img {
  width: 100%;
  border-radius: 32rpx;
  background: var(--sand);
}

.save {
  margin-top: 16rpx;
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
