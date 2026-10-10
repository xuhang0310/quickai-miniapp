<template>
  <view class="page">
    <view v-if="userStore.isLoggedIn" class="profile card">
      <text class="nickname">{{ userStore.user?.nickname || '快客用户' }}</text>
      <view class="balance">
        <text class="muted">积分余额</text>
        <text class="balance-value">{{ userStore.balance ?? '—' }}</text>
      </view>
    </view>
    <view v-else class="profile card">
      <text class="nickname">未登录</text>
      <text class="muted">登录后可生成图片，新用户赠送积分</text>
      <button class="btn-primary login-action" @tap="goLogin">登录 / 注册</button>
    </view>

    <!-- M1/M2：我的作品、邀请好友、绑定已有网页账号 -->
    <view class="menu card">
      <view v-for="item in menu" :key="item" class="menu-item">
        <text>{{ item }}</text>
        <text class="muted">即将上线</text>
      </view>
    </view>

    <button v-if="userStore.isLoggedIn" class="btn-secondary logout" @tap="logout">退出登录</button>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const menu = ['我的作品', '邀请好友得积分', '绑定网页账号']

onShow(() => {
  void userStore.refresh()
})

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function logout() {
  userStore.logout()
  uni.showToast({ title: '已退出登录', icon: 'none' })
}
</script>

<style>
.profile {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.nickname {
  font-size: 38rpx;
  font-weight: 700;
}

.balance {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.balance-value {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--brand-strong);
}

.login-action {
  margin-top: 16rpx;
}

.menu {
  margin-top: 28rpx;
  padding-top: 8rpx;
  padding-bottom: 8rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  border-bottom: 1rpx solid var(--line);
}

.menu-item:last-child {
  border-bottom: none;
}

.logout {
  margin-top: 48rpx;
}
</style>
