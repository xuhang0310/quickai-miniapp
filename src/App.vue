<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

onLaunch(() => {
  void useUserStore().refresh()
})
</script>

<style>
page {
  --bg: #f3f3f1;
  --card: #ffffff;
  --line: #e4e4e0;
  --text: #111111;
  --text-secondary: #3f3f3f;
  --text-muted: #8d8d8d;
  --brand: #111111;
  --brand-strong: #111111;
  --brand-soft: #efefec;
  --on-brand: #ffffff;
  --on-brand-dim: rgba(255, 255, 255, 0.62);
  --on-image: #ffffff;
  --signal: #ff3b1f;
  --sand: #ececea;
  --clay: #e4e4e0;
  --sage: #ececea;
  --moss: #111111;
  --paper: #f7f7f5;
  --scrim: rgba(17, 17, 17, 0.55);
  --shadow: none;
  --danger: #d92d20;

  background: var(--bg);
  color: var(--text);
  font-size: 28rpx;
  line-height: 1.5;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', sans-serif;
}

view,
text,
button,
input,
image {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  padding: 12rpx 28rpx 56rpx;
  box-sizing: border-box;
}

.card {
  background: var(--card);
  border: none;
  border-radius: 8rpx;
  padding: 32rpx;
}

.btn-primary,
.btn-secondary {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 8rpx;
  font-size: 30rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.btn-primary {
  background: var(--brand-strong);
  color: var(--on-brand);
}

.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 2rpx solid var(--text);
}

.btn-primary::after,
.btn-secondary::after {
  border: none;
}

button.btn-primary[disabled] {
  background: var(--brand-strong);
  color: var(--on-brand);
  opacity: 0.45;
}

button.btn-secondary[disabled] {
  background: var(--card);
  color: var(--text);
  opacity: 0.45;
}

.section-title {
  font-size: 36rpx;
  font-weight: 700;
  letter-spacing: -0.5rpx;
}

.muted {
  color: var(--text-muted);
  font-size: 24rpx;
}

.search-placeholder {
  color: var(--text-muted);
}
</style>
