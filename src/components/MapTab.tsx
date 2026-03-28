import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchCollectionPoints, CollectionPoint } from '../lib/mockData';
import { MapPin, Navigation, Info, Filter, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORY_COLORS: Record<string, { hex: string, bg: string, text: string, border: string }> = {
  "Metale i tworzywa sztuczne": { hex: "#EAB308", bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/50" },
  "Papier": { hex: "#3B82F6", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50" },
  "Szkło": { hex: "#22C55E", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/50" },
  "Bioodpady": { hex: "#D97706", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50" },
  "Odpady zmieszane": { hex: "#71717A", bg: "bg-zinc-500/20", text: "text-zinc-400", border: "border-zinc-500/50" },
  "Elektrośmieci": { hex: "#A855F7", bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/50" },
  "Baterie i akumulatory": { hex: "#D946EF", bg: "bg-fuchsia-500/20", text: "text-fuchsia-400", border: "border-fuchsia-500/50" },
  "Gabaryty": { hex: "#F97316", bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/50" },
  "Odpady niebezpieczne": { hex: "#EF4444", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/50" },
  "Leki i odpady medyczne": { hex: "#F43F5E", bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/50" },
  "Odpady budowlane i poremontowe": { hex: "#94A3B8", bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/50" },
  "Tekstylia i odzież": { hex: "#14B8A6", bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500/50" },
  "Opony": { hex: "#334155", bg: "bg-slate-700/40", text: "text-slate-300", border: "border-slate-600/50" },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS);

// Cache for custom icons to avoid recreating them on every render
const iconCache: Record<string, L.DivIcon> = {};

const getCustomIcon = (colorHex: string) => {
  if (!iconCache[colorHex]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${colorHex}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#ffffff"/></svg>`;
    iconCache[colorHex] = L.divIcon({
      className: 'bg-transparent border-none', // Removes default leaflet white square
      html: svg,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42]
    });
  }
  return iconCache[colorHex];
};

function MapResizer({ isActive, points, userLocation, isFiltering }: { isActive: boolean, points: CollectionPoint[], userLocation: { lat: number, lng: number }, isFiltering: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        map.invalidateSize();
        
        // Adjust bounds to show user location and filtered points
        if (isFiltering && points.length > 0) {
          const bounds = L.latLngBounds([userLocation.lat, userLocation.lng], [userLocation.lat, userLocation.lng]);
          points.forEach(p => bounds.extend([p.lat, p.lng]));
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        } else {
          // If not filtering, zoom in closely on the user's current location
          map.setView([userLocation.lat, userLocation.lng], 15);
        }
      }, 100);
    }
  }, [isActive, map, points, userLocation, isFiltering]);
  return null;
}

export default function MapTab({ 
  isActive = true,
  externalFilter, 
  onClearExternalFilter 
}: { 
  isActive?: boolean;
  externalFilter?: { category: string, id: number } | null; 
  onClearExternalFilter?: () => void; 
}) {
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (externalFilter) {
      setSelectedCategories([externalFilter.category]);
    }
  }, [externalFilter]);

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

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    if (onClearExternalFilter) {
      onClearExternalFilter();
    }
  };

  const filteredPoints = useMemo(() => {
    return points.filter(point => {
      if (selectedCategories.length === 0) return true;
      return point.accepted_categories.some(cat => selectedCategories.includes(cat));
    });
  }, [points, selectedCategories]);

  const defaultCenter: [number, number] = [52.2200, 21.0110]; // Gmach Starej Kotłowni, Plac Politechniki 1
  
  // Mocked user location
  const userLocation = {
    lat: 52.2200,
    lng: 21.0110,
    name: "Gmach Starej Kotłowni",
    address: "Plac Politechniki 1, Warszawa - Śródmieście, Polska",
    description: "Budynek uczelni wyższej"
  };

  // Custom icon for user location
  const userIcon = useMemo(() => L.divIcon({
    className: 'bg-transparent border-none',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-md"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="#ffffff"/></svg>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  }), []);

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

  return (
    <div className="w-full h-full relative overflow-hidden">
      
      {/* Floating Toggle Button (visible when sidebar is closed) */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-4 top-4 z-[400] flex items-center gap-2"
          >
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-[#151518]/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl flex items-center gap-3 hover:bg-[#151518] transition-colors group"
            >
              <div className="relative">
                <Filter size={20} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                {selectedCategories.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#151518]"></span>
                )}
              </div>
              
              {selectedCategories.length === 0 ? (
                <span className="text-sm font-medium text-white pr-1">Filtruj punkty</span>
              ) : selectedCategories.length === 1 ? (
                <div className="flex items-center gap-2 pr-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[selectedCategories[0]]?.hex }}></span>
                  <span className="text-sm font-medium text-white truncate max-w-[130px] sm:max-w-[200px]">{selectedCategories[0]}</span>
                </div>
              ) : (
                <span className="text-sm font-medium text-white pr-1">Wybrane filtry: {selectedCategories.length}</span>
              )}
            </button>

            {selectedCategories.length > 0 && (
              <button
                onClick={clearFilters}
                className="bg-[#151518]/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors text-zinc-400"
                title="Wyczyść filtry"
              >
                <X size={20} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[450] md:hidden"
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#0A0A0C]/95 backdrop-blur-xl border-r border-white/10 z-[500] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Filter className="text-blue-500" size={20} />
                    Filtry
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">Wybierz kategorie odpadów</p>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Categories List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {ALL_CATEGORIES.map(cat => {
                  const isSelected = selectedCategories.includes(cat);
                  const colorInfo = CATEGORY_COLORS[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div 
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                          isSelected ? 'border-transparent' : 'border-zinc-600'
                        }`}
                        style={{ backgroundColor: isSelected ? colorInfo.hex : 'transparent' }}
                      >
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                      <div className="flex items-center gap-2 flex-1 text-left">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colorInfo.hex }}></span>
                        <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                          {cat}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              {selectedCategories.length > 0 && (
                <div className="p-4 border-t border-white/10 shrink-0">
                  <button
                    onClick={clearFilters}
                    className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Wyczyść filtry ({selectedCategories.length})
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MapContainer 
        center={defaultCenter} 
        zoom={15} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapResizer 
          isActive={isActive} 
          points={filteredPoints} 
          userLocation={userLocation} 
          isFiltering={selectedCategories.length > 0} 
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* User Location Marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup className="custom-popup">
            <div className="p-1 min-w-[150px]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h3 className="font-bold text-sm text-white">Twoja lokalizacja</h3>
              </div>
              <p className="text-zinc-300 text-xs font-medium">{userLocation.name}</p>
              <p className="text-zinc-400 text-[10px] mt-0.5">{userLocation.description}</p>
              <p className="text-zinc-500 text-[10px] mt-1">{userLocation.address}</p>
            </div>
          </Popup>
        </Marker>

        {filteredPoints.map(point => {
          // Determine marker color
          let markerColorHex = "#3B82F6"; // default blue
          if (selectedCategories.length > 0) {
            // Priority to the selected category
            const matchedCat = point.accepted_categories.find(cat => selectedCategories.includes(cat));
            if (matchedCat && CATEGORY_COLORS[matchedCat]) {
              markerColorHex = CATEGORY_COLORS[matchedCat].hex;
            }
          } else {
            // Default to the first accepted category
            const firstCat = point.accepted_categories[0];
            if (firstCat && CATEGORY_COLORS[firstCat]) {
              markerColorHex = CATEGORY_COLORS[firstCat].hex;
            }
          }

          return (
            <Marker 
              key={point.id} 
              position={[point.lat, point.lng]}
              icon={getCustomIcon(markerColorHex)}
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
                      {point.accepted_categories.map((cat, idx) => {
                        const colorInfo = CATEGORY_COLORS[cat] || { bg: 'bg-zinc-800/50', text: 'text-zinc-300', border: 'border-white/10' };
                        const isHighlighted = selectedCategories.length === 0 || selectedCategories.includes(cat);
                        
                        return (
                          <span 
                            key={idx} 
                            className={`px-2 py-1 rounded-md text-[10px] font-medium border ${
                              isHighlighted 
                                ? `${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}` 
                                : 'bg-zinc-800/30 text-zinc-500 border-white/5'
                            }`}
                          >
                            {cat}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(point.address)}`, '_blank')}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Nawiguj
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
