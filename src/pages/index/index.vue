<template>
  <view class="page home">
    <view class="top">
      <text class="word">快客</text>
      <text class="credit" @tap="onCredit">{{ creditText }}</text>
    </view>
    <text class="lead">点一个例子，换上你的照片</text>

    <text class="sec">实用</text>
    <view class="pair">
      <view v-for="item in pairTop" :key="item.id" class="cell" @tap="open(item)">
        <play-card v-bind="cardProps(item)" />
      </view>
    </view>
    <view class="pair">
      <view v-for="item in pairBottom" :key="item.id" class="cell" @tap="open(item)">
        <play-card v-bind="cardProps(item)" />
      </view>
    </view>
    <view @tap="open(wide)">
      <play-card v-bind="cardProps(wide)" />
    </view>

    <text class="sec">好玩</text>
    <view class="fun">
      <view v-for="item in fun" :key="item.id" class="cell" @tap="open(item)">
        <play-card v-bind="cardProps(item)" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import PlayCard from '@/components/play-card/play-card.vue'
import { FUN_PLAYS, PAIR_PLAYS, WIDE_PLAY, type Play } from '@/constants/plays'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const pairTop = PAIR_PLAYS.slice(0, 2)
const pairBottom = PAIR_PLAYS.slice(2)
const wide = WIDE_PLAY
const fun = FUN_PLAYS

const creditText = computed(() => (userStore.isLoggedIn ? `${userStore.balance ?? '—'} 积分` : '登录'))

function cardProps(item: Play) {
  return {
    title: item.title,
    subtitle: item.subtitle,
    before: item.before,
    after: item.after,
    beforeLabel: item.beforeLabel,
    afterLabel: item.afterLabel,
    layout: item.layout,
    sampleMark: item.sampleMark,
    corner: item.corner
  }
}

function open(item: Play) {
  if (item.kind === 'erase') {
    uni.navigateTo({ url: `/pages/erase/index?id=${item.id}` })
    return
  }
  if (item.kind === 'stamp') {
    uni.navigateTo({ url: '/pages/stamp/index' })
    return
  }
  uni.navigateTo({ url: `/pages/play/index?id=${item.id}` })
}

function onCredit() {
  if (userStore.isLoggedIn) uni.switchTab({ url: '/pages/mine/index' })
  else uni.navigateTo({ url: '/pages/login/index' })
}

onShow(() => {
  void userStore.refresh()
})

onShareAppMessage(() => ({ title: '点一个例子，换上你的照片', path: '/pages/index/index' }))
onShareTimeline(() => ({ title: '点一个例子，换上你的照片' }))
</script>

<style>
.home {
  padding-top: 8rpx;
}

.top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.word {
  font-size: 56rpx;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1rpx;
}

.credit {
  margin-bottom: 8rpx;
  font-size: 26rpx;
  font-weight: 700;
}

.lead {
  display: block;
  margin: 8rpx 0 8rpx;
  color: var(--text-muted);
  font-size: 26rpx;
}

.sec {
  display: block;
  margin: 28rpx 4rpx 16rpx;
  color: var(--text-muted);
  font-size: 26rpx;
  font-weight: 700;
}

.pair,
.fun {
  display: flex;
  gap: 16rpx;
}

.pair {
  margin-bottom: 16rpx;
}

.cell {
  flex: 1;
  min-width: 0;
}
</style>
