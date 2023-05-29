import MapFallback from "@/components/map/MapFallback"
import MapTopLeft from "@/components/map/MapTopLeft"
import type { OfferPageData} from "@/lib/infojobs.api.server"
import { getOffers } from "@/lib/infojobs.api.server"
import { getCityLayerData, getProvinceLayerData } from "@/lib/map.server"
import type { LoaderFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import React from "react"
import { ClientOnly } from "remix-utils"

const Map = React.lazy(() => import('@/components/map/Map'))

export type RootData = {
  offers: OfferPageData,
  cityLayerData: ReturnType<typeof getCityLayerData>,
  provinceLayerData: ReturnType<typeof getProvinceLayerData>
}

export const loader: LoaderFunction = async ({ request }) => {
  const params = new URL(request.url).searchParams
  const offers = await getOffers({
    q: params.get('q') || undefined,
    country: params.getAll('country'),
    province: params.getAll('province'),
    city: params.getAll('city'),
    category: params.getAll('category'),
    subcategory: params.getAll('subcategory'),
    facets: true,
    maxResults: 50
  })

  return {
    offers,
    cityLayerData: getCityLayerData(offers.facets),
    provinceLayerData: getProvinceLayerData(offers.facets)
  }
}

export default function Index() {
  return (
    <div>
      <MapTopLeft />
      <ClientOnly fallback={<MapFallback />}>{() => <Map />}</ClientOnly>
      <Outlet />
    </div>
  )
}
