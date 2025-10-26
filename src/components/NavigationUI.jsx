import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

export default function NavigationUI({ layer, history, onGoHome, onGoBack }) {
  const showBackButton = history && history.length > 1;

  return (
    <>
      {/* Home Button - Top Left */}
      <button
        onClick={onGoHome}
        disabled={layer === 'earth'}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '12px',
          background: layer === 'earth' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          cursor: layer === 'earth' ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          opacity: layer === 'earth' ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (layer !== 'earth') {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Go to Home (Earth)"
      >
        <Home size={24} color="white" strokeWidth={2} />
      </button>

      {/* Back Button - Top Right */}
      {showBackButton && (
        <button
          onClick={onGoBack}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '12px 20px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Go Back One Level"
        >
          <ArrowLeft size={20} color="white" strokeWidth={2} />
          <span style={{ 
            color: 'white', 
            fontWeight: '600', 
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Back
          </span>
        </button>
      )}

      {/* Current Layer Indicator - Top Center */}
      <div style={{
        position: 'fixed',
        top: '90px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        padding: '10px 20px',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <span style={{
          color: 'white',
          fontSize: '13px',
          fontWeight: '500',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.5px'
        }}>
          {layer === 'earth' && '🌍 Earth'}
          {layer === 'continent' && '🗺️ Continent'}
          {layer === 'country' && '🏴 Country'}
          {layer === 'city' && '🏙️ City'}
        </span>
      </div>

      {/* Bottom Instructions */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        padding: '12px 24px',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <span style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }}>
          Click to zoom in • Right-click or Back button to zoom out
        </span>
      </div>
    </>
  );
}