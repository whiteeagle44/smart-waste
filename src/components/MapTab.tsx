import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchCollectionPoints, CollectionPoint } from '../lib/mockData';
import { MapPin, Navigation, Info } from 'lucide-react';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for our app
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.2/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapTab() {
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCollectionPoints();
        setPoints(data);
      } catch (error) {
        console.error("Failed to fetch points", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0A0A0C]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm font-medium">Ładowanie mapy...</p>
        </div>
      </div>
    );
  }

  // Center of Warsaw as default
  const defaultCenter: [number, number] = [52.2297, 21.0122];

  return (
    <div className="w-full h-full relative">
      {/* Floating Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[400] pointer-events-none">
        <div className="bg-[#151518]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="text-blue-500" size={20} />
            Punkty zbiórki
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Znajdź najbliższe miejsce na nietypowe odpady.
          </p>
        </div>
      </div>

      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {points.map(point => (
          <Marker 
            key={point.id} 
            position={[point.lat, point.lng]}
            icon={customIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-base text-white mb-1">{point.name}</h3>
                <div className="flex items-start gap-1.5 text-zinc-400 text-xs mb-3">
                  <Navigation size={12} className="mt-0.5 shrink-0" />
                  <span>{point.address}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    <Info size={12} />
                    Przyjmuje:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {point.accepted_categories.map((cat, idx) => (
                      <span 
                        key={idx} 
                        className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-md text-[10px] font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                  Nawiguj
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
