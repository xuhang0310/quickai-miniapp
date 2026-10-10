<template>
  <view class="page">
    <view class="hero card">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="hero-title">一张商品图，生成电商主图</text>
      <text class="hero-desc">拍一张商品照片，AI 生成主图、场景图和种草图。</text>
      <button class="btn-primary hero-action" @tap="goCreate">开始创作</button>
    </view>

    <view class="section">
      <view class="section-head">
        <text class="section-title">灵感广场</text>
        <text class="muted">看到喜欢的作品，一键做同款</text>
      </view>
      <!-- M1：接入 getTemplates() 模板瀑布流，游客可浏览 -->
      <view class="placeholder card">
        <text class="muted">灵感广场即将上线</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

const shareTitle = '一张商品图，AI 生成电商主图'

function goCreate() {
  uni.switchTab({ url: '/pages/create/index' })
}

onShareAppMessage(() => ({ title: shareTitle, path: '/pages/index/index' }))
onShareTimeline(() => ({ title: shareTitle }))
</script>

<style>
.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12rpx;
}

.logo {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 12rpx;
}

.hero-title {
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.3;
}

.hero-desc {
  color: var(--text-secondary);
}

.hero-action {
  margin-top: 20rpx;
}

.section {
  margin-top: 48rpx;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.placeholder {
  height: 320rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
