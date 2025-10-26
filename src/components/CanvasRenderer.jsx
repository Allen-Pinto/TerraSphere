import React, { useEffect, useRef } from 'react';
import { getColorForTemp } from '../utils/weatherAPI';
import { easeInOutCubic, lerp } from '../utils/animations';
import worldData from '../data/worldData.json';

/**
 * CanvasRenderer - Handles all Canvas 2D drawing with premium visual effects
 * Features: Mature colors, glow effects, smooth animations, particle systems
 */
export default function CanvasRenderer({
  layer,
  selectedContinent,
  selectedCountry,
  selectedCity,
  hoveredNode,
  weatherData,
  bgColor,
  onNodeClick,
  onNodeHover,
  onContextMenu,
  zoomProgress,
  zoomDirection
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const rotationRef = useRef(0);
  const particlesRef = useRef([]);
  const zoomLevelRef = useRef(1);
  const lastTouchDistanceRef = useRef(0);

  // Initialize particles for ambient effect
  useEffect(() => {
    particlesRef.current = Array.from({ length: 150 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5,
      speedY: Math.random() * 0.0003 + 0.0001,
      opacity: Math.random() * 0.5 + 0.3
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Handle canvas resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw premium background with radial gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5
      );
      gradient.addColorStop(0, bgColor);
      gradient.addColorStop(0.6, hexToRgba(bgColor, 0.7));
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated particles
      drawParticles(ctx, canvas);

      // Apply zoom transformation
      ctx.save();
      if (zoomProgress > 0 && zoomProgress < 1) {
        const scale = zoomDirection === 'in' 
          ? lerp(1, 1.8, easeInOutCubic(zoomProgress))
          : lerp(1.8, 1, easeInOutCubic(zoomProgress));
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        
        // Subtle fade during transition
        ctx.globalAlpha = zoomDirection === 'in'
          ? lerp(1, 0.4, easeInOutCubic(zoomProgress))
          : lerp(0.4, 1, easeInOutCubic(zoomProgress));
      }

      // Render appropriate layer
      if (layer === 'earth') {
        drawEarthLayer(ctx, canvas);
      } else if (layer === 'continent') {
        drawContinentLayer(ctx, canvas);
      } else if (layer === 'country') {
        drawCountryLayer(ctx, canvas);
      } else if (layer === 'city') {
        drawCityLayer(ctx, canvas);
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [layer, selectedContinent, selectedCountry, selectedCity, hoveredNode, weatherData, bgColor, zoomProgress, zoomDirection]);

  /**
   * Draw ambient floating particles
   */
  const drawParticles = (ctx, canvas) => {
    particlesRef.current.forEach(particle => {
      particle.y += particle.speedY;
      if (particle.y > 1) particle.y = 0;

      const x = particle.x * canvas.width;
      const y = particle.y * canvas.height;

      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Subtle glow
      if (particle.size > 1.5) {
        ctx.fillStyle = `rgba(200, 230, 255, ${particle.opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  /**
   * Draw Earth layer with rotating globe and continent nodes
   */
  const drawEarthLayer = (ctx, canvas) => {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.28;

    // Slow rotation for elegant effect
    rotationRef.current += 0.0015;
    
    ctx.save();
    ctx.translate(cx, cy);
    
    // Draw outer glow/atmosphere
    const atmosphereGradient = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.15);
    atmosphereGradient.addColorStop(0, 'rgba(100, 180, 255, 0)');
    atmosphereGradient.addColorStop(0.7, 'rgba(100, 180, 255, 0.15)');
    atmosphereGradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
    ctx.fillStyle = atmosphereGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // Draw Earth sphere with sophisticated gradient
    const earthGradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius);
    earthGradient.addColorStop(0, '#4A7BA7');
    earthGradient.addColorStop(0.4, '#2E5F8F');
    earthGradient.addColorStop(0.8, '#1A3D66');
    earthGradient.addColorStop(1, '#0D1F3D');
    ctx.fillStyle = earthGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle texture overlay
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, radius * (0.6 + i * 0.02), angle, angle + Math.PI);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw continents as interactive nodes
    const continents = worldData.earth.children;
    Object.entries(continents).forEach(([key, continent]) => {
      const angle = continent.position.x * Math.PI * 2 + rotationRef.current;
      const dist = radius * 0.75;
      const x = Math.cos(angle) * dist * continent.position.y;
      const y = Math.sin(angle) * dist * continent.position.y;
      
      const isHovered = hoveredNode === key;
      const nodeRadius = isHovered ? 20 : 17;
      
      // Outer glow
      if (isHovered) {
        const glowGradient = ctx.createRadialGradient(x, y, nodeRadius, x, y, nodeRadius + 15);
        glowGradient.addColorStop(0, hexToRgba(continent.color, 0.6));
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius + 15, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Node shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(x + 3, y + 3, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Node with gradient
      const nodeGradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, nodeRadius);
      nodeGradient.addColorStop(0, lightenColor(continent.color, 20));
      nodeGradient.addColorStop(1, continent.color);
      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(x - 4, y - 4, nodeRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Label with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${isHovered ? 16 : 15}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(continent.name, x, y + nodeRadius + 28);
      ctx.shadowBlur = 0;
    });
    
    ctx.restore();
  };

  /**
   * Draw Continent layer with country nodes
   */
  const drawContinentLayer = (ctx, canvas) => {
    if (!selectedContinent) return;
    
    const continent = worldData.earth.children[selectedContinent];
    if (!continent || !continent.children) return;
    
    const countries = continent.children;
    
    // Draw continent title with glow
    ctx.shadowColor = 'rgba(100, 200, 255, 0.5)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(continent.name, canvas.width / 2, 70);
    ctx.shadowBlur = 0;

    // Calculate grid layout
    const entries = Object.entries(countries);
    const cols = Math.ceil(Math.sqrt(entries.length));
    const spacing = Math.min(canvas.width, canvas.height) * 0.22;
    const startX = canvas.width / 2 - (cols * spacing) / 2;
    const startY = canvas.height / 2;

    entries.forEach(([key, country], index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * spacing + spacing / 2;
      const y = startY + row * spacing - 30;
      
      const isHovered = hoveredNode === key;
      const nodeRadius = isHovered ? 48 : 43;
      
      // Outer glow on hover
      if (isHovered) {
        const glowGradient = ctx.createRadialGradient(x, y, nodeRadius, x, y, nodeRadius + 20);
        glowGradient.addColorStop(0, hexToRgba(country.color, 0.7));
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius + 20, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(x + 4, y + 4, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Node with gradient
      const nodeGradient = ctx.createRadialGradient(x - 10, y - 10, 0, x, y, nodeRadius);
      nodeGradient.addColorStop(0, lightenColor(country.color, 25));
      nodeGradient.addColorStop(1, country.color);
      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(x - 8, y - 8, nodeRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = isHovered ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Label
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${isHovered ? 18 : 17}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(country.name, x, y + nodeRadius + 30);
      ctx.shadowBlur = 0;
    });
  };

  /**
   * Draw Country layer with city nodes colored by temperature
   */
  const drawCountryLayer = (ctx, canvas) => {
    if (!selectedCountry || !selectedContinent) return;
    
    const country = worldData.earth.children[selectedContinent].children[selectedCountry];
    const cities = country.children;
    
    // Draw country title
    ctx.shadowColor = 'rgba(100, 200, 255, 0.5)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(country.name, canvas.width / 2, 70);
    ctx.shadowBlur = 0;

    // Calculate grid layout
    const entries = Object.entries(cities);
    const cols = Math.ceil(Math.sqrt(entries.length));
    const spacing = Math.min(canvas.width, canvas.height) * 0.25;
    const startX = canvas.width / 2 - (cols * spacing) / 2;
    const startY = canvas.height / 2;

    entries.forEach(([key, city], index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * spacing + spacing / 2;
      const y = startY + row * spacing - 30;
      
      const weather = weatherData[city.name.toLowerCase()];
      const nodeColor = weather ? getColorForTemp(weather.temp) : country.color;
      const isHovered = hoveredNode === key;
      const nodeRadius = isHovered ? 53 : 48;
      
      // Outer glow
      if (isHovered) {
        const glowGradient = ctx.createRadialGradient(x, y, nodeRadius, x, y, nodeRadius + 25);
        glowGradient.addColorStop(0, hexToRgba(nodeColor, 0.8));
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius + 25, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(x + 4, y + 4, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Node with gradient
      const nodeGradient = ctx.createRadialGradient(x - 12, y - 12, 0, x, y, nodeRadius);
      nodeGradient.addColorStop(0, lightenColor(nodeColor, 30));
      nodeGradient.addColorStop(1, nodeColor);
      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(x - 10, y - 10, nodeRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Temperature text
      if (weather) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${weather.temp}°`, x, y + 9);
        ctx.shadowBlur = 0;
      }
      
      // Border
      ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = isHovered ? 4 : 3;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Label
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${isHovered ? 18 : 17}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(city.name, x, y + nodeRadius + 32);
      ctx.shadowBlur = 0;
    });
  };

  /**
   * Draw City layer - Final level (no more clicks allowed)
   */
  const drawCityLayer = (ctx, canvas) => {
    if (!selectedCity || !selectedCountry || !selectedContinent) return;
    
    const city = worldData.earth.children[selectedContinent]
      .children[selectedCountry]
      .children[selectedCity];
    
    const weather = weatherData[city.name.toLowerCase()];
    
    // Draw city title
    ctx.shadowColor = 'rgba(100, 200, 255, 0.6)';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(city.name, canvas.width / 2, 80);
    ctx.shadowBlur = 0;
    
    // Draw decorative elements around the city
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 120;
    
    // Animated circles
    for (let i = 0; i < 3; i++) {
      const r = radius + i * 40;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 - i * 0.04})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Central weather display (if available)
    if (weather) {
      const color = getColorForTemp(weather.temp);
      
      // Large weather node
      const glowGradient = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.3);
      glowGradient.addColorStop(0, hexToRgba(color, 0.5));
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();
      
      const nodeGradient = ctx.createRadialGradient(cx - 30, cy - 30, 0, cx, cy, radius);
      nodeGradient.addColorStop(0, lightenColor(color, 40));
      nodeGradient.addColorStop(1, color);
      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Temperature
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 64px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${weather.temp}°C`, cx, cy + 15);
      ctx.shadowBlur = 0;
    }
  };

  /**
   * Handle mouse click - detect node clicks with depth check
   */
  const handleCanvasClick = (e) => {
    // Prevent clicks at city level (deepest)
    if (layer === 'city') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (layer === 'earth') {
      checkEarthNodeClick(x, y, canvas);
    } else if (layer === 'continent') {
      checkContinentNodeClick(x, y, canvas);
    } else if (layer === 'country') {
      checkCountryNodeClick(x, y, canvas);
    }
  };

  const checkEarthNodeClick = (x, y, canvas) => {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.28;
    const continents = worldData.earth.children;
    
    Object.entries(continents).forEach(([key, continent]) => {
      const angle = continent.position.x * Math.PI * 2 + rotationRef.current;
      const dist = radius * 0.75;
      const nodeX = cx + Math.cos(angle) * dist * continent.position.y;
      const nodeY = cy + Math.sin(angle) * dist * continent.position.y;
      
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 25) {
        onNodeClick('continent', key);
      }
    });
  };

  const checkContinentNodeClick = (x, y, canvas) => {
    const countries = worldData.earth.children[selectedContinent].children;
    const entries = Object.entries(countries);
    const cols = Math.ceil(Math.sqrt(entries.length));
    const spacing = Math.min(canvas.width, canvas.height) * 0.22;
    const startX = canvas.width / 2 - (cols * spacing) / 2;
    const startY = canvas.height / 2;

    entries.forEach(([key], index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const nodeX = startX + col * spacing + spacing / 2;
      const nodeY = startY + row * spacing - 30;
      
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 50) {
        onNodeClick('country', key);
      }
    });
  };

  const checkCountryNodeClick = (x, y, canvas) => {
    const cities = worldData.earth.children[selectedContinent].children[selectedCountry].children;
    const entries = Object.entries(cities);
    const cols = Math.ceil(Math.sqrt(entries.length));
    const spacing = Math.min(canvas.width, canvas.height) * 0.25;
    const startX = canvas.width / 2 - (cols * spacing) / 2;
    const startY = canvas.height / 2;

    entries.forEach(([key], index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const nodeX = startX + col * spacing + spacing / 2;
      const nodeY = startY + row * spacing - 30;
      
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 55) {
        onNodeClick('city', key);
      }
    });
  };

  /**
   * Handle mouse move - detect node hovers
   */
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let hoveredKey = null;

    if (layer === 'earth') {
      hoveredKey = checkEarthNodeHover(x, y, canvas);
    } else if (layer === 'continent') {
      hoveredKey = checkContinentNodeHover(x, y, canvas);
    } else if (layer === 'country') {
      hoveredKey = checkCountryNodeHover(x, y, canvas);
    }

    // Update cursor style
    canvas.style.cursor = hoveredKey ? 'pointer' : 'default';
    
    // Don't show pointer on city layer (deepest level)
    if (layer === 'city') {
      canvas.style.cursor = 'default';
    }

    onNodeHover(hoveredKey, { x: e.clientX, y: e.clientY });
  };

  const checkEarthNodeHover = (x, y, canvas) => {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.28;
    const continents = worldData.earth.children;
    
    for (const [key, continent] of Object.entries(continents)) {
      const angle = continent.position.x * Math.PI * 2 + rotationRef.current;
      const dist = radius * 0.75;
      const nodeX = cx + Math.cos(angle) * dist * continent.position.y;
      const nodeY = cy + Math.sin(angle) * dist * continent.position.y;
      
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 25) return key;
    }
    return null;
  };

  const checkContinentNodeHover = (x, y, canvas) => {
    const countries = worldData.earth.children[selectedContinent].children;
    const entries = Object.entries(countries);
    const cols = Math.ceil(Math.sqrt(entries.length));
    const spacing = Math.min(canvas.width, canvas.height) * 0.22;
    const startX = canvas.width / 2 - (cols * spacing) / 2;
    const startY = canvas.height / 2;

    for (let index = 0; index < entries.length; index++) {
      const [key] = entries[index];
      const col = index % cols;
      const row = Math.floor(index / cols);
      const nodeX = startX + col * spacing + spacing / 2;
      const nodeY = startY + row * spacing - 30;
      
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 50) return key;
    }
    return null;
  };

  const checkCountryNodeHover = (x, y, canvas) => {
    const cities = worldData.earth.children[selectedContinent].children[selectedCountry].children;
    const entries = Object.entries(cities);
    const cols = Math.ceil(Math.sqrt(entries.length));
    const spacing = Math.min(canvas.width, canvas.height) * 0.25;
    const startX = canvas.width / 2 - (cols * spacing) / 2;
    const startY = canvas.height / 2;

    for (let index = 0; index < entries.length; index++) {
      const [key] = entries[index];
      const col = index % cols;
      const row = Math.floor(index / cols);
      const nodeX = startX + col * spacing + spacing / 2;
      const nodeY = startY + row * spacing - 30;
      
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 55) return key;
    }
    return null;
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu();
      }}
      className="absolute inset-0 z-0"
    />
  );
}

// Utility functions
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}