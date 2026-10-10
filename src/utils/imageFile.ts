export function readImageInfo(src: string): Promise<{ path: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: res => resolve({ path: res.path || src, width: res.width, height: res.height }),
      fail: () => reject(new Error('读取图片失败'))
    })
  })
}

export function readFileSize(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    uni.getFileInfo({
      filePath,
      success: res => resolve(res.size),
      fail: () => reject(new Error('读取图片大小失败'))
    })
  })
}

export function fitSize(width: number, height: number, maxEdge = 1600) {
  const scale = Math.min(1, maxEdge / Math.max(width, height, 1))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale
  }
}
