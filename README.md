# 🧞‍♂️ Map-Genie
**Your AI-Powered Travel Sidekick**

Ever wish you could just talk to your map and have it instantly curate the perfect itinerary? Meet **Map-Genie**! 

Map-Genie is a lightning-fast, AI-powered place explorer that transforms your voice or text into a beautifully mapped visual guide. Whether you're hunting for *"the coziest coffee shops in Amsterdam"* or *"hidden temples near Kyoto"*, Map-Genie interprets your intent and maps exactly what you want with live geocoding.

---

## ✨ Why You'll Love It

- **🗣️ Just Speak Your Mind**: Tap the mic and tell Map-Genie what you're looking for. Native Web Speech API handles live transcription with real-time feedback.
- **🧠 Brains by Google Gemini**: Map-Genie understands context and intent. It interprets your vibe and finds the most relevant spots using the Google Gemini API via server-side proxy.
- **🗺️ Interactive & Gorgeous**: Custom emoji markers render beautifully onto a premium CartoDB Positron light-themed basemap. Click place cards, hover for halos, toggle grid/route indicators, and view sequential route polylines as you edit.
- **💬 Chat to Map**: Multi-turn conversation history lets you refine searches without clearing the map. Ask for restaurants, then casually say *"What about parks nearby?"* and watch the magic happen.
- **📅 Visual Itinerary & Route Planner**: Switch to the Planner Workspace tab to build, reorder, and manually refine your travel route. Sequential routes are visualized with glowing polylines connecting each stop.
- **🇺🇸 50 US States Curated Itineraries**: Load pre-defined, high-fidelity travel highlights for all 50 US States (California pre-loaded as default) sequentially mapped with geocoded coordinates.
- **💾 Save & Share**: Export your final itinerary as a downloadable JSON file with one click for offline access and sharing.
- **🦸‍♂️ Resilient Error Handling**: Network timeouts, API rate limits, and geocoding failures trigger graceful fallbacks with user-friendly error messages (see [Error Handling](#error-handling-matrix) for details).

---

## 🛠️ The Magic Under the Hood

A production-grade, full-stack architecture built for speed, reliability, and maintainability:

| Layer | Technology |
|---|---|
| **AI & LLM** | [Google Gemini 1.5 Flash](https://ai.google.dev/) via server-side API proxy (rate limit: 15 requests/minute) |
| **Backend** | Node.js + [Express.js](https://expressjs.com/) with ESM modules via `esbuild` |
| **Frontend** | React 19, TypeScript 5.x, [Tailwind CSS](https://tailwindcss.com/) utilities |
| **Mapping** | [Leaflet.js](https://leafletjs.com/) with [CartoDB Positron](https://carto.com/basemaps/) basemap |
| **Geocoding** | [Nominatim OpenStreetMap](https://nominatim.org/) (rate limit: 1 req/sec) |
| **Voice Input** | Native [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (browser-dependent) |

---

## 📋 System Requirements

- **Node.js**: 18.x or higher (LTS recommended)
- **npm**: 9.x or higher
- **Disk Space**: ~500 MB (node_modules) + build artifacts
- **Internet**: Required for Gemini API, Nominatim, and CartoDB basemap tiles
- **Browser**: See [Browser Compatibility](#browser-compatibility-matrix) section

---

## 🚀 Quick Start (5–7 Minutes)

### Step 1: Clone & Install
```bash
# Clone the repository
git clone https://github.com/yourusername/map-genie.git
cd map-genie

# Install dependencies
npm install
```

**Expected output**: All packages installed with no peer dependency warnings. If you see `npm WARN` messages about optional dependencies, these are non-critical.

### Step 2: Configure Environment Variables
```bash
# Copy the template
cp .env.example .env

# Edit .env and add your Gemini API key
# See .env.example for all available options
```

**Your `.env` file should contain:**
```env
# Required: Google Gemini API key
# Get it from: https://ai.google.dev/
GEMINI_API_KEY=your_actual_key_here_not_placeholder

# Optional: Backend port (default: 3000)
PORT=3000

# Optional: Node environment (default: development)
NODE_ENV=development

# Optional: Nominatim base URL (default: https://nominatim.openstreetmap.org)
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org

# Optional: Default map center coordinates (default: San Francisco)
DEFAULT_LAT=37.7749
DEFAULT_LNG=-122.4194
DEFAULT_ZOOM=12
```

### Step 3: Start Development Server
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in 245 ms

  ➜  Local:   http://localhost:3000
  ➜  press h + enter to show help
```

### Step 4: Open in Browser
Navigate to **[http://localhost:3000](http://localhost:3000)** in a supported browser (see [Browser Compatibility](#browser-compatibility-matrix)).

**⚠️ Important**: If you use voice search, your browser will request microphone permission. Grant it to enable speech input.

---

## 🧪 Testing & Validation

### Run Full Test Suite
```bash
npm run test
```

This executes all unit, integration, and endpoint tests. Expected runtime: 15–30 seconds.

### What's Tested

| Category | Coverage | Details |
|---|---|---|
| **API Endpoints** | ✅ Full | Gemini proxy routing, error responses, rate limit handling |
| **Geocoding** | ✅ Full | Nominatim integration, coordinate validation, fallback behavior |
| **Data Models** | ✅ Full | TypeScript type validation, input sanitization, schema compliance |
| **Frontend Components** | ✅ Partial | Map rendering, marker placement, UI interactions (see Known Gaps below) |
| **E2E Workflows** | ⚠️ Manual | Voice input, multi-turn chat flow, itinerary export (requires browser automation) |

### Known Testing Gaps

- **Voice input**: Web Speech API is not headless-testable. Validate via manual testing on target browsers.
- **Map rendering**: Leaflet tile loading is DOM-dependent. Unit tests validate logic; visual QA is manual.
- **Rate limit recovery**: Requires live API calls to reproduce. See [Error Handling](#error-handling-matrix) for expected behavior.

### Writing Custom Tests

Add test files to `src/__tests__/` following the naming convention `*.test.ts`:

```typescript
// Example: src/__tests__/mapLogic.test.ts
import { describe, it, expect } from 'vitest';
import { validateCoordinates } from '../utils/geo';

describe('validateCoordinates', () => {
  it('should accept valid lat/lng pairs', () => {
    expect(validateCoordinates(40.7128, -74.0060)).toBe(true);
  });

  it('should reject out-of-range values', () => {
    expect(validateCoordinates(91, 0)).toBe(false);
  });
});
```

Run a specific test file:
```bash
npm run test -- src/__tests__/mapLogic.test.ts
```

---

## 🌐 Browser Compatibility Matrix

| Browser | Version | Voice Input | Leaflet Maps | Status |
|---|---|---|---|---|
| **Chrome / Chromium** | 90+ | ✅ Yes | ✅ Yes | ✅ Fully Supported |
| **Safari** | 14.5+ | ✅ Yes (iOS 14.5+) | ✅ Yes | ✅ Fully Supported |
| **Edge** | 90+ | ✅ Yes | ✅ Yes | ✅ Fully Supported |
| **Firefox** | 88+ | ❌ No | ✅ Yes | ⚠️ Partial (text input only) |
| **Opera** | 76+ | ✅ Yes | ✅ Yes | ✅ Fully Supported |
| **Internet Explorer 11** | All | ❌ | ❌ | ❌ Unsupported |

**Note**: Firefox does not support the Web Speech API. Users can still type queries but cannot use the microphone button. Consider adding a banner notification on Firefox.

---

## ⚠️ Error Handling Matrix

Map-Genie implements graceful degradation for all critical failure modes. Here's what happens when things go wrong:

### Gemini API Errors

| Error | Status Code | User Message | Recovery |
|---|---|---|---|
| Invalid API key | 401 | "API configuration error. Check your credentials." | Prompts user to verify `.env` configuration; offers docs link |
| Rate limit exceeded | 429 | "Too many requests. Please wait 60 seconds and try again." | Implements exponential backoff (1s, 2s, 4s, 8s) with retry UI |
| Network timeout | — | "Connection lost. Retrying in 5 seconds..." | Automatic retry up to 3 times; manual refresh available |
| Malformed response | 500 | "Unexpected response format. Please try again." | Falls back to empty results; logs error for debugging |
| API quota exceeded | 429 | "Daily limit reached. Available again tomorrow." | Disables search; directs to billing dashboard |

### Nominatim Geocoding Errors

| Error | User Message | Recovery |
|---|---|---|
| Coordinate not found | Marker shows as "pending" (striped pattern) | Placeholder placed immediately; snaps to address when resolved |
| Rate limit (1 req/sec) | None (silent queuing) | Implements request queue with 1-second delays between calls |
| Network timeout | Address field shows "?" | Retries once; falls back to coordinates display |

### Map Rendering Errors

| Error | User Message | Recovery |
|---|---|---|
| Tile service unavailable | Map shows gray grid; layers still clickable | Automatically retries tile loading every 10 seconds |
| Invalid GeoJSON | No polyline displayed; itinerary still editable | Validates JSON before rendering; logs details to console |

### Validation Errors

| Scenario | Validation | Behavior |
|---|---|---|
| Empty search query | Required field | Button disabled until text entered |
| Invalid coordinates | Lat/Lng range check | Prevents export; shows inline error |
| Duplicate POIs | Exact match on (lat, lng, name) | Silently skips duplicate; shows count badge |

---

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```
Starts a local dev server with hot module reloading on `http://localhost:3000`.

### Production Build
```bash
npm run build
```

This generates optimized, minified bundles:
- **Frontend**: `dist/` (Vite build output with code splitting)
- **Backend**: `dist/server.js` (ESM bundle)

**Build time**: 30–45 seconds on typical hardware.
**Output size**: ~2.5 MB (uncompressed); ~600 KB (gzipped).

### Run Production Build Locally
```bash
npm run build
npm run start
```

The app runs on `http://localhost:3000` with production optimizations.

### Deploy to Cloud

#### **Vercel** (Recommended for Full-Stack)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables via Vercel dashboard
# Add GEMINI_API_KEY to project settings
```

#### **Heroku**
```bash
# Create Procfile
echo "web: node dist/server.js" > Procfile

# Deploy
heroku create your-app-name
heroku config:set GEMINI_API_KEY=your_key
git push heroku main
```

#### **Docker**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
```

---

## 🔐 Security Best Practices

### API Key Management

1. **Never commit `.env`** — Add to `.gitignore`:
   ```
   .env
   .env.local
   .env.*.local
   ```

2. **Use environment variables** — Always inject `GEMINI_API_KEY` at runtime, never hardcode.

3. **Rotate keys regularly** — Regenerate API keys monthly or after suspected exposure.

4. **Restrict API scope** — Use Google Cloud's API restrictions to limit your Gemini key to Maps/Search APIs only.

### Input Sanitization

- All user queries are validated before sending to Gemini.
- Coordinates are checked to be within valid ranges (±90° latitude, ±180° longitude).
- GeoJSON responses are validated before rendering on the map.

### CORS & Content Security

- The Express server implements CORS headers. Adjust `server.ts` if deploying across different domains.
- Nominatim and CartoDB requests are made server-side to avoid exposing request patterns.

---

## 🛠️ Project Structure

```
map-genie/
├── server.ts                    # Express backend, Gemini proxy, geocoding router
├── src/
│   ├── App.tsx                  # Main React component & search controller
│   ├── main.tsx                 # Client entrypoint (mounted to #root)
│   ├── index.css                # Global Tailwind directives & custom CSS
│   ├── types.ts                 # TypeScript domain models (Place, Itinerary, etc.)
│   ├── utils/
│   │   ├── geo.ts               # Coordinate validation, bounding box logic
│   │   └── api.ts               # Gemini & Nominatim fetch wrappers
│   ├── components/
│   │   ├── MapContainer.tsx     # Leaflet map instance, marker rendering
│   │   ├── SearchBar.tsx        # Query input, voice trigger, submit button
│   │   ├── PlaceCard.tsx        # Individual POI display & details
│   │   ├── PlannerWorkspace.tsx # Itinerary editor with drag-reorder
│   │   └── ErrorBoundary.tsx    # React error catcher
│   ├── hooks/
│   │   ├── useGemini.ts         # Gemini API hook with retry logic
│   │   ├── useGeocode.ts        # Nominatim geocoding hook
│   │   └── useMapState.ts       # Map viewport & marker state
│   └── __tests__/
│       ├── api.test.ts
│       ├── geo.test.ts
│       └── components.test.ts
├── package.json
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment variables template
└── .gitignore
```

---

## 🎯 Quirks & Known Limitations

### The "Lazy Pop" Effect
Nominatim (our geocoding service) enforces a strict 1-request-per-second rate limit. To keep Map-Genie feeling responsive, markers appear instantly with placeholder emoji + coordinates. Over the next few seconds, the true address and refined coordinates "pop in" via a background queue. **This is expected behavior**, not a bug.

**Impact**: High-volume searches (15+ results) may take 15–30 seconds to fully geocode.

**Mitigation**: Results are cached per session to avoid redundant lookups.

### Voice Input Availability
The Web Speech API is not available in all browsers:
- ✅ Works great in Chrome, Safari (14.5+), Edge, Opera
- ❌ Does not work in Firefox (use text input instead)
- ❌ May require HTTPS in production (most browsers enforce this)

**On unsupported browsers**: The mic button is hidden; only text input is shown.

### Gemini API Rate Limits
Default Gemini tier allows **15 requests per minute**. Hitting this limit triggers a 60-second cooldown with a user-friendly message.

**Workaround**: Batch searches by combining related queries into one prompt (e.g., "Coffee shops AND pastry cafes" instead of two separate searches).

### Nominatim Rate Limiting
Nominatim enforces **1 request per second globally** (not per client). During peak times, the geocoding queue may back up.

**Workaround**: Implemented client-side queue; results are cached to prevent redundant requests.

### Export File Size
Large itineraries (50+ POIs) may produce JSON files larger than 500 KB. Some mobile email clients have attachment size limits.

**Workaround**: Export in batches or share via link instead of email.

---

## 🧹 Troubleshooting

### "Cannot GET /" Error
**Cause**: Frontend assets not built or Express not serving static files.
```bash
npm run build
npm run start
```

### "Gemini API key invalid" at Runtime
**Cause**: `.env` not loaded or key is incorrect.
```bash
# Verify .env exists and contains GEMINI_API_KEY
cat .env

# Test key validity
curl -X POST https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=YOUR_KEY
```

### Voice Input Not Working
**Cause**: Browser doesn't support Web Speech API or microphone permission denied.
```bash
# Check browser support: https://caniuse.com/speech-recognition
# On Chrome: Settings > Privacy > Site Settings > Microphone > Allow for localhost
```

### Map Tiles Not Loading
**Cause**: CartoDB or network connectivity issue.
```bash
# Verify internet connection
# Try switching to alternative basemap in MapContainer.tsx (see comments)
# Tiles auto-retry every 10 seconds
```

### Tests Failing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run test
```

---

## 📊 Performance Targets

- **Search response time**: < 3 seconds (Gemini API call + initial render)
- **Geocoding per POI**: 1–2 seconds per result (sequential, rate-limited)
- **Full itinerary render**: < 5 seconds for 20+ POIs
- **Map pan/zoom**: 60 FPS (Leaflet native)
- **Bundle size**: < 700 KB (gzipped frontend + server)

**Note**: Actual times depend on network speed, API quota status, and POI count. Voice input adds transcription latency (typically 2–5 seconds).

---

## 📝 Contributing & Development Workflow

1. **Create a feature branch**: `git checkout -b feature/your-feature`
2. **Make changes** and commit with clear messages: `git commit -m "feat: add dark mode"`
3. **Run tests locally**: `npm run test`
4. **Build and verify**: `npm run build && npm run start`
5. **Push and open a PR**

For bug reports, include:
- Browser & version
- Steps to reproduce
- Expected vs. actual behavior
- Console errors (if any)

---

## 📄 License

MIT License — See LICENSE file for details.

---

## 📞 Support & Feedback

- **Bugs**: Open a GitHub issue with reproduction steps
- **Features**: Open a discussion or issue labeled `enhancement`
- **Questions**: Check the troubleshooting section above

Built with ❤️ for explorers and wanderers. Happy travels! 🗺️✨
