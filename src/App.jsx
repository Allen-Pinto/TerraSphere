import React, { useState, useEffect } from 'react';
import CanvasRenderer from './components/CanvasRenderer';
import NavigationUI from './components/NavigationUI';
import WeatherTooltip from './components/WeatherTooltip';
import WeatherCard from './components/WeatherCard';
import { fetchWeather } from './utils/weatherAPI';
import worldData from './data/worldData.json';

/**
 * App - Root component managing global state and navigation with smooth zoom
 * Coordinates all child components and handles layer transitions
 */
export default function App() {
  // Layer state - tracks current view level
  const [layer, setLayer] = useState('earth');
  const [history, setHistory] = useState(['earth']);
  
  // Selection state - tracks what's selected at each level
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  
  // UI state
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [transitioning, setTransitioning] = useState(false);
  const [bgColor, setBgColor] = useState('#0A1628');
  
  // Zoom animation state
  const [zoomProgress, setZoomProgress] = useState(0);
  const [zoomDirection, setZoomDirection] = useState('in');
  
  // Weather data cache
  const [weatherData, setWeatherData] = useState({});

  // Zoom animation effect
  useEffect(() => {
    if (!transitioning) {
      setZoomProgress(0);
      return;
    }

    const duration = 800; // Smoother, slightly longer animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setZoomProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTransitioning(false);
        setZoomProgress(0);
      }
    };

    requestAnimationFrame(animate);
  }, [transitioning]);

  /**
   * Handle node click and navigate to next layer with zoom
   * FIXED: Prevents clicks at deepest level (city)
   */
  const handleNodeClick = (newLayer, selection) => {
    if (transitioning) return;
    
    // CRITICAL FIX: Prevent clicking when already at city level (deepest level)
    if (layer === 'city') {
      console.log('Already at deepest level - no further navigation');
      return;
    }
    
    setTransitioning(true);
    setZoomDirection('in');
    
    // Delay layer change to middle of zoom animation
    setTimeout(() => {
      if (newLayer === 'continent') {
        setSelectedContinent(selection);
        const color = worldData.earth.children[selection].color;
        setBgColor(color + '30'); // Darker, more mature opacity
        
      } else if (newLayer === 'country') {
        setSelectedCountry(selection);
        const country = worldData.earth.children[selectedContinent].children[selection];
        setBgColor(country.color + '20');
        
        // Prefetch weather for all cities in this country
        Object.values(country.children).forEach(city => {
          fetchWeather(city.name, city.lat, city.lon).then(data => {
            if (data) {
              setWeatherData(prev => ({ 
                ...prev, 
                [city.name.toLowerCase()]: data 
              }));
            }
          });
        });
        
      } else if (newLayer === 'city') {
        setSelectedCity(selection);
        setBgColor('#12192B');
        
        // Fetch weather for selected city
        const city = worldData.earth.children[selectedContinent]
          .children[selectedCountry]
          .children[selection];
        
        fetchWeather(city.name, city.lat, city.lon).then(data => {
          if (data) {
            setWeatherData(prev => ({ 
              ...prev, 
              [city.name.toLowerCase()]: data 
            }));
          }
        });
      }
      
      setLayer(newLayer);
      setHistory(prev => [...prev, newLayer]);
    }, 400); 
  };

  /**
   * Handle node hover for tooltip display
   */
  const handleNodeHover = (nodeKey, position) => {
    setHoveredNode(nodeKey);
    setMousePos(position);
  };

  /**
   * Navigate back one layer with zoom out (BACK BUTTON)
   */
  const goBack = () => {
    if (history.length <= 1 || transitioning) return;
    
    setTransitioning(true);
    setZoomDirection('out');
    
    const newHistory = history.slice(0, -1);
    const prevLayer = newHistory[newHistory.length - 1];
    
    // Delay state changes to middle of animation
    setTimeout(() => {
      setHistory(newHistory);
      setLayer(prevLayer);
      
      // Reset state based on previous layer
      if (prevLayer === 'earth') {
        setBgColor('#0A1628');
        setSelectedContinent(null);
        setSelectedCountry(null);
        setSelectedCity(null);
      } else if (prevLayer === 'continent') {
        const color = worldData.earth.children[selectedContinent].color;
        setBgColor(color + '30');
        setSelectedCountry(null);
        setSelectedCity(null);
      } else if (prevLayer === 'country') {
        const country = worldData.earth.children[selectedContinent]
          .children[selectedCountry];
        setBgColor(country.color + '20');
        setSelectedCity(null);
      }
    }, 400);
  };

  /**
   * Navigate to home (Earth layer) with zoom out (HOME BUTTON)
   */
  const goHome = () => {
    if (layer === 'earth' || transitioning) return;
    
    setTransitioning(true);
    setZoomDirection('out');
    
    setTimeout(() => {
      setLayer('earth');
      setHistory(['earth']);
      setBgColor('#0A1628');
      setSelectedContinent(null);
      setSelectedCountry(null);
      setSelectedCity(null);
    }, 400);
  };

  /**
   * Get current city object for weather card
   */
  const getCurrentCity = () => {
    if (layer !== 'city' || !selectedCity || !selectedCountry || !selectedContinent) {
      return null;
    }
    return worldData.earth.children[selectedContinent]
      .children[selectedCountry]
      .children[selectedCity];
  };

  const currentCity = getCurrentCity();
  const currentCityWeather = currentCity 
    ? weatherData[currentCity.name.toLowerCase()] 
    : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Ambient particle effect overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      </div>

      {/* Canvas Renderer - Handles all drawing with zoom */}
      <CanvasRenderer
        layer={layer}
        selectedContinent={selectedContinent}
        selectedCountry={selectedCountry}
        selectedCity={selectedCity}
        hoveredNode={hoveredNode}
        weatherData={weatherData}
        bgColor={bgColor}
        zoomProgress={zoomProgress}
        zoomDirection={zoomDirection}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onContextMenu={goBack}
      />

      {/* Navigation UI - Home, breadcrumbs, back button - HIGHEST Z-INDEX */}
      <NavigationUI
        layer={layer}
        history={history}
        onGoHome={goHome}
        onGoBack={goBack}
      />

      {/* Weather Tooltip - Hover information */}
      <WeatherTooltip
        hoveredNode={hoveredNode}
        mousePos={mousePos}
        layer={layer}
        selectedContinent={selectedContinent}
        selectedCountry={selectedCountry}
        weatherData={weatherData}
      />

      {/* Weather Card - City detail view with fade in */}
      {layer === 'city' && (
        <div 
          className={`transition-opacity duration-700 ${
            transitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <WeatherCard
            city={currentCity}
            weather={currentCityWeather}
          />
        </div>
      )}
    </div>
  );
}