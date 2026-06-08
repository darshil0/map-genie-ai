/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2, Compass, Edit3, Trash2, BookOpen, MapPin } from 'lucide-react';
import { Message, Place } from '../types';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  filteredPlaces: Place[];
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  handleCardClick: (place: Place) => void;
  setHoveredPlaceId: (id: string | null) => void;
  openEditForm: (place: Place, e?: React.MouseEvent) => void;
  handleDeletePlace: (id: string, e?: React.MouseEvent) => void;
  handleSendMessage: (text?: string) => void;
  starterPrompts: Array<{ text: string; icon: string }>;
  categoryLabels: Record<string, string>;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isLoading,
  filteredPlaces,
  activePlaceId,
  hoveredPlaceId,
  handleCardClick,
  setHoveredPlaceId,
  openEditForm,
  handleDeletePlace,
  handleSendMessage,
  starterPrompts,
  categoryLabels,
}) => {
  return (
    <>
      {/* Messages Loop */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-slate-400 select-none">
            <span>{msg.sender === 'user' ? 'You' : 'Genie Assistant'}</span>
            <span>•</span>
            <span>{msg.timestamp}</span>
          </div>

          <div
            className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed text-left ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                : 'bg-slate-900/60 text-slate-200 border border-slate-900 rounded-tl-none font-sans'
            }`}
          >
            <div className="prose prose-invert prose-sm whitespace-pre-line text-slate-100">
              {msg.text}
            </div>
          </div>
        </div>
      ))}

      {/* Typing Loader animation */}
      {isLoading && (
        <div className="flex flex-col items-start select-none">
          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-slate-400">
            <span>Map Genie</span>
            <span>•</span>
            <span>Searching...</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            <span className="text-[11px] text-slate-400 font-mono">Geocoding suggestions dynamically...</span>
          </div>
        </div>
      )}

      {/* Suggestions results cards inside Chat Feed */}
      {filteredPlaces.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-mono text-slate-400 tracking-wider uppercase flex items-center gap-1 select-none font-bold">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Suggested Spots ({filteredPlaces.length})</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {filteredPlaces.map((place) => {
              const isActive = place.id === activePlaceId;
              const isHovered = place.id === hoveredPlaceId;

              return (
                <div
                  key={place.id}
                  onClick={() => handleCardClick(place)}
                  onMouseEnter={() => setHoveredPlaceId(place.id)}
                  onMouseLeave={() => setHoveredPlaceId(null)}
                  className={`group p-3 border rounded-xl cursor-pointer transition-all duration-300 text-left ${
                    isActive
                      ? 'border-indigo-500/80 bg-indigo-950/20 shadow-inner font-bold'
                      : isHovered
                      ? 'border-indigo-500/35 bg-slate-900/40 scale-[1.01]'
                      : 'border-slate-900 bg-slate-900/10 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2">
                      <span className="text-xl pt-0.5 select-none">{place.emoji || '📍'}</span>
                      <div>
                        <h4 className="font-display font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors">
                          {place.name}
                        </h4>
                        <span className="inline-block mt-0.5 text-[8px] font-mono bg-slate-900 border border-slate-800 px-1 py-0.2 rounded text-slate-400 uppercase tracking-wider select-none font-bold">
                          {categoryLabels[place.category] || place.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 select-none" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => openEditForm(place, e)}
                        className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Edit Spot"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeletePlace(place.id, e)}
                        className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-rose-500 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                        title="Delete Spot"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-300 leading-relaxed font-sans">
                    {place.description}
                  </p>

                  {place.whyMatch && (
                    <div className="mt-2 text-[9px] text-indigo-200/90 bg-indigo-950/30 border border-indigo-900/40 p-2 rounded-lg font-mono leading-relaxed">
                      <span className="font-bold text-indigo-400">Match Vibe:</span> {place.whyMatch}
                    </div>
                  )}

                  <div className="mt-2 text-[9px] text-slate-500 font-mono flex items-center gap-1 border-t border-slate-900 pt-1.5 select-none">
                    <MapPin className="w-3 h-3 text-slate-650" />
                    <span className="truncate max-w-[340px]" title={place.address}>{place.address}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Starter triggers */}
      {messages.length <= 1 && !isLoading && (
        <div className="border border-slate-900 bg-slate-950/20 p-4 rounded-xl space-y-3">
          <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none font-bold">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Starter Search Spell Prompts:</span>
          </h4>
          <div className="grid grid-cols-1 gap-1.5 text-left">
            {starterPrompts.map((p) => (
              <button
                key={p.text}
                onClick={() => handleSendMessage(p.text)}
                className="flex items-center gap-2 text-left p-2.5 rounded-xl border border-slate-900 bg-slate-900/35 hover:border-slate-800 hover:bg-slate-900/60 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
              >
                <span className="text-base shrink-0">{p.icon}</span>
                <span className="truncate font-medium">{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPanel;
