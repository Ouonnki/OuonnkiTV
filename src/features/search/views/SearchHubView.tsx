import { useSearchParams, useNavigate } from 'react-router'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { type VideoItem, type SearchResultEvent } from '@ouonnki/cms-core'
import { useApiStore } from '@/shared/store/apiStore'
import { useSearchStore } from '@/shared/store/searchStore'
import { useCmsClient } from '@/shared/hooks'
import { Card, CardFooter, CardHeader } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Pagination } from '@/shared/components/ui/pagination'
import { NoResultIcon } from '@/shared/components/icons'
import { PaginationConfig } from '@/shared/config/video.config'
import { useDocumentTitle } from '@/shared/hooks'
import { toast } from 'sonner'

/**
 * SearchHubView - 搜索中心视图
 * 使用 cms-core 进行搜索
 * ?q=keyword - 搜索关键词
 * ?mode=tmdb|direct - 搜索模式 (未来支持)
 */
export default function SearchHubView() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''

  const abortCtrlRef = useRef<AbortController | null>(null)
  const { videoAPIs } = useApiStore()
  const { getCachedResults, updateCachedResults } = useSearchStore()
  const cmsClient = useCmsClient()

  const [searchRes, setSearchRes] = useState<VideoItem[]>([])
  const [curPage, setCurPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const timeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [invertPagination, setInvertPagination] = useState(false)

  // 筛选启用的视频源
  const selectedAPIs = useMemo(() => {
    return videoAPIs.filter(api => api.isEnabled)
  }, [videoAPIs])

  // 分页结果
  const paginationRes = useMemo(() => {
    const res = []
    for (let i = 0; i < searchRes.length; i += PaginationConfig.singlePageSize) {
      res.push(searchRes.slice(i, Math.min(i + PaginationConfig.singlePageSize, searchRes.length)))
    }
    return res || []
  }, [searchRes])

  // 动态更新页面标题
  useDocumentTitle(query ? `${query}` : '搜索结果')

  // 调用搜索内容
  const fetchSearchRes = useCallback(
    async (keyword: string | undefined) => {
      if (!keyword) return

      const searchAPIs = async (
        apisToSearch: typeof selectedAPIs,
        existingResults: VideoItem[],
        existingApiIds: string[],
      ) => {
        abortCtrlRef.current?.abort()
        const controller = new AbortController()
        abortCtrlRef.current = controller

        if (timeOutTimer.current) {
          clearTimeout(timeOutTimer.current)
          timeOutTimer.current = null
        }
        timeOutTimer.current = setTimeout(() => {
          setLoading(false)
          timeOutTimer.current = null
        }, PaginationConfig.maxRequestTimeout)

        const completedApiIds = [...existingApiIds]
        let hasNewResults = false

        // 订阅增量结果事件
        const unsubResult = cmsClient.on('search:result', (event: SearchResultEvent) => {
          hasNewResults = true
          setSearchRes(prevResults => {
            const mergedRes = [...prevResults, ...event.items]
            if (mergedRes.length >= PaginationConfig.singlePageSize) setLoading(false)
            return mergedRes
          })

          const newApiIds = Array.from(
            new Set(
              event.items
                .map((r: VideoItem) => r.source_code)
                .filter((id: string | undefined): id is string => !!id),
            ),
          )
          newApiIds.forEach(id => {
            if (!completedApiIds.includes(id)) {
              completedApiIds.push(id)
            }
          })

          updateCachedResults(keyword, event.items, completedApiIds, false)
        })

        const searchPromise = cmsClient
          .aggregatedSearch(keyword, apisToSearch, controller.signal)
          .then((allResults: VideoItem[]) => {
            const allApiIds = apisToSearch.map(api => api.id)
            const finalApiIds = Array.from(new Set([...existingApiIds, ...allApiIds]))

            const selectedApiIds = selectedAPIs.map(api => api.id)
            const isComplete = selectedApiIds.every(id => finalApiIds.includes(id))

            updateCachedResults(keyword, hasNewResults ? [] : allResults, finalApiIds, isComplete)

            const totalCount = existingResults.length + allResults.length
            toast.success(`搜索完成！${isComplete ? '总计' : '当前'} ${totalCount} 条结果`)
          })
          .catch(error => {
            if ((error as Error).name === 'AbortError') {
              console.error('搜索已取消:', error)
            } else {
              console.error('搜索时发生错误:', error)
            }
          })
          .finally(() => {
            unsubResult()
            setLoading(false)
          })

        toast.promise(searchPromise, {
          loading: '持续搜索内容中......',
        })
      }

      const cached = getCachedResults(keyword)
      const selectedApiIds = selectedAPIs.map(api => api.id)

      if (cached) {
        setSearchRes(cached.results)

        if (cached.isComplete) {
          setLoading(false)
          return
        }

        const remainingAPIs = selectedAPIs.filter(api => !cached.completedApiIds.includes(api.id))

        if (remainingAPIs.length === 0) {
          setLoading(false)
          updateCachedResults(keyword, [], selectedApiIds, true)
          return
        }

        setLoading(true)
        await searchAPIs(remainingAPIs, cached.results, cached.completedApiIds)
        return
      }

      setSearchRes([])
      await searchAPIs(selectedAPIs, [], [])
    },
    [selectedAPIs, getCachedResults, updateCachedResults, cmsClient],
  )

  // 监听搜索词变化
  useEffect(() => {
    if (!query) return
    setLoading(true)
    setCurPage(1)
    fetchSearchRes(query)
    return () => {
      abortCtrlRef.current?.abort()
    }
  }, [query, fetchSearchRes])

  // 监听滚动位置变化
  useEffect(() => {
    let timer: number | null = null
    const run = () => {
      const total = document.documentElement.scrollHeight
      const view = window.innerHeight
      if (total <= view + 8) {
        setInvertPagination(true)
        return
      }
      const remaining = total - ((window.scrollY || window.pageYOffset) + view)
      setInvertPagination(remaining < 50)
    }
    const debounced = () => {
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(run, 80)
    }
    window.addEventListener('scroll', debounced, { passive: true })
    window.addEventListener('resize', debounced)
    run()
    return () => {
      if (timer) window.clearTimeout(timer)
      window.removeEventListener('scroll', debounced)
      window.removeEventListener('resize', debounced)
    }
  }, [paginationRes.length, curPage])

  const onPageChange = (page: number) => {
    setCurPage(page)
    window.scrollTo({ top: 0 })
  }

  // 点击结果跳转播放
  const handleItemClick = (item: VideoItem) => {
    navigate(`/play/raw?id=${item.vod_id}&source=${item.source_code}`)
  }

  if (!query) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-lg text-gray-500">请输入搜索关键词</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* 搜索结果网格 */}
      {!loading && paginationRes[curPage - 1]?.length > 0 && (
        <div className="flex flex-col items-center gap-10">
          <div className="grid grid-cols-2 gap-[4vw] sm:grid-cols-3 md:gap-[2vw] xl:grid-cols-4">
            {paginationRes[curPage - 1]?.map((item: VideoItem, index: number) => (
              <Card
                key={`${item.source_code}_${item.vod_id}_${index}`}
                className="group relative flex h-[27vh] w-full cursor-pointer items-center overflow-hidden border-none p-0 transition-transform hover:scale-103 lg:h-[35vh]"
                onClick={() => handleItemClick(item)}
              >
                <CardHeader className="absolute top-1 z-10 flex-col items-start gap-0 p-3">
                  <div className="rounded-lg bg-black/20 px-2 py-1 backdrop-blur">
                    <p className="text-xs font-bold text-white/80 uppercase">{item.source_name}</p>
                  </div>
                  {item.vod_remarks && (
                    <Badge variant="warning" className="mt-2 bg-amber-500/80 backdrop-blur">
                      {item.vod_remarks}
                    </Badge>
                  )}
                </CardHeader>
                <img
                  loading="lazy"
                  alt={item.vod_name}
                  className="z-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  src={
                    item.vod_pic ||
                    'https://placehold.jp/30/ffffff/000000/300x450.png?text=暂无封面'
                  }
                />
                <CardFooter className="absolute bottom-[3%] z-10 min-h-[8vh] w-[92%] justify-between overflow-hidden rounded-lg border border-white/20 py-2 shadow-sm backdrop-blur before:rounded-xl before:bg-white/10">
                  <div className="flex flex-grow flex-col gap-1 px-1">
                    <p className="text-xs text-white/80">
                      {item.type_name} · {item.vod_year}
                    </p>
                    <p className="line-clamp-2 text-sm font-semibold text-white">{item.vod_name}</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="sticky bottom-[2vh] z-50 flex justify-center transition-all">
            <div
              className={`rounded-full px-2 py-1 backdrop-blur-xl backdrop-saturate-150 ${
                invertPagination ? 'bg-white/5' : 'bg-white/10 shadow-lg ring-1 ring-white/20'
              }`}
            >
              <Pagination
                onChange={onPageChange}
                showControls
                size={window.innerWidth < 640 ? 'sm' : 'default'}
                page={curPage}
                total={paginationRes.length}
              />
            </div>
          </div>
        </div>
      )}

      {/* 加载中 */}
      {loading && (
        <div className="grid grid-cols-2 gap-[4vw] sm:grid-cols-3 md:gap-[2vw] xl:grid-cols-4">
          {new Array(PaginationConfig.singlePageSize).fill(null).map((_, index: number) => (
            <Card
              key={index}
              className="flex h-[27vh] w-full items-center overflow-hidden border-none p-0 transition-transform hover:scale-103 lg:h-[35vh]"
            >
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
                <Skeleton className="h-[59%] w-[90%] rounded-lg md:h-[66%]" />
                <CardFooter className="absolute bottom-[4%] z-10 min-h-[8vh] w-[90%] justify-between overflow-hidden rounded-lg border border-white/20 py-2 shadow-sm backdrop-blur before:rounded-xl before:bg-white/10">
                  <div className="flex flex-grow flex-col gap-3 px-1">
                    <Skeleton className="h-4 w-full rounded-lg md:h-5 md:w-[40%]" />
                    <Skeleton className="h-4 w-full rounded-lg md:h-5 md:w-[60%]" />
                  </div>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 无结果提示 */}
      {!loading && searchRes?.length === 0 && (
        <div className="flex flex-col items-center py-20">
          <NoResultIcon size={200}></NoResultIcon>
          <p className="text-gray-500">没有找到相关内容，试试别的关键词吧~</p>
        </div>
      )}
    </div>
  )
}
