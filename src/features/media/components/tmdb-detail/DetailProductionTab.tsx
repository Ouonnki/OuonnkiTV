import { Badge } from '@/shared/components/ui/badge'
import type { TmdbMediaType } from '@/shared/types/tmdb'
import { DetailInfoGrid } from './DetailInfoGrid'
import type {
  DetailCompany,
  DetailCountry,
  DetailInfoField,
  DetailNetwork,
} from './types'

interface DetailProductionTabProps {
  tmdbType: TmdbMediaType
  movieInfoFields: DetailInfoField[]
  tvInfoFields: DetailInfoField[]
  productionCompanies: DetailCompany[]
  productionCountries: DetailCountry[]
  networks: DetailNetwork[]
}

export function DetailProductionTab({
  tmdbType,
  movieInfoFields,
  tvInfoFields,
  productionCompanies,
  productionCountries,
  networks,
}: DetailProductionTabProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">制作与发行信息</h2>

      {(movieInfoFields.length > 0 || tvInfoFields.length > 0) && (
        <div className="space-y-2">
          <h3 className="text-base font-medium">{tmdbType === 'movie' ? '电影发行信息' : '剧集发行信息'}</h3>
          <DetailInfoGrid
            fields={tmdbType === 'movie' ? movieInfoFields : tvInfoFields}
            className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3"
          />
        </div>
      )}

      {productionCompanies.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-medium">制作公司</h3>
          <ul className="divide-border/35 border-border/35 divide-y border-y">
            {productionCompanies.map(company => (
              <li key={company.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span className="font-medium">{company.name}</span>
                <span className="text-muted-foreground text-xs">{company.origin_country || '未知地区'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {productionCountries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-medium">制作国家/地区</h3>
          <div className="flex flex-wrap gap-2">
            {productionCountries.map(country => (
              <Badge key={country.iso_3166_1} variant="outline" className="rounded-full">
                {country.name} ({country.iso_3166_1})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {networks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-medium">发行平台</h3>
          <ul className="divide-border/35 border-border/35 divide-y border-y">
            {networks.map(network => (
              <li key={network.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span className="font-medium">{network.name}</span>
                <span className="text-muted-foreground text-xs">{network.origin_country || '未知地区'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {movieInfoFields.length === 0 &&
        tvInfoFields.length === 0 &&
        productionCompanies.length === 0 &&
        productionCountries.length === 0 &&
        networks.length === 0 && <p className="text-muted-foreground text-sm">当前条目没有制作与发行数据</p>}
    </section>
  )
}
