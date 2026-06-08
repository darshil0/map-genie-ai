/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Download, RotateCcw, ArrowUp, ArrowDown, Edit3, Trash2, MapPin } from 'lucide-react';
import { Place } from '../types';

interface PlannerWorkspaceProps {
  openAddForm: () => void;
  handleExportItinerary: () => void;
  handleCreateFromScratch: () => void;
  places: Place[];
  filteredPlaces: Place[];
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  handleCardClick: (place: Place) => void;
  setHoveredPlaceId: (id: string | null) => void;
  handleMovePlace: (index: number, direction: 'up' | 'down', e?: React.MouseEvent) => void;
  openEditForm: (place: Place, e?: React.MouseEvent) => void;
  handleDeletePlace: (id: string, e?: React.MouseEvent) => void;
  setActiveTab: (tab: 'ai' | 'planner') => void;
  categoryLabels: Record<string, string>;
}

const PlannerWorkspace: React.FC<PlannerWorkspaceProps> = ({
  openAddForm,
  handleExportItinerary,
  handleCreateFromScratch,
  places,
  filteredPlaces,
  activePlaceId,
  hoveredPlaceId,
  handleCardClick,
  setHoveredPlaceId,
  handleMovePlace,
  openEditForm,
  handleDeletePlace,
  setActiveTab,
  categoryLabels,
}) => {
  return (
    <div className="space-y-4">
      {/* Toolbar sequential buttons */}
      <div className="flex flex-col gap-2 border-b border-slate-900 pb-3 select-none">
        <button
          type="button"
          onClick={openAddForm}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-indigo-500/50 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-50 hover:text-white rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Pin Manual Spot from Scratch</span>
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportItinerary}
            disabled={places.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border border-emerald-500/35 bg-emerald-950/20 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-950/20 text-emerald-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            title="Export to JSON"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={handleCreateFromScratch}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border border-slate-855 bg-slate-900/60 hover:bg-slate-900 hover:border-rose-500/40 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            title="Start fresh list"
          >
            <RotateCcw className="w-3 h-3 text-rose-500" />
            <span>Reset Scratch</span>
          </button>
        </div>
      </div>

      {/* Itinerary steps mapping index */}
      {filteredPlaces.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider select-none">
            <span>Sequential Route List</span>
            <span>Rearrange Node Order</span>
          </div>

          <div className="space-y-3">
            {filteredPlaces.map((place, index) => {
              const isActive = place.id === activePlaceId;
              const isHovered = place.id === hoveredPlaceId;
              const isFirst = index === 0;
              const isLast = index === filteredPlaces.length - 1;

              return (
                <div
                  key={place.id}
                  onClick={() => handleCardClick(place)}
                  onMouseEnter={() => setHoveredPlaceId(place.id)}
                  onMouseLeave={() => setHoveredPlaceId(null)}
                  className={`group relative p-3 border rounded-xl cursor-pointer transition-all duration-300 text-left ${
                    isActive
                      ? 'border-indigo-500/80 bg-indigo-950/20 shadow-inner font-bold'
                      : isHovered
                      ? 'border-indigo-500/35 bg-slate-900/40 scale-[1.01]'
                      : 'border-slate-900 bg-slate-900/10 hover:border-slate-800'
                  }`}
                >
                  {/* Sequential Badge overlay */}
                  <div className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center text-[9px] font-mono font-bold text-indigo-300 select-none shadow-md">
                    {index + 1}
                  </div>

                  <div className="flex items-start justify-between gap-2 pl-2">
                    <div className="flex gap-2">
                      <span className="text-xl pt-0.5 select-none">{place.emoji || '📍'}</span>
                      <div>
                        <h4 className="font-display font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors">
                          {place.name}
                        </h4>
                        <span className="inline-block mt-0.5 text-[8px] font-mono bg-slate-900 border border-slate-850 px-1 py-0.1 rounded text-slate-400 uppercase tracking-wider select-none font-bold">
                          {categoryLabels[place.category] || place.category}
                        </span>
                      </div>
                    </div>

                    {/* Move index triggers */}
                    <div className="flex items-center gap-1 shrink-0 select-none" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleMovePlace(index, 'up', e)}
                        disabled={isFirst}
                        className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-20 cursor-pointer transition-all"
                        title="Move Node Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleMovePlace(index, 'down', e)}
                        disabled={isLast}
                        className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-20 cursor-pointer transition-all"
                        title="Move Node Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => openEditForm(place, e)}
                        className="p-1 rounded bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-white cursor-pointer transition-all"
                        title="Edit details"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeletePlace(place.id, e)}
                        className="p-1 rounded bg-slate-950 border border-slate-800 hover:border-rose-500 text-slate-400 hover:text-rose-400 cursor-pointer transition-all"
                        title="Trash node"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-1.5 pl-2 text-[11px] text-slate-300 leading-relaxed font-sans">
                    {place.description}
                  </p>

                  {place.whyMatch && (
                    <div className="ml-2 mt-2 text-[9px] text-indigo-200/90 bg-indigo-950/30 border border-indigo-900/40 p-2 rounded-lg font-mono leading-relaxed">
                      <span className="font-bold text-indigo-400">Match Vibe:</span> {place.whyMatch}
                    </div>
                  )}

                  <div className="mt-2 ml-2 text-[9px] text-slate-500 font-mono flex items-center gap-1 border-t border-slate-900 pt-1.5 select-none">
                    <MapPin className="w-3 h-3 text-slate-650" />
                    <span className="truncate max-w-[340px]" title={place.address}>{place.address}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Planner empty state card */
        <div className="border border-dashed border-slate-800 bg-slate-900/10 p-6 rounded-2xl text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-xl select-none">
            🗺️
          </div>
          <div>
            <h4 className="font-display font-medium text-xs text-slate-250">Your Planner is Empty</h4>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed max-w-[240px] mx-auto">
              Build your sequence trip! Search with AI, or manually pin your personal favorite coordinates here.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 pt-2 select-none">
            <button
              onClick={openAddForm}
              className="py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide transition-all shadow-md cursor-pointer"
            >
              + Add Manual Spot from Scratch
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className="py-2 rounded-xl bg-slate-900 border border-slate-850 text-slate-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              💬 Message AI Genie Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerWorkspace;
