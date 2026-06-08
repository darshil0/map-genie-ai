/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { Place, MapLocation } from '../types';
import WeatherWidget from './WeatherWidget';

interface MapContainerProps {
  places: Place[];
  activePlaceId: string | null;
  hoveredPlaceId?: string | null;
  onPlaceClick: (place: Place) => void;
  onPlaceHover?: (placeId: string | null) => void;
  centerLocation: MapLocation | null;
  showRouteLines?: boolean;
  showGridLines?: boolean;
}

export default function MapContainer({
  places,
  activePlaceId,
  hoveredPlaceId = null,
  onPlaceClick,
  onPlaceHover,
  centerLocation,
  showRouteLines = true,
  showGridLines = true,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const routePolylinesRef = useRef<L.Polyline[]>([]);

  // Capture latest callbacks in refs to avoid stale closures in Leaflet event handlers
  const onPlaceClickRef = useRef(onPlaceClick);
  const onPlaceHoverRef = useRef(onPlaceHover);

  useEffect(() => {
    onPlaceClickRef.current = onPlaceClick;
    onPlaceHoverRef.current = onPlaceHover;
  }, [onPlaceClick, onPlaceHover]);

  // 1. Initial Map Setup
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default starting point (Amsterdam)
    const initialLat = centerLocation?.latitude ?? 52.3676;
    const initialLng = centerLocation?.longitude ?? 4.9041;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([initialLat, initialLng], 13);

    // Zoom controls on bottom right to clear space
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Beautiful premium dark tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;

    // Implement ResizeObserver to handle responsiveness and map size invalidation
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ animate: true });
      }
    });
    
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Center & Smoothly Fly To the active location when requested
  useEffect(() => {
    if (!mapInstanceRef.current || !centerLocation) return;
    mapInstanceRef.current.setView(
      [centerLocation.latitude, centerLocation.longitude],
      mapInstanceRef.current.getZoom() ?? 13,
      { animate: true, duration: 1.5 }
    );
  }, [centerLocation]);

  // 3. Keep Leaflet Markers Sync with Places list
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // A. Identify places to remove
    const placeIdsInProps = new Set(places.map((p) => p.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!placeIdsInProps.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // B. Add or update markers based on dynamic coords
    places.forEach((place) => {
      // Fallback: If place coordinates are not geocoded yet, position them transiently at the center to show placeholder
      const lat = place.latitude ?? (centerLocation?.latitude ?? 52.3676);
      const lng = place.longitude ?? (centerLocation?.longitude ?? 4.9041);
      const isGeocoded = place.latitude !== null && place.longitude !== null;
      const isActive = place.id === activePlaceId;
      const isHovered = place.id === hoveredPlaceId;

      // Calculate sequential routing sequence number to show badge overlay matching the planner workspace
      const placeIndex = places.findIndex((p) => p.id === place.id);
      const routeSeqNumber = placeIndex !== -1 ? placeIndex + 1 : null;

      // Category pulse color mapping for high-fidelity interactive pulsing
      const catColorSpec: Record<string, { pulse: string; border: string; glow: string; activeStroke: string }> = {
        cafe: { pulse: 'bg-indigo-500/40', border: 'border-indigo-400', glow: 'bg-indigo-500/15', activeStroke: 'ring-indigo-500/40' },
        restaurant: { pulse: 'bg-rose-500/45', border: 'border-rose-400', glow: 'bg-rose-500/15', activeStroke: 'ring-rose-500/40' },
        museum: { pulse: 'bg-purple-500/45', border: 'border-purple-400', glow: 'bg-purple-500/15', activeStroke: 'ring-purple-500/40' },
        temple: { pulse: 'bg-amber-500/45', border: 'border-amber-400', glow: 'bg-amber-500/15', activeStroke: 'ring-amber-500/40' },
        park: { pulse: 'bg-emerald-500/45', border: 'border-emerald-400', glow: 'bg-emerald-500/15', activeStroke: 'ring-emerald-500/40' },
        'scenic-overlook': { pulse: 'bg-sky-500/45', border: 'border-sky-400', glow: 'bg-sky-500/15', activeStroke: 'ring-sky-500/40' },
        historic: { pulse: 'bg-yellow-500/45', border: 'border-yellow-400', glow: 'bg-yellow-500/15', activeStroke: 'ring-yellow-500/40' },
        custom: { pulse: 'bg-slate-400/40', border: 'border-slate-300', glow: 'bg-slate-400/15', activeStroke: 'ring-slate-400/40' },
      };

      const spec = catColorSpec[place.category] || catColorSpec.custom;

      // Sanitize user inputs for safe HTML injection
      const sanitize = (str: string) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      };

      const safeEmoji = sanitize(place.emoji || '📍');
      const safeName = sanitize(place.name);
      const safeDescription = sanitize(place.description);

      // Icon creation using category-specific CSS pulses
      const customEmojiIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            ${
              !isGeocoded
                ? `<div class="absolute -inset-2 rounded-full bg-amber-500/35 blur-sm animate-pulse"></div>`
                : isActive
                ? `<div class="absolute -inset-2.5 rounded-full ${spec.pulse} blur-sm animate-ping"></div>`
                : isHovered
                ? `<div class="absolute -inset-3.5 rounded-full ${spec.pulse} blur-sm animate-pulse ring-4 ${spec.activeStroke}"></div>`
                : `<div class="absolute -inset-1 rounded-full ${spec.glow} blur-sm"></div>`
            }
            <div class="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shadow-md ${
              isActive
                ? 'bg-slate-900 border-2 ' + spec.border + ' text-2xl scale-125 z-50 shadow-indigo-950/80 ring-2 ' + spec.activeStroke
                : isHovered
                ? 'bg-slate-900 border-2 ' + spec.border + ' text-2xl scale-110 z-50 shadow-indigo-950/60'
                : !isGeocoded
                ? 'bg-amber-950/90 border border-amber-500/50 opacity-70 scale-95'
                : 'bg-slate-900/90 border border-white/10 hover:border-white/40 text-xl'
            } cursor-pointer hover:scale-110 active:scale-95">
              <span>${safeEmoji}</span>
            </div>
            ${
              !isGeocoded
                ? `<div class="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-slate-950 border border-slate-950">⏱️</div>`
                : ''
            }
            ${
              routeSeqNumber !== null && isGeocoded
                ? `<div class="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-mono font-bold text-white border border-slate-950 shadow-sm">${routeSeqNumber}</div>`
                : ''
            }
          </div>
        `,
        className: 'custom-map-icon',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      // Add Leaflet popup description on hover/click interactions
      const popupContent = `
        <div class="p-2 select-none min-w-[160px]">
          <div class="flex items-center gap-1.5 font-display font-semibold text-white">
            ${routeSeqNumber ? `<span class="bg-indigo-600/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-sm select-none mr-1">Spot ${routeSeqNumber}</span>` : ''}
            <span class="text-xl">${safeEmoji}</span>
            <span>${safeName}</span>
          </div>
          <p class="mt-1.5 text-xs text-slate-300 leading-snug font-sans">${safeDescription}</p>
          <div class="mt-2 text-[9px] font-mono text-slate-400 border-t border-slate-800/80 pt-1 flex items-center justify-between">
            <span class="uppercase tracking-wider font-bold text-indigo-400">${place.category}</span>
            <span class="${!isGeocoded ? 'text-amber-400 font-bold' : 'text-emerald-400'}">
              ${!isGeocoded ? 'Locating...' : 'Live Plot'}
            </span>
          </div>
        </div>
      `;

      if (markersRef.current[place.id]) {
        // Update existing marker's position + appearance
        const marker = markersRef.current[place.id];
        marker.setLatLng([lat, lng]);
        marker.setIcon(customEmojiIcon);
        
        // Refresh popup content in case description or name changes dynamically
        marker.bindPopup(popupContent, { closeButton: false });
        
        // Dynamically adjust zIndexOffset so active/hovered markers sits on top
        if (isActive) {
          marker.setZIndexOffset(1000);
        } else if (isHovered) {
          marker.setZIndexOffset(800);
        } else {
          marker.setZIndexOffset(0);
        }
      } else {
        // Create new marker
        const marker = L.marker([lat, lng], { icon: customEmojiIcon }).addTo(map);
        
        // Set up click/hover interactions using refs to prevent closure trapping
        marker.on('click', () => {
          onPlaceClickRef.current?.(place);
        });

        marker.on('mouseover', () => {
          onPlaceHoverRef.current?.(place.id);
        });

        marker.on('mouseout', () => {
          onPlaceHoverRef.current?.(null);
        });

        marker.bindPopup(popupContent, { closeButton: false });
        markersRef.current[place.id] = marker;
      }
    });
  }, [places, activePlaceId, hoveredPlaceId, centerLocation]);

  // 4. Fire popup or pan map when activePlaceId changes inside core view
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (!activePlaceId) {
      mapInstanceRef.current.closePopup();
      return;
    }
    const activeMarker = markersRef.current[activePlaceId];
    if (activeMarker) {
      const latlng = activeMarker.getLatLng();
      mapInstanceRef.current.setView([latlng.lat, latlng.lng], Math.max(mapInstanceRef.current.getZoom() ?? 14, 15), {
        animate: true,
        duration: 1.2,
      });
      activeMarker.openPopup();
    }
  }, [activePlaceId]);

  // 5. Automatically adjust map zoom level to include all active markers whenever a new list of places is generated/updated.
  // Order-invariant key prevents map jumping on simple sequencing tasks.
  const placesBoundsTrackingKey = useMemo(() => [...places]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((p) => `${p.id}-${p.latitude}-${p.longitude}`)
    .join(','), [places]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || places.length === 0) return;

    const validCoordinates = places
      .map((p) => {
        if (p.latitude !== null && p.longitude !== null) {
          return L.latLng(p.latitude, p.longitude);
        }
        return null;
      })
      .filter((loc): loc is L.LatLng => loc !== null);

    if (validCoordinates.length > 0) {
      const bounds = L.latLngBounds(validCoordinates);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
        duration: 1.5,
      });
    }
  }, [placesBoundsTrackingKey]);

  // 6. Draw/Update the route polyline connecting places sequentially
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous polylines
    routePolylinesRef.current.forEach((line) => line.remove());
    routePolylinesRef.current = [];

    if (!showRouteLines) return;

    // Filter places that have valid coordinates in their defined order
    const latLngs = places
      .map((place) => {
        if (place.latitude !== null && place.longitude !== null) {
          return [place.latitude, place.longitude] as [number, number];
        }
        return null;
      })
      .filter((coord): coord is [number, number] => coord !== null);

    if (latLngs.length > 1) {
      // Glow polyline: broad translucent underlay simulating neon reflection
      const glowLine = L.polyline(latLngs, {
        color: '#6366f1', // Indigo-500
        weight: 9,
        opacity: 0.22,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map);

      // Core dash line: bright vibrant overlay indicating forward pathway motion
      const coreLine = L.polyline(latLngs, {
        color: '#818cf8', // Indigo-400
        weight: 3.5,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round',
        dashArray: '8, 8',
      }).addTo(map);

      routePolylinesRef.current = [glowLine, coreLine];
    }

    return () => {
      routePolylinesRef.current.forEach((line) => line.remove());
      routePolylinesRef.current = [];
    };
  }, [places, showRouteLines]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 border border-white/5 shadow-2xl">
      {/* Absolute Dynamic Grid backdrop texture */}
      {showGridLines && (
        <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.035]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      )}

      {/* Absolute Header Overlay in map showing current region context */}
      {centerLocation && (
        <div className="absolute top-4 left-4 z-40 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 shadow-lg text-[10px] font-mono tracking-wider text-slate-300 select-none flex items-center gap-1.5 uppercase">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Center: {centerLocation.name}</span>
        </div>
      )}

      {/* Absolute Real-Time Weather Widget Overlay in map */}
      <div className="absolute top-4 right-4 z-40">
        <WeatherWidget
          latitude={centerLocation?.latitude ?? (places.length > 0 ? places[0].latitude : 52.3676)}
          longitude={centerLocation?.longitude ?? (places.length > 0 ? places[0].longitude : 4.9041)}
          locationName={centerLocation?.name ?? (places.length > 0 ? places[0].name : "Amsterdam")}
        />
      </div>

      <div id="map-genie-canvas" ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}
