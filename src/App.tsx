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
  MapPin,
  Map as MapIcon,
  RotateCcw,
  Navigation,
  Loader2,
  Info,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  X,
  Download,
  Layers,
  Save,
  Check,
  PlusCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { Place, Message, MapLocation } from './types';
import MapContainer from './components/MapContainer';
import ItineraryAnalytics from './components/ItineraryAnalytics';
import { geocodeAddress } from './utils/geocoder';
import { US_STATES_DATA } from './data/usStatesData';

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
  { id: 'cafe', label: 'Cafes', emoji: '☕', color: 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100/60 font-medium' },
  { id: 'restaurant', label: 'Dining', emoji: '🍣', color: 'text-rose-700 bg-rose-50 border-rose-200 hover:border-rose-400 hover:bg-rose-100/60 font-medium' },
  { id: 'museum', label: 'Museums', emoji: '🖼️', color: 'text-purple-700 bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100/60 font-medium' },
  { id: 'temple', label: 'Temples', emoji: '⛩️', color: 'text-amber-805 bg-amber-50 border-amber-200 hover:border-amber-400 hover:bg-amber-100/60 font-medium' },
  { id: 'park', label: 'Parks', emoji: '🌳', color: 'text-emerald-800 bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/60 font-medium' },
  { id: 'scenic-overlook', label: 'Vistas', emoji: '🌄', color: 'text-sky-700 bg-sky-50 border-sky-200 hover:border-sky-400 hover:bg-sky-100/60 font-medium' },
  { id: 'historic', label: 'Historic', emoji: '🏰', color: 'text-yellow-850 bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-105/60 font-medium' },
  { id: 'custom', label: 'Custom Pins', emoji: '📍', color: 'text-slate-800 bg-slate-100 border-slate-300 hover:border-slate-400 hover:bg-slate-200/60 font-medium' },
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
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCategory, setFormCategory] = useState('cafe');
  const [formEmoji, setFormEmoji] = useState('📍');
  const [formWhyMatch, setFormWhyMatch] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Initial State Persistence
  useEffect(() => {
    const savedMessages = localStorage.getItem('map_genie_messages');
    const savedPlaces = localStorage.getItem('map_genie_places');
    const savedLocation = localStorage.getItem('map_genie_location');
    const savedCustomRoutes = localStorage.getItem('map_genie_custom_saved_routes');

    if (savedCustomRoutes) {
      try { combackSavedRoutes(JSON.parse(savedCustomRoutes)); } catch (_) {}
    }

    if (savedMessages && savedPlaces && savedLocation) {
      setMessages(JSON.parse(savedMessages));
      setPlaces(JSON.parse(savedPlaces));
      setCurrentLocation(JSON.parse(savedLocation));
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
  const combackSavedRoutes = (parsed: any[]) => {
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
    setFormName('');
    setFormDescription('');
    setFormAddress('');
    setFormCategory('cafe');
    setFormEmoji('📍');
    setFormWhyMatch('Custom hand-made itinerary spot');
    setIsFormOpen(true);
  };

  // Open Form to Edit an Existing Spot
  const openEditForm = (place: Place, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingPlace(place);
    setFormName(place.name);
    setFormDescription(place.description);
    setFormAddress(place.address);
    setFormCategory(place.category);
    setFormEmoji(place.emoji);
    setFormWhyMatch(place.whyMatch || '');
    setIsFormOpen(true);
  };

  // Handle Save of Custom Spot (Add/Update)
  const handleSaveCustomPlace = async () => {
    if (!formName.trim() || !formAddress.trim()) {
      return;
    }

    const isEdit = !!editingPlace;
    const targetId = isEdit ? editingPlace!.id : `custom-${Date.now()}`;

    // Get current centroid context for initial map alignment if they don't specify coords
    const baseLat = currentLocation?.latitude ?? 52.3676;
    const baseLng = currentLocation?.longitude ?? 4.9041;

    const newPlace: Place = {
      id: targetId,
      name: formName.trim(),
      description: formDescription.trim(),
      whyMatch: formWhyMatch.trim(),
      emoji: formEmoji.trim(),
      address: formAddress.trim(),
      latitude: isEdit ? editingPlace!.latitude : baseLat,
      longitude: isEdit ? editingPlace!.longitude : baseLng,
      geocodingStatus: 'loading',
      category: formCategory
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

    try {
      // B. Post to Gemini backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          currentLocation: currentLocation
        })
      });

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
      const isRefinementPrompt = textToSend.toLowerCase().includes('nearby') || 
                                 textToSend.toLowerCase().includes('after') || 
                                 textToSend.toLowerCase().includes('parks') || 
                                 textToSend.toLowerCase().includes('and also') ||
                                 textToSend.toLowerCase().includes('refine');

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
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] font-sans relative">
      
      {/* 🔴 COLUMN 1: LEFT PANEL (Map Customization, POI Category Layer Filters & Saved Routes) */}
      <aside
        id="left-control-panel-column"
        className={`w-full lg:w-[280px] xl:w-[320px] shrink-0 border-r border-[var(--border)] bg-[var(--surface-blur)] flex flex-col h-full overflow-hidden transition-all duration-300 relative ${
          mobileActiveTab === 'controls' ? 'flex h-[calc(100vh-64px)]' : 'hidden lg:flex'
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
              <h2 className="font-display font-bold text-sm text-[var(--text)] leading-none tracking-tight">Genie Control</h2>
              <span className="text-[9px] font-mono text-indigo-700 uppercase tracking-widest font-bold mt-0.5 block">Layers &amp; Memory</span>
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
                <button onClick={handleSelectAllFilters} className="hover:text-indigo-705 transition-colors font-bold">Select All</button>
                <span>|</span>
                <button onClick={handleClearFilters} className="hover:text-amber-705 transition-colors font-bold">Clear</button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORY_CHIPS.map((chip) => {
                const isSelected = selectedCategories.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    onClick={() => toggleCategoryFilter(chip.id)}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-medium border text-left cursor-pointer transition-all ${
                      isSelected
                        ? chip.color + ' border-indigo-500/40 font-bold'
                        : 'bg-[var(--surface2)] border-[var(--border)] text-[var(--text-muted)] hover:border-slate-400'
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
              <span className="text-[9px] text-[var(--text-muted)] font-mono font-bold block">🇺🇸 Load Predefined State Itinerary:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleLoadStatePreset("California")}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 border border-indigo-400 rounded-lg text-[10px] font-bold text-indigo-800 hover:text-white transition-all shrink-0 cursor-pointer"
                >
                  🌴 California Route
                </button>
                <select
                  value=""
                  onChange={(e) => { e.target.value && handleLoadStatePreset(e.target.value); }}
                  className="flex-1 bg-[var(--bg)] text-[10px] p-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] font-sans cursor-pointer focus:outline-none focus:border-indigo-500"
                >
                  <option value="" disabled>Other State Preset...</option>
                  {US_STATES_DATA.filter(s => s.name !== "California").map((s) => (
                    <option key={s.name} value={s.name} className="bg-[var(--bg)] text-[var(--text)]">
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* User save control module */}
            <div className="p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl space-y-2">
              <span className="text-[9px] text-indigo-700 font-mono font-bold block uppercase tracking-wider">💾 Memory Route Archiver</span>
              
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
                  <span className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-wider block font-bold">Personal Archives ({customSavedRoutes.length}):</span>
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
          <div className="w-full bg-[var(--surface-blur)] backdrop-blur-md border border-[var(--border)] rounded-2xl p-2 flex items-center gap-2 shadow-2xl transition-all">
            {/* Custom browser-microphone voice input */}
            <button
              onClick={toggleListening}
              type="button"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-650 border-rose-600 text-white shadow-lg animate-pulse'
                  : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-indigo-600 hover:border-indigo-300'
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
                className="w-full bg-[var(--bg)] border border-[var(--border)] text-xs py-2.5 pl-3 pr-9 rounded-xl focus:outline-none focus:border-indigo-600 transition-all placeholder:text-[var(--text-muted)] disabled:opacity-50 text-[var(--text)] font-semibold"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white disabled:opacity-45 disabled:bg-transparent disabled:text-slate-500 transition-all cursor-pointer"
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
        className={`w-full lg:w-[420px] xl:w-[460px] shrink-0 border-l border-[var(--border)] bg-[var(--surface-blur)] flex flex-col h-full overflow-hidden relative ${
          mobileActiveTab === 'chat' || mobileActiveTab === 'itinerary' ? 'flex h-[calc(100vh-64px)]' : 'hidden lg:flex'
        }`}
      >
        <div className="bg-mesh-glow" />

        {/* Dual action Tabs defining Assistant vs Planner */}
        <div className="flex border-b border-[var(--border)] bg-[var(--surface2)]/40 backdrop-blur-sm p-3 gap-2 select-none z-10">
          <button
            onClick={() => { setActiveTab('ai'); setIsFormOpen(false); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border btn-tab cursor-pointer ${
              activeTab === 'ai'
                ? 'btn-tab-active border-indigo-500/50 text-indigo-800'
                : 'bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Genie Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border btn-tab cursor-pointer ${
              activeTab === 'planner'
                ? 'btn-tab-active border-indigo-500/50 text-indigo-800'
                : 'bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Planner Workspace</span>
          </button>
        </div>

        {/* REAL-TIME DYNAMIC METRICS OVERVIEW CARD */}
        {places.length > 0 && (
          <div className="px-4 pt-1 pb-3 border-b border-[var(--border)] bg-[var(--surface2)]/80 backdrop-blur-sm z-10 shrink-0">
            <ItineraryAnalytics places={filteredPlaces} />
          </div>
        )}

        {/* Custom Spot Curation Form (Add / Edit) - Repositioned outside as gorgeous overlay on mobile and sleek inline container */}
        {isFormOpen && (
          <div className="absolute inset-x-0 bottom-0 top-[60px] bg-[var(--surface-blur)] backdrop-blur-md border-t border-[var(--border)] p-4 space-y-4 shadow-2xl z-20 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 select-none">
              <h3 className="font-display font-bold text-xs text-[var(--text)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{editingPlace ? `Edit Spot: ${editingPlace.name}` : 'Add Spot from Scratch'}</span>
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
                <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">Spot Name *</label>
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
                  <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormCategory(newCat);
                      const suggestedEmoji = CATEGORY_EMOJIS[newCat];
                      if (suggestedEmoji) {
                        setFormEmoji(suggestedEmoji);
                      }
                    }}
                    className="w-full bg-[var(--bg)] text-xs p-2.5 rounded-lg border border-[var(--border)] focus:focus-border-indigo-500 focus:outline-none text-[var(--text)] font-sans"
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
                  <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">Icon Emoji</label>
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
                <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">Geocodable Address *</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="e.g. Kyoto Tower, Shimogyo Ward, Kyoto, Japan"
                  className="w-full bg-[var(--bg)] text-xs p-2.5 rounded-lg border border-[var(--border)] focus:border-indigo-600 focus:outline-none text-[var(--text)] font-sans"
                />
                <span className="text-[9px] text-[var(--text-muted)] font-mono mt-1 block leading-snug font-bold">We'll center this leaflet marker automatically using OSM Nominatim.</span>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Add outstanding details, highlights, or tips..."
                  rows={2}
                  className="w-full bg-[var(--bg)] text-xs p-2.5 rounded-lg border border-[var(--border)] focus:border-indigo-600 focus:outline-none text-[var(--text)] font-sans resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-bold">Personal Note / Recommendation Vibe</label>
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
        )}
        {/* Scrollable conversation timelines */}
        <div id="sidebar-logs" className="flex-1 overflow-y-auto p-4 space-y-4 z-10">

          {activeTab === 'ai' && (
            <>
              {/* Messages Loop */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-[var(--text-muted)] select-none font-bold">
                    <span>{msg.sender === 'user' ? 'You' : 'Genie Assistant'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed text-left ${
                      msg.sender === 'user'
                        ? 'bg-indigo-650 text-white rounded-tr-none shadow-md'
                        : 'bg-[var(--surface2)] text-[var(--text)] border border-[var(--border)] rounded-tl-none font-sans'
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
                    <span className="text-[11px] text-[var(--text-muted)] font-mono font-bold">Geocoding suggestions dynamically...</span>
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
                      const isGeocoded = place.latitude !== null && place.longitude !== null;

                      return (
                        <div
                          key={place.id}
                          onClick={() => handleCardClick(place)}
                          onMouseEnter={() => setHoveredPlaceId(place.id)}
                          onMouseLeave={() => setHoveredPlaceId(null)}
                          className={`group p-3 border rounded-xl cursor-pointer transition-all duration-300 text-left ${
                            isActive
                              ? 'border-indigo-600 bg-indigo-50/70 shadow-inner font-bold'
                              : isHovered
                              ? 'border-indigo-400 bg-indigo-50/30 scale-[1.01]'
                              : 'border-[var(--border)] bg-[var(--surface2)] hover:border-[var(--accent2)]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex gap-2">
                              <span className="text-xl pt-0.5 select-none">{place.emoji || '📍'}</span>
                              <div>
                                <h4 className="font-display font-semibold text-xs text-[var(--text)] group-hover:text-indigo-700 transition-colors">
                                  {place.name}
                                </h4>
                                <span className="inline-block mt-0.5 text-[8px] font-mono bg-[var(--bg)] border border-[var(--border)] px-1 py-0.5 rounded text-[var(--text-muted)] uppercase tracking-wider select-none font-bold">
                                  {CATEGORY_LABELS[place.category] || place.category}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 select-none" onClick={(e) => e.stopPropagation()}>
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
                              <span className="font-bold text-indigo-700">Match Vibe:</span> {place.whyMatch}
                            </div>
                          )}

                          <div className="mt-2 text-[9px] text-[var(--text-muted)] font-mono flex items-center gap-1 border-t border-[var(--border)] pt-1.5 select-none">
                            <MapPin className="w-3 border-none" />
                            <span className="truncate max-w-[340px]" title={place.address}>{place.address}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Starter triggers */}
              {places.length === 0 && !isLoading && (
                <div className="border border-[var(--border)] bg-[var(--surface2)]/50 p-4 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5 select-none font-bold">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-650" />
                    <span>Starter Search Spell Prompts:</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5 text-left">
                    {STARTER_PROMPTS.map((p) => (
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
          {activeTab === 'planner' && (
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
                    disabled={places.length === 0}
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
                              ? 'border-indigo-600 bg-indigo-50/70 shadow-inner font-bold'
                              : isHovered
                              ? 'border-indigo-400 bg-indigo-50/30 scale-[1.01]'
                              : 'border-[var(--border)] bg-[var(--surface2)] hover:border-[var(--accent2)]'
                          }`}
                        >
                          {/* Sequential Badge overlay */}
                          <div className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-indigo-100 border border-indigo-350 flex items-center justify-center text-[9px] font-mono font-bold text-indigo-800 select-none shadow-md">
                            {index + 1}
                          </div>

                          <div className="flex items-start justify-between gap-2 pl-2">
                            <div className="flex gap-2">
                              <span className="text-xl pt-0.5 select-none">{place.emoji || '📍'}</span>
                              <div>
                                <h4 className="font-display font-semibold text-xs text-[var(--text)] group-hover:text-indigo-700 transition-colors">
                                  {place.name}
                                </h4>
                                <span className="inline-block mt-0.5 text-[8px] font-mono bg-[var(--bg)] border border-[var(--border)] px-1 py-0.5 rounded text-[var(--text-muted)] uppercase tracking-wider select-none font-bold">
                                  {CATEGORY_LABELS[place.category] || place.category}
                                </span>
                              </div>
                            </div>

                            {/* Move index triggers */}
                            <div className="flex items-center gap-1 shrink-0 select-none" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => handleMovePlace(index, 'up', e)}
                                disabled={isFirst}
                                className="p-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-20 cursor-pointer transition-all"
                                title="Move Node Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleMovePlace(index, 'down', e)}
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
                              <span className="font-bold text-indigo-700">Match Vibe:</span> {place.whyMatch}
                            </div>
                          )}

                          <div className="mt-2 ml-2 text-[9px] text-[var(--text-muted)] font-mono flex items-center gap-1 border-t border-[var(--border)] pt-1.5 select-none">
                            <MapPin className="w-3 border-none" />
                            <span className="truncate max-w-[340px]" title={place.address}>{place.address}</span>
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
                    <h4 className="font-display font-bold text-xs text-[var(--text)]">Your Planner is Empty</h4>
                    <p className="mt-1 text-[11px] text-[var(--text-muted)] leading-relaxed max-w-[240px] mx-auto font-medium">
                      Build your sequence trip! Search with AI, or manually pin your personal favorite coordinates here.
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
                      onClick={() => setActiveTab('ai')}
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
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg animate-pulse'
                  : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-indigo-650'
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

      {/* 📱 MOBILE RESPONSIVE NAVIGATION BOTTOM TAB-BAR CONTROL PATTERN */}
      <nav
        id="mobile-bottom-navigation-bar"
        className="fixed bottom-0 inset-x-0 h-16 bg-[var(--surface-blur)] border-t border-[var(--border)] backdrop-blur-md flex items-center justify-around z-50 lg:hidden shadow-2xl select-none px-2 pb-1.5"
      >
        {/* Tab 1: Map View */}
        <button
          onClick={() => setMobileActiveTab('map')}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
            mobileActiveTab === 'map' ? 'text-indigo-800 bg-indigo-50/75 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Compass className="w-4 h-4 mb-1" />
          <span className="text-[10px]">🗺️ Canvas</span>
        </button>

        {/* Tab 2: Control layers/filters */}
        <button
          onClick={() => setMobileActiveTab('controls')}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer relative ${
            mobileActiveTab === 'controls' ? 'text-indigo-805 bg-indigo-50/75 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
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
            setMobileActiveTab('chat');
            setActiveTab('ai');
          }}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
            mobileActiveTab === 'chat' ? 'text-indigo-805 bg-indigo-50/75 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
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
            mobileActiveTab === 'itinerary' ? 'text-indigo-805 bg-indigo-50/75 font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Navigation className="w-4 h-4 mb-1" />
          <span className="text-[10px]">📅 Planner</span>
          {places.length > 0 && (
            <div className="absolute top-2 right-5 bg-indigo-650 text-white border border-transparent font-mono text-[8px] h-4 min-w-[16px] rounded-full flex items-center justify-center font-bold px-1 select-none shadow">
              {filteredPlaces.length}
            </div>
          )}
        </button>
      </nav>

    </div>
  );
}
