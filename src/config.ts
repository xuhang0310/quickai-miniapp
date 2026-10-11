/** 云端 API 地址，与网页版 VITE_CLOUD_API_URL 指向同一服务。 */
export const API_BASE = (import.meta.env.VITE_API_BASE || 'https://openclaw.aisupermarket.top').replace(/\/$/, '')

/** Java 升级接口。微信登录走这里，其余接口仍用 API_BASE。 */
export const JAVA_API_BASE = (import.meta.env.VITE_JAVA_API_BASE || 'https://console-9f4c2a7e6b13.aisupermarket.top/kuaike-api').replace(/\/$/, '')

/** 当前编译平台，如 mp-weixin、mp-toutiao、h5，随请求上报便于后端区分渠道。 */
export const CLIENT = process.env.UNI_PLATFORM || 'unknown'

/**
 * 小程序生图固定使用的模型标识。
 * 只放进请求体，页面、分享文案、任务卡片和报错都不要展示。
 * 提审前若要换成有国内备案的模型，只改这一处，见 docs/PLAN.md 第 2 节。
 */
export const MP_IMAGE_MODEL = 'gpt-image-2'
