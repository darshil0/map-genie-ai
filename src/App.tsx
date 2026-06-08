/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Compass,
  Navigation,
  Info,
  Layers,
  MessageSquare
} from 'lucide-react';
import { Place, Message, MapLocation } from './types';
import MapContainer from './components/MapContainer';
import ItineraryAnalytics from './components/ItineraryAnalytics';
import { geocodeAddress } from './utils/geocoder';
import { US_STATES_DATA } from './data/usStatesData';

// Modular components
import ControlsPanel from './components/ControlsPanel';
import ItineraryForm from './components/ItineraryForm';
import ChatPanel from './components/ChatPanel';
import PlannerWorkspace from './components/PlannerWorkspace';

const STARTER_PROMPTS = [
  { text: 'Cozy coffee shops in Amsterdam', icon: '☕' },
  { text: 'Hidden temples near Kyoto', icon: '🛕' },
  { text: 'Scenic clifftop vistas near Mallorca', icon: '⛰️' },
  { text: 'Art deco buildings in Miami', icon: '🌴' }
];

const CATEGORY_EMOJIS: Record<string, string> = {
  cafe: '☕',
  restaurant: '🍣',
  museum: '🖼️',
  temple: '⛩️',
  park: '🌳',
  'scenic-overlook': '🌄',
  historic: '🏰',
  custom: '📍'
};

const CATEGORY_LABELS: Record<string, string> = {
  cafe: '☕ Cafes',
  restaurant: '🍣 Dining',
  museum: '🖼️ Museums',
  temple: '⛩️ Temples',
  park: '🌳 Parks',
  'scenic-overlook': '🌄 Vistas',
  historic: '🏰 Historic',
  custom: '📍 Handcrafted'
};

const CATEGORY_CHIPS = [
  { id: 'cafe', label: 'Cafes', emoji: '☕', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/45' },
  { id: 'restaurant', label: 'Dining', emoji: '🍣', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/45' },
  { id: 'museum', label: 'Museums', emoji: '🖼️', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/45' },
  { id: 'temple', label: 'Temples', emoji: '⛩️', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/45' },
  { id: 'park', label: 'Parks', emoji: '🌳', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/45' },
  { id: 'scenic-overlook', label: 'Vistas', emoji: '🌄', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20 hover:border-sky-400/45' },
  { id: 'historic', label: 'Historic', emoji: '🏰', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-400/45' },
  { id: 'custom', label: 'Custom Pins', emoji: '📍', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20 hover:border-slate-550/45' },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(null);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Layout states (3 Panels / 4 Mobile Tabs / Layers)
  const [activeTab, setActiveTab] = useState<'ai' | 'planner'>('ai');
  const [mobileActiveTab, setMobileActiveTab] = useState<'map' | 'controls' | 'chat' | 'itinerary'>('map');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);

  // Map settings toggles
  const [showRouteLines, setShowRouteLines] = useState(true);
  const [showGridLines, setShowGridLines] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'cafe', 'restaurant', 'museum', 'temple', 'park', 'scenic-overlook', 'historic', 'custom'
  ]);

  // Saved Routes state
  const [customSavedRoutes, setCustomSavedRoutes] = useState<Array<{ name: string; places: Place[]; centerLocation: MapLocation | null }>>([]);
  const [newRouteName, setNewRouteName] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    category: 'cafe',
    emoji: '📍',
    whyMatch: ''
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Initial State Persistence
  useEffect(() => {
    const savedMessages = localStorage.getItem('map_genie_messages');
    const savedPlaces = localStorage.getItem('map_genie_places');
    const savedLocation = localStorage.getItem('map_genie_location');
    const savedCustomRoutes = localStorage.getItem('map_genie_custom_saved_routes');

    if (savedCustomRoutes) {
      try { restoreSavedRoutes(JSON.parse(savedCustomRoutes)); } catch (_) {}
    }

    if (savedMessages && savedPlaces && savedLocation) {
      try {
        setMessages(JSON.parse(savedMessages));
        setPlaces(JSON.parse(savedPlaces));
        setCurrentLocation(JSON.parse(savedLocation));
      } catch (err) {
        console.error("Failed to parse saved session from localStorage:", err);
      }
    } else {
      // Welcome Intro
      const welcomeMsg: Message = {
        id: 'welcome',
        sender: 'assistant',
        text: "✨ Welcome to **Map Genie**! I'm your AI travel sidekick. Tell or speak to me who or what you are looking for—e.g., 'cozy coffee shops in Amsterdam' or 'jazz bars in Tokyo'. \n\nI will generate high-fidelity place cards and map markers on our dark map. You can continue chatting to refine these lists or add nearby highlights (like 'parks nearby' after 'restaurants') without starting over!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        places: []
      };
      setMessages([welcomeMsg]);
    }
    
    // Automatically query user context location for precise routing if allowed
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("Device Geolocation obtained successfully:", pos.coords.latitude, pos.coords.longitude);
        },
        (err) => console.log("Device Geolocation not available or rejected.", err)
      );
    }
  }, []);

  // Helper because variable hoist
  const restoreSavedRoutes = (parsed: any[]) => {
    setCustomSavedRoutes(parsed);
  };

  // 2. Persist State Changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('map_genie_messages', JSON.stringify(messages));
      localStorage.setItem('map_genie_places', JSON.stringify(places));
      if (currentLocation) {
        localStorage.setItem('map_genie_location', JSON.stringify(currentLocation));
      }
    }
  }, [messages, places, currentLocation]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'ai') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  // 3. Setup Web Speech Recognition Hook
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setMicError("Microphone error occurred. Try speaking clearly or type instead.");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Toggle voice recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setMicError("Speech recognition is not fully supported in this browser. Try Google Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setMicError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Speech session failed to target:", err);
      }
    }
  };

  // Reset Session
  const resetSession = () => {
    localStorage.removeItem('map_genie_messages');
    localStorage.removeItem('map_genie_places');
    localStorage.removeItem('map_genie_location');
    setPlaces([]);
    setCurrentLocation(null);
    setActivePlaceId(null);
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: "💼 Map Genie has been reset. Type or speak your next dream itinerary above!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        places: []
      }
    ]);
  };

  // Open Form to Add a Spot from Scratch
  const openAddForm = () => {
    setEditingPlace(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      category: 'cafe',
      emoji: '📍',
      whyMatch: 'Custom hand-made itinerary spot'
    });
    setIsFormOpen(true);
  };

  // Open Form to Edit an Existing Spot
  const openEditForm = (place: Place, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingPlace(place);
    setFormData({
      name: place.name,
      description: place.description,
      address: place.address,
      category: place.category,
      emoji: place.emoji,
      whyMatch: place.whyMatch || ''
    });
    setIsFormOpen(true);
  };

  // Handle Save of Custom Spot (Add/Update)
  const handleSaveCustomPlace = async () => {
    if (!formData.name.trim()) {
      alert("Spot name is required.");
      return;
    }
    if (!formData.address.trim()) {
      alert("Address is required for geocoding.");
      return;
    }

    const isEdit = !!editingPlace;
    const targetId = isEdit ? editingPlace!.id : `custom-${Date.now()}`;

    // Get current centroid context for initial map alignment if they don't specify coords
    const baseLat = currentLocation?.latitude ?? 52.3676;
    const baseLng = currentLocation?.longitude ?? 4.9041;

    const newPlace: Place = {
      id: targetId,
      name: formData.name.trim(),
      description: formData.description.trim(),
      whyMatch: formData.whyMatch.trim(),
      emoji: formData.emoji.trim(),
      address: formData.address.trim(),
      latitude: isEdit ? editingPlace!.latitude : baseLat,
      longitude: isEdit ? editingPlace!.longitude : baseLng,
      geocodingStatus: 'loading',
      category: formData.category
    };

    let updatedPlacesList: Place[] = [];
    if (isEdit) {
      updatedPlacesList = places.map(p => p.id === targetId ? newPlace : p);
    } else {
      updatedPlacesList = [...places, newPlace];
    }

    setPlaces(updatedPlacesList);
    setIsFormOpen(false);
    setActiveTab('planner');

    // Trigger async geocoding for target address
    try {
      const coords = await geocodeAddress(newPlace.address);
      setPlaces((currentList) =>
        currentList.map((item) => {
          if (item.id === targetId) {
            if (coords) {
              // Center view on newly custom set location if it was geocoded successfully
              if (!isEdit) {
                setCurrentLocation({
                  name: item.name,
                  latitude: coords.lat,
                  longitude: coords.lng
                });
              }
              return {
                ...item,
                latitude: coords.lat,
                longitude: coords.lng,
                geocodingStatus: 'success'
              };
            } else {
              return {
                ...item,
                latitude: item.latitude ? item.latitude + (Math.random() - 0.5) * 0.01 : null,
                longitude: item.longitude ? item.longitude + (Math.random() - 0.5) * 0.01 : null,
                geocodingStatus: 'error'
              };
            }
          }
          return item;
        })
      );
    } catch (err) {
      console.error("Geocoding failed for manual custom spot address:", err);
    }
  };

  // Delete Place
  const handleDeletePlace = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updatedList = places.filter(p => p.id !== id);
    setPlaces(updatedList);
    if (activePlaceId === id) {
      setActivePlaceId(null);
    }
  };

  // Swap Order of Places
  const handleMovePlace = (index: number, direction: 'up' | 'down', e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === places.length - 1) return;

    const newList = [...places];
    const swapTargetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newList[index];
    newList[index] = newList[swapTargetIndex];
    newList[swapTargetIndex] = temp;

    setPlaces(newList);
  };

  // Full manual reset to construct itinerary completely from scratch
  const handleCreateFromScratch = () => {
    setPlaces([]);
    setCurrentLocation(null);
    setActivePlaceId(null);
    setMessages([
      {
        id: `scratch-${Date.now()}`,
        sender: 'assistant',
        text: "🆕 **New Custom Itinerary Initiated from Scratch!**\n\nUse the form below to pin and custom-build your personal travel locations manually, or switch back to the AI chat whenever you need on-the-fly suggestions in seconds.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setActiveTab('planner');
    openAddForm();
  };

  // Export current itinerary to a downloadable JSON file
  const handleExportItinerary = () => {
    if (places.length === 0) return;
    
    // Create an object with metadata and current places
    const exportData = {
      appName: "Map Genie Itinerary",
      exportedAt: new Date().toISOString(),
      centerLocation: currentLocation,
      places: places.map(({ id, name, description, category, emoji, address, latitude, longitude, whyMatch }) => ({
        id,
        name,
        description,
        category,
        emoji,
        address,
        latitude,
        longitude,
        whyMatch
      }))
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    const fileName = `map-genie-itinerary-${currentLocation?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'trip'}.json`;
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Load US State Preset on map and planner
  const handleLoadStatePreset = (stateName: string) => {
    if (!stateName) return;
    const selected = US_STATES_DATA.find(s => s.name === stateName);
    if (!selected) return;

    // Load places
    setPlaces(selected.spots);
    
    // Set map focus
    setCurrentLocation({
      name: `${selected.name} (${selected.capital})`,
      latitude: selected.centroid.latitude,
      longitude: selected.centroid.longitude
    });

    if (selected.spots.length > 0) {
      setActivePlaceId(selected.spots[0].id);
    }

    // Set a matching narrative in conversation to introduce the loaded itinerary
    const presetMsg: Message = {
      id: `state-preset-${Date.now()}`,
      sender: 'assistant',
      text: `🇺🇸 Loaded curated travel itinerary spots for **${selected.name}**! I have plotted **${selected.spots.length} major spots** (connected sequentially via pathways on the map). \n\nYou can use the **Planner Workspace** tab to rearrange, add custom spots, or export them into a JSON file anytime. Happy travels!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      places: selected.spots
    };

    setMessages((prev) => [...prev, presetMsg]);
  };

  // Custom Saved Route capabilities
  const handleSaveCurrentRoute = () => {
    if (!newRouteName.trim() || places.length === 0) return;
    
    const newSavedItem = {
      name: newRouteName.trim(),
      places: [...places],
      centerLocation: currentLocation
    };
    
    const updated = [...customSavedRoutes, newSavedItem];
    setCustomSavedRoutes(updated);
    localStorage.setItem('map_genie_custom_saved_routes', JSON.stringify(updated));
    setNewRouteName('');
  };

  const handleDeleteSavedRoute = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customSavedRoutes.filter((_, i) => i !== index);
    setCustomSavedRoutes(updated);
    localStorage.setItem('map_genie_custom_saved_routes', JSON.stringify(updated));
  };

  const handleLoadSavedRoute = (route: typeof customSavedRoutes[0]) => {
    setPlaces(route.places);
    setCurrentLocation(route.centerLocation);
    if (route.places.length > 0) {
      setActivePlaceId(route.places[0].id);
    }
    const loadMsg: Message = {
      id: `saved-load-${Date.now()}`,
      sender: 'assistant',
      text: `📁 Recalled your personal saved route **"${route.name}"** successfully! Loaded **${route.places.length} travel nodes** sequentially on your canvas.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, loadMsg]);
    setMobileActiveTab('map');
  };

  // 4. Submit Chat and Handle Progressive Geocoding
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText ?? inputMessage;
    if (!textToSend.trim() || isLoading) return;

    // A. Append user message
    const userMsgId = `usr-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Switch to assistant chat tab
    setActiveTab('ai');
    setMobileActiveTab('chat');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for AI

    try {
      // B. Post to Gemini backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          currentLocation: currentLocation
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error ?? `Backend returned status ${response.status}`);
      }

      const responseData = await response.json();
      const { resolvedLocation, aiResponseText, spots } = responseData;

      const newCityLocation: MapLocation = {
        name: resolvedLocation.name,
        latitude: resolvedLocation.latitude,
        longitude: resolvedLocation.longitude
      };

      // Set fallback map center and user locations instantly
      setCurrentLocation(newCityLocation);

      // C. Model new generated spots with a 'loading' geocodingStatus
      const formattedSpots: Place[] = (spots || []).map((spot: any, idx: number) => ({
        id: `spot-${Date.now()}-${idx}`,
        name: spot.name,
        description: spot.description,
        whyMatch: spot.whyMatch,
        emoji: spot.emoji,
        address: spot.address,
        // Centroid coordinates act as placeholders instantly on map
        latitude: newCityLocation.latitude,
        longitude: newCityLocation.longitude,
        geocodingStatus: 'loading',
        category: spot.category
      }));

      // Update places to clear previous unless user is doing refinements
      const refinementKeywords = [
        'nearby', 'after', 'also', 'refine', 'more', 'another', 'additional', 'plus'
      ];
      const isRefinementPrompt = refinementKeywords.some(keyword =>
        new RegExp(`\\b${keyword}\\b`, 'i').test(textToSend)
      ) || textToSend.toLowerCase().includes('and also');

      let updatedPlacesList: Place[] = [];
      if (isRefinementPrompt) {
        // Appending refined spots to existing spots
        updatedPlacesList = [...places, ...formattedSpots];
      } else {
        // Full reload of current spots
        updatedPlacesList = [...formattedSpots];
      }

      setPlaces(updatedPlacesList);

      // D. Append Assistant text
      const assistantMsgId = `ast-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantMsgId,
        sender: 'assistant',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        places: formattedSpots,
        location: newCityLocation
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // E. Resolve Geocoding asynchronously & update positions gracefully
      formattedSpots.forEach(async (spot) => {
        try {
          // Call free OSM Nominatim geocoding tool
          const coords = await geocodeAddress(spot.address);

          setPlaces((currentList) =>
            currentList.map((item) => {
              if (item.id === spot.id) {
                if (coords) {
                  return {
                    ...item,
                    latitude: coords.lat,
                    longitude: coords.lng,
                    geocodingStatus: 'success'
                  };
                } else {
                  return {
                    ...item,
                    // If geocoding failed, scatter coordinates slightly around centroid for placeholder display
                    latitude: item.latitude ? item.latitude + (Math.random() - 0.5) * 0.015 : null,
                    longitude: item.longitude ? item.longitude + (Math.random() - 0.5) * 0.015 : null,
                    geocodingStatus: 'error'
                  };
                }
              }
              return item;
            })
          );
        } catch (err) {
          console.error(`Geocoding failed for ${spot.name}:`, err);
          setPlaces((currentList) =>
            currentList.map((item) =>
              item.id === spot.id ? { ...item, geocodingStatus: 'error' } : item
            )
          );
        }
      });

    } catch (err: any) {
      console.error("Failed loading Map Genie travel spots:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `🚨 **Map Connection Failed**: ${err.message || "An unexpected error occurred."}\n\nCould not query Gemini Flash successfully. Please try again!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (place: Place) => {
    setActivePlaceId(place.id);
    if (place.latitude && place.longitude) {
      setCurrentLocation({
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude
      });
    }
  };

  // Filter places based on active category chips
  const filteredPlaces = places.filter(place => selectedCategories.includes(place.category || 'custom'));

  const toggleCategoryFilter = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleSelectAllFilters = () => {
    setSelectedCategories(['cafe', 'restaurant', 'museum', 'temple', 'park', 'scenic-overlook', 'historic', 'custom']);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans relative">
      
      {/* 🔴 COLUMN 1: LEFT PANEL (Map Customization, POI Category Layer Filters & Saved Routes) */}
      <ControlsPanel
        mobileActiveTab={mobileActiveTab}
        resetSession={resetSession}
        showRouteLines={showRouteLines}
        setShowRouteLines={setShowRouteLines}
        showGridLines={showGridLines}
        setShowGridLines={setShowGridLines}
        selectedCategories={selectedCategories}
        toggleCategoryFilter={toggleCategoryFilter}
        handleSelectAllFilters={handleSelectAllFilters}
        handleClearFilters={handleClearFilters}
        handleLoadStatePreset={handleLoadStatePreset}
        newRouteName={newRouteName}
        setNewRouteName={setNewRouteName}
        places={places}
        handleSaveCurrentRoute={handleSaveCurrentRoute}
        customSavedRoutes={customSavedRoutes}
        handleLoadSavedRoute={handleLoadSavedRoute}
        handleDeleteSavedRoute={handleDeleteSavedRoute}
        categoryChips={CATEGORY_CHIPS}
      />

      {/* 🟢 COLUMN 2: CENTER PANEL (Interactive Map Center Layout with Floating Prompt Engine) */}
      <main
        id="center-spatial-panel-column"
        className={`flex-1 h-full relative flex flex-col ${
          mobileActiveTab === 'map' ? 'flex h-[calc(100vh-64px)]' : 'hidden lg:flex'
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
          <div className="w-full bg-slate-950/92 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-2xl transition-all">
            {/* Custom browser-microphone voice input */}
            <button
              onClick={toggleListening}
              type="button"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950/50 animate-pulse'
                  : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              title={isListening ? 'Click to stop listening' : 'Speak into search'}
            >
              {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* FLOATING PROMPT ENTRY INPUT */}
            <div className="flex-1 relative">
              <input
                type="text"
                disabled={isLoading}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={isListening ? "Listening closely... Speak now!" : "Search places (e.g. scenic vistas Mallorca)..."}
                className="w-full bg-slate-900 border border-slate-800 text-xs py-2.5 pl-3 pr-9 rounded-xl focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500 disabled:opacity-50 text-white"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-45 disabled:bg-transparent disabled:text-slate-600 transition-all cursor-pointer"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 🔵 COLUMN 3: RIGHT PANEL (AI Chat Assistant & Dynamic Telemetry Stats Rail) */}
      <section
        id="right-assistant-panel-column"
        className={`w-full lg:w-[420px] xl:w-[460px] shrink-0 border-l border-slate-900 bg-slate-950/98 flex flex-col h-full overflow-hidden relative ${
          mobileActiveTab === 'chat' || mobileActiveTab === 'itinerary' ? 'flex h-[calc(100vh-64px)]' : 'hidden lg:flex'
        }`}
      >
        <div className="bg-mesh-glow" />

        {/* Dual action Tabs defining Assistant vs Planner */}
        <div className="flex border-b border-slate-900 bg-slate-950/40 backdrop-blur-sm p-3 gap-2 select-none z-10">
          <button
            onClick={() => { setActiveTab('ai'); setIsFormOpen(false); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border btn-tab cursor-pointer ${
              activeTab === 'ai'
                ? 'btn-tab-active border-indigo-500/50 text-indigo-100'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Genie Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border btn-tab cursor-pointer ${
              activeTab === 'planner'
                ? 'btn-tab-active border-indigo-500/50 text-indigo-100'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Planner Workspace</span>
          </button>
        </div>

        {/* REAL-TIME DYNAMIC METRICS OVERVIEW CARD */}
        {places.length > 0 && (
          <div className="px-4 pt-1 pb-3 border-b border-slate-900 bg-slate-950/80 backdrop-blur-sm z-10 shrink-0">
            <ItineraryAnalytics places={filteredPlaces} />
          </div>
        )}

        {/* Custom Spot Curation Form (Add / Edit) - Modularized */}
        <ItineraryForm
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
          editingPlace={editingPlace}
          formData={formData}
          setFormData={setFormData}
          handleSaveCustomPlace={handleSaveCustomPlace}
          categoryEmojis={CATEGORY_EMOJIS}
        />

        {/* Scrollable conversation timelines */}
        <div id="sidebar-logs" className="flex-1 overflow-y-auto p-4 space-y-4 z-10">

          {/* TAB A: AI CHAT SIDEKICK */}
          {activeTab === 'ai' && (
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              filteredPlaces={filteredPlaces}
              activePlaceId={activePlaceId}
              hoveredPlaceId={hoveredPlaceId}
              handleCardClick={handleCardClick}
              setHoveredPlaceId={setHoveredPlaceId}
              openEditForm={openEditForm}
              handleDeletePlace={handleDeletePlace}
              handleSendMessage={handleSendMessage}
              starterPrompts={STARTER_PROMPTS}
              categoryLabels={CATEGORY_LABELS}
            />
          )}

          {/* TAB B: PLANNER WORKSPACE SEQUENCE */}
          {activeTab === 'planner' && (
            <PlannerWorkspace
              openAddForm={openAddForm}
              handleExportItinerary={handleExportItinerary}
              handleCreateFromScratch={handleCreateFromScratch}
              places={places}
              filteredPlaces={filteredPlaces}
              activePlaceId={activePlaceId}
              hoveredPlaceId={hoveredPlaceId}
              handleCardClick={handleCardClick}
              setHoveredPlaceId={setHoveredPlaceId}
              handleMovePlace={handleMovePlace}
              openEditForm={openEditForm}
              handleDeletePlace={handleDeletePlace}
              setActiveTab={setActiveTab}
              categoryLabels={CATEGORY_LABELS}
            />
          )}
          
          <div ref={chatBottomRef} />
        </div>

        {/* Console assistant entry foot input bar inside column 3 */}
        <footer className="p-4 border-t border-slate-900 bg-slate-950/90 backdrop-blur select-none">
          {micError && (
            <div className="mb-2 p-1.5 bg-rose-950/20 text-rose-300 rounded-lg text-[9px] font-mono border border-rose-900/40 flex items-center gap-1">
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
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg animate-pulse'
                  : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
              }`}
              title={isListening ? 'Stop' : 'Voice Speak'}
            >
              {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                disabled={isLoading}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Ask Genie (e.g. temples in Kyoto)..."
                className="w-full bg-slate-900 text-xs py-2.5 pl-3 pr-9 rounded-xl border border-slate-850 focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-slate-500 disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-45 disabled:bg-transparent disabled:text-slate-600 transition-all cursor-pointer"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </footer>

      </section>

      {/* 📱 MOBILE RESPONSIVE NAVIGATION BOTTOM TAB-BAR CONTROL PATTERN */}
      <nav
        id="mobile-bottom-navigation-bar"
        className="fixed bottom-0 inset-x-0 h-16 bg-slate-950 border-t border-slate-900 flex items-center justify-around z-50 lg:hidden shadow-2xl select-none px-2 pb-1.5"
      >
        {/* Tab 1: Map View */}
        <button
          onClick={() => setMobileActiveTab('map')}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
            mobileActiveTab === 'map' ? 'text-indigo-400 bg-indigo-500/5 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Compass className="w-4 h-4 mb-1" />
          <span className="text-[10px]">🗺️ Canvas</span>
        </button>

        {/* Tab 2: Control layers/filters */}
        <button
          onClick={() => setMobileActiveTab('controls')}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer relative ${
            mobileActiveTab === 'controls' ? 'text-indigo-400 bg-indigo-500/5 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4 mb-1" />
          <span className="text-[10px]">🎛️ Layers</span>
          {selectedCategories.length < 8 && (
            <div className="absolute top-2.5 right-6 h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
          )}
        </button>

        {/* Tab 3: Chat Assistant */}
        <button
          onClick={() => {
            setMobileActiveTab('chat');
            setActiveTab('ai');
          }}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
            mobileActiveTab === 'chat' ? 'text-indigo-400 bg-indigo-500/5 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-1" />
          <span className="text-[10px]">💬 Assistant</span>
        </button>

        {/* Tab 4: Route Itinerary */}
        <button
          onClick={() => {
            setMobileActiveTab('itinerary');
            setActiveTab('planner');
          }}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer relative ${
            mobileActiveTab === 'itinerary' ? 'text-indigo-400 bg-indigo-500/5 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Navigation className="w-4 h-4 mb-1" />
          <span className="text-[10px]">📅 Planner</span>
          {places.length > 0 && (
            <div className="absolute top-2 right-5 bg-indigo-650 text-white border border-slate-950 font-mono text-[8px] h-4 min-w-[16px] rounded-full flex items-center justify-center font-bold px-1 select-none shadow">
              {filteredPlaces.length}
            </div>
          )}
        </button>
      </nav>

    </div>
  );
}
