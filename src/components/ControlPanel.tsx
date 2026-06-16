/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Layers, RotateCcw, Save, Trash2 } from "lucide-react";
import { MapLocation, Place } from "../types";
import { US_STATES_DATA } from "../data/usStatesData";

interface ControlPanelProps {
  mobileActiveTab: string;
  resetSession: () => void;
  showRouteLines: boolean;
  setShowRouteLines: (val: boolean) => void;
  showGridLines: boolean;
  setShowGridLines: (val: boolean) => void;
  handleSelectAllFilters: () => void;
  handleClearFilters: () => void;
  selectedCategories: string[];
  toggleCategoryFilter: (catId: string) => void;
  categoryChips: any[];
  handleLoadStatePreset: (stateName: string) => void;
  newRouteName: string;
  setNewRouteName: (val: string) => void;
  places: Place[];
  handleSaveCurrentRoute: () => void;
  customSavedRoutes: any[];
  handleLoadSavedRoute: (route: any) => void;
  handleDeleteSavedRoute: (index: number, e: React.MouseEvent) => void;
}

export default function ControlPanel({
  mobileActiveTab,
  resetSession,
  showRouteLines,
  setShowRouteLines,
  showGridLines,
  setShowGridLines,
  handleSelectAllFilters,
  handleClearFilters,
  selectedCategories,
  toggleCategoryFilter,
  categoryChips,
  handleLoadStatePreset,
  newRouteName,
  setNewRouteName,
  places,
  handleSaveCurrentRoute,
  customSavedRoutes,
  handleLoadSavedRoute,
  handleDeleteSavedRoute,
}: ControlPanelProps) {
  return (
    <aside
      id="left-control-panel-column"
      className={`w-full lg:w-[280px] xl:w-[320px] shrink-0 border-r border-[var(--border)] bg-[var(--surface-blur)] flex flex-col h-full overflow-hidden transition-all duration-300 relative ${
        mobileActiveTab === "controls"
          ? "flex h-[calc(100vh-64px)]"
          : "hidden lg:flex"
      }`}
    >
      <div className="bg-mesh-glow" />

      {/* Panel 1 Branding Header */}
      <header className="p-4 border-b border-[var(--border)] bg-[var(--surface-blur)] backdrop-blur-md flex items-center justify-between z-10 select-none">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm text-[var(--text)] leading-none tracking-tight">
              Genie Control
            </h2>
            <span className="text-[9px] font-mono text-indigo-700 uppercase tracking-widest font-bold mt-0.5 block">
              Layers &amp; Memory
            </span>
          </div>
        </div>

        <button
          onClick={resetSession}
          title="Reset current session dialog & spots"
          className="p-1 rounded-lg border border-[var(--border)] bg-[var(--surface2)] hover:bg-slate-200 text-[var(--text-muted)] hover:text-[var(--text)] transition-all cursor-pointer z-10"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Scrollable Side column section contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 z-10 text-left">
        {/* Visual Canvas Layers */}
        <section className="space-y-2.5">
          <h3 className="text-[10px] font-mono text-indigo-700 uppercase tracking-widest font-bold select-none">
            🌐 Map Spatial Layers
          </h3>
          <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--border)] space-y-2.5">
            {/* Route Pathway checkbox */}
            <label className="flex items-center gap-2.5 text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)] transition-linear select-none">
              <input
                type="checkbox"
                checked={showRouteLines}
                onChange={(e) => setShowRouteLines(e.target.checked)}
                className="rounded border-[var(--border)] text-indigo-600 focus:ring-indigo-500 focus:outline-none h-4 w-4 bg-white cursor-pointer"
              />
              <span className="font-medium">Connect Path Sequences</span>
            </label>

            {/* Grid outline checkbox */}
            <label className="flex items-center gap-2.5 text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)] transition-linear select-none">
              <input
                type="checkbox"
                checked={showGridLines}
                onChange={(e) => setShowGridLines(e.target.checked)}
                className="rounded border-[var(--border)] text-indigo-600 focus:ring-indigo-500 focus:outline-none h-4 w-4 bg-white cursor-pointer"
              />
              <span className="font-medium">Symmetric Science Grid</span>
            </label>
          </div>
        </section>

        {/* Interactive Category Filter chips */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between select-none">
            <h3 className="text-[10px] font-mono text-indigo-700 uppercase tracking-widest font-bold text-left">
              📍 POI Semantic Filters
            </h3>
            <div className="flex items-center gap-2 text-[9px] font-semibold text-[var(--text-muted)] font-mono">
              <button
                onClick={handleSelectAllFilters}
                className="hover:text-indigo-705 transition-colors font-bold"
              >
                Select All
              </button>
              <span>|</span>
              <button
                onClick={handleClearFilters}
                className="hover:text-amber-705 transition-colors font-bold"
              >
                Clear
              </button>
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
                      ? chip.color + " border-indigo-500/40 font-bold"
                      : "bg-[var(--surface2)] border-[var(--border)] text-[var(--text-muted)] hover:border-slate-400"
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
          <h3 className="text-[10px] font-mono text-indigo-700 uppercase tracking-widest font-bold select-none">
            📁 Travel Route Storage
          </h3>

          {/* Quick preset selector */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[var(--surface2)] border border-[var(--border)]">
            <span className="text-[9px] text-[var(--text-muted)] font-mono font-bold block">
              🇺🇸 Load Predefined State Itinerary:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleLoadStatePreset("California")}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 border border-indigo-400 rounded-lg text-[10px] font-bold text-indigo-800 hover:text-white transition-all shrink-0 cursor-pointer"
              >
                🌴 California Route
              </button>
              <select
                value=""
                onChange={(e) => {
                  e.target.value && handleLoadStatePreset(e.target.value);
                }}
                className="flex-1 bg-[var(--bg)] text-[10px] p-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] font-sans cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                <option value="" disabled>
                  Other State Preset...
                </option>
                {US_STATES_DATA.filter((s) => s.name !== "California").map(
                  (s) => (
                    <option
                      key={s.name}
                      value={s.name}
                      className="bg-[var(--bg)] text-[var(--text)]"
                    >
                      {s.name} ({s.code})
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {/* User save control module */}
          <div className="p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl space-y-2">
            <span className="text-[9px] text-indigo-700 font-mono font-bold block uppercase tracking-wider">
              💾 Memory Route Archiver
            </span>

            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                placeholder="e.g. My Kyoto Sakura Trip..."
                disabled={places.length === 0}
                className="w-full bg-[var(--bg)] text-xs p-2 rounded-lg border border-[var(--border)] text-[var(--text)] font-sans focus:outline-none focus:border-indigo-600 disabled:opacity-40"
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
              <div className="pt-2 border-t border-[var(--border)] space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                <span className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-wider block font-bold">
                  Personal Archives ({customSavedRoutes.length}):
                </span>
                {customSavedRoutes.map((route, i) => (
                  <div
                    key={i}
                    onClick={() => handleLoadSavedRoute(route)}
                    className="group flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:border-indigo-500 cursor-pointer transition-all"
                  >
                    <span className="text-[11px] text-[var(--text-muted)] group-hover:text-indigo-700 font-medium truncate select-none">
                      📅 {route.name}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSavedRoute(i, e)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-rose-650 hover:bg-rose-50 cursor-pointer transition-colors"
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
}
