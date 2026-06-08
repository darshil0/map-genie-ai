/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, RotateCcw, Save, Trash2 } from 'lucide-react';
import { Place, MapLocation } from '../types';
import { US_STATES_DATA } from '../data/usStatesData';

interface CategoryChip {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

interface ControlsPanelProps {
  mobileActiveTab: string;
  resetSession: () => void;
  showRouteLines: boolean;
  setShowRouteLines: (val: boolean) => void;
  showGridLines: boolean;
  setShowGridLines: (val: boolean) => void;
  selectedCategories: string[];
  toggleCategoryFilter: (catId: string) => void;
  handleSelectAllFilters: () => void;
  handleClearFilters: () => void;
  handleLoadStatePreset: (stateName: string) => void;
  newRouteName: string;
  setNewRouteName: (val: string) => void;
  places: Place[];
  handleSaveCurrentRoute: () => void;
  customSavedRoutes: Array<{ name: string; places: Place[]; centerLocation: MapLocation | null }>;
  handleLoadSavedRoute: (route: any) => void;
  handleDeleteSavedRoute: (index: number, e: React.MouseEvent) => void;
  categoryChips: CategoryChip[];
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  mobileActiveTab,
  resetSession,
  showRouteLines,
  setShowRouteLines,
  showGridLines,
  setShowGridLines,
  selectedCategories,
  toggleCategoryFilter,
  handleSelectAllFilters,
  handleClearFilters,
  handleLoadStatePreset,
  newRouteName,
  setNewRouteName,
  places,
  handleSaveCurrentRoute,
  customSavedRoutes,
  handleLoadSavedRoute,
  handleDeleteSavedRoute,
  categoryChips,
}) => {
  return (
    <aside
      id="left-control-panel-column"
      className={`w-full lg:w-[280px] xl:w-[320px] shrink-0 border-r border-slate-900 bg-slate-950 flex flex-col h-full overflow-hidden transition-all duration-300 relative ${
        mobileActiveTab === 'controls' ? 'flex h-[calc(100vh-64px)]' : 'hidden lg:flex'
      }`}
    >
      <div className="bg-mesh-glow" />

      {/* Panel 1 Branding Header */}
      <header className="p-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-10 select-none">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-800 flex items-center justify-center shadow-md">
            <Layers className="w-4 h-4 text-indigo-200" />
          </div>
          <div>
            <h2 className="font-display font-medium text-sm text-white leading-none tracking-tight">Genie Control</h2>
            <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-semibold mt-0.5 block">Layers &amp; Memory</span>
          </div>
        </div>

        <button
          onClick={resetSession}
          title="Reset current session dialog & spots"
          className="p-1 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Scrollable controls configuration body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 z-10 text-left">

        {/* Visual Canvas Layers */}
        <section className="space-y-2.5">
          <h3 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold select-none">
            🌐 Map Spatial Layers
          </h3>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-855 space-y-2.5">

            {/* Route Pathway checkbox */}
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-linear select-none">
              <input
                type="checkbox"
                checked={showRouteLines}
                onChange={(e) => setShowRouteLines(e.target.checked)}
                className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:outline-none h-4 w-4 bg-slate-950 cursor-pointer"
              />
              <span className="font-medium">Connect Path Sequences</span>
            </label>

            {/* Grid outline checkbox */}
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-linear select-none">
              <input
                type="checkbox"
                checked={showGridLines}
                onChange={(e) => setShowGridLines(e.target.checked)}
                className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:outline-none h-4 w-4 bg-slate-950 cursor-pointer"
              />
              <span className="font-medium">Symmetric Science Grid</span>
            </label>
          </div>
        </section>

        {/* Interactive Category Filter chips */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between select-none">
            <h3 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold text-left">
              📍 POI Semantic Filters
            </h3>
            <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-500 font-mono">
              <button onClick={handleSelectAllFilters} className="hover:text-indigo-400 transition-colors">Select All</button>
              <span>|</span>
              <button onClick={handleClearFilters} className="hover:text-amber-500 transition-colors">Clear</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {categoryChips.map((chip) => {
              const isSelected = selectedCategories.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  onClick={() => toggleCategoryFilter(chip.id)}
                  className={`flex items-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-medium border text-left cursor-pointer transition-all ${
                    isSelected
                      ? chip.color + ' border-indigo-500/40 font-bold'
                      : 'bg-slate-900/10 border-transparent text-slate-500'
                  }`}
                >
                  <span className="text-sm shrink-0">{chip.emoji}</span>
                  <span className="truncate">{chip.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Saved Routes and US Preset memory */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold select-none">
            📁 Travel Route Storage
          </h3>

          {/* Quick preset selector */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/30 border border-slate-900">
            <span className="text-[9px] text-slate-400 font-mono font-bold block">🇺🇸 Load Predefined State Itinerary:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleLoadStatePreset("California")}
                className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 rounded-lg text-[10px] font-bold text-indigo-100 hover:text-white transition-all shrink-0 cursor-pointer"
              >
                🌴 California Route
              </button>
              <select
                value=""
                onChange={(e) => { e.target.value && handleLoadStatePreset(e.target.value); }}
                className="flex-1 bg-slate-950 text-[10px] p-1.5 rounded-lg border border-slate-800 text-slate-300 font-sans cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                <option value="" disabled>Other State Preset...</option>
                {US_STATES_DATA.filter(s => s.name !== "California").map((s) => (
                  <option key={s.name} value={s.name} className="bg-slate-950 text-slate-300">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User save control module */}
          <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-2">
            <span className="text-[9px] text-indigo-300 font-mono font-bold block uppercase tracking-wider">💾 Memory Route Archiver</span>

            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                placeholder="e.g. My Kyoto Sakura Trip..."
                disabled={places.length === 0}
                className="w-full bg-slate-950 text-xs p-2 rounded-lg border border-slate-800 text-white font-sans focus:outline-none focus:border-indigo-500 disabled:opacity-40"
              />
              <button
                onClick={handleSaveCurrentRoute}
                disabled={!newRouteName.trim() || places.length === 0}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Save className="w-3 h-3" />
                <span>Save Active Route</span>
              </button>
            </div>

            {/* Personal saved routes list */}
            {customSavedRoutes.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block font-bold">Personal Archives ({customSavedRoutes.length}):</span>
                {customSavedRoutes.map((route, i) => (
                  <div
                    key={i}
                    onClick={() => handleLoadSavedRoute(route)}
                    className="group flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-900 hover:border-indigo-500/50 cursor-pointer transition-all"
                  >
                    <span className="text-[11px] text-slate-300 group-hover:text-indigo-200 font-medium truncate select-none">
                      📅 {route.name}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSavedRoute(i, e)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 cursor-pointer transition-colors"
                      title="Delete from memory"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </aside>
  );
};

export default ControlsPanel;
