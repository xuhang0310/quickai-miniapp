<template>
  <view class="page home">
    <view class="mast">
      <view class="mast-copy">
        <text class="mast-kicker">QUICKAI</text>
        <text class="mast-title">做一张能上架的图</text>
      </view>
      <view class="credit" @tap="onCredit">
        <text class="credit-value">{{ creditText }}</text>
      </view>
    </view>

    <view class="search">
      <input
        v-model="keyword"
        class="search-input"
        confirm-type="search"
        placeholder="搜索场景、商品或风格"
        placeholder-class="search-placeholder"
        @confirm="onSearch"
      />
      <text v-if="keyword" class="search-clear" @tap="clearSearch">清除</text>
      <text class="search-go" @tap="onSearch">搜索</text>
    </view>

    <scroll-view class="cats" scroll-x :show-scrollbar="false">
      <view class="cats-row">
        <view
          v-for="cat in categories"
          :key="cat"
          :class="['cat', { on: cat === currentCategory }]"
          @tap="pickCategory(cat)"
        >{{ cat }}</view>
      </view>
    </scroll-view>

    <view class="tools">
      <view
        v-for="(kind, index) in kinds"
        :key="kind.key"
        :class="['tool', { lead: index === 0 }]"
        @tap="openKind(kind.key)"
      >
        <text class="tool-index">0{{ index + 1 }}</text>
        <text class="tool-title">{{ kind.title }}</text>
        <text class="tool-hint">{{ kind.hint }}</text>
      </view>
    </view>

    <view class="section-head">
      <text class="section-title">灵感广场</text>
      <text class="muted">点开就能做同款</text>
    </view>

    <view v-if="loading && templates.length === 0" class="board">
      <view class="col">
        <view class="bone" style="height: 360rpx" />
        <view class="bone" style="height: 240rpx" />
      </view>
      <view class="col">
        <view class="bone" style="height: 260rpx" />
        <view class="bone" style="height: 400rpx" />
      </view>
    </view>

    <view v-else-if="loadError && templates.length === 0" class="empty card">
      <text>{{ loadError }}</text>
      <button class="btn-secondary retry" @tap="reload">重试</button>
    </view>

    <view v-else-if="templates.length === 0" class="empty card">
      <text class="empty-title">这个分类还没有模板</text>
      <text class="muted">换个分类，或去创作页直接做商品图</text>
    </view>

    <view v-else class="board">
      <view v-for="(column, index) in columns" :key="index" class="col">
        <view
          v-for="item in column"
          :key="item.id"
          class="shot"
          @tap="openTemplate(item.id)"
        >
          <view class="shot-frame" :style="{ height: item.height + 'rpx' }">
            <image v-if="item.cover_url" class="shot-cover" :src="item.cover_url" mode="aspectFill" lazy-load />
            <view v-else class="shot-fallback">
              <text>{{ item.title }}</text>
            </view>
            <text v-if="item.official" class="badge">官方</text>
          </view>
          <text class="shot-title">{{ item.title }}</text>
          <text class="shot-meta">{{ item.use_count || 0 }} 次使用</text>
        </view>
      </view>
    </view>

    <view v-if="templates.length > 0" class="load-state">
      <text class="muted">{{ loading ? '正在加载' : hasMore ? '上拉加载更多' : '已经到底了' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { getTemplates, type CreativeTemplate } from '@/api/creative'
import { PRODUCT_KINDS, TEMPLATE_CATEGORIES, coverHeight, isOfficial, setPendingKind, type ProductKindKey } from '@/constants/catalog'
import { useUserStore } from '@/stores/user'

interface Shot extends CreativeTemplate {
  height: number
  official: boolean
}

const userStore = useUserStore()
const categories = TEMPLATE_CATEGORIES
const kinds = PRODUCT_KINDS
const currentCategory = ref('全部')
const keyword = ref('')
const appliedKeyword = ref('')
const templates = ref<CreativeTemplate[]>([])
const page = ref(1)
const total = ref(0)
const hasMore = ref(true)
const loading = ref(false)
const loadError = ref('')
const pageSize = 12
let ticket = 0

const creditText = computed(() => (userStore.isLoggedIn ? `${userStore.balance ?? '—'} 积分` : '登录'))

const columns = computed(() => {
  const left: Shot[] = []
  const right: Shot[] = []
  let leftHeight = 0
  let rightHeight = 0
  for (const item of templates.value) {
    const height = coverHeight(item.size)
    const shot: Shot = { ...item, height, official: isOfficial(item.is_official) }
    if (leftHeight <= rightHeight) {
      left.push(shot)
      leftHeight += height
    } else {
      right.push(shot)
      rightHeight += height
    }
  }
  return [left, right]
})

async function load(reset: boolean) {
  const mine = ++ticket
  if (reset) {
    page.value = 1
    hasMore.value = true
  }
  if (!hasMore.value && !reset) return
  loading.value = true
  if (reset) loadError.value = ''
  const result = await getTemplates({
    page: page.value,
    pageSize,
    category: currentCategory.value === '全部' ? undefined : currentCategory.value,
    search: appliedKeyword.value || undefined
  })
  if (mine !== ticket) return
  loading.value = false
  uni.stopPullDownRefresh()
  if (!result.success || !result.data) {
    if (reset) loadError.value = result.error || '灵感加载失败'
    return
  }
  const batch = result.data.list
  templates.value = reset ? batch : templates.value.concat(batch)
  total.value = result.data.total
  hasMore.value = total.value > 0 ? templates.value.length < total.value : batch.length === pageSize
  if (batch.length > 0) page.value += 1
}

function reload() {
  void load(true)
}

function pickCategory(cat: string) {
  if (cat === currentCategory.value) return
  currentCategory.value = cat
  templates.value = []
  void load(true)
}

function onSearch() {
  appliedKeyword.value = keyword.value.trim()
  templates.value = []
  void load(true)
}

function clearSearch() {
  keyword.value = ''
  if (!appliedKeyword.value) return
  appliedKeyword.value = ''
  templates.value = []
  void load(true)
}

function openKind(key: ProductKindKey) {
  setPendingKind(key)
  uni.switchTab({ url: '/pages/create/index' })
}

function openTemplate(id: number) {
  uni.navigateTo({ url: `/pages/template/index?id=${id}` })
}

function onCredit() {
  if (userStore.isLoggedIn) uni.switchTab({ url: '/pages/mine/index' })
  else uni.navigateTo({ url: '/pages/login/index' })
}

onLoad(() => {
  void load(true)
})

onShow(() => {
  void userStore.refresh()
})

onPullDownRefresh(() => {
  void load(true)
})

onReachBottom(() => {
  if (!loading.value && hasMore.value) void load(false)
})

onShareAppMessage(() => ({ title: '一张商品图，AI 生成电商主图', path: '/pages/index/index' }))
onShareTimeline(() => ({ title: '一张商品图，AI 生成电商主图' }))
</script>

<style>
.home {
  padding-top: 8rpx;
  padding-bottom: 24rpx;
}

.mast {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24rpx;
  margin: 12rpx 0 36rpx;
}

.mast-kicker {
  display: block;
  color: var(--text-muted);
  font-size: 20rpx;
  letter-spacing: 6rpx;
}

.mast-title {
  display: block;
  margin-top: 8rpx;
  font-size: 52rpx;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -1rpx;
}

.credit {
  flex-shrink: 0;
  margin-bottom: 6rpx;
}

.credit-value {
  color: var(--signal);
  font-size: 24rpx;
  font-weight: 600;
}

.search {
  display: flex;
  align-items: center;
  height: 80rpx;
  border-bottom: 2rpx solid var(--text);
}

.search-input {
  flex: 1;
  height: 80rpx;
  font-size: 30rpx;
}

.search-clear,
.search-go {
  margin-left: 20rpx;
  font-size: 26rpx;
}

.search-go {
  color: var(--text);
  font-weight: 700;
}

.search-clear {
  color: var(--text-muted);
}

.cats {
  width: 100%;
  height: 84rpx;
  margin-top: 8rpx;
  white-space: nowrap;
}

.cats-row {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  height: 84rpx;
}

.cat {
  display: inline-flex;
  align-items: center;
  margin-right: 36rpx;
  color: var(--text-muted);
  font-size: 28rpx;
}

.cat.on {
  color: var(--text);
  font-weight: 700;
  box-shadow: inset 0 -4rpx 0 var(--text);
}

.tools {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 28rpx;
}

.tool {
  width: calc(50% - 6rpx);
  min-height: 168rpx;
  padding: 24rpx;
  background: var(--card);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tool.lead {
  background: var(--text);
}

.tool-index {
  color: var(--text-muted);
  font-size: 20rpx;
  letter-spacing: 2rpx;
}

.tool.lead .tool-index,
.tool.lead .tool-hint {
  color: var(--on-brand-dim);
}

.tool-title {
  display: block;
  margin-top: 28rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.tool.lead .tool-title {
  color: var(--on-brand);
}

.tool-hint {
  display: block;
  margin-top: 6rpx;
  color: var(--text-muted);
  font-size: 22rpx;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 48rpx 0 20rpx;
}

.board {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.shot-frame {
  position: relative;
  overflow: hidden;
  border-radius: 6rpx;
  background: var(--sand);
}

.shot-cover,
.shot-fallback {
  width: 100%;
  height: 100%;
}

.shot-fallback {
  display: flex;
  align-items: flex-end;
  padding: 20rpx;
  background: var(--text);
  color: var(--on-brand);
  font-size: 26rpx;
  font-weight: 600;
}

.badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 2rpx 10rpx;
  background: var(--on-brand);
  color: var(--text);
  font-size: 18rpx;
  letter-spacing: 1rpx;
}

.shot-title {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.35;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.shot-meta {
  display: block;
  margin-top: 2rpx;
  color: var(--text-muted);
  font-size: 20rpx;
}

.bone {
  border-radius: 6rpx;
  background: var(--sand);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
  background: transparent;
  padding-left: 0;
  padding-right: 0;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 700;
}

.retry {
  margin-top: 16rpx;
}

.load-state {
  padding: 36rpx 0 8rpx;
  text-align: center;
}
</style>
