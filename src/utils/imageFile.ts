export function readImageInfo(src: string): Promise<{ path: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: res => resolve({ path: res.path || src, width: res.width, height: res.height }),
      fail: () => reject(new Error('读取图片失败'))
    })
  })
}

/** 代码包里的示例图不能直接上传，先抄到用户目录。相册临时文件原样返回。 */
export function uploadableImagePath(src: string): Promise<string> {
  if (!src.startsWith('/static/') && !src.startsWith('static/')) return Promise.resolve(src)
  const root = (uni as unknown as { env?: { USER_DATA_PATH?: string } }).env?.USER_DATA_PATH
  if (!root) return Promise.reject(new Error('当前环境不能使用示例图'))
  const dest = `${root}/sample-${Date.now()}.jpg`
  const fs = uni.getFileSystemManager()
  return new Promise((resolve, reject) => {
    fs.readFile({
      filePath: src,
      success: res => {
        fs.writeFile({
          filePath: dest,
          data: res.data,
          success: () => resolve(dest),
          fail: () => reject(new Error('示例图读取失败'))
        })
      },
      fail: () => reject(new Error('示例图读取失败'))
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
