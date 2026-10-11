import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import { PostOffice } from '@/types'
import { MapPin, AlertCircle } from 'lucide-react'

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
  postOffices: PostOffice[]
  selectedOffice?: PostOffice | null
  height?: string
  interactive?: boolean
  onSelectOffice?: (po: PostOffice) => void
}

export const PostalMap: React.FC<PostalMapProps> = ({
  postOffices,
  selectedOffice,
  height = '420px',
  interactive = true,
  onSelectOffice,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  // Filter only records that possess verified coordinates
  const verifiedOffices = postOffices.filter(
    (p) => p.has_verified_coords && p.latitude != null && p.longitude != null
  )

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      // Initialize map centered roughly on India (20.5937, 78.9629)
      const map = L.map(mapContainerRef.current, {
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        attributionControl: false,
      }).setView([20.5937, 78.9629], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 18,
      }).addTo(map)

      const markersLayer = L.layerGroup().addTo(map)
      markersLayerRef.current = markersLayer
      mapInstanceRef.current = map
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [interactive])

  // Update markers when postOffices change
  useEffect(() => {
    const map = mapInstanceRef.current
    const markersLayer = markersLayerRef.current
    if (!map || !markersLayer) return

    markersLayer.clearLayers()

    if (verifiedOffices.length === 0) return

    const bounds = L.latLngBounds([])

    verifiedOffices.forEach((po) => {
      if (po.latitude != null && po.longitude != null) {
        const isSelected = selectedOffice?.id === po.id

        // Black Dark Editorial map marker styling
        const marker = L.circleMarker([po.latitude, po.longitude], {
          radius: isSelected ? 11 : 7,
          fillColor: isSelected ? '#A01D26' : '#FFFFFF',
          color: isSelected ? '#FFFFFF' : '#A01D26',
          weight: isSelected ? 3 : 2,
          opacity: 1,
          fillOpacity: isSelected ? 1 : 0.85,
        })

        const popupContent = `
          <div style="font-family: 'Urbanist', sans-serif; font-size: 13px; line-height: 1.4; color: #FFFFFF; background: #1B1C1D; padding: 4px;">
            <div style="font-weight: 800; font-size: 15px; color: #FFFFFF; margin-bottom: 4px;">
              ${po.post_office_name}
            </div>
            <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px;">
              <span style="background: rgba(160, 29, 38, 0.25); color: #FF4D57; font-weight: 800; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-family: monospace; border: 1px solid rgba(160, 29, 38, 0.6);">
                PIN ${po.pin_code}
              </span>
              <span style="background: rgba(255, 255, 255, 0.1); color: #D9D9D9; padding: 2px 8px; border-radius: 9999px; font-size: 11px;">
                ${po.delivery_status}
              </span>
            </div>
            <div style="color: #D9D9D9; font-size: 12px;">
              ${po.district}, ${po.state}
            </div>
            <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 6px; font-family: monospace;">
              Coordinates: ${po.latitude.toFixed(4)}, ${po.longitude.toFixed(4)} (Verified)
            </div>
          </div>
        `

        marker.bindPopup(popupContent)

        if (onSelectOffice) {
          marker.on('click', () => onSelectOffice(po))
        }

        markersLayer.addLayer(marker)
        bounds.extend([po.latitude, po.longitude])

        if (isSelected) {
          marker.openPopup()
        }
      }
    })

    if (verifiedOffices.length === 1 && verifiedOffices[0].latitude && verifiedOffices[0].longitude) {
      map.setView([verifiedOffices[0].latitude, verifiedOffices[0].longitude], 13)
    } else if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    }
  }, [postOffices, selectedOffice, onSelectOffice, verifiedOffices])

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#1A1A1A]">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {verifiedOffices.length === 0 && (
        <div className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
          <AlertCircle className="w-10 h-10 text-[#A01D26] mb-3" />
          <h4 className="text-base font-bold text-white">
            No Verified Coordinates Available
          </h4>
          <p className="text-xs text-[#D9D9D9] max-w-sm mt-1 leading-relaxed">
            In compliance with strict data integrity guidelines, POSTALIQ never fabricates GPS coordinates for postal records lacking verified survey benchmarks.
          </p>
        </div>
      )}

      {verifiedOffices.length > 0 && (
        <div className="absolute bottom-4 left-4 z-20 bg-[#1B1C1D]/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-bold text-white shadow-xl flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#A01D26]" />
          <span>{verifiedOffices.length} Verified Postal Nodes</span>
        </div>
      )}
    </div>
  )
}
