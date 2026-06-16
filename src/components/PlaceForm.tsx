/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, X } from "lucide-react";
import { Place } from "../types";

interface PlaceFormProps {
  editingPlace: Place | null;
  formName: string;
  setFormName: (val: string) => void;
  formDescription: string;
  setFormDescription: (val: string) => void;
  formAddress: string;
  setFormAddress: (val: string) => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
  formEmoji: string;
  setFormEmoji: (val: string) => void;
  formWhyMatch: string;
  setFormWhyMatch: (val: string) => void;
  setIsFormOpen: (val: boolean) => void;
  handleSaveCustomPlace: () => void;
  categoryEmojis: Record<string, string>;
}

export default function PlaceForm({
  editingPlace,
  formName,
  setFormName,
  formDescription,
  setFormDescription,
  formAddress,
  setFormAddress,
  formCategory,
  setFormCategory,
  formEmoji,
  setFormEmoji,
  formWhyMatch,
  setFormWhyMatch,
  setIsFormOpen,
  handleSaveCustomPlace,
  categoryEmojis,
}: PlaceFormProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 top-[60px] bg-[var(--surface-blur)] backdrop-blur-md border-t border-[var(--border)] p-4 space-y-4 shadow-2xl z-20 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 select-none">
        <h3 className="font-display font-bold text-xs text-[var(--text)] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>
            {editingPlace
              ? `Edit Spot: ${editingPlace.name}`
              : "Add Spot from Scratch"}
          </span>
        </h3>
        <button
          onClick={() => setIsFormOpen(false)}
          className="p-1 rounded-md hover:bg-slate-200 text-[var(--text-muted)] hover:text-[var(--text)] transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3.5 text-left">
        <div>
          <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">
            Spot Name *
          </label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. My Secret Courtyard Tea"
            className="w-full bg-[var(--bg)] text-xs p-2.5 rounded-lg border border-[var(--border)] focus:border-indigo-600 focus:outline-none text-[var(--text)] font-sans"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">
              Category
            </label>
            <select
              value={formCategory}
              onChange={(e) => {
                const newCat = e.target.value;
                setFormCategory(newCat);
                const suggestedEmoji = categoryEmojis[newCat];
                if (suggestedEmoji) {
                  setFormEmoji(suggestedEmoji);
                }
              }}
              className="w-full bg-[var(--bg)] text-xs p-2.5 rounded-lg border border-[var(--border)] focus:border-indigo-500 focus:outline-none text-[var(--text)] font-sans"
            >
              <option value="cafe">☕ Cafe</option>
              <option value="restaurant">🍣 Restaurant</option>
              <option value="museum">🖼️ Museum</option>
              <option value="temple">⛩️ Temple</option>
              <option value="park">🌳 Park</option>
              <option value="scenic-overlook">🌄 Scenic Overlook</option>
              <option value="historic">🏰 Historic Site</option>
              <option value="custom">📍 Custom Spot</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">
              Icon Emoji
            </label>
            <input
              type="text"
              value={formEmoji}
              onChange={(e) => setFormEmoji(e.target.value)}
              placeholder="e.g. 🏮"
              maxLength={4}
              className="w-full bg-[var(--bg)] text-xs p-2.5 rounded-lg border border-[var(--border)] focus:border-indigo-600 focus:outline-none text-[var(--text)] text-center font-sans"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">
            Geocodable Address *
          </label>
          <input
            type="text"
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
            placeholder="e.g. Kyoto Tower, Shimogyo Ward, Kyoto, Japan"
            className="w-full bg-[var(--bg)] text-xs p-2.5 rounded-lg border border-[var(--border)] focus:border-indigo-600 focus:outline-none text-[var(--text)] font-sans"
          />
          <span className="text-[9px] text-[var(--text-muted)] font-mono mt-1 block leading-snug font-bold">
            We'll center this leaflet marker automatically using OSM Nominatim.
          </span>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">
            Description
          </label>
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Add outstanding details, highlights, or tips..."
            rows={2}
            className="w-full bg-[var(--bg)] text-xs p-2.5 rounded-lg border border-[var(--border)] focus:border-indigo-600 focus:outline-none text-[var(--text)] font-sans resize-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">
            Personal Note / Recommendation Vibe
          </label>
          <input
            type="text"
            value={formWhyMatch}
            onChange={(e) => setFormWhyMatch(e.target.value)}
            placeholder="Why this spot belongs in your journey"
            className="w-full bg-[var(--bg)] text-xs p-2.5 rounded-lg border border-[var(--border)] focus:border-indigo-600 focus:outline-none text-[var(--text)] font-sans"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 select-none">
        <button
          type="button"
          onClick={handleSaveCustomPlace}
          disabled={!formName.trim() || !formAddress.trim()}
          className="flex-grow py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs transition-all shadow-lg hover:shadow-indigo-600/35 cursor-pointer"
        >
          Save Spot
        </button>
        <button
          type="button"
          onClick={() => setIsFormOpen(false)}
          className="flex-1 py-2 rounded-xl bg-[var(--surface2)] hover:bg-slate-200 text-[var(--text-muted)] hover:text-[var(--text)] font-semibold text-xs transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
