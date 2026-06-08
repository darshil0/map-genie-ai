/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Thermometer, Wind, Droplets, CloudSun, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, RefreshCw } from 'lucide-react';

interface WeatherWidgetProps {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
}

interface WeatherData {
  temperatureC: number;
  temperatureF: number;
  humidity: number;
  windSpeed: number;
  apparentTempC: number;
  apparentTempF: number;
  weatherCode: number;
  time: string;
}

export default function WeatherWidget({ latitude, longitude, locationName }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFahrenheit, setIsFahrenheit] = useState<boolean>(true);

  // Fetch weather data from Open-Meteo API when location shifts
  const fetchWeather = async () => {
    if (latitude === null || longitude === null) return;
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to retrieve forecast data');
      }
      const data = await response.json();
      const current = data.current;

      const tempC = Math.round(current.temperature_2m);
      const appC = Math.round(current.apparent_temperature);

      setWeather({
        temperatureC: tempC,
        temperatureF: Math.round((tempC * 9/5) + 32),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        apparentTempC: appC,
        apparentTempF: Math.round((appC * 9/5) + 32),
        weatherCode: current.weather_code,
        time: new Date(current.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err: any) {
      console.error('Weather Fetch Error:', err);
      setError('Unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [latitude, longitude]);

  if (latitude === null || longitude === null) return null;

  // Render weather illustration matched to live WMO Code
  const getWeatherDecoration = (code: number) => {
    if (code === 0) {
      return {
        condition: 'Clear Sky',
        themeClass: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30 text-amber-200',
        icon: <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />,
        glowColor: 'bg-amber-500/30'
      };
    }
    if ([1, 2, 3].includes(code)) {
      return {
        condition: 'Partly Cloudy',
        themeClass: 'from-blue-500/15 via-slate-500/10 to-transparent border-slate-500/30 text-slate-200',
        icon: <CloudSun className="w-4 h-4 text-indigo-300" />,
        glowColor: 'bg-blue-400/20'
      };
    }
    if ([45, 48].includes(code)) {
      return {
        condition: 'Foggy Mist',
        themeClass: 'from-zinc-500/15 via-slate-650/10 to-transparent border-slate-700/50 text-slate-300',
        icon: <Cloud className="w-4 h-4 text-zinc-400" />,
        glowColor: 'bg-zinc-500/20'
      };
    }
    if ([51, 53, 55, 56, 57].includes(code)) {
      return {
        condition: 'Drizzling',
        themeClass: 'from-sky-500/20 via-blue-500/10 to-transparent border-sky-500/30 text-sky-200',
        icon: <CloudRain className="w-4 h-4 text-sky-400" />,
        glowColor: 'bg-sky-500/25'
      };
    }
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return {
        condition: 'Rainy Shower',
        themeClass: 'from-indigo-500/20 via-blue-600/10 to-transparent border-indigo-500/30 text-indigo-200',
        icon: <CloudRain className="w-4 h-4 text-indigo-400 animate-pulse" />,
        glowColor: 'bg-indigo-500/30'
      };
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return {
        condition: 'Snowfall',
        themeClass: 'from-cyan-300/15 via-slate-100/10 to-transparent border-cyan-400/30 text-cyan-100',
        icon: <CloudSnow className="w-4 h-4 text-cyan-300 animate-bounce" />,
        glowColor: 'bg-cyan-200/25'
      };
    }
    if ([95, 96, 99].includes(code)) {
      return {
        condition: 'Thunderstorm',
        themeClass: 'from-purple-500/20 via-rose-500/10 to-transparent border-purple-500/40 text-purple-200',
        icon: <CloudLightning className="w-4 h-4 text-purple-400 animate-pulse" />,
        glowColor: 'bg-purple-500/40'
      };
    }
    return {
      condition: 'Overcast',
      themeClass: 'from-slate-500/15 via-slate-800/10 to-transparent border-slate-700/55 text-slate-300',
      icon: <Cloud className="w-4 h-4 text-slate-400" />,
      glowColor: 'bg-slate-500/15'
    };
  };

  const dec = weather ? getWeatherDecoration(weather.weatherCode) : null;

  return (
    <div className={`p-0.5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-white/5 shadow-2xl backdrop-blur-md select-none transition-all duration-500 w-full max-w-[280px] hover:shadow-indigo-500/5 hover:-translate-y-0.5 group`}>
      {/* Loading state indicator */}
      {loading && !weather && (
        <div className="flex items-center justify-center py-5 gap-2 text-xs font-mono text-slate-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Syncing real-time forecast...</span>
        </div>
      )}

      {/* Error state fallback */}
      {error && !weather && (
        <div className="flex items-center justify-between p-3 text-xs font-mono text-rose-300">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span>Weather Sync Failed</span>
          </span>
          <button 
            onClick={fetchWeather}
            className="p-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Structured weather data layout */}
      {weather && dec && (
        <div className="flex flex-col p-3 rounded-2xl space-y-2.5 relative overflow-hidden">
          {/* Accent glow halo */}
          <div className={`absolute -top-12 -right-12 h-20 w-20 rounded-full blur-3xl filter opacity-40 transition-colors duration-500 ${dec.glowColor}`} />

          {/* Title & Condition Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold font-mono tracking-widest text-[rgb(129,140,248)] flex items-center gap-1">
                <span>⚡</span>
                <span>Live Weather</span>
              </span>
            </div>
            
            {/* Toggle Switch */}
            <button
              onClick={() => setIsFahrenheit(!isFahrenheit)}
              className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-950 hover:bg-indigo-600 border border-slate-800 text-indigo-300 hover:text-white transition-all duration-200 cursor-pointer"
              title={`Switch to ${isFahrenheit ? 'Celsius' : 'Fahrenheit'}`}
            >
              {isFahrenheit ? '°F' : '°C'}
            </button>
          </div>

          {/* Temperature & Large Visual Icon */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="font-display font-bold text-2xl tracking-tight text-white leading-none">
                {isFahrenheit ? `${weather.temperatureF}°` : `${weather.temperatureC}°`}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {isFahrenheit ? 'F' : 'C'}
              </span>
            </div>

            {/* Condition badge capsule */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-gradient-to-r text-xs font-medium ${dec.themeClass}`}>
              {dec.icon}
              <span className="font-sans text-[10px] tracking-wide uppercase font-semibold">{dec.condition}</span>
            </div>
          </div>

          {/* Atmospheric metadata section */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-400">
            {/* Humidity */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/45 rounded-lg border border-slate-900/30">
              <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div className="flex flex-col truncate">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 leading-none">Humid</span>
                <span className="text-slate-200 mt-0.5 leading-none font-bold">{weather.humidity}%</span>
              </div>
            </div>

            {/* Wind speed */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/45 rounded-lg border border-slate-900/30">
              <Wind className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div className="flex flex-col truncate">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 leading-none">Wind</span>
                <span className="text-slate-200 mt-0.5 leading-none font-bold">{weather.windSpeed} mph</span>
              </div>
            </div>
          </div>

          {/* Small sub-label indicating precise forecast details */}
          <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 select-none pt-0.5">
            <span>Feels: {isFahrenheit ? `${weather.apparentTempF}°F` : `${weather.apparentTempC}°C`}</span>
            <span>Recorded: {weather.time}</span>
          </div>
        </div>
      )}
    </div>
  );
}
