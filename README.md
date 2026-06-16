# 🧞‍♂️ Map-Genie

**Your AI-Powered Travel Sidekick**

Map-Genie is a lightning-fast, AI-powered place explorer that transforms your voice or text into a beautifully mapped visual guide. Whether you're hunting for _"the coziest coffee shops in Amsterdam"_ or _"hidden temples near Kyoto"_, Map-Genie interprets your intent and maps exactly what you want with live geocoding.

---

## ✨ Features

- **🗣️ Voice & Text Search**: Just speak or type what you're looking for. Native Web Speech API handles live transcription.
- **🧠 AI-Powered Insights**: Powered by Google Gemini, Map-Genie understands context and intent to find the most relevant spots.
- **🗺️ Interactive Maps**: Custom emoji markers on a beautiful CartoDB Positron basemap.
- **📅 Itinerary Planner**: Build, reorder, and refine your travel route in the Planner Workspace.
- **🌤️ Real-time Weather**: Integrated `WeatherWidget` provides live forecasts for your chosen destinations via Open-Meteo.
- **📊 Spatial Analytics**: `ItineraryAnalytics` offers deep insights into your travel plans, including category distribution and geocoding health.
- **🇺🇸 Preset Itineraries**: Load curated highlights for all 50 US States.
- **💾 Save & Export**: Save your favorite routes locally or export them as JSON.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Leaflet.js
- **Backend (Node.js)**: Express.js
- **Backend (Python)**: FastAPI, Pydantic, Uvicorn
- **AI**: Google Gemini 1.5 Flash & 2.0 Flash
- **Geocoding**: Nominatim OpenStreetMap

### Key Dependencies

- `@google/genai`: Integration with Gemini AI models.
- `express`: Robust web server for the backend.
- `fastapi`: High-performance Python backend framework.
- `leaflet`: Interactive mapping library.
- `lucide-react`: Beautiful, consistent iconography.
- `motion`: Smooth animations and transitions.
- `tailwindcss`: Utility-first CSS framework.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- Python 3.9+ (for Python backend)
- A Google Gemini API Key ([Get it here](https://ai.google.dev/))

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/yourusername/map-genie.git
    cd map-genie
    ```

2.  **Install Frontend & Node Backend dependencies**:

    ```bash
    npm install
    ```

3.  **Install Python Backend dependencies (Optional)**:

    ```bash
    cd backend_python
    pip install -r requirements.txt
    cd ..
    ```

4.  **Configure environment variables**:
    Create a `.env` file in the root directory and add your API key:

    ```env
    GEMINI_API_KEY=your_actual_key_here
    ```

5.  **Start the development server**:

    ```bash
    npm run dev
    ```

6.  **Open in your browser**:
    Navigate to [http://localhost:3000](http://localhost:3000)

### API Usage Example (Internal)
Map-Genie communicates with the Gemini-powered backend using a simple JSON API.

## 📂 Project Structure

- `src/server/`: Express backend and AI proxy.
- `backend_python/`: Alternative high-performance FastAPI backend.
- `src/components/`: Modular React components (includes `WeatherWidget`, `ItineraryAnalytics`, etc.).
- `src/utils/`: Helper functions and API wrappers.
- `src/data/`: Static data and US state presets.
- `tests/`: Backend and utility tests.

---

## 💡 Usage Examples

### Searching for Places
Type a natural language query in the search bar:
> "Find the best ramen spots in Shinjuku with a traditional vibe."

### Voice Search
Click the microphone icon and speak your request. Map-Genie will transcribe your voice in real-time and generate map markers instantly.

### Planning an Itinerary
1. Search for a location.
2. Click the **"Add to Itinerary"** button on any place card.
3. Open the **Planner Workspace** to reorder stops and view your daily schedule and analytics.

---

## 🧪 Testing

Run the Node.js test suite with:

```bash
npm test
```

Run the Python backend tests:

```bash
python3 -m pytest backend_python/test_server.py
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and ensure they pass linting and tests.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Open a Pull Request.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
