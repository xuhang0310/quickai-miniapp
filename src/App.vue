<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

onLaunch(() => {
  void useUserStore().refresh()
})
</script>

<style>
page {
  --bg: #f4f5f7;
  --card: #ffffff;
  --line: #e6e6ea;
  --text: #1c1c1e;
  --text-secondary: #3a3a3c;
  --text-muted: #8a8a90;
  --brand: #111111;
  --brand-strong: #111111;
  --brand-soft: #efefec;
  --on-brand: #ffffff;
  --on-brand-dim: rgba(255, 255, 255, 0.62);
  --on-image: #ffffff;
  --signal: #1c1c1e;
  --sand: #ececef;
  --clay: #e6e6ea;
  --sage: #ececef;
  --moss: #111111;
  --paper: #f7f7f8;
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
  border-radius: 32rpx;
  padding: 32rpx;
}

.btn-primary,
.btn-secondary {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 700;
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
