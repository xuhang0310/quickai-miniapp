<template>
  <view class="page">
    <view class="brand">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">登录快客 QuickAI</text>
      <text class="muted">新用户登录即送积分</text>
    </view>

    <!-- M2：后端实现 /api/auth/wechat-mini/login 后启用 -->
    <button class="btn-primary" disabled>微信一键登录（即将上线）</button>

    <view class="divider"><text class="muted">已有网页账号</text></view>

    <view class="form card">
      <input v-model="email" class="field" type="text" placeholder="邮箱" />
      <input v-model="password" class="field" password placeholder="密码" />
      <text v-if="error" class="error">{{ error }}</text>
      <button class="btn-secondary" :loading="submitting" :disabled="submitting" @tap="submit">邮箱登录</button>
    </view>

    <view class="agreement" @tap="agreed = !agreed">
      <view :class="['check', { checked: agreed }]" />
      <text class="muted">已阅读并同意《用户协议》和《隐私政策》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const email = ref('')
const password = ref('')
const agreed = ref(false)
const submitting = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!agreed.value) {
    error.value = '请先阅读并同意用户协议和隐私政策'
    return
  }
  if (!email.value.trim() || !password.value) {
    error.value = '请输入邮箱和密码'
    return
  }
  submitting.value = true
  try {
    const result = await userStore.loginByEmail(email.value.trim(), password.value)
    if (!result.success) {
      error.value = result.error || '登录失败，请稍后重试'
      return
    }
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      if (getCurrentPages().length > 1) uni.navigateBack()
      else uni.switchTab({ url: '/pages/mine/index' })
    }, 600)
  } finally {
    submitting.value = false
  }
}
</script>

<style>
.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  margin: 40rpx 0 56rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 12rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
}

.divider {
  display: flex;
  justify-content: center;
  margin: 40rpx 0 24rpx;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.field {
  height: 88rpx;
  padding: 0 24rpx;
  border: 1rpx solid var(--line);
  border-radius: 20rpx;
  background: var(--bg);
}

.error {
  color: var(--danger);
  font-size: 24rpx;
}

.agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 32rpx;
}

.check {
  width: 28rpx;
  height: 28rpx;
  border: 2rpx solid var(--text-muted);
  border-radius: 50%;
}

.check.checked {
  border-color: var(--brand-strong);
  background: var(--brand-strong);
}
</style>
