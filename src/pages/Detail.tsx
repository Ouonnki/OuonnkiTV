import { useParams, useNavigate } from 'react-router'
import { useState, useEffect, useMemo } from 'react'
import { apiService } from '@/services/api.service'
import { type DetailResponse } from '@/types'
import { useApiStore } from '@/store/apiStore'
import { useSettingStore } from '@/store/settingStore'
import { Chip, Button, Spinner, Tooltip, Divider, Select, SelectItem } from '@heroui/react'
import { useDocumentTitle } from '@/hooks'
import { ArrowUpIcon, ArrowDownIcon } from '@/components/icons'
import { motion } from 'framer-motion'

export default function Detail() {
  const { sourceCode, vodId } = useParams<{ sourceCode: string; vodId: string }>()
  const navigate = useNavigate()
  const { videoAPIs } = useApiStore()
  const { playback } = useSettingStore()

  const [detail, setDetail] = useState<DetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReversed, setIsReversed] = useState(playback.defaultEpisodeOrder === 'desc')
  const [currentPageRange, setCurrentPageRange] = useState<string>('')
  const [openTooltipIndex, setOpenTooltipIndex] = useState<number | null>(null)
  const [episodesPerPage, setEpisodesPerPage] = useState(100)

  // 计算响应式的每页集数 (基于屏幕尺寸和列数)
  useEffect(() => {
    const calculateEpisodesPerPage = () => {
      const width = window.innerWidth
      let cols = 2 // 手机默认2列
      let rows = 8 // 默认行数

      if (width >= 1024) {
        cols = 8 // 桌面端8列
        rows = 5 // 桌面端行数，确保一屏显示完整
      } else if (width >= 768) {
        cols = 6 // 平板横屏6列
        rows = 6 // 平板行数
      } else if (width >= 640) {
        cols = 3 // 平板竖屏3列
        rows = 8
      }

      setEpisodesPerPage(cols * rows)
    }

    calculateEpisodesPerPage()
    window.addEventListener('resize', calculateEpisodesPerPage)
    return () => window.removeEventListener('resize', calculateEpisodesPerPage)
  }, [])

  // 动态更新页面标题
  useDocumentTitle(detail?.videoInfo?.title || '视频详情')

  // 获取显示信息的辅助函数
  const getTitle = () => detail?.videoInfo?.title || ''
  const getCover = () =>
    detail?.videoInfo?.cover || 'https://via.placeholder.com/300x400?text=暂无封面'
  const getType = () => detail?.videoInfo?.type || ''
  const getYear = () => detail?.videoInfo?.year || ''
  const getDirector = () => detail?.videoInfo?.director || ''
  const getActor = () => detail?.videoInfo?.actor || ''
  const getArea = () => detail?.videoInfo?.area || ''
  const getContent = () => detail?.videoInfo?.desc || ''
  const getSourceName = () => detail?.videoInfo?.source_name || ''

  // 计算分页范围（根据正序倒序调整标签）
  const pageRanges = useMemo(() => {
    const totalEpisodes = detail?.videoInfo?.episodes_names?.length || 0
    if (totalEpisodes === 0) return []

    const ranges: { label: string; value: string; start: number; end: number }[] = []

    if (isReversed) {
      // 倒序：从最后一集开始
      for (let i = 0; i < totalEpisodes; i += episodesPerPage) {
        const start = i
        const end = Math.min(i + episodesPerPage - 1, totalEpisodes - 1)
        // 倒序时，标签应该显示从大到小
        const labelStart = totalEpisodes - start
        const labelEnd = totalEpisodes - end
        ranges.push({
          label: `${labelStart}-${labelEnd}`,
          value: `${start}-${end}`,
          start,
          end,
        })
      }
    } else {
      // 正序：从第一集开始
      for (let i = 0; i < totalEpisodes; i += episodesPerPage) {
        const start = i
        const end = Math.min(i + episodesPerPage - 1, totalEpisodes - 1)
        ranges.push({
          label: `${start + 1}-${end + 1}`,
          value: `${start}-${end}`,
          start,
          end,
        })
      }
    }

    return ranges
  }, [detail?.videoInfo?.episodes_names?.length, episodesPerPage, isReversed])

  // 当前页显示的剧集
  const currentPageEpisodes = useMemo(() => {
    if (!currentPageRange || !detail?.videoInfo?.episodes_names) return []

    const [start, end] = currentPageRange.split('-').map(Number)
    const totalEpisodes = detail.videoInfo.episodes_names.length
    const episodes = detail.videoInfo.episodes_names

    if (isReversed) {
      // 倒序：取出对应范围的集数并反转
      const selectedEpisodes = []
      for (let i = start; i <= end; i++) {
        const actualIndex = totalEpisodes - 1 - i
        if (actualIndex >= 0 && actualIndex < totalEpisodes) {
          selectedEpisodes.push({
            name: episodes[actualIndex],
            displayIndex: i,
            actualIndex: actualIndex,
          })
        }
      }
      return selectedEpisodes
    } else {
      // 正序：直接取出对应范围
      return episodes.slice(start, end + 1).map((name, idx) => ({
        name,
        displayIndex: start + idx,
        actualIndex: start + idx,
      }))
    }
  }, [currentPageRange, detail?.videoInfo?.episodes_names, isReversed])

  useEffect(() => {
    const fetchDetail = async () => {
      if (!sourceCode || !vodId) return

      setLoading(true)
      try {
        // 根据 sourceCode 找到对应的 API 配置
        const api = videoAPIs.find(api => api.id === sourceCode)
        if (!api) {
          throw new Error('未找到对应的API配置')
        }

        const response = await apiService.getVideoDetail(vodId, api)
        setDetail(response)
      } catch (error) {
        console.error('获取视频详情失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [sourceCode, vodId, videoAPIs])

  // 初始化当前页范围 & 当切换正序倒序时自动调整页码
  useEffect(() => {
    if (pageRanges.length === 0) return

    // 切换正序倒序时，跳转到第一页
    setCurrentPageRange(pageRanges[0].value)
  }, [pageRanges, isReversed])

  // 处理播放按钮点击
  const handlePlayEpisode = (displayIndex: number) => {
    // displayIndex 是在当前显示列表中的索引（已考虑倒序）
    // 需要转换成原始列表中的实际索引
    const actualIndex = isReversed
      ? (detail?.videoInfo?.episodes_names?.length || 0) - 1 - displayIndex
      : displayIndex
    // 跳转到播放页面,使用新的路由格式,不传递 state
    navigate(`/video/${sourceCode}/${vodId}/${actualIndex}`)
  }

  // 处理长按开始
  const handleLongPressStart = (index: number) => {
    const timer = setTimeout(() => {
      setOpenTooltipIndex(index)
    }, 500)
    return () => clearTimeout(timer)
  }

  // 处理长按结束
  const handleLongPressEnd = () => {
    if (openTooltipIndex !== null) {
      setTimeout(() => {
        setOpenTooltipIndex(null)
      }, 300)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" label="加载中..." />
      </div>
    )
  }

  if (!detail || detail.code !== 200) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">获取视频详情失败</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto overflow-x-hidden p-4 pb-15 md:pt-10">
      {/* 视频信息卡片 */}

      <motion.div
        className="flex gap-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 封面图 */}
        <motion.img
          src={getCover()}
          alt={getTitle()}
          className="hidden w-70 rounded-lg shadow-lg md:block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        {/* 详细信息 */}
        <motion.div
          className="flex flex-1 flex-col gap-3 rounded-lg bg-white/40 p-4 shadow-lg/5 backdrop-blur-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* 移动端详情 */}
          <div className="md:hidden">
            <div className="flex h-auto w-full flex-row justify-center gap-4">
              <motion.img
                src={getCover()}
                alt={getTitle()}
                className="h-full w-1 flex-1/2 rounded-lg object-cover shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              />
              <motion.div
                className="flex flex-1/2 flex-col gap-1 self-end"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {getTitle() && (
                  <h1 className="text-[1rem] font-bold sm:text-2xl">
                    <span className="line-clamp-2 text-gray-800">{getTitle()}</span>
                  </h1>
                )}
                <div className="text-[0.7rem] sm:text-[1rem]">
                  {getDirector() && (
                    <div className="text-gray-500">
                      <span className="font-semibold text-gray-700">导演：</span>
                      <span className="line-clamp-2">{getDirector()}</span>
                    </div>
                  )}

                  {getActor() && (
                    <div className="text-gray-500">
                      <span className="font-semibold text-gray-700">演员：</span>
                      <span className="line-clamp-2">{getActor()}</span>
                    </div>
                  )}
                </div>
                <motion.div
                  className="flex-row flex-wrap text-[0.4rem]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  {[
                    { color: 'primary' as const, value: getSourceName() },
                    { color: 'secondary' as const, value: getYear() },
                    { color: 'warning' as const, value: getType() },
                    { color: 'danger' as const, value: getArea() },
                  ].map((chip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.4 + index * 0.05 }}
                      style={{ display: 'inline-block' }}
                    >
                      <Chip size="sm" color={chip.color} variant="shadow" className="mr-1 mb-1">
                        {chip.value}
                      </Chip>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
            <div>
              {getContent() && (
                <motion.div
                  className="mt-3 line-clamp-5 text-[0.8rem] text-gray-600 sm:text-[1rem]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <div dangerouslySetInnerHTML={{ __html: getContent() }} />
                </motion.div>
              )}
            </div>
          </div>

          {/* 标题 */}
          {getTitle() && (
            <motion.h1
              className="hidden text-3xl font-bold md:block"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <span className="text-gray-800">{getTitle()}</span>
            </motion.h1>
          )}
          <motion.div
            className="hidden flex-wrap gap-x-1 gap-y-2 md:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            {[
              { color: 'primary' as const, value: getSourceName(), delay: 0 },
              { color: 'secondary' as const, value: getYear(), delay: 0.05 },
              { color: 'warning' as const, value: getType(), delay: 0.1 },
              { color: 'danger' as const, value: getArea(), delay: 0.15 },
            ].map((chip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + chip.delay }}
              >
                <Chip color={chip.color} variant="shadow" className="mr-2">
                  {chip.value}
                </Chip>
              </motion.div>
            ))}
          </motion.div>

          {/* 详细信息 */}
          <motion.div
            className="mt-1 hidden flex-col gap-2 pl-1 md:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {getDirector() && (
              <motion.div
                className="text-gray-600"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <span className="font-semibold text-gray-900">导演：</span>
                <span>{getDirector()}</span>
              </motion.div>
            )}

            {getActor() && (
              <motion.div
                className="text-gray-600"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.65 }}
              >
                <span className="font-semibold text-gray-900">演员：</span>
                <span>{getActor()}</span>
              </motion.div>
            )}

            {getContent() && (
              <motion.div
                className="mt-3 text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div dangerouslySetInnerHTML={{ __html: getContent() }} />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 播放列表 */}
      {detail?.videoInfo?.episodes_names && detail.videoInfo.episodes_names.length > 0 && (
        <motion.div
          className="mt-8 flex flex-col"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            className="flex flex-col gap-2 p-3 pr-0 pl-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-row items-end gap-2">
                <motion.h2
                  className="text-2xl font-semibold text-gray-900"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                >
                  选集
                </motion.h2>
              </div>
              <div className="flex items-end">
                {pageRanges.length > 1 && (
                  <Select
                    size="sm"
                    selectedKeys={[currentPageRange]}
                    onChange={e => setCurrentPageRange(e.target.value)}
                    className="w-35"
                    classNames={{
                      trigger: 'bg-white/30 backdrop-blur-md border border-gray-200',
                      value: 'text-gray-800 font-medium',
                      popoverContent: 'bg-white/40 backdrop-blur-2xl border border-gray-200/50',
                    }}
                    aria-label="选择集数范围"
                    placeholder="选择集数范围"
                  >
                    {pageRanges.map(range => (
                      <SelectItem key={range.value}>{range.label}</SelectItem>
                    ))}
                  </Select>
                )}
              </div>
            </div>
            <Divider></Divider>
          </motion.div>
          {/* 列表 */}
          <motion.div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8"
            key={currentPageRange}
          >
            {currentPageEpisodes.map(({ name, displayIndex }, index) => (
              <motion.div
                key={`${name}-${displayIndex}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.03,
                  ease: 'easeOut',
                }}
              >
                <Tooltip
                  content={name}
                  placement="top"
                  delay={1000}
                  isOpen={openTooltipIndex === displayIndex}
                  onOpenChange={open => {
                    if (!open) setOpenTooltipIndex(null)
                  }}
                >
                  <Button
                    size="md"
                    color="default"
                    variant="shadow"
                    className="w-full border border-gray-200 bg-white/30 text-gray-800 drop-shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/80 hover:text-white"
                    onPress={() => handlePlayEpisode(displayIndex)}
                    onPressStart={() => handleLongPressStart(displayIndex)}
                    onPressEnd={handleLongPressEnd}
                  >
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">{name}</span>
                  </Button>
                </Tooltip>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="mt-4 flex items-end justify-between pr-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="light"
                onPress={() => setIsReversed(!isReversed)}
                startContent={isReversed ? <ArrowUpIcon size={18} /> : <ArrowDownIcon size={18} />}
                className="min-w-unit-16 text-sm text-gray-600"
              >
                {isReversed ? '正序' : '倒序'}
              </Button>
            </motion.div>
            <span className="text-sm text-gray-600">
              共 {detail.videoInfo.episodes_names.length} 集
            </span>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
