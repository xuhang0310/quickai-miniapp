function saveToAlbum(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        uni.showToast({ title: '已保存到相册', icon: 'success' })
        resolve()
      },
      fail: err => {
        const message = err.errMsg || ''
        if (message.includes('auth deny') || message.includes('authorize')) {
          uni.showModal({
            title: '需要相册权限',
            content: '保存图片需要允许访问相册。',
            confirmText: '去设置',
            success: modal => {
              if (modal.confirm) uni.openSetting({})
            }
          })
        }
        reject(new Error(message || '保存失败'))
      }
    })
  })
}

function previewForSave(url: string) {
  uni.previewImage({ urls: [url] })
  uni.showToast({ title: '请长按图片保存', icon: 'none' })
}

/** 保存生成图到相册。H5 没有相册权限，改为打开预览让用户长按保存。 */
export function saveRemoteImage(url: string): Promise<void> {
  if (process.env.UNI_PLATFORM === 'h5') {
    previewForSave(url)
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success(res) {
        if (res.statusCode !== 200) {
          reject(new Error('图片下载失败'))
          return
        }
        saveToAlbum(res.tempFilePath).then(resolve, reject)
      },
      fail: err => reject(new Error(err.errMsg || '图片下载失败'))
    })
  })
}

/** 保存已经在本地的图片，例如手机上叠好的水印图。 */
export function saveLocalImage(filePath: string): Promise<void> {
  if (process.env.UNI_PLATFORM === 'h5') {
    previewForSave(filePath)
    return Promise.resolve()
  }
  return saveToAlbum(filePath)
}
