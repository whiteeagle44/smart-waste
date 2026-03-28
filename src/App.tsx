/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageSquare, Map as MapIcon } from 'lucide-react';
import ChatTab from './components/ChatTab';
import MapTab from './components/MapTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'map'>('chat');
  const [mapFilter, setMapFilter] = useState<{category: string, id: number} | null>(null);

  const handleShowOnMap = (category: string) => {
    setMapFilter({ category, id: Date.now() });
    setActiveTab('map');
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0C] text-white overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Smart<span className="text-blue-500">Waste</span></h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className={`w-full h-full ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
          <ChatTab onShowOnMap={handleShowOnMap} />
        </div>
        <div className={`w-full h-full ${activeTab === 'map' ? 'block' : 'hidden'}`}>
          <MapTab 
            isActive={activeTab === 'map'}
            externalFilter={mapFilter} 
            onClearExternalFilter={() => setMapFilter(null)} 
          />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t border-white/10 bg-[#151518] px-6 py-4 pb-safe z-20">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'chat' ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${activeTab === 'chat' ? 'bg-blue-500/10' : ''}`}>
              <MessageSquare size={24} className={activeTab === 'chat' ? 'fill-blue-500/20' : ''} />
            </div>
            <span className="text-xs font-medium">Skaner / Chat</span>
          </button>
          
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'map' ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${activeTab === 'map' ? 'bg-blue-500/10' : ''}`}>
              <MapIcon size={24} className={activeTab === 'map' ? 'fill-blue-500/20' : ''} />
            </div>
            <span className="text-xs font-medium">Mapa</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
