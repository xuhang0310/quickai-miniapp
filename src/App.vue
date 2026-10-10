<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

onLaunch(() => {
  void useUserStore().refresh()
})
</script>

<style>
page {
  --bg: #f7f4f1;
  --card: #ffffff;
  --line: #ece5df;
  --text: #241f1c;
  --text-secondary: #6f6863;
  --text-muted: #8a817b;
  --brand: #cf7e5e;
  --brand-strong: #a85a40;
  --brand-soft: #f7e9e2;
  --on-brand: #ffffff;
  --danger: #b42318;

  background: var(--bg);
  color: var(--text);
  font-size: 28rpx;
  line-height: 1.6;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.page {
  min-height: 100vh;
  padding: 32rpx 32rpx 48rpx;
  box-sizing: border-box;
}

.card {
  background: var(--card);
  border: 1rpx solid var(--line);
  border-radius: 28rpx;
  padding: 32rpx;
}

.btn-primary,
.btn-secondary {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 46rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.btn-primary {
  background: var(--brand-strong);
  color: var(--on-brand);
}

.btn-secondary {
  background: var(--card);
  color: var(--text);
  border: 1rpx solid var(--line);
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
  font-size: 34rpx;
  font-weight: 700;
}

.muted {
  color: var(--text-muted);
  font-size: 24rpx;
}
</style>
