import React from 'react';
import worldData from '../data/worldData.json';
import { Cloud, Navigation } from 'lucide-react';

/**
 * WeatherTooltip - Premium hover tooltip with glassmorphism
 * Shows: Node name, type, and weather preview (if available)
 */
export default function WeatherTooltip({
  hoveredNode,
  mousePos,
  layer,
  selectedContinent,
  selectedCountry,
  weatherData
}) {
  if (!hoveredNode) return null;

  const getTooltipContent = () => {
    try {
      if (layer === 'earth') {
        const continent = worldData.earth.children[hoveredNode];
        if (!continent) return null;
        return { 
          name: continent.name,
          type: 'Continent',
          icon: '🌍',
          color: continent.color
        };
      } else if (layer === 'continent') {
        if (!selectedContinent) return null;
        const continent = worldData.earth.children[selectedContinent];
        if (!continent || !continent.children) return null;
        const country = continent.children[hoveredNode];
        if (!country) return null;
        return { 
          name: country.name,
          type: 'Country',
          icon: '🏴',
          color: country.color
        };
      } else if (layer === 'country') {
        if (!selectedContinent || !selectedCountry) return null;
        const continent = worldData.earth.children[selectedContinent];
        if (!continent || !continent.children) return null;
        const country = continent.children[selectedCountry];
        if (!country || !country.children) return null;
        const city = country.children[hoveredNode];
        if (!city) return null;
        
        const weather = weatherData[city.name.toLowerCase()];
        
        return { 
          name: city.name,
          type: 'City',
          icon: '🏙️',
          color: country.color,
          weather: weather 
            ? {
                temp: weather.temp,
                condition: weather.condition,
                humidity: weather.humidity
              }
            : null
        };
      }
    } catch (error) {
      console.error('Tooltip error:', error);
      return null;
    }
    return null;
  };

  const tooltipContent = getTooltipContent();
  if (!tooltipContent) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 animate-in fade-in duration-200"
      style={{
        left: mousePos.x + 20,
        top: mousePos.y - 10,
      }}
    >
      <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
        {/* Color accent bar */}
        <div 
          className="h-1.5 w-full"
          style={{ backgroundColor: tooltipContent.color }}
        />
        
        <div className="px-4 py-3">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{tooltipContent.icon}</span>
            <div>
              <p className="font-bold text-white text-base leading-tight">
                {tooltipContent.name}
              </p>
              <p className="text-white/50 text-xs uppercase tracking-wider">
                {tooltipContent.type}
              </p>
            </div>
          </div>

          {tooltipContent.weather && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-cyan-400" />
                  <span className="text-white/80">{tooltipContent.weather.temp}°C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <span className="text-white/80">{tooltipContent.weather.humidity}%</span>
                </div>
              </div>
              <p className="text-white/60 text-xs mt-2 capitalize">
                {tooltipContent.weather.condition}
              </p>
            </div>
          )}

          {/* Action hint */}
          {layer !== 'city' && (
            <div className="mt-3 pt-2 border-t border-white/10">
              <p className="text-white/40 text-xs">
                Click to explore →
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}