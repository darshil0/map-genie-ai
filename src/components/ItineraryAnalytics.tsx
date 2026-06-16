/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Place } from "../types";
import { Compass, BarChart3, Tag, Heart, Map, Sparkles } from "lucide-react";

interface ItineraryAnalyticsProps {
  places: Place[];
}

const CATEGORY_COLORS: Record<
  string,
  { text: string; bg: string; border: string; bar: string }
> = {
  cafe: {
    text: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    bar: "bg-indigo-500",
  },
  restaurant: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    bar: "bg-rose-500",
  },
  museum: {
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    bar: "bg-purple-500",
  },
  temple: {
    text: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    bar: "bg-amber-500",
  },
  park: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    bar: "bg-emerald-500",
  },
  "scenic-overlook": {
    text: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    bar: "bg-sky-500",
  },
  historic: {
    text: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    bar: "bg-yellow-500",
  },
  custom: {
    text: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    bar: "bg-slate-400",
  },
};

const CATEGORY_LABEL: Record<string, string> = {
  cafe: "Café Lounge",
  restaurant: "Dining / Food",
  museum: "Fine Art / Exhibition",
  temple: "Sacred Temple / Shrine",
  park: "Nature Park / Garden",
  "scenic-overlook": "Clifftop Overlook",
  historic: "Historic Castle Site",
  custom: "Manual Custom Spot",
};

export default function ItineraryAnalytics({
  places,
}: ItineraryAnalyticsProps) {
  if (places.length === 0) return null;

  // Compute stats
  const totalSpots = places.length;

  // Georeference rate
  const geocodedCount = places.filter(
    (p) => p.latitude !== null && p.longitude !== null,
  ).length;
  const geocodeRate = Math.round((geocodedCount / totalSpots) * 100);

  // Category counts
  const catDistribution: Record<string, number> = {};
  places.forEach((place) => {
    const cat = place.category || "custom";
    catDistribution[cat] = (catDistribution[cat] || 0) + 1;
  });

  // Sort categories by frequency
  const sortedCategories = Object.entries(catDistribution).sort(
    (a, b) => b[1] - a[1],
  );
  const primaryVibe =
    sortedCategories.length > 0
      ? CATEGORY_LABEL[sortedCategories[0][0]] || sortedCategories[0][0]
      : "Exploratory";

  return (
    <div className="p-3 border rounded-2xl glass-panel space-y-3.5 shadow-xl select-none">
      {/* Analytics Card Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] uppercase font-bold font-mono tracking-widest text-indigo-400 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Spatial Analytics Matrix</span>
        </span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono">
          Live Telemetry
        </span>
      </div>

      {/* Grid KPI Summary Widgets */}
      <div className="grid grid-cols-2 gap-2 text-left">
        {/* Total stop count */}
        <div className="p-2 bg-white/2 rounded-xl border border-white/5 space-y-0.5">
          <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono">
            Total Stops
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-display font-medium text-white">
              {totalSpots}
            </span>
            <span className="text-[10px] text-slate-400">places</span>
          </div>
        </div>

        {/* Primary Intended Vibe */}
        <div className="p-2 bg-white/2 rounded-xl border border-white/5 space-y-0.5 truncate">
          <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono">
            Primary Atmosphere
          </span>
          <div className="flex items-center gap-1 mt-0.5 font-sans">
            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200 truncate">
              {primaryVibe}
            </span>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Bar Distribution */}
      <div className="space-y-2 text-left">
        <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400">
          Category Density distribution
        </span>
        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
          {Object.entries(CATEGORY_COLOR_MAPPING()).map(([catKey, counts]) => {
            const count = catDistribution[catKey] || 0;
            const percentage = totalSpots > 0 ? (count / totalSpots) * 100 : 0;
            const style = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.custom;

            return (
              <div key={catKey} className="group flex flex-col space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-300 flex items-center gap-1 shrink-0">
                    <span className="text-slate-400 w-4 font-normal text-right">
                      {count}x
                    </span>
                    <span className={`font-semibold ${style.text}`}>
                      {CATEGORY_LABEL[catKey] || catKey}
                    </span>
                  </span>
                  <span className="text-slate-500 text-[9px]">
                    {Math.round(percentage)}%
                  </span>
                </div>
                {/* Horizontal Progress bar container */}
                <div className="h-1.5 w-full bg-slate-900/60 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${style.bar}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Geocode Health telemetry */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <Map className="w-3.5 h-3.5 text-indigo-400" />
          <span>Active Map Plot rate</span>
        </span>
        <span
          className={
            geocodeRate === 100
              ? "text-emerald-400 font-bold"
              : "text-indigo-300"
          }
        >
          {geocodeRate}% resolved ({geocodedCount}/{totalSpots})
        </span>
      </div>
    </div>
  );
}

// Helper to provide sorted keys or standard static category catalog
function CATEGORY_COLOR_MAPPING() {
  return {
    cafe: "#4f46e5",
    restaurant: "#f43f5e",
    museum: "#a855f7",
    temple: "#f59e0b",
    park: "#10b981",
    "scenic-overlook": "#0ea5e9",
    historic: "#eab308",
    custom: "#94a3b8",
  };
}
