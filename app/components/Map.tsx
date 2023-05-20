import type { MapboxOverlayProps } from '@deck.gl/mapbox/typed'
import { MapboxOverlay } from '@deck.gl/mapbox/typed'
import type { MapProps} from "react-map-gl"
import { Map, useControl } from "react-map-gl"
import maplibregl from "maplibre-gl"
import { GeoJsonLayer } from '@deck.gl/layers/typed'

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

export default function MapContainer() {
  return (
    <div className='overflow-hidden w-screen h-screen absolute inset-0'>
      <Map
        mapLib={maplibregl}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        initialViewState={INITIAL_VIEW_STATE}
      >
        <DeckGLOverlay
          interleaved={false}
          getTooltip={
            ({ object }) => {
              const text = object && `${object.fields.name} (${object.fields.population})`
              return text
            }
          }
          layers={[new GeoJsonLayer({
            id: 'geojson-layer',
            pickable: true,
            data: 'https://gist.githubusercontent.com/jhernandez-stratio/82f36aa75dec8d040810780dccb9816b/raw/f9afc8b09f9c4de34d7055ff0f56c652868f95e5/spain-cities-2.geojson',
            getPointRadius: d => Math.sqrt((d as any).fields.population) / 100,
            pointRadiusUnits: 'pixels'
          })]}
        />
      </Map>
    </div>
  ) 
}