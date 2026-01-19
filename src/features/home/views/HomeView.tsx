import { useTmdbNowPlaying } from '@/shared/hooks/useTmdb'
import { FeaturedCarousel } from '../components/FeaturedCarousel'
import { ContinueWatching } from '../components/ContinueWatching'

/**
 * HomeView - 首页视图
 */
export default function HomeView() {
  const { trending, loading } = useTmdbNowPlaying()

  return (
    <div>
      <FeaturedCarousel items={trending} loading={loading.trending} />
      <div className="h-6"></div>
      <ContinueWatching />
    </div>
  )
}
