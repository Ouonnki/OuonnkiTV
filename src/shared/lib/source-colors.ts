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
 *
 * 设计原则：
 * - 每个配色方案都有独特的视觉特征
 * - 混合使用亮色和暗色背景
 * - 文字颜色与背景形成强烈对比
 * - 覆盖色轮的各个区域
 */
const COLOR_SCHEMES: SourceColorScheme[] = [
  // === 暖色系 ===
  { bg: '251, 191, 36', text: '120, 53, 15' },       // 琥珀金 - 深棕文字
  { bg: '239, 68, 68', text: '255, 255, 255' },      // 烈焰红 - 白色文字
  { bg: '249, 115, 22', text: '255, 255, 255' },     // 活力橙 - 白色文字
  { bg: '236, 72, 153', text: '255, 255, 255' },     // 洋红 - 白色文字

  // === 冷色系 ===
  { bg: '59, 130, 246', text: '255, 255, 255' },     // 海洋蓝 - 白色文字
  { bg: '6, 182, 212', text: '15, 23, 42' },         // 明亮青 - 深色文字
  { bg: '34, 197, 94', text: '255, 255, 255' },      // 森林绿 - 白色文字
  { bg: '16, 185, 129', text: '255, 255, 255' },     // 翡翠绿 - 白色文字

  // === 紫色系 ===
  { bg: '139, 92, 246', text: '255, 255, 255' },     // 紫罗兰 - 白色文字
  { bg: '168, 85, 247', text: '255, 255, 255' },     // 电紫 - 白色文字

  // === 深色系（暗背景） ===
  { bg: '30, 41, 59', text: '148, 163, 184' },       // 石板灰 - 银灰文字
  { bg: '15, 23, 42', text: '96, 165, 250' },        // 深夜蓝 - 天蓝文字
  { bg: '20, 83, 45', text: '74, 222, 128' },        // 暗森绿 - 亮绿文字
  { bg: '76, 29, 149', text: '192, 132, 252' },      // 暗紫 - 淡紫文字

  // === 特殊色系 ===
  { bg: '234, 179, 8', text: '0, 0, 0' },            // 金丝雀黄 - 纯黑文字
  { bg: '163, 230, 53', text: '0, 0, 0' },           // 酸橙绿 - 纯黑文字
  { bg: '251, 207, 232', text: '131, 24, 67' },      // 樱花粉 - 深玫红文字
  { bg: '186, 230, 253', text: '12, 74, 110' },      // 天空蓝 - 深蓝文字
  { bg: '187, 247, 208', text: '22, 101, 52' },      // 薄荷绿 - 深绿文字
  { bg: '254, 215, 170', text: '124, 45, 18' },      // 杏色 - 深棕文字
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
