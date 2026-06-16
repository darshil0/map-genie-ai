/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Mic, MicOff, Send } from "lucide-react";
import MapContainer from "./MapContainer";
import { Place, MapLocation } from "../types";

interface MapPanelProps {
  mobileActiveTab: string;
  filteredPlaces: Place[];
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  handleCardClick: (place: Place) => void;
  setHoveredPlaceId: (id: string | null) => void;
  currentLocation: MapLocation | null;
  showRouteLines: boolean;
  showGridLines: boolean;
  toggleListening: () => void;
  isListening: boolean;
  isLoading: boolean;
  inputMessage: string;
  setInputMessage: (val: string) => void;
  handleSendMessage: (customText?: string) => void;
}

export default function MapPanel({
  mobileActiveTab,
  filteredPlaces,
  activePlaceId,
  hoveredPlaceId,
  handleCardClick,
  setHoveredPlaceId,
  currentLocation,
  showRouteLines,
  showGridLines,
  toggleListening,
  isListening,
  isLoading,
  inputMessage,
  setInputMessage,
  handleSendMessage,
}: MapPanelProps) {
  return (
    <main
      id="center-spatial-panel-column"
      className={`flex-1 h-full relative flex flex-col ${
        mobileActiveTab === "map"
          ? "flex h-[calc(100vh-64px)]"
          : "hidden lg:flex"
      }`}
    >
      <MapContainer
        places={filteredPlaces}
        activePlaceId={activePlaceId}
        hoveredPlaceId={hoveredPlaceId}
        onPlaceClick={handleCardClick}
        onPlaceHover={setHoveredPlaceId}
        centerLocation={currentLocation}
        showRouteLines={showRouteLines}
        showGridLines={showGridLines}
      />

      {/* FLOATING AI PROMPT ENGINE AT THE BOTTOM */}
      <div className="absolute bottom-6 inset-x-4 max-w-lg mx-auto z-30 select-none pb-4 md:pb-0">
        <div className="w-full bg-[var(--surface-blur)] backdrop-blur-md border border-[var(--border)] rounded-2xl p-2 flex items-center gap-2 shadow-2xl transition-all">
          {/* Custom browser-microphone voice input */}
          <button
            onClick={toggleListening}
            type="button"
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
              isListening
                ? "bg-rose-600 border-rose-500 text-white shadow-lg animate-pulse"
                : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-indigo-600 hover:border-indigo-300"
            }`}
            title={
              isListening ? "Click to stop listening" : "Speak into search"
            }
          >
            {isListening ? (
              <Mic className="w-4 h-4 animate-bounce" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </button>

          {/* FLOATING PROMPT ENTRY INPUT */}
          <div className="flex-1 relative">
            <input
              type="text"
              disabled={isLoading}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder={
                isListening
                  ? "Listening closely... Speak now!"
                  : "Search places (e.g. scenic vistas Mallorca)..."
              }
              className="w-full bg-[var(--bg)] border border-[var(--border)] text-xs py-2.5 pl-3 pr-9 rounded-xl focus:outline-none focus:border-indigo-600 transition-all placeholder:text-[var(--text-muted)] disabled:opacity-50 text-[var(--text)] font-semibold"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-45 disabled:bg-transparent disabled:text-slate-500 transition-all cursor-pointer"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
