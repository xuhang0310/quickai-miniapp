export const TEMPLATE_CATEGORIES = [
  '全部',
  '电商主图',
  '外贸商品',
  '公仔手办',
  '企业海报',
  '个人写真',
  '品牌视觉',
  '社媒配图',
  '产品包装',
  '角色设定',
  '国风插画',
  '室内空间',
  '漫剧分镜'
]

export type ProductKindKey = 'white' | 'scene' | 'selling' | 'seed'

export interface ProductKind {
  key: ProductKindKey
  title: string
  hint: string
  tone: 'paper' | 'sand' | 'clay' | 'sage'
}

/** 首发四种 1:1 商品图，对应规划里从电商图种里先挑 3–5 种。 */
export const PRODUCT_KINDS: ProductKind[] = [
  { key: 'white', title: '白底主图', hint: '纯白背景，商品居中', tone: 'paper' },
  { key: 'scene', title: '场景主图', hint: '放进真实使用场景', tone: 'sand' },
  { key: 'selling', title: '卖点特写', hint: '突出材质和卖点', tone: 'clay' },
  { key: 'seed', title: '种草图', hint: '适合转发的生活感', tone: 'sage' }
]

const RATIO_HEIGHT: Record<string, number> = {
  '1:1': 332,
  '3:4': 442,
  '4:3': 250,
  '9:16': 520,
  '16:9': 200,
  '2:3': 498,
  '3:2': 222
}

/** 双列瀑布流里封面的高度，单位 rpx。 */
export function coverHeight(size: string) {
  return RATIO_HEIGHT[size] || 360
}

export function isOfficial(value: boolean | number | undefined) {
  return value === true || value === 1
}

export function buildProductPrompt(kind: ProductKindKey, name: string, points: string) {
  const product = name.trim() || '图中的商品'
  const extra = points.trim() ? `补充要求：${points.trim()}。` : ''
  const prompts: Record<ProductKindKey, string> = {
    white: `电商白底主图。纯白色背景，${product}完整、居中、轮廓清楚，专业棚拍光线，保留商品真实外观、颜色和比例，不要文字、水印、logo 和多余道具。${extra}`,
    scene: `电商场景主图。把${product}放在干净、真实的使用场景里，自然光，商品是画面主体，背景不抢主体，保留商品真实外观，不要文字、水印和 logo。${extra}`,
    selling: `电商卖点特写图。突出${product}的材质、结构和核心卖点，商业摄影，背景简洁，画面留出少量空白，不要乱码文字、水印和 logo。${extra}`,
    seed: `社交平台种草图。${product}出现在自然的生活场景里，柔和日光，真实质感，适合分享，不要水印和 logo。${extra}`
  }
  return prompts[kind]
}

let pendingKind: ProductKindKey | '' = ''

/** tab 页不能带查询参数，用一次性意图把首页入口带到创作页。 */
export function setPendingKind(key: ProductKindKey) {
  pendingKind = key
}

export function takePendingKind() {
  const value = pendingKind
  pendingKind = ''
  return value
}
