import React from 'react';
import { MapPin, Droplets, Wind, Thermometer } from 'lucide-react';

/**
 * WeatherCard - Premium glassmorphism weather display
 * Shows: Temperature, humidity, wind speed, condition with beautiful gradients
 */
export default function WeatherCard({ city, weather }) {
  if (!city) return null;

  if (!weather) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 max-w-md pointer-events-auto">
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <p className="text-white/80 text-lg">Loading weather data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 p-4">
      <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 max-w-lg w-full pointer-events-auto transform hover:scale-[1.02] transition-transform duration-300">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {city.name}
            </h2>
            <div className="flex items-center gap-2 text-white/70">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°
              </span>
            </div>
            <p className="text-white/90 capitalize text-lg mt-2 font-medium">
              {weather.description}
            </p>
          </div>
          
          {/* Weather Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-xl" />
            <img
              src={weather.icon}
              alt={weather.condition}
              className="w-24 h-24 relative z-10 drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Main Temperature Display */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Thermometer className="w-6 h-6 text-orange-300" />
              <span className="text-white/70 text-sm font-medium uppercase tracking-wider">Temperature</span>
            </div>
            <p className="text-7xl font-bold text-white drop-shadow-lg">
              {weather.temp}°
            </p>
            <p className="text-white/60 text-sm mt-1">Celsius</p>
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Humidity */}
          <div className="bg-gradient-to-br from-blue-500/15 to-cyan-500/15 backdrop-blur-sm border border-white/10 rounded-xl p-5 group hover:border-white/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-blue-400/20 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-300" />
              </div>
              <span className="text-white/70 text-sm font-medium">Humidity</span>
            </div>
            <p className="text-4xl font-bold text-white">{weather.humidity}%</p>
          </div>
          
          {/* Wind Speed */}
          <div className="bg-gradient-to-br from-cyan-500/15 to-teal-500/15 backdrop-blur-sm border border-white/10 rounded-xl p-5 group hover:border-white/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-cyan-400/20 rounded-lg">
                <Wind className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="text-white/70 text-sm font-medium">Wind</span>
            </div>
            <p className="text-4xl font-bold text-white">{weather.windSpeed}</p>
            <p className="text-white/60 text-xs mt-1">m/s</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
            <span className="text-white/60 text-sm">Real-time data</span>
          </div>
          <div className="text-white/40 text-xs">
            Weather API
          </div>
        </div>
      </div>
    </div>
  );
}