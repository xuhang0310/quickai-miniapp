<template>
  <view :class="['tile', layout]">
    <view v-if="layout === 'fun'" class="result">
      <image class="fill" :src="after" mode="aspectFill" lazy-load />
      <image class="inset" :src="before" mode="aspectFill" />
    </view>
    <view v-else class="split">
      <view class="half">
        <image class="fill" :src="before" mode="aspectFill" lazy-load />
        <text v-if="sampleMark" class="sample">样图水印</text>
        <text class="badge">{{ beforeLabel }}</text>
      </view>
      <view class="half">
        <image class="fill" :src="after" mode="aspectFill" lazy-load />
        <text v-if="corner" class="corner">{{ corner }}</text>
        <text class="badge">{{ afterLabel }}</text>
      </view>
      <view class="cut" />
    </view>
    <view class="meta">
      <text class="name">{{ title }}</text>
      <text class="sub">{{ subtitle }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  before: string
  after: string
  beforeLabel: string
  afterLabel: string
  layout: 'split' | 'wide' | 'fun'
  sampleMark?: boolean
  corner?: string
}>()
</script>

<style scoped>
.tile {
  background: var(--card);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(20, 20, 20, 0.05);
}

.split {
  display: flex;
  height: 300rpx;
  position: relative;
  background: var(--sand);
}

.wide .split {
  height: 340rpx;
}

.half {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
}

.fill {
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
  left: 12rpx;
  bottom: 12rpx;
  padding: 0 12rpx;
  height: 32rpx;
  line-height: 32rpx;
  border-radius: 16rpx;
  background: rgba(0, 0, 0, 0.58);
  color: #fff;
  font-size: 20rpx;
}

.sample {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 38%;
  text-align: center;
  color: rgba(255, 255, 255, 0.92);
  font-size: 26rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
  transform: rotate(-16deg);
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.45);
}

.corner {
  position: absolute;
  right: 12rpx;
  bottom: 52rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  background: rgba(0, 0, 0, 0.42);
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
}

.meta {
  padding: 16rpx 16rpx 20rpx;
}

.name {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.sub {
  display: block;
  margin-top: 4rpx;
  color: var(--text-muted);
  font-size: 22rpx;
  line-height: 1.35;
}

.result {
  position: relative;
  height: 280rpx;
  background: var(--sand);
}

.inset {
  position: absolute;
  left: 12rpx;
  bottom: 12rpx;
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.25);
}
</style>
