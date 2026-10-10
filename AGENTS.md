# AGENTS.md

## 项目

- 快客 QuickAI 小程序，uni-app（Vue 3 + Vite + TypeScript）CLI 工程。先发布微信小程序（`mp-weixin`），后续发布抖音小程序（`mp-toutiao`）。
- 定位是引流入口，不复制网页版全部功能。范围、里程碑和后端接口契约以 `docs/PLAN.md` 为准。
- 云端接口与产品前端 `xuhang0310/quickai-studio` 共用；新增后端接口统一在 Java 项目 `zhirui-ai-admin` 中实现，接口沿用 `{ success, data, error }` 和 Bearer token。

## 需求与设计

- 新增功能或调整范围时，先阅读 `docs/PLAN.md` 和相关代码，给出简洁设计，用户确认后再修改业务代码。
- 采用满足当前需求的最小实现；不自行增加支付、审批等业务能力。
- 设计变化时同步更新 `docs/PLAN.md`。

## 开发约定

- 页面使用 `<script setup lang="ts">` 和 Composition API；界面文案使用中文。
- 请求统一走 `src/api/request.ts`，不要在页面里直接调用 `uni.request`。
- 需要登录的操作先调用 `useUserStore().requireLogin()`。
- 颜色使用 `App.vue` 中 `page` 上定义的 CSS 变量，不在页面里写死颜色。
- 平台差异用 uni-app 条件编译（`#ifdef MP-WEIXIN`）处理，放在 `src/utils/`。
- 耗时操作显示处理状态并防止重复提交。

## 验证

- 修改代码后运行 `npm run type-check` 和 `npm run build:mp-weixin`，两者都必须通过。
- 涉及交互的改动，在微信开发者工具中验证；无法验证时如实说明。

## 安全

- 不提交 AppSecret、支付密钥、`.env.local`、`project.private.config.json` 等私密配置。AppSecret 只存在后端。
