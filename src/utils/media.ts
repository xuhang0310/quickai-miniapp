/** 保存生成图到相册。H5 没有相册权限，改为打开预览让用户长按保存。 */
export function saveRemoteImage(url: string): Promise<void> {
  if (process.env.UNI_PLATFORM === 'h5') {
    uni.previewImage({ urls: [url] })
    uni.showToast({ title: '请长按图片保存', icon: 'none' })
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
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
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
      },
      fail: err => reject(new Error(err.errMsg || '图片下载失败'))
    })
  })
}
