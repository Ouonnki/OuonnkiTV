import { useEffect } from 'react'

/**
 * 自定义 Hook：动态更新页面标题
 * @param title - 页面标题（不包含站点名称）
 * @param siteName - 站点名称，默认为 'Ouonnki TV'
 */
export function useDocumentTitle(title: string, siteName: string = 'Ouonnki TV') {
  useEffect(() => {
    const previousTitle = document.title

    if (title) {
      document.title = `${title} - ${siteName}`
    } else {
      document.title = siteName
    }

    // 组件卸载时恢复之前的标题
    return () => {
      document.title = previousTitle
    }
  }, [title, siteName])
}
