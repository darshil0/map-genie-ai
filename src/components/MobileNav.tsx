/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Compass, Layers, Sparkles, Navigation } from "lucide-react";

interface MobileNavProps {
  mobileActiveTab: string;
  setMobileActiveTab: (tab: "map" | "controls" | "chat" | "itinerary") => void;
  setActiveTab: (tab: "ai" | "planner") => void;
  selectedCategories: string[];
  filteredPlacesCount: number;
}

export default function MobileNav({
  mobileActiveTab,
  setMobileActiveTab,
  setActiveTab,
  selectedCategories,
  filteredPlacesCount,
}: MobileNavProps) {
  return (
    <nav
      id="mobile-bottom-navigation-bar"
      className="fixed bottom-0 inset-x-0 h-16 bg-[var(--surface-blur)] border-t border-[var(--border)] backdrop-blur-md flex items-center justify-around z-50 lg:hidden shadow-2xl select-none px-2 pb-1.5"
    >
      {/* Tab 1: Map View */}
      <button
        onClick={() => setMobileActiveTab("map")}
        className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
          mobileActiveTab === "map"
            ? "text-indigo-800 bg-indigo-50/75 font-bold"
            : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
      >
        <Compass className="w-4 h-4 mb-1" />
        <span className="text-[10px]">🗺️ Canvas</span>
      </button>

      {/* Tab 2: Control layers/filters */}
      <button
        onClick={() => setMobileActiveTab("controls")}
        className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer relative ${
          mobileActiveTab === "controls"
            ? "text-indigo-800 bg-indigo-50/75 font-bold"
            : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
      >
        <Layers className="w-4 h-4 mb-1" />
        <span className="text-[10px]">🎛️ Layers</span>
        {selectedCategories.length < 8 && (
          <div className="absolute top-2.5 right-6 h-1.5 w-1.5 rounded-full bg-indigo-600"></div>
        )}
      </button>

      {/* Tab 3: Chat Assistant */}
      <button
        onClick={() => {
          setMobileActiveTab("chat");
          setActiveTab("ai");
        }}
        className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
          mobileActiveTab === "chat"
            ? "text-indigo-800 bg-indigo-50/75 font-bold"
            : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
      >
        <Sparkles className="w-4 h-4 mb-1" />
        <span className="text-[10px]">💬 Assistant</span>
      </button>

      {/* Tab 4: Route Itinerary */}
      <button
        onClick={() => {
          setMobileActiveTab("itinerary");
          setActiveTab("planner");
        }}
        className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer relative ${
          mobileActiveTab === "itinerary"
            ? "text-indigo-800 bg-indigo-50/75 font-bold"
            : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
      >
        <Navigation className="w-4 h-4 mb-1" />
        <span className="text-[10px]">📅 Planner</span>
        {filteredPlacesCount > 0 && (
          <div className="absolute top-2 right-5 bg-indigo-600 text-white border border-transparent font-mono text-[8px] h-4 min-w-[16px] rounded-full flex items-center justify-center font-bold px-1 select-none shadow">
            {filteredPlacesCount}
          </div>
        )}
      </button>
    </nav>
  );
}
