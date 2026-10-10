/** 云端 API 地址，与网页版 VITE_CLOUD_API_URL 指向同一服务。 */
export const API_BASE = (import.meta.env.VITE_API_BASE || 'https://openclaw.aisupermarket.top').replace(/\/$/, '')

/** 当前编译平台，如 mp-weixin、mp-toutiao、h5，随请求上报便于后端区分渠道。 */
export const CLIENT = process.env.UNI_PLATFORM || 'unknown'

/**
 * 小程序自发创作使用的模型，与网页版当前默认一致。
 * 提审前应改成有国内备案的模型，见 docs/PLAN.md 第 2 节。
 */
export const MP_IMAGE_MODEL = 'gpt-image-2'
