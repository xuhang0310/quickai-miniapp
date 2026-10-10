export type PlayKind = 'generate' | 'erase' | 'stamp'
export type PlayLayout = 'split' | 'wide' | 'fun'

export interface Play {
  id: string
  title: string
  subtitle: string
  kind: PlayKind
  layout: PlayLayout
  before: string
  after: string
  beforeLabel: string
  afterLabel: string
  sampleMark?: boolean
  corner?: string
  prompt?: string
  resolution?: '1K' | '2K'
  steps: string[]
  action: string
  hint: string
}

const photo = (name: string) => `/static/plays/${name}.jpg`

const restore: Play = {
  id: 'restore',
  title: '旧照修复',
  subtitle: '划痕、褪色，一键修好',
  kind: 'generate',
  layout: 'split',
  before: photo('old'),
  after: photo('portrait'),
  beforeLabel: '前',
  afterLabel: '后',
  resolution: '1K',
  prompt: '修复这张旧照片：去掉划痕、折痕、污点和褪色，恢复自然色彩和清晰度。必须保留人物的五官、身份、表情、姿势和原有构图，不要换脸，不要新增人或物品，不要文字和水印。',
  steps: ['先看示例里修好前后的差别', '换上你的旧照片', '按这个效果生成，尽量保住原来的脸'],
  action: '用我的照片复刻',
  hint: '生成需要一点时间，可稍后在「我的」查看'
}

const hd: Play = {
  id: 'hd',
  title: '一键高清',
  subtitle: '糊掉的照片变清楚',
  kind: 'generate',
  layout: 'split',
  before: photo('blur'),
  after: photo('portrait'),
  beforeLabel: '前',
  afterLabel: '后',
  resolution: '2K',
  prompt: '把这张照片变清晰：恢复对焦、边缘和细节，减少模糊和噪点。必须保留人物的五官、身份、表情、姿势和原有构图，不要换脸，不要改成另一张图，不要文字和水印。',
  steps: ['先看糊掉的和变清楚之后', '换上你的照片', '按这个效果生成，尽量保住原来的脸'],
  action: '用我的照片复刻',
  hint: '生成需要一点时间，可稍后在「我的」查看'
}

const threed: Play = {
  id: 'threed',
  title: '转 3D',
  subtitle: '人物变成立体角色',
  kind: 'generate',
  layout: 'fun',
  before: photo('portrait'),
  after: photo('threed'),
  beforeLabel: '前',
  afterLabel: '后',
  resolution: '1K',
  prompt: '把照片中的人物变成精致的立体渲染形象，体积和光影要明显，五官特征仍能认出是同一个人。保留姿势和构图，不要文字和水印。',
  steps: ['先看变成立体形象之后的样子', '换上你的人物照片', '按这个效果生成'],
  action: '用我的照片复刻',
  hint: '生成需要一点时间，可稍后在「我的」查看'
}

const anime: Play = {
  id: 'anime',
  title: '转动漫',
  subtitle: '同一张脸，动漫画风',
  kind: 'generate',
  layout: 'fun',
  before: photo('portrait'),
  after: photo('anime'),
  beforeLabel: '前',
  afterLabel: '后',
  resolution: '1K',
  prompt: '把照片中的人物变成干净的动漫形象，线条清楚，五官特征仍能认出是同一个人。保留姿势和构图，不要文字和水印。',
  steps: ['先看动漫画风的示例', '换上你的人物照片', '按这个效果生成'],
  action: '用我的照片复刻',
  hint: '生成需要一点时间，可稍后在「我的」查看'
}

const chibi: Play = {
  id: 'chibi',
  title: '转 Q 版',
  subtitle: '大头小身，一张就出',
  kind: 'generate',
  layout: 'fun',
  before: photo('portrait'),
  after: photo('chibi'),
  beforeLabel: '前',
  afterLabel: '后',
  resolution: '1K',
  prompt: '把照片中的人物变成 Q 版大头形象，头身比例夸张可爱，五官特征仍能认出是同一个人。不要文字和水印。',
  steps: ['先看 Q 版示例', '换上你的人物照片', '按这个效果生成'],
  action: '用我的照片复刻',
  hint: '生成需要一点时间，可稍后在「我的」查看'
}

const unwatermark: Play = {
  id: 'unwatermark',
  title: '去除水印',
  subtitle: '涂掉水印，其余不动',
  kind: 'erase',
  layout: 'split',
  before: photo('portrait'),
  after: photo('portrait'),
  beforeLabel: '前',
  afterLabel: '后',
  sampleMark: true,
  steps: ['上传带水印的照片', '用手指涂住水印', '只补涂过的区域，脸和其余画面保持原图'],
  action: '去掉涂抹区域',
  hint: '只处理涂过的地方，其余画面保持原图'
}

const stamp: Play = {
  id: 'watermark',
  title: '添加水印',
  subtitle: '右下角加一行字',
  kind: 'stamp',
  layout: 'split',
  before: photo('clean'),
  after: photo('clean'),
  beforeLabel: '前',
  afterLabel: '后',
  corner: '快客',
  steps: ['上传照片，输入一行字', '选位置，马上看到预览', '直接叠到原图上，不重新生成'],
  action: '加上水印',
  hint: '在手机上完成，不消耗积分'
}

const crowd: Play = {
  id: 'crowd',
  title: '路人消失',
  subtitle: '景区、合影里多余的人去掉',
  kind: 'erase',
  layout: 'wide',
  before: photo('crowd'),
  after: photo('clean'),
  beforeLabel: '有路人',
  afterLabel: '只留你',
  steps: ['上传有路人的照片', '涂住要去掉的人', '只补涂过的区域，没涂的地方保持原图'],
  action: '去掉涂抹区域',
  hint: '涂住多余的人，没涂的地方保持原图'
}

export const PAIR_PLAYS = [unwatermark, stamp, restore, hd]
export const WIDE_PLAY = crowd
export const FUN_PLAYS = [threed, anime, chibi]

const ALL = [...PAIR_PLAYS, WIDE_PLAY, ...FUN_PLAYS]

export function findPlay(id: string) {
  return ALL.find(item => item.id === id)
}

const FRAMES: Array<[string, number]> = [
  ['9:16', 9 / 16],
  ['3:4', 3 / 4],
  ['1:1', 1],
  ['4:3', 4 / 3],
  ['16:9', 16 / 9]
]

export function closestFrame(width: number, height: number) {
  const ratio = width / Math.max(height, 1)
  return FRAMES.reduce((best, item) => (Math.abs(item[1] - ratio) < Math.abs(best[1] - ratio) ? item : best))[0]
}
