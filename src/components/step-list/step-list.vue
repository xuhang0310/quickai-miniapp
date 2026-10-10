<template>
  <view class="steps">
    <view v-for="(step, index) in steps" :key="index" class="step">
      <text class="n">{{ index + 1 }}</text>
      <text class="label">{{ step }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{ steps: string[] }>()
</script>

<style scoped>
.steps {
  margin-top: 8rpx;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 14rpx 0;
}

.n {
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background: var(--brand-strong);
  color: var(--on-brand);
  font-size: 24rpx;
  font-weight: 700;
  line-height: 44rpx;
  text-align: center;
  flex: 0 0 auto;
}

.label {
  flex: 1;
  padding-top: 4rpx;
  color: var(--text-secondary);
  font-size: 28rpx;
  line-height: 1.45;
}
</style>
