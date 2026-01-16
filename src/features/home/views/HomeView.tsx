import { useTmdbNowPlaying } from '@/shared/hooks/useTmdb'
import { FeaturedCarousel } from '../components/FeaturedCarousel'

/**
 * HomeView - 首页视图
 */
export default function HomeView() {
  const { trending, loading } = useTmdbNowPlaying()

  return (
    <div>
      <FeaturedCarousel items={trending} loading={loading.trending} />
    </div>
  )
}
