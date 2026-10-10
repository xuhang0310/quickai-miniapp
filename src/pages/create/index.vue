<template>
  <view class="page">
    <view class="intro">
      <text class="section-title">选择创作方式</text>
      <text class="muted">每次生成按平台规则消耗积分，新用户登录即送积分</text>
    </view>

    <!-- M1/M2：两种创作流程，见 docs/PLAN.md 第 3 节 -->
    <view v-for="mode in modes" :key="mode.key" class="mode card" @tap="openMode(mode.title)">
      <view class="mode-text">
        <text class="mode-title">{{ mode.title }}</text>
        <text class="mode-desc">{{ mode.desc }}</text>
      </view>
      <text class="mode-tag">即将上线</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const modes = [
  { key: 'product', title: 'AI 商品图', desc: '上传商品照片，生成电商主图、场景图' },
  { key: 'free', title: '自由创作', desc: '输入描述或上传参考图，生成图片' }
]

function openMode(title: string) {
  if (!userStore.requireLogin()) return
  uni.showToast({ title: `${title}即将上线`, icon: 'none' })
}
</script>

<style>
.intro {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 28rpx;
}

.mode {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 20rpx;
}

.mode-text {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.mode-title {
  font-size: 32rpx;
  font-weight: 600;
}

.mode-desc {
  color: var(--text-secondary);
  font-size: 26rpx;
}

.mode-tag {
  flex-shrink: 0;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  background: var(--brand-soft);
  color: var(--brand-strong);
  font-size: 22rpx;
}
</style>
