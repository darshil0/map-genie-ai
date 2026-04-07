# 🧞‍♂️ Map-Genie
**Your AI-Powered Travel Sidekick**

Ever wish you could just talk to your map and have it instantly curate the perfect itinerary? Meet **Map-Genie**! 

Map-Genie is a lightning-fast, AI-powered place explorer that transforms your voice or text into a beautifully mapped visual guide. Whether you're hunting for *"the coziest coffee shops in Amsterdam"* or *"hidden temples near Kyoto"*, Map-Genie figures out exactly what you want and maps it for you locally in real-time.

---

## ✨ Why You'll Love It

- **🗣️ Just Speak Your Mind**: Tap the mic and tell Map-Genie what you're looking for! Our live-transcription handles the rest.
- **🧠 Brains by Google Gemini**: Map-Genie's backend understands context. It doesn't just keyword-match; it interprets your vibe and finds the coolest, most relevant spots.
- **🗺️ Interactive & Gorgeous**: Custom emoji markers drop beautifully onto a sleek, dark-mode CartoDB map. Click a place card, and watch the camera glide right to it.
- **💬 Chat to Map**: Thanks to our multi-turn history engine, you can refine your search without clearing the map. Ask for restaurants, then casually say *"What about parks nearby?"* and watch the magic happen.
- **🦸‍♂️ Self-Healing**: Network blipped? Gemini glitched? Don't sweat it. Map-Genie is armed with exponential backoff API retry-loops and clever JSON auto-repair mechanics, so your experience stays butter-smooth.

---

## 🛠️ The Magic Under the Hood

We’ve pieced together an incredibly robust, full-stack architecture to keep things speedy and secure:

| What it does | What powers it |
|-------|------------|
| **The Brains (AI)** | [Google Gemini](https://ai.google.dev/) (`gemini-2.0-flash`) via our native backend |
| **The Engine (Backend)** | [FastAPI](https://fastapi.tiangolo.com/), `google-genai` & `python-dotenv` |
| **The Visuals (Frontend)** | Vanilla HTML/JS natively styled with Google SYNE fonts |
| **The Canvas (Map)** | [Leaflet.js](https://leafletjs.com/) layered over [CartoDB Dark Matter](https://carto.com/basemaps/) |
| **The Coordinates** | [Nominatim](https://nominatim.org/) OpenStreetMap Geocoding |
| **The Ears** | Native [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) |

---

## 🚀 Let's Get Started!

Want to take Map-Genie for a spin on your local machine? It takes less than two minutes!

### Step 1: Hook up your API Key
First, grab a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
```bash
# Copy the template to set up your environment variables
cp .env.example .env

# Open .env and paste your GEMINI_API_KEY inside!
```

### Step 2: Fire up the Engine
Install the python requirements and spin up the blazing-fast FastAPI server:
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

### Step 3: Explore!
Open your favorite web browser and gently navigate to:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

*(Make sure your browser gives the site microphone permission if you want to use the voice features!)*

---

## 🧪 Testing the Magic

We love stable code! If you want to make sure the backend routing and Gemini schemas are behaving properly, just run:
```bash
pytest
```
*You should see all our test validations glowing green!*

---

## 🧭 How Everything Fits Together

Curious about how we organized the project? It's intentionally lightweight:

```text
map-genie/
├── main.py             # 🧠 The FastAPI brain & Gemini link
├── static/
│   └── index.html      # 🎨 The beautiful user interface
├── requirements.txt    # 📦 Python toolbelt
├── tests/
│   └── test_main.py    # 🛡️ Defense against bugs
└── (and a few config files like .env and .gitignore!)
```

---

## 🩹 Quirks & Considerations

Software is organic, and Map-Genie has a few lovable quirks to keep in mind:

- **The "Lazy Pop" Effect**: Nominatim (our geocoding buddy) enforces a strict 1-request-per-second speed limit. To keep Map-Genie feeling fast, we instantly toss "placeholder" markers on the map the second Gemini answers. Over the next few seconds, you'll see them automatically "snap" to their true geographical street address in the background!
- **Browser Compatibility**: Voice search is powered by the native Web Speech API. It works flawlessly on Chrome, Safari (iOS 14.5+), and Edge! Sorry Firefox friends, voice isn't natively supported yet—but you can still type your heart out!

---

*Built with ❤️ for explorers and wanderers. Dive in, and happy travels!*
