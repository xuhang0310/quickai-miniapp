# 快客 QuickAI 小程序

快客 QuickAI 在微信生态的引流入口：一张商品图生成电商主图，灵感广场一键做同款。
使用 uni-app（Vue 3 + Vite + TypeScript），先发布微信小程序，后续发布抖音小程序。

规划、上线前置条件和后端接口见 [docs/PLAN.md](docs/PLAN.md)。

## 开发

需要 Node.js 18 以上（推荐 24）和[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。

```bash
npm install
npm run dev:mp-weixin
```

用微信开发者工具导入 `dist/dev/mp-weixin`，修改代码后自动重新编译。

- 正式 AppID 填在 `src/manifest.json` 的 `mp-weixin.appid`。
- 接口地址默认是 `https://openclaw.aisupermarket.top`。需要改时，复制 `.env.example` 为 `.env.local` 再修改。
- 开发期 `urlCheck` 已关闭。真机预览和发布前，要在小程序后台配置 request、uploadFile、downloadFile 合法域名。

## 构建与检查

```bash
npm run type-check        # 类型检查
npm run build:mp-weixin   # 产物在 dist/build/mp-weixin，用开发者工具上传
npm run build:mp-toutiao  # 抖音小程序
npm run dev:h5            # 浏览器里快速看样式
```

## 目录

```text
src/
├── api/          请求封装（与网页版 cloudRequest 同一返回格式）和业务接口
├── stores/       Pinia：登录态、积分
├── pages/        index 灵感 · create 创作 · template 做同款 · mine 我的 · login 登录
├── components/   生成结果
├── composables/  生图与轮询
├── constants/    分类与商品图种
├── static/       图片资源
├── App.vue       全局样式与主题变量
├── pages.json    路由与 tabBar
└── manifest.json AppID 与平台配置
```
