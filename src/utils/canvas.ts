export interface CanvasNode {
  width: number
  height: number
  createImage: () => CanvasImage
  getContext: (kind: '2d') => CanvasRenderingContext2D
}

export interface CanvasImage {
  src: string
  width: number
  height: number
  onload: (() => void) | null
  onerror: (() => void) | null
}

export interface ViewBox {
  x: number
  y: number
  w: number
  h: number
}

export interface Stroke {
  size: number
  points: Array<{ x: number; y: number }>
}

export function containRect(boxW: number, boxH: number, imgW: number, imgH: number): ViewBox {
  const scale = Math.min(boxW / imgW, boxH / imgH)
  const w = imgW * scale
  const h = imgH * scale
  return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h }
}

export function queryCanvas(proxy: unknown, selector: string): Promise<{ node: CanvasNode; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const query = uni.createSelectorQuery()
    if (proxy) query.in(proxy as any)
    query.select(selector).fields({ node: true, size: true } as any, () => {}).exec((res: any[]) => {
      const row = res?.[0]
      if (!row?.node) {
        reject(new Error('画布还没准备好，请重试'))
        return
      }
      resolve({ node: row.node as CanvasNode, width: Number(row.width || 0), height: Number(row.height || 0) })
    })
  })
}

export function loadCanvasImage(node: CanvasNode, src: string): Promise<CanvasImage> {
  return new Promise((resolve, reject) => {
    const image = node.createImage()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片读取失败'))
    image.src = src
  })
}

export function canvasToFile(node: CanvasNode, proxy: unknown, fileType: 'jpg' | 'png'): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.canvasToTempFilePath({
      canvas: node,
      x: 0,
      y: 0,
      width: node.width,
      height: node.height,
      destWidth: node.width,
      destHeight: node.height,
      fileType,
      quality: fileType === 'jpg' ? 0.92 : 1,
      success: (res: { tempFilePath: string }) => resolve(res.tempFilePath),
      fail: (err: { errMsg?: string }) => reject(new Error(err?.errMsg || '导出图片失败'))
    } as any, proxy as any)
  })
}

export function paintStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  color: string,
  scaleX: number,
  scaleY = scaleX
) {
  if (!stroke.points.length) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = Math.max(1, stroke.size * scaleX)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const first = stroke.points[0]
  if (stroke.points.length === 1) {
    ctx.beginPath()
    ctx.arc(first.x * scaleX, first.y * scaleY, Math.max(1, stroke.size * scaleX) / 2, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.moveTo(first.x * scaleX, first.y * scaleY)
    for (let index = 1; index < stroke.points.length; index += 1) {
      const point = stroke.points[index]
      ctx.lineTo(point.x * scaleX, point.y * scaleY)
    }
    ctx.stroke()
  }
  ctx.restore()
}
