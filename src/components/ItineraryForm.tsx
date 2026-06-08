/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { Place } from '../types';

interface ItineraryFormProps {
  isFormOpen: boolean;
  setIsFormOpen: (val: boolean) => void;
  editingPlace: Place | null;
  formData: {
    name: string;
    description: string;
    address: string;
    category: string;
    emoji: string;
    whyMatch: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    address: string;
    category: string;
    emoji: string;
    whyMatch: string;
  }>>;
  handleSaveCustomPlace: () => void;
  categoryEmojis: Record<string, string>;
}

const ItineraryForm: React.FC<ItineraryFormProps> = ({
  isFormOpen,
  setIsFormOpen,
  editingPlace,
  formData,
  setFormData,
  handleSaveCustomPlace,
  categoryEmojis,
}) => {
  if (!isFormOpen) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 top-[60px] bg-slate-950/98 backdrop-blur-md border-t border-indigo-500/30 p-4 space-y-4 shadow-2xl z-20 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 select-none">
        <h3 className="font-display font-medium text-xs text-white flex items-center gap-1.5 font-bold">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{editingPlace ? `Edit Spot: ${editingPlace.name}` : 'Add Spot from Scratch'}</span>
        </h3>
        <button
          onClick={() => setIsFormOpen(false)}
          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3.5 text-left">
        <div>
          <label htmlFor="formName" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Spot Name *</label>
          <input
            id="formName"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. My Secret Courtyard Tea"
            className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none text-white font-sans"
            aria-required="true"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="formCategory" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Category</label>
            <select
              id="formCategory"
              value={formData.category}
              onChange={(e) => {
                const newCat = e.target.value;
                const suggestedEmoji = categoryEmojis[newCat] || formData.emoji;
                setFormData(prev => ({ ...prev, category: newCat, emoji: suggestedEmoji }));
              }}
              className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none text-white font-sans"
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
            <label htmlFor="formEmoji" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Icon Emoji</label>
            <input
              id="formEmoji"
              type="text"
              value={formData.emoji}
              onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
              placeholder="e.g. 🏮"
              maxLength={4}
              className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none text-white text-center font-sans"
              aria-label="Emoji Icon"
            />
          </div>
        </div>

        <div>
          <label htmlFor="formAddress" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Geocodable Address *</label>
          <input
            id="formAddress"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="e.g. Kyoto Tower, Shimogyo Ward, Kyoto, Japan"
            className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none text-white font-sans"
            aria-required="true"
          />
          <span className="text-[9px] text-slate-500 font-mono mt-1 block leading-snug">We'll center this leaflet marker automatically using OSM Nominatim.</span>
        </div>

        <div>
          <label htmlFor="formDescription" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Description</label>
          <textarea
            id="formDescription"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Add outstanding details, highlights, or tips..."
            rows={2}
            className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none text-white font-sans resize-none"
          />
        </div>

        <div>
          <label htmlFor="formWhyMatch" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Personal Note / Recommendation Vibe</label>
          <input
            id="formWhyMatch"
            type="text"
            value={formData.whyMatch}
            onChange={(e) => setFormData(prev => ({ ...prev, whyMatch: e.target.value }))}
            placeholder="Why this spot belongs in your journey"
            className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none text-white font-sans"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 select-none">
        <button
          type="button"
          onClick={handleSaveCustomPlace}
          disabled={!formData.name.trim() || !formData.address.trim()}
          className="flex-grow py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs transition-all shadow-lg hover:shadow-indigo-600/35 cursor-pointer"
        >
          Save Spot
        </button>
        <button
          type="button"
          onClick={() => setIsFormOpen(false)}
          className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ItineraryForm;
