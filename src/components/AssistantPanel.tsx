/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  MessageSquare,
  Navigation,
  Loader2,
  Compass,
  Edit3,
  Trash2,
  MapPin,
  BookOpen,
  Plus,
  Download,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Mic,
  MicOff,
  Info,
  Send,
} from "lucide-react";
import { Message, Place, MapLocation } from "../types";
import ItineraryAnalytics from "./ItineraryAnalytics";

interface AssistantPanelProps {
  mobileActiveTab: string;
  activeTab: "ai" | "planner";
  setActiveTab: (tab: "ai" | "planner") => void;
  setIsFormOpen: (val: boolean) => void;
  filteredPlaces: Place[];
  messages: Message[];
  isLoading: boolean;
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  setHoveredPlaceId: (id: string | null) => void;
  handleCardClick: (place: Place) => void;
  openEditForm: (place: Place, e?: React.MouseEvent) => void;
  handleDeletePlace: (id: string, e?: React.MouseEvent) => void;
  handleSendMessage: (customText?: string) => void;
  starterPrompts: any[];
  categoryLabels: Record<string, string>;
  openAddForm: () => void;
  handleExportItinerary: () => void;
  handleCreateFromScratch: () => void;
  handleMovePlace: (
    index: number,
    direction: "up" | "down",
    e?: React.MouseEvent,
  ) => void;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
  micError: string | null;
  toggleListening: () => void;
  isListening: boolean;
  inputMessage: string;
  setInputMessage: (val: string) => void;
}

export default function AssistantPanel({
  mobileActiveTab,
  activeTab,
  setActiveTab,
  setIsFormOpen,
  filteredPlaces,
  messages,
  isLoading,
  activePlaceId,
  hoveredPlaceId,
  setHoveredPlaceId,
  handleCardClick,
  openEditForm,
  handleDeletePlace,
  handleSendMessage,
  starterPrompts,
  categoryLabels,
  openAddForm,
  handleExportItinerary,
  handleCreateFromScratch,
  handleMovePlace,
  chatBottomRef,
  micError,
  toggleListening,
  isListening,
  inputMessage,
  setInputMessage,
}: AssistantPanelProps) {
  return (
    <section
      id="right-assistant-panel-column"
      className={`w-full lg:w-[420px] xl:w-[460px] shrink-0 border-l border-[var(--border)] bg-[var(--surface-blur)] flex flex-col h-full overflow-hidden relative ${
        mobileActiveTab === "chat" || mobileActiveTab === "itinerary"
          ? "flex h-[calc(100vh-64px)]"
          : "hidden lg:flex"
      }`}
    >
      <div className="bg-mesh-glow" />

      {/* Dual action Tabs defining Assistant vs Planner */}
      <div className="flex border-b border-[var(--border)] bg-[var(--surface2)]/40 backdrop-blur-sm p-3 gap-2 select-none z-10">
        <button
          onClick={() => {
            setActiveTab("ai");
            setIsFormOpen(false);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border btn-tab cursor-pointer ${
            activeTab === "ai"
              ? "btn-tab-active border-indigo-500/50 text-indigo-800"
              : "bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>AI Genie Chat</span>
        </button>
        <button
          onClick={() => setActiveTab("planner")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border btn-tab cursor-pointer ${
            activeTab === "planner"
              ? "btn-tab-active border-indigo-500/50 text-indigo-800"
              : "bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]"
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Planner Workspace</span>
        </button>
      </div>

      {/* REAL-TIME DYNAMIC METRICS OVERVIEW CARD */}
      {filteredPlaces.length > 0 && (
        <div className="px-4 pt-1 pb-3 border-b border-[var(--border)] bg-[var(--surface2)]/80 backdrop-blur-sm z-10 shrink-0">
          <ItineraryAnalytics places={filteredPlaces} />
        </div>
      )}

      {/* Scrollable conversation timelines */}
      <div
        id="sidebar-logs"
        className="flex-1 overflow-y-auto p-4 space-y-4 z-10"
      >
        {activeTab === "ai" && (
          <>
            {/* Messages Loop */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-[var(--text-muted)] select-none font-bold">
                  <span>
                    {msg.sender === "user" ? "You" : "Genie Assistant"}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed text-left ${
                    msg.sender === "user"
                      ? "bg-indigo-650 text-white rounded-tr-none shadow-md"
                      : "bg-[var(--surface2)] text-[var(--text)] border border-[var(--border)] rounded-tl-none font-sans"
                  }`}
                >
                  <div className="prose prose-sm whitespace-pre-line text-[var(--text)] font-medium">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Loader animation */}
            {isLoading && (
              <div className="flex flex-col items-start select-none">
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-[var(--text-muted)]">
                  <span>Map Genie</span>
                  <span>•</span>
                  <span>Searching...</span>
                </div>
                <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span className="text-[11px] text-[var(--text-muted)] font-mono font-bold">
                    Geocoding suggestions dynamically...
                  </span>
                </div>
              </div>
            )}

            {/* Suggestions results cards inside Chat Feed */}
            {filteredPlaces.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider uppercase flex items-center gap-1 select-none font-bold">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>Suggested Spots ({filteredPlaces.length})</span>
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {filteredPlaces.map((place, index) => {
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
                            ? "border-indigo-600 bg-indigo-50/70 shadow-inner font-bold"
                            : isHovered
                              ? "border-indigo-400 bg-indigo-50/30 scale-[1.01]"
                              : "border-[var(--border)] bg-[var(--surface2)] hover:border-[var(--accent2)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-2">
                            <span className="text-xl pt-0.5 select-none">
                              {place.emoji || "📍"}
                            </span>
                            <div>
                              <h4 className="font-display font-semibold text-xs text-[var(--text)] group-hover:text-indigo-700 transition-colors">
                                {place.name}
                              </h4>
                              <span className="inline-block mt-0.5 text-[8px] font-mono bg-[var(--bg)] border border-[var(--border)] px-1 py-0.5 rounded text-[var(--text-muted)] uppercase tracking-wider select-none font-bold">
                                {categoryLabels[place.category] ||
                                  place.category}
                              </span>
                            </div>
                          </div>

                          <div
                            className="flex items-center gap-1 shrink-0 select-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => openEditForm(place, e)}
                              className="p-1 rounded bg-[var(--bg)] border border-[var(--border)] hover:border-indigo-600 text-[var(--text-muted)] hover:text-indigo-700 transition-all cursor-pointer"
                              title="Edit Spot"
                            >
                              <Edit3 className="w-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeletePlace(place.id, e)}
                              className="p-1 rounded bg-[var(--bg)] border border-[var(--border)] hover:border-rose-650 text-[var(--text-muted)] hover:text-rose-650 transition-all cursor-pointer"
                              title="Delete Spot"
                            >
                              <Trash2 className="w-3" />
                            </button>
                          </div>
                        </div>

                        <p className="mt-1.5 text-[11px] text-[var(--text-muted)] leading-relaxed font-sans font-medium">
                          {place.description}
                        </p>

                        {place.whyMatch && (
                          <div className="mt-2 text-[9px] text-indigo-805 bg-indigo-55/70 border border-indigo-200/60 p-2 rounded-lg font-mono leading-relaxed">
                            <span className="font-bold text-indigo-700">
                              Match Vibe:
                            </span>{" "}
                            {place.whyMatch}
                          </div>
                        )}

                        <div className="mt-2 text-[9px] text-[var(--text-muted)] font-mono flex items-center gap-1 border-t border-[var(--border)] pt-1.5 select-none">
                          <MapPin className="w-3 border-none" />
                          <span
                            className="truncate max-w-[340px]"
                            title={place.address}
                          >
                            {place.address}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Starter triggers */}
            {filteredPlaces.length === 0 && !isLoading && (
              <div className="border border-[var(--border)] bg-[var(--surface2)]/50 p-4 rounded-xl space-y-3">
                <h4 className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5 select-none font-bold">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-650" />
                  <span>Starter Search Spell Prompts:</span>
                </h4>
                <div className="grid grid-cols-1 gap-1.5 text-left">
                  {starterPrompts.map((p) => (
                    <button
                      key={p.text}
                      onClick={() => handleSendMessage(p.text)}
                      className="flex items-center gap-2 text-left p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface2)] hover:border-indigo-600 hover:bg-white text-[var(--text-muted)] hover:text-slate-900 text-xs transition-all cursor-pointer"
                    >
                      <span className="text-base shrink-0">{p.icon}</span>
                      <span className="truncate font-bold">{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB B: PLANNER WORKSPACE SEQUENCE */}
        {activeTab === "planner" && (
          <div className="space-y-4">
            {/* Toolbar sequential buttons */}
            <div className="flex flex-col gap-2 border-b border-slate-900 pb-3 select-none">
              <button
                type="button"
                onClick={openAddForm}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-indigo-400 bg-indigo-50/70 hover:bg-indigo-600 text-indigo-900 hover:text-white rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pin Manual Spot from Scratch</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportItinerary}
                  disabled={filteredPlaces.length === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border border-emerald-500/50 bg-emerald-50 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-50 text-emerald-800 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  title="Export to JSON"
                >
                  <Download className="w-3 h-3 text-emerald-700 group-hover:text-white" />
                  <span>Export JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleCreateFromScratch}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border border-[var(--border)] bg-[var(--surface2)] hover:bg-rose-50 hover:border-rose-300 text-[var(--text-muted)] hover:text-rose-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  title="Start fresh list"
                >
                  <RotateCcw className="w-3 h-3 text-rose-600" />
                  <span>Reset Scratch</span>
                </button>
              </div>
            </div>

            {/* Itinerary steps mapping index */}
            {filteredPlaces.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider select-none font-bold">
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
                            ? "border-indigo-600 bg-indigo-50/70 shadow-inner font-bold"
                            : isHovered
                              ? "border-indigo-400 bg-indigo-50/30 scale-[1.01]"
                              : "border-[var(--border)] bg-[var(--surface2)] hover:border-[var(--accent2)]"
                        }`}
                      >
                        {/* Sequential Badge overlay */}
                        <div className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-indigo-100 border border-indigo-350 flex items-center justify-center text-[9px] font-mono font-bold text-indigo-800 select-none shadow-md">
                          {index + 1}
                        </div>

                        <div className="flex items-start justify-between gap-2 pl-2">
                          <div className="flex gap-2">
                            <span className="text-xl pt-0.5 select-none">
                              {place.emoji || "📍"}
                            </span>
                            <div>
                              <h4 className="font-display font-semibold text-xs text-[var(--text)] group-hover:text-indigo-700 transition-colors">
                                {place.name}
                              </h4>
                              <span className="inline-block mt-0.5 text-[8px] font-mono bg-[var(--bg)] border border-[var(--border)] px-1 py-0.5 rounded text-[var(--text-muted)] uppercase tracking-wider select-none font-bold">
                                {categoryLabels[place.category] ||
                                  place.category}
                              </span>
                            </div>
                          </div>

                          {/* Move index triggers */}
                          <div
                            className="flex items-center gap-1 shrink-0 select-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => handleMovePlace(index, "up", e)}
                              disabled={isFirst}
                              className="p-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-20 cursor-pointer transition-all"
                              title="Move Node Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleMovePlace(index, "down", e)}
                              disabled={isLast}
                              className="p-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-20 cursor-pointer transition-all"
                              title="Move Node Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => openEditForm(place, e)}
                              className="p-1 rounded bg-[var(--bg)] border border-[var(--border)] hover:border-indigo-600 text-[var(--text-muted)] hover:text-indigo-600 cursor-pointer transition-all"
                              title="Edit details"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeletePlace(place.id, e)}
                              className="p-1 rounded bg-[var(--bg)] border border-[var(--border)] hover:border-rose-450 hover:text-rose-650 text-[var(--text-muted)] cursor-pointer transition-all"
                              title="Trash node"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="mt-1.5 pl-2 text-[11px] text-[var(--text-muted)] leading-relaxed font-sans font-medium">
                          {place.description}
                        </p>

                        {place.whyMatch && (
                          <div className="ml-2 mt-2 text-[9px] text-indigo-805 bg-indigo-55/70 border border-indigo-200/60 p-2 rounded-lg font-mono leading-relaxed">
                            <span className="font-bold text-indigo-700">
                              Match Vibe:
                            </span>{" "}
                            {place.whyMatch}
                          </div>
                        )}

                        <div className="mt-2 ml-2 text-[9px] text-[var(--text-muted)] font-mono flex items-center gap-1 border-t border-[var(--border)] pt-1.5 select-none">
                          <MapPin className="w-3 border-none" />
                          <span
                            className="truncate max-w-[340px]"
                            title={place.address}
                          >
                            {place.address}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Planner empty state card */
              <div className="border border-dashed border-[var(--border)] bg-[var(--surface2)]/40 p-6 rounded-2xl text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-xl select-none">
                  🗺️
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-[var(--text)]">
                    Your Planner is Empty
                  </h4>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)] leading-relaxed max-w-[240px] mx-auto font-medium">
                    Build your sequence trip! Search with AI, or manually pin
                    your personal favorite coordinates here.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 pt-2 select-none">
                  <button
                    onClick={openAddForm}
                    className="py-2 rounded-xl bg-indigo-650 hover:bg-indigo-605 text-white font-semibold text-xs tracking-wide transition-all shadow-md cursor-pointer"
                  >
                    + Add Manual Spot from Scratch
                  </button>
                  <button
                    onClick={() => setActiveTab("ai")}
                    className="py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-indigo-600 text-xs font-semibold transition-all cursor-pointer"
                  >
                    💬 Message AI Genie Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Console assistant entry foot input bar inside column 3 */}
      <footer className="p-4 border-t border-[var(--border)] bg-[var(--surface-blur)] backdrop-blur select-none">
        {micError && (
          <div className="mb-2 p-1.5 bg-rose-50 text-rose-750 rounded-lg text-[10px] font-mono border border-rose-250/60 flex items-center gap-1 font-bold">
            <Info className="w-3 h-3 shrink-0" />
            <span>{micError}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={toggleListening}
            type="button"
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
              isListening
                ? "bg-rose-600 border-rose-500 text-white shadow-lg animate-pulse"
                : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-indigo-650"
            }`}
            title={isListening ? "Stop" : "Voice Speak"}
          >
            {isListening ? (
              <Mic className="w-3.5 h-3.5" />
            ) : (
              <MicOff className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              disabled={isLoading}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Ask Genie (e.g. temples in Kyoto)..."
              className="w-full bg-[var(--bg)] text-xs py-2.5 pl-3 pr-9 rounded-xl border border-[var(--border)] focus:outline-none focus:border-indigo-650 transition-all text-[var(--text)] placeholder:text-[var(--text-muted)] font-medium"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-45 disabled:bg-transparent disabled:text-slate-400 transition-all cursor-pointer"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}
