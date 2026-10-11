import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import { PostOffice, NetworkDot } from '@/types'
import { MapPin, Compass, Search } from 'lucide-react'

// Fix default leaflet marker icon in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

interface PostalMapProps {
  postOffices?: PostOffice[]
  selectedOffice?: PostOffice | null
  networkDots?: NetworkDot[]
  height?: string
  interactive?: boolean
  onSelectOffice?: (po: PostOffice) => void
  onSelectNetworkDot?: (dot: NetworkDot) => void
}

export const PostalMap: React.FC<PostalMapProps> = ({
  postOffices = [],
  selectedOffice,
  networkDots = [],
  height = '420px',
  interactive = true,
  onSelectOffice,
  onSelectNetworkDot,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const networkLayerRef = useRef<L.LayerGroup | null>(null)
  const highlightLayerRef = useRef<L.LayerGroup | null>(null)

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      // Centered on India
      const map = L.map(mapContainerRef.current, {
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        attributionControl: false,
      }).setView([22.5, 79.5], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 18,
      }).addTo(map)

      const networkLayer = L.layerGroup().addTo(map)
      const highlightLayer = L.layerGroup().addTo(map)

      networkLayerRef.current = networkLayer
      highlightLayerRef.current = highlightLayer
      mapInstanceRef.current = map
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [interactive])

  // Render nationwide network dots (representing the full 154,797 database across India)
  useEffect(() => {
    const map = mapInstanceRef.current
    const networkLayer = networkLayerRef.current
    if (!map || !networkLayer) return

    networkLayer.clearLayers()

    // 1. If networkDots are provided, render all district postal nodes
    if (networkDots.length > 0) {
      networkDots.forEach((dot) => {
        if (dot.latitude && dot.longitude) {
          const marker = L.circleMarker([dot.latitude, dot.longitude], {
            radius: 3.8,
            fillColor: '#A01D26',
            color: '#FFFFFF',
            weight: 0.8,
            opacity: 0.9,
            fillOpacity: 0.75,
          })

          const popupContent = `
            <div style="font-family: 'Urbanist', sans-serif; font-size: 13px; line-height: 1.4; color: #FFFFFF; background: #1B1C1D; padding: 4px;">
              <div style="font-weight: 800; font-size: 14px; color: #FFFFFF; margin-bottom: 2px;">
                ${dot.district} District
              </div>
              <div style="color: #9CA3AF; font-size: 11px; margin-bottom: 4px;">
                ${dot.state}
              </div>
              <div style="display: inline-block; background: rgba(160, 29, 38, 0.3); color: #FF4D57; font-weight: 800; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-family: monospace; border: 1px solid rgba(160, 29, 38, 0.5);">
                ${dot.count.toLocaleString()} Post Offices
              </div>
            </div>
          `
          marker.bindPopup(popupContent)

          if (onSelectNetworkDot) {
            marker.on('click', () => onSelectNetworkDot(dot))
          }

          networkLayer.addLayer(marker)
        }
      })
    } else if (postOffices.length > 0) {
      // Fallback: render provided postOffices as dots
      postOffices.forEach((po) => {
        if (po.latitude != null && po.longitude != null) {
          const marker = L.circleMarker([po.latitude, po.longitude], {
            radius: 3.5,
            fillColor: '#A01D26',
            color: '#FFFFFF',
            weight: 0.8,
            opacity: 0.8,
            fillOpacity: 0.7,
          })

          marker.bindPopup(`
            <div style="font-family: 'Urbanist', sans-serif; font-size: 12px; color: #FFFFFF; background: #1B1C1D; padding: 3px;">
              <strong>${po.post_office_name}</strong> (PIN ${po.pin_code})<br/>
              <span style="color: #9CA3AF;">${po.district}, ${po.state}</span>
            </div>
          `)

          if (onSelectOffice) {
            marker.on('click', () => onSelectOffice(po))
          }

          networkLayer.addLayer(marker)
        }
      })
    }
  }, [networkDots, postOffices, onSelectNetworkDot, onSelectOffice])

  // Render the Searched / Selected Post Office as a DISTINCT SEPARATE POINT
  useEffect(() => {
    const map = mapInstanceRef.current
    const highlightLayer = highlightLayerRef.current
    if (!map || !highlightLayer) return

    highlightLayer.clearLayers()

    if (!selectedOffice) return

    const lat = selectedOffice.latitude
    const lon = selectedOffice.longitude

    if (lat != null && lon != null) {
      // 1. Distinct Outer Beacon Ring
      const beaconRing = L.circleMarker([lat, lon], {
        radius: 18,
        color: '#FF1E28',
        weight: 2.5,
        dashArray: '4, 5',
        opacity: 0.9,
        fillColor: '#FF1E28',
        fillOpacity: 0.15,
      })

      // 2. High-visibility solid red core marker with white border
      const coreMarker = L.circleMarker([lat, lon], {
        radius: 10,
        fillColor: '#FF1E28',
        color: '#FFFFFF',
        weight: 3.5,
        opacity: 1,
        fillOpacity: 1,
      })

      const popupContent = `
        <div style="font-family: 'Urbanist', sans-serif; font-size: 13px; line-height: 1.4; color: #FFFFFF; background: #1B1C1D; padding: 6px;">
          <div style="display: inline-block; background: #FF1E28; color: #FFFFFF; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 9999px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
            Searched Postal Point
          </div>
          <div style="font-weight: 800; font-size: 16px; color: #FFFFFF; margin-bottom: 4px;">
            ${selectedOffice.post_office_name}
          </div>
          <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px;">
            <span style="background: rgba(160, 29, 38, 0.3); color: #FF4D57; font-weight: 800; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-family: monospace; border: 1px solid rgba(160, 29, 38, 0.6);">
              PIN ${selectedOffice.pin_code}
            </span>
            <span style="background: rgba(255, 255, 255, 0.1); color: #D9D9D9; padding: 2px 8px; border-radius: 9999px; font-size: 11px;">
              ${selectedOffice.delivery_status}
            </span>
          </div>
          <div style="color: #D9D9D9; font-size: 12px;">
            ${selectedOffice.locality ? selectedOffice.locality + ', ' : ''}${selectedOffice.district}, ${selectedOffice.state}
          </div>
          <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 6px; font-family: monospace;">
            GPS Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}
          </div>
        </div>
      `

      coreMarker.bindPopup(popupContent)

      highlightLayer.addLayer(beaconRing)
      highlightLayer.addLayer(coreMarker)

      // Smoothly fly to the searched point
      map.flyTo([lat, lon], 12, { duration: 1.2 })
      setTimeout(() => {
        coreMarker.openPopup()
      }, 500)
    }
  }, [selectedOffice])

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([22.5, 79.5], 5, { duration: 1 })
    }
  }

  const totalCoveredOffices = networkDots.reduce((acc, d) => acc + d.count, 0) || 154797

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#1A1A1A]">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Floating Re-center button */}
      <button
        onClick={handleResetView}
        className="absolute top-4 right-4 z-20 bg-[#1B1C1D]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs text-white shadow-xl flex items-center gap-2 hover:bg-[#2A2B2D] transition-colors cursor-pointer"
        title="Reset map to full India view"
      >
        <Compass className="w-3.5 h-3.5 text-[#FF4D57]" />
        <span className="font-bold">All India View</span>
      </button>

      {/* Bottom left info badge showing nationwide coverage */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#1B1C1D]/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-bold text-white shadow-xl flex items-center gap-2">
        {selectedOffice ? (
          <>
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF1E28] animate-ping" />
            <span className="text-[#FF4D57]">Searched: {selectedOffice.post_office_name} (PIN {selectedOffice.pin_code})</span>
          </>
        ) : (
          <>
            <MapPin className="w-3.5 h-3.5 text-[#A01D26]" />
            <span>{totalCoveredOffices.toLocaleString()} All-India Postal Nodes Active</span>
          </>
        )}
      </div>
    </div>
  )
}

