import type { RootData } from '@/routes'
import type { DictionaryID } from '@/lib/DictionaryID'
import type { PickingInfo } from '@deck.gl/core/typed'
import type { MapboxOverlayProps } from '@deck.gl/mapbox/typed'
import type { MapProps } from "react-map-gl"
import maplibregl from "maplibre-gl"
import { MapboxOverlay } from '@deck.gl/mapbox/typed'
import { Map, useControl } from "react-map-gl"
import { GeoJsonLayer } from '@deck.gl/layers/typed'
import { useRouteLoaderData, useSearchParams } from '@remix-run/react'
import { MAP_WIDTH } from '@/lib/styles'
import IconClusterLayer from './IconClusterLayer'

const INITIAL_VIEW_STATE = {
  longitude: -3.762796,
  latitude: 39.802749,
  zoom: 6,
  pitch: 0,
  bearing: 0
} as MapProps['viewState']

function DeckGLOverlay(props: MapboxOverlayProps & { interleaved?: boolean }) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props))
  overlay.setProps(props)
  return null
}

function convertToGeoJson(data: RootData['provinceLayerData']) {
  return {
    type: 'FeatureCollection',
    features: data.map(({ coordinates, ...d }) => ({
      type: 'Feature',
      properties: d,
      geometry: {
        type: 'MultiPolygon',
        coordinates
      }
    }))
  }
}

export default function MapContainer() {
  const [params, setParams] = useSearchParams()
  const { cityLayerData, provinceLayerData } = useRouteLoaderData('routes/index') as RootData

  const provinces = params.getAll('province')
  const cities = params.getAll('city')

  const provincesLayer = new GeoJsonLayer({
    id: 'provinces',
    pickable: true,
    data: convertToGeoJson(provinceLayerData),
    getFillColor: d => {
      if (provinces.includes(d.properties?.key)) {
        return [0, 0, 255, 98]
      }
      return [0, 0, 255, 18]
    },
    getLineColor: [0, 0, 255, 98],
    lineWidthMinPixels: 2,
    onClick: ({ object }) => {
      if (object && !object.properties.cluster) {
        handleClick(object.properties.key, 'province')
      }
    }
  })

  const citiesLayer = new IconClusterLayer({
    id: 'cities',
    data: cityLayerData,
    sizeScale: 80,
    textSizeScale: 16,
    selected: cities,
    onClick: ({ object }) => {
      if (object && !object.properties.cluster) {
        handleClick(object.properties.key, 'city')
      }
    }
  })

  const layers = [
    provincesLayer,
    citiesLayer
  ]

  function handleClick(key: string, type: DictionaryID) {
    setParams(prev => {
      if (prev.has(type)) {
        const prevValue = prev.getAll(type)
        if (prevValue.includes(key)) {
          prev.delete(type)
          const filtered = prevValue.filter(v => v !== key)
          filtered.forEach(v => prev.append(type, v))
        } else {
          prev.append(type, key)
        }
      } else {
        prev.append(type, key)
      }
      return prev
    })
  }

  function getTooltip({ object, layer }: PickingInfo) {
    if (!object) return null
    
    let text = ''
    if (layer?.id === 'provinces') {
      text = object && `${object.properties.name} - ${object.properties.count} ofertas`
    }
    if (layer?.id === 'cities') {
      if (object.properties.cluster) {
        text = object && `${object.properties.point_count_abbreviated} ciudades - ${object.properties.count} ofertas`
      } else {
        text = `${object.properties.name} - ${object.properties.count} ofertas`
      }
    }
    return {
      style: { borderRadius: '8px', fontSize: '16px', padding: '12px', background: 'rgba(0, 0, 0, 0.8)', color: 'white' },
      text
    }
  }

  return (
    <div
      style={{ maxWidth: MAP_WIDTH }}
      className='overflow-hidden w-full h-screen absolute inset-0 bg-gray-200'
    >
      <Map
        mapLib={maplibregl}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        initialViewState={INITIAL_VIEW_STATE}
      >
        <DeckGLOverlay
          interleaved={false}
          layers={layers}
          getTooltip={getTooltip}
        />
      </Map>
    </div>
  ) 
}