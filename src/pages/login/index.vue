<template>
  <view class="page">
    <view class="brand">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">登录快客 QuickAI</text>
      <text class="muted">新用户登录即送积分</text>
    </view>

    <button class="btn-primary" :loading="wechatSubmitting" :disabled="wechatSubmitting || submitting" @tap="wechat">
      微信一键登录
    </button>

    <view class="divider"><text class="muted">已有网页账号</text></view>

    <view class="form card">
      <input v-model="email" class="field" type="text" placeholder="邮箱" />
      <input v-model="password" class="field" password placeholder="密码" />
      <text v-if="error" class="error">{{ error }}</text>
      <button class="btn-secondary" :loading="submitting" :disabled="submitting" @tap="submit">邮箱登录</button>
    </view>

    <view class="agreement">
      <view class="agree-toggle" @tap="agreed = !agreed">
        <view :class="['check', { checked: agreed }]">
          <text v-if="agreed" class="check-mark">✓</text>
        </view>
        <text class="muted">已阅读并同意</text>
      </view>
      <text class="link" @tap="policyOpen = true">《用户协议》和《隐私政策》</text>
    </view>

    <view v-if="policyOpen" class="mask" @tap="policyOpen = false">
      <view class="policy card" @tap.stop>
        <text class="policy-title">协议摘要</text>
        <text class="policy-body">使用快客生成图片时，请遵守法律法规，不要制作违法或侵犯他人权益的内容。生成结果的使用以平台规则为准。</text>
        <text class="policy-body">微信登录只提交微信给出的登录凭证。邮箱登录会提交邮箱和密码。你选择的照片和写下的描述会发送到快客服务器，只用于按你的操作处理图片。</text>
        <button class="btn-primary" @tap="acceptPolicy">我已阅读</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { publicError } from '@/utils/public'

const userStore = useUserStore()
const email = ref('')
const password = ref('')
const referralCode = ref('')
const agreed = ref(false)
const policyOpen = ref(false)
const submitting = ref(false)
const wechatSubmitting = ref(false)
const error = ref('')

onLoad(query => {
  const code = String(query?.referralCode || query?.invite || '')
  if (code) referralCode.value = code.slice(0, 32)
})

function requestLoginCode() {
  return new Promise<string>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success(res) {
        if (res.code) resolve(res.code)
        else reject(new Error('没有拿到微信登录凭证'))
      },
      fail(err) {
        reject(new Error(err.errMsg || '微信登录失败'))
      }
    })
  })
}

async function wechat() {
  error.value = ''
  if (!agreed.value) {
    error.value = '请先阅读并同意用户协议和隐私政策'
    return
  }
  wechatSubmitting.value = true
  try {
    const code = await requestLoginCode()
    const result = await userStore.loginByWechat(code, referralCode.value || undefined)
    if (!result.success || !result.data?.token) {
      error.value = publicError(result.error, '微信登录失败，请稍后重试')
      return
    }
    const created = Boolean(result.data.isNew ?? result.data.is_new)
    uni.showToast({ title: created ? '欢迎，积分已到账' : '登录成功', icon: 'none' })
    setTimeout(() => leave(), 600)
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    error.value = /fail|not supported|暂不支持/i.test(message)
      ? '请在微信小程序里使用微信登录'
      : publicError(message, '微信登录失败，请稍后重试')
  } finally {
    wechatSubmitting.value = false
  }
}

function leave() {
  if (getCurrentPages().length > 1) uni.navigateBack()
  else uni.switchTab({ url: '/pages/mine/index' })
}

async function acceptPolicy() {
  agreed.value = true
  policyOpen.value = false
}

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
    setTimeout(() => leave(), 600)
  } finally {
    submitting.value = false
  }
}
</script>

<style>
.brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
  margin: 28rpx 0 48rpx;
}

.logo {
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 56rpx;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -1rpx;
}

.divider {
  display: flex;
  margin: 48rpx 0 12rpx;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: transparent;
  padding: 0;
}

.field {
  height: 96rpx;
  padding: 0;
  border-bottom: 2rpx solid var(--text);
  background: transparent;
  font-size: 32rpx;
}

.error {
  color: var(--danger);
  font-size: 24rpx;
}

.agreement {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 28rpx;
}

.form .btn-secondary {
  margin-top: 36rpx;
}

.agree-toggle {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.check {
  width: 28rpx;
  height: 28rpx;
  border: 2rpx solid var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
}

.check.checked {
  border-color: var(--brand-strong);
  background: var(--brand-strong);
}

.check-mark {
  color: var(--on-brand);
  font-size: 20rpx;
  line-height: 1;
}

.link {
  color: var(--brand-strong);
  font-size: 24rpx;
}

.mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 48rpx;
  background: var(--scrim);
  display: flex;
  align-items: center;
  z-index: 20;
}

.policy {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.policy-title {
  font-size: 34rpx;
  font-weight: 700;
}

.policy-body {
  color: var(--text-secondary);
  font-size: 26rpx;
  line-height: 1.6;
}
</style>
