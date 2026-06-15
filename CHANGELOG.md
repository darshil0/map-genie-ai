# 📜 Changelog

All notable changes and functional updates to the **Map Genie** codebase are documented below.

---

## [1.5.0] - 2026-06-07 (Mobile Sidebar & Curation Form Polish)

### ✨ Added
- **Dynamic Mobile Height Adapter**:
  - Engineered smooth, state-driven sidebar transitions. The sidebar expands automatically from `50vh` to a generous `75vh` on mobile viewports on action triggering, keeping the viewport adaptive.
- **Glassmorphic Overlay Lock-in Form**:
  - Repositioned the Curation Form outside of the log flow to act as a focus-lock overlay viewport starting below the brand header on mobile devices.
  - Keeps the form fully visible and scrollable independently of background content, preventing any input fields or submit buttons from being cut off.
- **Form Density Polish**:
  - Upgraded spacings, font paddings, and outline focus elements to offer clean target touch bounds (44px) complying with our mobile spacing principles.

---

## [1.4.0] - 2026-06-07 (Live Weather Integration)

### ✨ Added
- **Real-Time Meteorological Sync Engine**:
  - Engineered a fully responsive, stateful `WeatherWidget` connected to Open-Meteo's global forecast API.
  - Implements coordinates trackers to instantly request high-contrast ambient conditions (temperature, wind speeds, humidity indices, and apparent temperatures) on location shifts.
- **Micro-Climate Theming & Atmosphere Design**:
  - Programmed condition code interpreters displaying appropriate custom animators and colorful glowing halo overlays (e.g., rotating Sun controls, pulsing bolts for thunderstorm alerts).
  - Designed an instantaneous toggle button to switch smoothly between Fahrenheit and Celsius displays.
- **Map Canopy Alignment**:
  - Embedded the glassmorphic climate capsule directly into the map viewport alongside the existing location context overlays.

---

## [1.3.0] - 2026-06-07 (US States Expansion)

### ✨ Added
- **50 US States Curated Itinerary Engine**:
  - Structured and integrated a high-fidelity, comprehensive preset dataset for all **50 states of the USA**.
  - Decorated each state's itinerary with 2 to 3 world-famous highlight locations complete with exact coordinates, realistic addresses, human-crafted descriptions, custom emojis, and matched travel categories.
- **US State Preset Selector Interface**:
  - Structured an elegant interactive dashboard select drawer directly beneath the dynamic navigation tabs.
  - Implemented a featured fast-load action for **California 🌴** as a first-class highlight button, with an adjacent dropdown for the **other 49 states**.
  - Wired triggers so selecting any state instantly updates the active itinerary, repositions the map focus to the state's centroid capital with visual polyline path connectors, and posts a customized welcoming assistant guide in the stream.

---

## [1.2.0] - 2026-06-07 (Recent Updates)

### ✨ Added
- **Interactive Planner View ("Create from Scratch")**:
  - Introduced the **Planner Workspace** tab to design independent trips completely from scratch.
  - Implemented an add/edit form featuring customizable category selectors with automated matched emoji defaults (e.g., Cafe ☕, Park 🌳).
  - Integrated standard **OSM Nominatim Geocoding** as an offline-fallback trigger to retrieve map latitude and longitude from raw addresses dynamically.
  - Designed sorting triggers so users can customize lists with sequentials indicators and simple Up/Down sorting arrows.
  
- **Itinerary JSON Exporter**:
  - Added a high-fidelity downloadable JSON traveler-export action allowing users to save, back-up, and distribute custom itineraries on-demand.
  - Configured descriptive, contextual file naming based on the active focal location name automatically.

- **Dynamic Interactive Route Linking Paths**:
  - Implemented dynamic, high-fidelity Leaflet route polylines that connect places sequentially matching the accurate travel plan sequence.
  - Added a double-rendered path layout consisting of a broad translucent cyan/indigo base underlay simulating glowing neon and a lively dashed core indicator that shifts visually as places are manually reordered.
  
- **Dual-Sided Hover Lighting**:
  - Implemented high-fidelity glowing halos and scale transitions (scale-120) surrounding map markers.
  - Synced hover-triggers seamlessly so placing the mouse over any itinerary card in the Chat or Planner view lights up the correct pin.
  - Bound mouse callbacks through persistent React Ref blocks to bypass Leaflet closure traps and prevent lag.

### 🔄 Changed
- **Adaptive Map Zoom & Auto-Fitted Bounds**:
  - Updated map rendering logic to automatically fit bounds (`fitBounds`) whenever the lists of active locations changes.
  - Integrated a sorted indexing key to guarantee bounding updates are order-invariant, avoiding map jitter during reordering operations.
  - Automatically centered on newly added manual spots.

### 🛡️ Fixed & Hardened (Stability Phase)
- Binned component variables into decoupled state files and React Refs to protect event handlers from closure errors.
- Handled empty state conditions gracefully with dedicated quick-start buttons and helpful system instructions.
- Repaired chat view performance by auto-scrolling to the latest assistant responses purely inside the AI chat frame context.

---

## [1.1.0] - Prior Updates

- Initial implementation of the Gemini API chat sidekick client-proxy interface.
- Configured audio inputs and speech commands based on the standard browser SpeechRecognition interface.
- Added Leaflet map container using safe dark slate layers.
