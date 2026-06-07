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
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans relative">
      
      {/* 🔴 COLUMN 1: LEFT PANEL (Map Customization, POI Category Layer Filters & Saved Routes) */}
      <aside
        id="left-control-panel-column"
        className={`w-full lg:w-[280px] xl:w-[320px] shrink-0 border-r border-slate-900 bg-slate-950 flex flex-col h-full overflow-hidden transition-all duration-300 relative ${
          mobileActiveTab === 'controls' ? 'flex h-[calc(100vh-64px)]' : 'hidden lg:flex'
        }`}
      >
        <div className="bg-mesh-glow" />
        
        {/* Panel 1 Branding Header */}
        <header className="p-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-10 select-none">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-800 flex items-center justify-center shadow-md">
              <Layers className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <h2 className="font-display font-medium text-sm text-white leading-none tracking-tight">Genie Control</h2>
              <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-semibold mt-0.5 block">Layers &amp; Memory</span>
            </div>
          </div>
          
          <button
            onClick={resetSession}
            title="Reset current session dialog & spots"
            className="p-1 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* Scrollable controls configuration body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 z-10 text-left">
          
          {/* Visual Canvas Layers */}
          <section className="space-y-2.5">
            <h3 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold select-none">
              🌐 Map Spatial Layers
            </h3>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-855 space-y-2.5">
              
              {/* Route Pathway checkbox */}
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-linear select-none">
                <input
                  type="checkbox"
                  checked={showRouteLines}
                  onChange={(e) => setShowRouteLines(e.target.checked)}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:outline-none h-4 w-4 bg-slate-950 cursor-pointer"
                />
                <span className="font-medium">Connect Path Sequences</span>
              </label>

              {/* Grid outline checkbox */}
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-linear select-none">
                <input
                  type="checkbox"
                  checked={showGridLines}
                  onChange={(e) => setShowGridLines(e.target.checked)}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:outline-none h-4 w-4 bg-slate-950 cursor-pointer"
                />
                <span className="font-medium">Symmetric Science Grid</span>
              </label>
            </div>
          </section>

          {/* Interactive Category Filter chips */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between select-none">
              <h3 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold text-left">
                📍 POI Semantic Filters
              </h3>
              <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-500 font-mono">
                <button onClick={handleSelectAllFilters} className="hover:text-indigo-400 transition-colors">Select All</button>
                <span>|</span>
                <button onClick={handleClearFilters} className="hover:text-amber-500 transition-colors">Clear</button>
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
                        : 'bg-slate-900/10 border-transparent text-slate-500'
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
            <h3 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold select-none">
              📁 Travel Route Storage
            </h3>

            {/* Quick preset selector */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/30 border border-slate-900">
              <span className="text-[9px] text-slate-400 font-mono font-bold block">🇺🇸 Load Predefined State Itinerary:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleLoadStatePreset("California")}
                  className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 rounded-lg text-[10px] font-bold text-indigo-100 hover:text-white transition-all shrink-0 cursor-pointer"
                >
                  🌴 California Route
                </button>
                <select
                  value=""
                  onChange={(e) => { e.target.value && handleLoadStatePreset(e.target.value); }}
                  className="flex-1 bg-slate-950 text-[10px] p-1.5 rounded-lg border border-slate-800 text-slate-300 font-sans cursor-pointer focus:outline-none focus:border-indigo-500"
                >
                  <option value="" disabled>Other State Preset...</option>
                  {US_STATES_DATA.filter(s => s.name !== "California").map((s) => (
                    <option key={s.name} value={s.name} className="bg-slate-950 text-slate-300">
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* User save control module */}
            <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-2">
              <span className="text-[9px] text-indigo-300 font-mono font-bold block uppercase tracking-wider">💾 Memory Route Archiver</span>
              
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder="e.g. My Kyoto Sakura Trip..."
                  disabled={places.length === 0}
                  className="w-full bg-slate-950 text-xs p-2 rounded-lg border border-slate-800 text-white font-sans focus:outline-none focus:border-indigo-500 disabled:opacity-40"
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
                <div className="pt-2 border-t border-slate-800 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block font-bold">Personal Archives ({customSavedRoutes.length}):</span>
                  {customSavedRoutes.map((route, i) => (
                    <div
                      key={i}
                      onClick={() => handleLoadSavedRoute(route)}
                      className="group flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-900 hover:border-indigo-500/50 cursor-pointer transition-all"
                    >
                      <span className="text-[11px] text-slate-300 group-hover:text-indigo-200 font-medium truncate select-none">
                        📅 {route.name}
                      </span>
                      <button
                        onClick={(e) => handleDeleteSavedRoute(i, e)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 cursor-pointer transition-colors"
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

        {/* Custom Spot Curation Form (Add / Edit) - Repositioned outside as gorgeous overlay on mobile and sleek inline container */}
        {isFormOpen && (
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
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Spot Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. My Secret Courtyard Tea"
                  className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Category</label>
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
                    className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:focus-border-indigo-500 focus:outline-none text-white font-sans"
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
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Icon Emoji</label>
                  <input
                    type="text"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    placeholder="e.g. 🏮"
                    maxLength={4}
                    className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none text-white text-center font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Geocodable Address *</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="e.g. Kyoto Tower, Shimogyo Ward, Kyoto, Japan"
                  className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none text-white font-sans"
                />
                <span className="text-[9px] text-slate-500 font-mono mt-1 block leading-snug">We'll center this leaflet marker automatically using OSM Nominatim.</span>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Add outstanding details, highlights, or tips..."
                  rows={2}
                  className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none text-white font-sans resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Personal Note / Recommendation Vibe</label>
                <input
                  type="text"
                  value={formWhyMatch}
                  onChange={(e) => setFormWhyMatch(e.target.value)}
                  placeholder="Why this spot belongs in your journey"
                  className="w-full bg-slate-950 text-xs p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none text-white font-sans"
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
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Scrollable conversation timelines */}
        <div id="sidebar-logs" className="flex-1 overflow-y-auto p-4 space-y-4 z-10">

          {/* TAB A: AI CHAT SIDEKICK */}
          {activeTab === 'ai' && (
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
                                  {CATEGORY_LABELS[place.category] || place.category}
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
              {places.length === 0 && !isLoading && (
                <div className="border border-slate-900 bg-slate-950/20 p-4 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none font-bold">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Starter Search Spell Prompts:</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5 text-left">
                    {STARTER_PROMPTS.map((p) => (
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
          )}

          {/* TAB B: PLANNER WORKSPACE SEQUENCE */}
          {activeTab === 'planner' && (
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
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border border-slate-850 bg-slate-900/60 hover:bg-slate-900 hover:border-rose-500/40 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
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
                                  {CATEGORY_LABELS[place.category] || place.category}
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
