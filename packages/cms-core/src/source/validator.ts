import type { VideoSource } from '../types'

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 验证单个视频源
 * @param source 部分视频源数据
 */
export function validateSource(source: Partial<VideoSource>): ValidationResult {
  const errors: string[] = []

  if (!source.name || typeof source.name !== 'string' || source.name.trim() === '') {
    errors.push('源名称不能为空')
  }

  if (!source.url || typeof source.url !== 'string' || source.url.trim() === '') {
    errors.push('源URL不能为空')
  } else {
    try {
      new URL(source.url)
    } catch {
      errors.push('源URL格式无效')
    }
  }

  if (source.detailUrl && typeof source.detailUrl === 'string' && source.detailUrl.trim() !== '') {
    try {
      new URL(source.detailUrl)
    } catch {
      errors.push('详情URL格式无效')
    }
  }

  if (source.timeout !== undefined && (typeof source.timeout !== 'number' || source.timeout < 0)) {
    errors.push('超时时间必须为非负数')
  }

  if (source.retry !== undefined && (typeof source.retry !== 'number' || source.retry < 0)) {
    errors.push('重试次数必须为非负数')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 验证多个视频源
 * @param sources 视频源数组
 */
export function validateSources(sources: Partial<VideoSource>[]): ValidationResult[] {
  return sources.map(validateSource)
}

/**
 * 检查是否所有源都有效
 * @param results 验证结果数组
 */
export function allValid(results: ValidationResult[]): boolean {
  return results.every((r) => r.valid)
}
