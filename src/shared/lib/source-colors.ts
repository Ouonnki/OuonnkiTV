/**
 * 源配色方案系统
 * 为不同的视频源生成一致的视觉标识
 */

/**
 * 配色方案接口
 */
export interface SourceColorScheme {
  /** 背景色 RGB 值 */
  bg: string
  /** 文字颜色 RGB 值 */
  text: string
}

/**
 * 预定义配色方案（RGB 值）
 * 使用这些配色方案为不同源提供一致的视觉体验
 */
const COLOR_SCHEMES: SourceColorScheme[] = [
  { bg: '250, 204, 21', text: '120, 53, 15' },       // 黄色
  { bg: '96, 165, 250', text: '255, 255, 255' },     // 蓝色
  { bg: '74, 222, 128', text: '255, 255, 255' },     // 绿色
  { bg: '192, 132, 252', text: '255, 255, 255' },    // 紫色
  { bg: '244, 114, 182', text: '255, 255, 255' },    // 粉色
  { bg: '129, 140, 248', text: '255, 255, 255' },    // 靛蓝
  { bg: '45, 212, 191', text: '255, 255, 255' },     // 青色
  { bg: '251, 146, 60', text: '255, 255, 255' },     // 橙色
  { bg: '248, 113, 113', text: '255, 255, 255' },    // 红色
  { bg: '34, 211, 238', text: '15, 23, 42' },        // 青色
  { bg: '52, 211, 153', text: '255, 255, 255' },     // 翠绿
  { bg: '167, 139, 250', text: '255, 255, 255' },    // 紫罗兰
  { bg: '251, 113, 133', text: '255, 255, 255' },    // 玫瑰
  { bg: '251, 191, 36', text: '120, 53, 15' },       // 琥珀
  { bg: '163, 230, 53', text: '15, 23, 42' },        // 青柠
  { bg: '14, 165, 233', text: '15, 23, 42' },        // 天蓝
]

/**
 * 根据源ID或名称获取配色方案
 * 使用哈希算法确保相同的源始终获得相同的配色
 *
 * @param sourceIdOrName 源ID或名称
 * @returns 配色方案
 */
export function getSourceColorScheme(sourceIdOrName: string): SourceColorScheme {
  if (!sourceIdOrName) {
    return COLOR_SCHEMES[0] // 默认黄色
  }

  // 简单的字符串哈希函数
  let hash = 0
  for (let i = 0; i < sourceIdOrName.length; i++) {
    const char = sourceIdOrName.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 转换为32位整数
  }

  // 使用哈希值选择配色方案（确保为正数）
  const index = Math.abs(hash) % COLOR_SCHEMES.length
  return COLOR_SCHEMES[index]
}
