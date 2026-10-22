import { CanvasTexture, MeshBasicMaterial, SRGBColorSpace } from 'three'
import countries from '../../data/countries.json'

export function createCartographicMaterial() {
  const canvas = document.createElement('canvas')
  canvas.width = 4096
  canvas.height = 2048
  const context = canvas.getContext('2d')
  context.fillStyle = '#10283c'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#35566a'
  context.strokeStyle = '#7594a3'
  context.lineWidth = 1.2
  context.lineJoin = 'round'

  for (const geometry of countries) {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
    for (const polygon of polygons) {
      context.beginPath()
      for (const ring of polygon) {
        ring.forEach(([longitude, latitude], index) => {
          const x = (longitude + 180) / 360 * canvas.width
          const y = (90 - latitude) / 180 * canvas.height
          if (index === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        })
        context.closePath()
      }
      context.fill('evenodd')
      context.stroke()
    }
  }

  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  map.anisotropy = 4
  // An unlit map keeps geography legible on the entire visible hemisphere.
  return new MeshBasicMaterial({ map })
}
