import type { OfferPageData } from './infojobs.api.server'
import provincesMapData from '@/lib/data/provinces.map.json'
import citiesMapData from '@/lib/data/cities.map.json'

type ProvinceMap = Record<string, typeof provincesMapData.albacete>
type CityMap = Record<string, typeof citiesMapData.albacete>

export function getProvinceLayerData(facets: OfferPageData['facets']) {
  const availableProvinces = facets.find(f => f.key === 'province')?.values || []
  return availableProvinces.map(p => ({
    ...(provincesMapData as ProvinceMap)[p.key],
    count: p.count
  }))
}

export function getCityLayerData(facets: OfferPageData['facets']) {
  const availableCities = facets.find(f => f.key === 'city')?.values || []
  const layerData = availableCities
    .filter(c => (citiesMapData as CityMap)[c.key])
    .map(c => {
      const city = (citiesMapData as CityMap)[c.key]
      return {
        ...city,
        id: city.geoname_id,
        count: c.count,
        coordinates: city.coordinates.reverse(),
      }
    })

  layerData.sort((a, b) => a!.count - b!.count)
  return layerData
}