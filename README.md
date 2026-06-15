# 🧞‍♂️ Map-Genie
**Your AI-Powered Travel Sidekick**

Ever wish you could just talk to your map and have it instantly curate the perfect itinerary? Meet **Map-Genie**! 

Map-Genie is a lightning-fast, AI-powered place explorer that transforms your voice or text into a beautifully mapped visual guide. Whether you're hunting for *"the coziest coffee shops in Amsterdam"* or *"hidden temples near Kyoto"*, Map-Genie figures out exactly what you want and maps it for you locally in real-time.

---

## ✨ Why You'll Love It

- **🗣️ Just Speak Your Mind**: Tap the mic and tell Map-Genie what you're looking for! Our live-transcription handles the rest.
- **🧠 Brains by Google Gemini**: Map-Genie understands context. It doesn't just keyword-match; it interprets your vibe and finds the coolest, most relevant spots utilizing the `@google/genai` SDK.
- **🗺️ Interactive & Gorgeous**: Custom emoji markers drop beautifully onto a sleek, premium, light-themed CartoDB Positron map. Click any place card, hover to trigger glowing halos, toggle grid/route indicators, or view sequential route polylines as you edit.
- **💬 Chat to Map**: Thanks to our multi-turn history engine, you can refine your search without clearing the map. Ask for restaurants, then casually say *"What about parks nearby?"* and watch the magic happen.
- **📅 Visual Itinerary & Route Planner**: Switch to the Planner Workspace tab to build, reorder, and refine your travel route manually. Draw glowing indicator lines connecting each sequential spot.
- **🇺🇸 50 US States Curated Itineraries**: Load pre-defined, high-fidelity travel highlights for all 50 US States (featuring California upfront!) sequentially mapped with coordinates and custom suggestions in seconds.
- **💾 Save & Share**: Export your final compiled itinerary as a neat, downloadable JSON file with one click to keep your vacation plans handy!
- **🦸‍♂️ Self-Healing**: Network blipped? Gemini glitched? Don't sweat it. Map-Genie is armed with robust error guards and structured fallback handlers, so your experience stays butter-smooth.

---

## 🛠️ The Magic Under the Hood

We’ve pieced together an incredibly robust, full-stack architecture to keep things speedy, secure, and responsive:

| What it does | What powers it |
|---|---|
| **The Brains (AI)** | [Google Gemini](https://ai.google.dev/) via our native server-side API proxy |
| **The Engine (Backend)** | Custom standalone [Express](https://expressjs.com/) Server, Node.js + ESM `esbuild` pipeline |
| **The Visuals (Frontend)** | React 19, TypeScript, and [Tailwind CSS](https://tailwindcss.com/) utilities |
| **The Canvas (Map)** | [Leaflet.js](https://leafletjs.com/) layered over premium [CartoDB Positron](https://carto.com/basemaps/) Light map styles |
| **The Coordinates** | [Nominatim](https://nominatim.org/) OpenStreetMap Geocoding |
| **The Ears** | Native browser [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) |

---

## 🚀 Let's Get Started!

Want to take Map-Genie for a spin on your local machine? It takes less than two minutes!

### Step 1: Hook up your API Key
First, configure your environment variables.
```bash
# Copy the template to set up your environment variables
cp .env.example .env

# Open .env and paste your GEMINI_API_KEY inside!
```

### Step 2: Fire up the Engine
Install the modern npm toolbelt and spin up the full-stack development environment:
```bash
# Install dependencies
npm install

# Start the full-stack server (runs on port 3000)
npm run dev
```

### Step 3: Explore!
Open your favorite web browser and navigate directly to:
👉 **[http://localhost:3000](http://localhost:3000)**

*(Make sure your browser gives the site microphone permission if you want to use the voice features!)*

---

## 🧪 Testing the Magic

We love stable code! If you want to make sure the backend endpoint routing and Gemini schemas are behaving properly, just run:
```bash
npm run test
```
*You should see all our test validations glowing green!*

---

## 🧭 How Everything Fits Together

Curious about how we organized the project? It's intentionally structured and lightweight:

```text
map-genie/
├── server.ts                 # 🧠 The Express backend server & Gemini API link
├── src/
│   ├── App.tsx               # 🎨 Main application interface & controller
│   ├── main.tsx              # 🚀 Frontend client entrypoint
│   ├── index.css             # 💅 Global CSS & Tailwind imports
│   ├── types.ts              # 🛡️ Shared TypeScript domain models
│   └── components/
│       └── MapContainer.tsx  # 🗺️ Leaflet map, marker, and route polyline overlay setup
├── package.json              # 📦 Project manifest and commands
└── .env.example              # 🔐 Environment template
```

---

## 🩹 Quirks & Considerations

Software is organic, and Map-Genie has a few lovable quirks to keep in mind:

- **The "Lazy Pop" Effect**: Nominatim (our geocoding buddy) enforces a strict 1-request-per-second rate limit. To keep Map-Genie feeling fast, we instantly toss placeholder markers on the map the second Gemini answers. Over the next few seconds, you'll see them automatically "snap" to their true geographical street address in the background!
- **Browser Compatibility**: Voice search is powered by the native Web Speech API. It works flawlessly on Chrome, Safari (iOS 14.5+), and Edge! Sorry Firefox friends, voice isn't natively supported yet—but you can still type your heart out!

---

*Built with ❤️ for explorers and wanderers. Dive in, and happy travels!*
