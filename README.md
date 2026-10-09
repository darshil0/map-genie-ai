# 🧞‍♂️ Map-Genie

Your AI-powered travel sidekick for finding, planning, and saving place recommendations on a live map.

Map-Genie turns a natural-language prompt like "cozy coffee shops in Amsterdam" or "hidden temples near Kyoto" into a dynamic itinerary: it generates place suggestions, maps them, and lets you refine your search without losing context.

---

## Features

- Voice or text search with browser speech input
- Gemini-powered itinerary and recommendation generation
- Interactive map with category-based filtering
- Custom place add/edit workflow with geocoding
- Saved routes and itinerary export to JSON
- Built-in US state itinerary presets
- Refinement-aware chat context while keeping the same destination area

---

## Tech stack

- Frontend: React 19 + TypeScript + Vite
- Styling: Tailwind CSS
- Maps: Leaflet
- Backend: Express.js + Node.js
- AI: Google Gemini 1.5 Flash
- Geocoding: OpenStreetMap Nominatim

---

## Repository

- GitHub: https://github.com/darshil0/map-genie-ai

---

## Getting started

### Prerequisites

- Node.js 18 or newer
- A Google Gemini API key from https://ai.google.dev/

### Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/darshil0/map-genie-ai.git
   cd map-genie-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app in a browser at:

   ```text
   http://localhost:3000
   ```

---

## Scripts

```bash
npm run dev     # Start the Vite + Express development server
npm run build   # Build frontend and server bundle
npm run start   # Run the production server
npm run test    # Run geocoder and backend assertion tests
npm run lint    # Type-check the project with TypeScript
```

---

## API

The app exposes a lightweight Express API used by the frontend.

### Health check

```http
GET /api/health
```

Returns:

```json
{
  "status": "healthy",
  "timestamp": "2026-10-09T00:00:00.000Z"
}
```

### Chat recommendations

```http
POST /api/chat
Content-Type: application/json
```

Body:

```json
{
  "message": "Cozy coffee shops in Amsterdam",
  "history": [
    { "sender": "user", "text": "Hidden temples near Kyoto" }
  ],
  "currentLocation": {
    "name": "Kyoto, Japan",
    "latitude": 35.0116,
    "longitude": 135.7681
  }
}
```

The server validates the request, calls Gemini, and returns structured JSON with:

- `resolvedLocation`
- `aiResponseText`
- `spots`

---

## Project structure

```text
.
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── types.ts
│   ├── components/
│   ├── data/
│   ├── server/
│   └── utils/
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── README.md
└── LICENSE
```

---

## Usage examples

### Search for places

Type a prompt like:

> "Best ramen spots in Shinjuku with a traditional vibe"

### Add your own place

Use the planner form to add a custom location, then let the app geocode it automatically.

### Refine the search

Follow up with prompts such as:

> "Parks nearby" 
> "More historical options"
> "Places to sit and relax"

The app keeps the same geographic context unless the user explicitly changes location.

---

## Testing

Run the test suite:

```bash
npm test
```

The suite validates the geocoder utility and the backend schema assumptions used by Gemini responses.

---

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run `npm run lint` and `npm test`.
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.
