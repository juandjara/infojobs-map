import Sidebar from "@/components/Sidebar"
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
    page: Number(params.get('page')) || 1,
    maxResults: 50,
    teleworking: params.getAll('teleworking'),
    contractType: params.getAll('contract-type'),
    employerId: params.get('employerId') || undefined,
  })

  return {
    offers,
    cityLayerData: getCityLayerData(offers.facets),
    provinceLayerData: getProvinceLayerData(offers.facets)
  }
}

export default function Index() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="relative w-full">
        <MapTopLeft />
        <ClientOnly fallback={<MapFallback />}>{() => <Map />}</ClientOnly>
      </div>
      <Outlet />
    </div>
  )
}
