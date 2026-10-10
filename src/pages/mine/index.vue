<template>
  <view class="page">
    <view v-if="userStore.isLoggedIn" class="profile card">
      <view class="avatar">{{ initial }}</view>
      <view class="profile-text">
        <text class="nickname">{{ userStore.user?.nickname || '快客用户' }}</text>
        <text class="muted">{{ userStore.user?.email || '微信登录即将开通' }}</text>
      </view>
    </view>
    <view v-else class="profile card">
      <view class="avatar">客</view>
      <view class="profile-text">
        <text class="nickname">先看看，再登录</text>
        <text class="muted">登录后可以生成图片，新用户赠送积分</text>
      </view>
      <button class="btn-primary login-action" @tap="goLogin">登录 / 注册</button>
    </view>

    <view class="wallet card">
      <view>
        <text class="muted">积分余额</text>
        <text class="balance-value">{{ userStore.isLoggedIn ? userStore.balance ?? '—' : '—' }}</text>
      </view>
      <text class="wallet-note">充值在网页版完成，小程序内支付即将开通</text>
    </view>

    <view class="section-head">
      <text class="section-title">我的作品</text>
      <text v-if="worksLoading" class="muted">加载中</text>
    </view>

    <view v-if="!userStore.isLoggedIn" class="empty card">
      <text class="muted">登录后在这里看生成结果</text>
    </view>
    <view v-else-if="worksError" class="empty card">
      <text>{{ worksError }}</text>
      <button class="btn-secondary retry" @tap="loadWorks">重试</button>
    </view>
    <view v-else-if="works.length === 0" class="empty card">
      <text class="empty-title">还没有作品</text>
      <text class="muted">去灵感广场做一张同款</text>
    </view>
    <view v-else class="works">
      <view v-for="item in works" :key="item.id" class="work" @tap="openWork(item)">
        <image v-if="item.result_url" class="work-img" :src="item.result_url" mode="aspectFill" lazy-load />
        <view v-else class="work-img work-pending">
          <text>{{ statusLabel(item.status) }}</text>
        </view>
      </view>
    </view>

    <view class="menu card">
      <button class="menu-item share" open-type="share">
        <text>分享给好友</text>
        <text class="muted">邀请奖励即将开通</text>
      </button>
      <view class="menu-item" @tap="onBind">
        <text>绑定网页账号</text>
        <text class="muted">用邮箱登录即同一账号</text>
      </view>
    </view>

    <button v-if="userStore.isLoggedIn" class="btn-secondary logout" @tap="logout">退出登录</button>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShareAppMessage, onShow } from '@dcloudio/uni-app'
import { getImageTasks, type ImageTask } from '@/api/creative'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const works = ref<ImageTask[]>([])
const worksLoading = ref(false)
const worksError = ref('')

const initial = computed(() => (userStore.user?.nickname || '客').slice(0, 1))

function statusLabel(status: string) {
  if (status === 'failed') return '失败'
  if (status === 'completed') return '完成'
  return '生成中'
}

async function loadWorks() {
  if (!userStore.isLoggedIn) {
    works.value = []
    return
  }
  worksLoading.value = true
  worksError.value = ''
  const result = await getImageTasks({ page: 1, pageSize: 30 })
  worksLoading.value = false
  if (!result.success || !result.data) {
    worksError.value = result.error || '作品加载失败'
    return
  }
  works.value = result.data.list
}

function openWork(item: ImageTask) {
  if (!item.result_url) {
    uni.showToast({ title: statusLabel(item.status), icon: 'none' })
    return
  }
  const urls = works.value.map(work => work.result_url).filter((url): url is string => Boolean(url))
  uni.previewImage({ urls, current: item.result_url })
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function onBind() {
  if (!userStore.isLoggedIn) {
    goLogin()
    return
  }
  uni.showToast({ title: '当前邮箱登录与网页版是同一账号', icon: 'none' })
}

function logout() {
  userStore.logout()
  works.value = []
  uni.showToast({ title: '已退出登录', icon: 'none' })
}

onShow(() => {
  void userStore.refresh()
  void loadWorks()
})

onShareAppMessage(() => ({ title: '一张商品图，AI 生成电商主图', path: '/pages/index/index' }))
</script>

<style>
.profile {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  background: var(--text);
  color: var(--on-brand);
  font-size: 36rpx;
  font-weight: 700;
  line-height: 88rpx;
  text-align: center;
}

.profile-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.nickname {
  font-size: 40rpx;
  font-weight: 700;
  letter-spacing: -1rpx;
}

.login-action {
  width: 100%;
  margin-top: 8rpx;
}

.profile,
.wallet,
.menu,
.empty {
  background: transparent;
  padding-left: 0;
  padding-right: 0;
}

.wallet {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 36rpx;
  padding-top: 28rpx;
  border-top: 2rpx solid var(--text);
}

.balance-value {
  display: block;
  margin-top: 4rpx;
  font-size: 88rpx;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -2rpx;
  color: var(--signal);
}

.wallet-note {
  color: var(--text-secondary);
  font-size: 24rpx;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 36rpx 0 16rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 600;
}

.retry {
  margin-top: 12rpx;
}

.works {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.work {
  width: calc((100% - 16rpx) / 3);
  height: 220rpx;
}

.work-img {
  width: 100%;
  height: 100%;
  border-radius: 4rpx;
  background: var(--sand);
}

.work-pending {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 22rpx;
}

.menu {
  margin-top: 28rpx;
  padding-top: 0;
  padding-bottom: 0;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  border-bottom: 1rpx solid var(--line);
  background: transparent;
  font-size: 28rpx;
  line-height: 100rpx;
  text-align: left;
}

.menu-item:last-child {
  border-bottom: none;
}

.share {
  width: 100%;
  padding: 0;
  margin: 0;
  border-radius: 0;
  background: transparent;
  color: var(--text);
  font-weight: 400;
}

.share::after {
  border: none;
}

.logout {
  margin-top: 36rpx;
}
</style>
