/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Place, Message, MapLocation } from "./types";
import { geocodeAddress } from "./utils/geocoder";
import { US_STATES_DATA } from "./data/usStatesData";
import ControlPanel from "./components/ControlPanel";
import MapPanel from "./components/MapPanel";
import AssistantPanel from "./components/AssistantPanel";
import PlaceForm from "./components/PlaceForm";
import MobileNav from "./components/MobileNav";

const STARTER_PROMPTS = [
  { text: "Cozy coffee shops in Amsterdam", icon: "☕" },
  { text: "Hidden temples near Kyoto", icon: "🛕" },
  { text: "Scenic clifftop vistas near Mallorca", icon: "⛰️" },
  { text: "Art deco buildings in Miami", icon: "🌴" },
];

const CATEGORY_EMOJIS: Record<string, string> = {
  cafe: "☕",
  restaurant: "🍣",
  museum: "🖼️",
  temple: "⛩️",
  park: "🌳",
  "scenic-overlook": "🌄",
  historic: "🏰",
  custom: "📍",
};

const CATEGORY_LABELS: Record<string, string> = {
  cafe: "☕ Cafes",
  restaurant: "🍣 Dining",
  museum: "🖼️ Museums",
  temple: "⛩️ Temples",
  park: "🌳 Parks",
  "scenic-overlook": "🌄 Vistas",
  historic: "🏰 Historic",
  custom: "📍 Handcrafted",
};

const CATEGORY_CHIPS = [
  {
    id: "cafe",
    label: "Cafes",
    emoji: "☕",
    color:
      "text-indigo-700 bg-indigo-50 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100/60 font-medium",
  },
  {
    id: "restaurant",
    label: "Dining",
    emoji: "🍣",
    color:
      "text-rose-700 bg-rose-50 border-rose-200 hover:border-rose-400 hover:bg-rose-100/60 font-medium",
  },
  {
    id: "museum",
    label: "Museums",
    emoji: "🖼️",
    color:
      "text-purple-700 bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100/60 font-medium",
  },
  {
    id: "temple",
    label: "Temples",
    emoji: "⛩️",
    color:
      "text-amber-800 bg-amber-50 border-amber-200 hover:border-amber-400 hover:bg-amber-100/60 font-medium",
  },
  {
    id: "park",
    label: "Parks",
    emoji: "🌳",
    color:
      "text-emerald-800 bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/60 font-medium",
  },
  {
    id: "scenic-overlook",
    label: "Vistas",
    emoji: "🌄",
    color:
      "text-sky-700 bg-sky-50 border-sky-200 hover:border-sky-400 hover:bg-sky-100/60 font-medium",
  },
  {
    id: "historic",
    label: "Historic",
    emoji: "🏰",
    color:
      "text-yellow-800 bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-100/60 font-medium",
  },
  {
    id: "custom",
    label: "Custom Pins",
    emoji: "📍",
    color:
      "text-slate-800 bg-slate-100 border-slate-300 hover:border-slate-400 hover:bg-slate-200/60 font-medium",
  },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(
    null,
  );
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Layout states (3 Panels / 4 Mobile Tabs / Layers)
  const [activeTab, setActiveTab] = useState<"ai" | "planner">("ai");
  const [mobileActiveTab, setMobileActiveTab] = useState<
    "map" | "controls" | "chat" | "itinerary"
  >("map");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);

  // Map settings toggles
  const [showRouteLines, setShowRouteLines] = useState(true);
  const [showGridLines, setShowGridLines] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "cafe",
    "restaurant",
    "museum",
    "temple",
    "park",
    "scenic-overlook",
    "historic",
    "custom",
  ]);

  // Saved Routes state
  const [customSavedRoutes, setCustomSavedRoutes] = useState<
    Array<{ name: string; places: Place[]; centerLocation: MapLocation | null }>
  >([]);
  const [newRouteName, setNewRouteName] = useState("");

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCategory, setFormCategory] = useState("cafe");
  const [formEmoji, setFormEmoji] = useState("📍");
  const [formWhyMatch, setFormWhyMatch] = useState("");

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Initial State Persistence
  useEffect(() => {
    const savedMessages = localStorage.getItem("map_genie_messages");
    const savedPlaces = localStorage.getItem("map_genie_places");
    const savedLocation = localStorage.getItem("map_genie_location");
    const savedCustomRoutes = localStorage.getItem(
      "map_genie_custom_saved_routes",
    );

    if (savedCustomRoutes) {
      try {
        setCustomSavedRoutes(JSON.parse(savedCustomRoutes));
      } catch (_) {}
    }

    if (savedMessages && savedPlaces && savedLocation) {
      setMessages(JSON.parse(savedMessages));
      setPlaces(JSON.parse(savedPlaces));
      setCurrentLocation(JSON.parse(savedLocation));
    } else {
      // Welcome Intro
      const welcomeMsg: Message = {
        id: "welcome",
        sender: "assistant",
        text: "✨ Welcome to **Map Genie**! I'm your AI travel sidekick. Tell or speak to me who or what you are looking for—e.g., 'cozy coffee shops in Amsterdam' or 'jazz bars in Tokyo'. \n\nI will generate high-fidelity place cards and map markers on our dark map. You can continue chatting to refine these lists or add nearby highlights (like 'parks nearby' after 'restaurants') without starting over!",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        places: [],
      };
      setMessages([welcomeMsg]);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log(
            "Device Geolocation obtained successfully:",
            pos.coords.latitude,
            pos.coords.longitude,
          );
        },
        (err) =>
          console.log("Device Geolocation not available or rejected.", err),
      );
    }
  }, []);

  // 2. Persist State Changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("map_genie_messages", JSON.stringify(messages));
      localStorage.setItem("map_genie_places", JSON.stringify(places));
      if (currentLocation) {
        localStorage.setItem(
          "map_genie_location",
          JSON.stringify(currentLocation),
        );
      }
    }
  }, [messages, places, currentLocation]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === "ai") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, activeTab]);

  // 3. Setup Web Speech Recognition Hook
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

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
        setMicError(
          "Microphone error occurred. Try speaking clearly or type instead.",
        );
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
      setMicError(
        "Speech recognition is not fully supported in this browser. Try Google Chrome or Safari.",
      );
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
    localStorage.removeItem("map_genie_messages");
    localStorage.removeItem("map_genie_places");
    localStorage.removeItem("map_genie_location");
    setPlaces([]);
    setCurrentLocation(null);
    setActivePlaceId(null);
    setMessages([
      {
        id: "welcome-reset",
        sender: "assistant",
        text: "💼 Map Genie has been reset. Type or speak your next dream itinerary above!",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        places: [],
      },
    ]);
  };

  // Open Form to Add a Spot from Scratch
  const openAddForm = () => {
    setEditingPlace(null);
    setFormName("");
    setFormDescription("");
    setFormAddress("");
    setFormCategory("cafe");
    setFormEmoji("📍");
    setFormWhyMatch("Custom hand-made itinerary spot");
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
    setFormWhyMatch(place.whyMatch || "");
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
      geocodingStatus: "loading",
      category: formCategory,
    };

    let updatedPlacesList: Place[] = [];
    if (isEdit) {
      updatedPlacesList = places.map((p) => (p.id === targetId ? newPlace : p));
    } else {
      updatedPlacesList = [...places, newPlace];
    }

    setPlaces(updatedPlacesList);
    setIsFormOpen(false);
    setActiveTab("planner");

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
                  longitude: coords.lng,
                });
              }
              return {
                ...item,
                latitude: coords.lat,
                longitude: coords.lng,
                geocodingStatus: "success",
              };
            } else {
              return {
                ...item,
                latitude: item.latitude
                  ? item.latitude + (Math.random() - 0.5) * 0.01
                  : null,
                longitude: item.longitude
                  ? item.longitude + (Math.random() - 0.5) * 0.01
                  : null,
                geocodingStatus: "error",
              };
            }
          }
          return item;
        }),
      );
    } catch (err) {
      console.error("Geocoding failed for manual custom spot address:", err);
    }
  };

  // Delete Place
  const handleDeletePlace = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updatedList = places.filter((p) => p.id !== id);
    setPlaces(updatedList);
    if (activePlaceId === id) {
      setActivePlaceId(null);
    }
  };

  // Swap Order of Places
  const handleMovePlace = (
    index: number,
    direction: "up" | "down",
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === places.length - 1) return;

    const newList = [...places];
    const swapTargetIndex = direction === "up" ? index - 1 : index + 1;
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
        sender: "assistant",
        text: "🆕 **New Custom Itinerary Initiated from Scratch!**\n\nUse the form below to pin and custom-build your personal travel locations manually, or switch back to the AI chat whenever you need on-the-fly suggestions in seconds.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        places: [],
      },
    ]);
    setActiveTab("planner");
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
      places: places.map(
        ({
          id,
          name,
          description,
          category,
          emoji,
          address,
          latitude,
          longitude,
          whyMatch,
        }) => ({
          id,
          name,
          description,
          category,
          emoji,
          address,
          latitude,
          longitude,
          whyMatch,
        }),
      ),
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2),
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    const fileName = `map-genie-itinerary-${currentLocation?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "trip"}.json`;
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Load US State Preset on map and planner
  const handleLoadStatePreset = (stateName: string) => {
    if (!stateName) return;
    const selected = US_STATES_DATA.find((s) => s.name === stateName);
    if (!selected) return;

    // Load places
    setPlaces(selected.spots);

    // Set map focus
    setCurrentLocation({
      name: `${selected.name} (${selected.capital})`,
      latitude: selected.centroid.latitude,
      longitude: selected.centroid.longitude,
    });

    if (selected.spots.length > 0) {
      setActivePlaceId(selected.spots[0].id);
    }

    // Set a matching narrative in conversation to introduce the loaded itinerary
    const presetMsg: Message = {
      id: `state-preset-${Date.now()}`,
      sender: "assistant",
      text: `🇺🇸 Loaded curated travel itinerary spots for **${selected.name}**! I have plotted **${selected.spots.length} major spots** (connected sequentially via pathways on the map). \n\nYou can use the **Planner Workspace** tab to rearrange, add custom spots, or export them into a JSON file anytime. Happy travels!`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      places: selected.spots,
    };

    setMessages((prev) => [...prev, presetMsg]);
  };

  // Custom Saved Route capabilities
  const handleSaveCurrentRoute = () => {
    if (!newRouteName.trim() || places.length === 0) return;

    const newSavedItem = {
      name: newRouteName.trim(),
      places: [...places],
      centerLocation: currentLocation,
    };

    const updated = [...customSavedRoutes, newSavedItem];
    setCustomSavedRoutes(updated);
    localStorage.setItem(
      "map_genie_custom_saved_routes",
      JSON.stringify(updated),
    );
    setNewRouteName("");
  };

  const handleDeleteSavedRoute = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customSavedRoutes.filter((_, i) => i !== index);
    setCustomSavedRoutes(updated);
    localStorage.setItem(
      "map_genie_custom_saved_routes",
      JSON.stringify(updated),
    );
  };

  const handleLoadSavedRoute = (route: (typeof customSavedRoutes)[0]) => {
    setPlaces(route.places);
    setCurrentLocation(route.centerLocation);
    if (route.places.length > 0) {
      setActivePlaceId(route.places[0].id);
    }
    const loadMsg: Message = {
      id: `saved-load-${Date.now()}`,
      sender: "assistant",
      text: `📁 Recalled your personal saved route **"${route.name}"** successfully! Loaded **${route.places.length} travel nodes** sequentially on your canvas.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, loadMsg]);
    setMobileActiveTab("map");
  };

  // 4. Submit Chat and Handle Progressive Geocoding
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText ?? inputMessage;
    if (!textToSend.trim() || isLoading) return;

    // A. Append user message
    const userMsgId = `usr-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Switch to assistant chat tab
    setActiveTab("ai");
    setMobileActiveTab("chat");

    try {
      // B. Post to Gemini backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          currentLocation: currentLocation,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(
          errJson.error ?? `Backend returned status ${response.status}`,
        );
      }

      const responseData = await response.json();
      const { resolvedLocation, aiResponseText, spots } = responseData;

      const newCityLocation: MapLocation = {
        name: resolvedLocation.name,
        latitude: resolvedLocation.latitude,
        longitude: resolvedLocation.longitude,
      };

      // Set fallback map center and user locations instantly
      setCurrentLocation(newCityLocation);

      // C. Model new generated spots with a 'loading' geocodingStatus
      const formattedSpots: Place[] = (spots || []).map(
        (spot: any, idx: number) => ({
          id: `spot-${Date.now()}-${idx}`,
          name: spot.name,
          description: spot.description,
          whyMatch: spot.whyMatch,
          emoji: spot.emoji,
          address: spot.address,
          // Centroid coordinates act as placeholders instantly on map
          latitude: newCityLocation.latitude,
          longitude: newCityLocation.longitude,
          geocodingStatus: "loading",
          category: spot.category,
        }),
      );

      // Update places to clear previous unless user is doing refinements
      const isRefinementPrompt =
        textToSend.toLowerCase().includes("nearby") ||
        textToSend.toLowerCase().includes("after") ||
        textToSend.toLowerCase().includes("parks") ||
        textToSend.toLowerCase().includes("and also") ||
        textToSend.toLowerCase().includes("refine");

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
        sender: "assistant",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        places: formattedSpots,
        location: newCityLocation,
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
                  geocodingStatus: "success",
                };
              } else {
                return {
                  ...item,
                  // If geocoding failed, scatter coordinates slightly around centroid for placeholder display
                  latitude: item.latitude
                    ? item.latitude + (Math.random() - 0.5) * 0.015
                    : null,
                  longitude: item.longitude
                    ? item.longitude + (Math.random() - 0.5) * 0.015
                    : null,
                  geocodingStatus: "error",
                };
              }
            }
            return item;
          }),
        );
      });
    } catch (err: any) {
      console.error("Failed loading Map Genie travel spots:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: `🚨 **Map Connection Failed**: ${err.message || "An unexpected error occurred."}\n\nCould not query Gemini Flash successfully. Please try again!`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
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
        longitude: place.longitude,
      });
    }
  };

  // Filter places based on active category chips
  const filteredPlaces = places.filter((place) =>
    selectedCategories.includes(place.category || "custom"),
  );

  const toggleCategoryFilter = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleSelectAllFilters = () => {
    setSelectedCategories([
      "cafe",
      "restaurant",
      "museum",
      "temple",
      "park",
      "scenic-overlook",
      "historic",
      "custom",
    ]);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] font-sans relative">
      <ControlPanel
        mobileActiveTab={mobileActiveTab}
        resetSession={resetSession}
        showRouteLines={showRouteLines}
        setShowRouteLines={setShowRouteLines}
        showGridLines={showGridLines}
        setShowGridLines={setShowGridLines}
        handleSelectAllFilters={handleSelectAllFilters}
        handleClearFilters={handleClearFilters}
        selectedCategories={selectedCategories}
        toggleCategoryFilter={toggleCategoryFilter}
        categoryChips={CATEGORY_CHIPS}
        handleLoadStatePreset={handleLoadStatePreset}
        newRouteName={newRouteName}
        setNewRouteName={setNewRouteName}
        places={places}
        handleSaveCurrentRoute={handleSaveCurrentRoute}
        customSavedRoutes={customSavedRoutes}
        handleLoadSavedRoute={handleLoadSavedRoute}
        handleDeleteSavedRoute={handleDeleteSavedRoute}
      />

      <MapPanel
        mobileActiveTab={mobileActiveTab}
        filteredPlaces={filteredPlaces}
        activePlaceId={activePlaceId}
        hoveredPlaceId={hoveredPlaceId}
        handleCardClick={handleCardClick}
        setHoveredPlaceId={setHoveredPlaceId}
        currentLocation={currentLocation}
        showRouteLines={showRouteLines}
        showGridLines={showGridLines}
        toggleListening={toggleListening}
        isListening={isListening}
        isLoading={isLoading}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
      />

      <AssistantPanel
        mobileActiveTab={mobileActiveTab}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsFormOpen={setIsFormOpen}
        filteredPlaces={filteredPlaces}
        messages={messages}
        isLoading={isLoading}
        activePlaceId={activePlaceId}
        hoveredPlaceId={hoveredPlaceId}
        setHoveredPlaceId={setHoveredPlaceId}
        handleCardClick={handleCardClick}
        openEditForm={openEditForm}
        handleDeletePlace={handleDeletePlace}
        handleSendMessage={handleSendMessage}
        starterPrompts={STARTER_PROMPTS}
        categoryLabels={CATEGORY_LABELS}
        openAddForm={openAddForm}
        handleExportItinerary={handleExportItinerary}
        handleCreateFromScratch={handleCreateFromScratch}
        handleMovePlace={handleMovePlace}
        chatBottomRef={chatBottomRef}
        micError={micError}
        toggleListening={toggleListening}
        isListening={isListening}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
      />

      {isFormOpen && (
        <PlaceForm
          editingPlace={editingPlace}
          formName={formName}
          setFormName={setFormName}
          formDescription={formDescription}
          setFormDescription={setFormDescription}
          formAddress={formAddress}
          setFormAddress={setFormAddress}
          formCategory={formCategory}
          setFormCategory={setFormCategory}
          formEmoji={formEmoji}
          setFormEmoji={setFormEmoji}
          formWhyMatch={formWhyMatch}
          setFormWhyMatch={setFormWhyMatch}
          setIsFormOpen={setIsFormOpen}
          handleSaveCustomPlace={handleSaveCustomPlace}
          categoryEmojis={CATEGORY_EMOJIS}
        />
      )}

      <MobileNav
        mobileActiveTab={mobileActiveTab}
        setMobileActiveTab={setMobileActiveTab}
        setActiveTab={setActiveTab}
        selectedCategories={selectedCategories}
        filteredPlacesCount={filteredPlaces.length}
      />
    </div>
  );
}
