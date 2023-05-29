import type { RootData } from "@/routes"
import { CompositeLayer } from "@deck.gl/core/typed"
import { ScatterplotLayer, TextLayer } from "@deck.gl/layers/typed"
import Supercluster from 'supercluster'

type IconClusterProps = {
  id: string
  sizeScale?: number
  textSizeScale?: number
  data: RootData['cityLayerData']
  selected: string[]
}

type UpdateStateProps = Parameters<CompositeLayer<IconClusterProps>['updateState']>[0]
type GetPickingInfoProps = Parameters<CompositeLayer<IconClusterProps>['getPickingInfo']>[0]

// from official deck.gl example at https://github.com/visgl/deck.gl/blob/master/examples/website/icon/icon-cluster-layer.js
class IconClusterLayer extends CompositeLayer<IconClusterProps> {
  shouldUpdateState({ changeFlags }: Parameters<CompositeLayer['shouldUpdateState']>[0]) {
    return changeFlags.somethingChanged
  }

  updateState({ props, oldProps, changeFlags }: UpdateStateProps) {
    const rebuildIndex = changeFlags.dataChanged || props.sizeScale !== oldProps.sizeScale

    if (rebuildIndex) {
      const index = new Supercluster({
        maxZoom: 16,
        radius: props.sizeScale,
        map: props => ({
          count: props.count
        }),
        reduce: (acum, props) => {
          acum.count += props.count
        }
      })
      index.load(
        props.data.map((d) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: d.coordinates },
          properties: d
        }))
      )
      this.setState({ index })
    }

    const z = Math.floor(this.context.viewport.zoom)
    if (rebuildIndex || z !== this.state.z) {
      this.setState({
        data: this.state.index.getClusters([-180, -85, 180, 85], z),
        z
      })
    }
  }

  getPickingInfo ({ info, mode }: GetPickingInfoProps) {
    const pickedObject = info.object && info.object.properties ? info.object.properties : info.object
    if (pickedObject) {
      if (pickedObject.cluster && mode !== 'hover') {
        (info as any).objects = this.state.index
          .getLeaves(pickedObject.cluster_id, 50)
      }
    }
    return info
  }

  renderLayers() {
    const { data } = this.state

    return [
      new ScatterplotLayer(
        { data, radiusUnits: 'pixels', lineWidthUnits: 'pixels' },
        this.getSubLayerProps({
          id: 'cluster-icon',
          pickable: true,
          stroked: true,
          filled: true,
          lineWidthMinPixels: 2,
          radiusMinPixels: 20,
          radiusScale: 1,
          getPosition: (d: any) => d.geometry.coordinates,
          getRadius: (d: any) => Math.sqrt(d.properties.count),
          updateTriggers: {
            getLineWidth: [this.props.selected],
            getFillColor: [this.props.selected],
            getLineColor: [this.props.selected]
          },
          getLineColor: (d: any) => {
            const isSelected = this.props.selected.includes(d.properties.key)
            return isSelected ? [255, 255, 180] : [255, 255, 255]
          },
          getLineWidth: (d: any) => {
            const isSelected = this.props.selected.includes(d.properties.key)
            return isSelected ? 4 : 2
          },
          getFillColor: (d: any) => {
            const isSelected = this.props.selected.includes(d.properties.key)
            return isSelected ? [200, 0, 0] : [255, 140, 0]
          },
          onClick: this.props.onClick
        })
      ),
      new TextLayer(
        { fontWeight: 'bold' },
        this.getSubLayerProps({
          id: 'cluster-label',
          data,
          pickable: false,
          getPosition: (d: any) => d.geometry.coordinates,
          getText: (d: any) => String(d.properties.count || '0'),
          sizeScale: this.props.textSizeScale || this.props.sizeScale,
          getColor: [255, 255, 255],
          getSize: (d: any) => {
            const numLength = String(d.properties.count).length
            const baseSize = numLength >= 4 ? 0.75 : 1
            return baseSize + Math.sqrt((d.properties.count)) / 1000
          },
          getPixelOffset: [0, 2],
        })
      )
    ]
  }
}
IconClusterLayer.layerName = 'IconClusterLayer'

export default IconClusterLayer
