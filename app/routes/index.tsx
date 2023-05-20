import MapFallback from "@/components/MapFallback"
import MapTopLeft from "@/components/MapTopLeft"
import { getOffers } from "@/lib/infojobs.api.server"
import type { LoaderFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import React from "react"
import { ClientOnly } from "remix-utils"

const Map = React.lazy(() => import('@/components/Map'))

export const loader: LoaderFunction = async ({ request }) => {
  const params = new URL(request.url).searchParams
  const data = await getOffers({
    q: params.get('q') || undefined,
    country: params.getAll('country'),
    province: params.getAll('province'),
    city: params.getAll('city'),
    category: params.getAll('category'),
    subcategory: params.getAll('subcategory'),
    facets: true,
    maxResults: 50
  })

  return data
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
