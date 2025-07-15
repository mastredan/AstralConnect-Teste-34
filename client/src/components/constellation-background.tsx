import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ConstellationBackgroundProps {
  zodiacSign: string;
}

// SVG constellation images for each zodiac sign
const constellationImages = {
  'Áries': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ariesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#ff8e8e;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M50 150 Q60 120 80 110 Q100 100 120 110 Q140 120 150 150 Q130 140 120 130 Q100 120 80 130 Q70 140 50 150 Z" 
          fill="url(#ariesGradient)" stroke="#ff6b6b" stroke-width="2" opacity="0.7"/>
    <path d="M70 120 Q80 100 90 90 Q100 80 110 90 Q120 100 130 120" 
          fill="none" stroke="#ff6b6b" stroke-width="3" opacity="0.8"/>
  </svg>`,
  
  'Touro': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="taurusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#a78bfa;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M40 120 Q50 100 70 90 Q100 80 130 90 Q150 100 160 120 Q150 110 130 105 Q100 100 70 105 Q50 110 40 120 Z" 
          fill="url(#taurusGradient)" stroke="#8b5cf6" stroke-width="2" opacity="0.7"/>
    <path d="M60 110 Q70 90 80 85 Q100 80 120 85 Q130 90 140 110" 
          fill="none" stroke="#8b5cf6" stroke-width="3" opacity="0.8"/>
    <circle cx="75" cy="100" r="3" fill="#8b5cf6" opacity="0.9"/>
    <circle cx="125" cy="100" r="3" fill="#8b5cf6" opacity="0.9"/>
  </svg>`,
  
  'Gêmeos': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="geminiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#67e8f9;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M60 80 L60 140 M80 80 L80 140 M120 80 L120 140 M140 80 L140 140" 
          stroke="#06b6d4" stroke-width="3" opacity="0.8"/>
    <path d="M50 90 L90 90 M110 90 L150 90 M50 130 L90 130 M110 130 L150 130" 
          stroke="#06b6d4" stroke-width="2" opacity="0.7"/>
  </svg>`,
  
  'Câncer': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cancerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#fbbf24;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M70 90 Q80 80 90 90 Q100 100 110 90 Q120 80 130 90 Q120 100 110 110 Q100 120 90 110 Q80 100 70 90 Z" 
          fill="url(#cancerGradient)" stroke="#f59e0b" stroke-width="2" opacity="0.7"/>
    <circle cx="85" cy="95" r="2" fill="#f59e0b" opacity="0.9"/>
    <circle cx="115" cy="95" r="2" fill="#f59e0b" opacity="0.9"/>
  </svg>`,
  
  'Leão': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="leoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#fbbf24;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M70 80 Q100 70 130 80 Q140 90 130 100 Q120 110 110 120 Q100 130 90 120 Q80 110 70 100 Q60 90 70 80 Z" 
          fill="url(#leoGradient)" stroke="#f59e0b" stroke-width="2" opacity="0.7"/>
    <path d="M80 90 Q90 80 100 90 Q110 80 120 90" 
          fill="none" stroke="#f59e0b" stroke-width="3" opacity="0.8"/>
    <circle cx="100" cy="100" r="5" fill="#f59e0b" opacity="0.9"/>
  </svg>`,
  
  'Virgem': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="virgoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#22c55e;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#4ade80;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M80 80 L80 120 M90 80 L90 120 M100 80 L100 120 M110 80 L110 120 M120 80 L120 120" 
          stroke="#22c55e" stroke-width="2" opacity="0.8"/>
    <path d="M75 90 L125 90 M80 100 L120 100 M85 110 L115 110" 
          stroke="#22c55e" stroke-width="1.5" opacity="0.7"/>
  </svg>`,
  
  'Libra': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="libraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#a78bfa;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M60 100 L140 100 M70 90 L130 90 M80 110 L120 110" 
          stroke="#8b5cf6" stroke-width="3" opacity="0.8"/>
    <circle cx="100" cy="100" r="15" fill="none" stroke="#8b5cf6" stroke-width="2" opacity="0.7"/>
  </svg>`,
  
  'Escorpião': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scorpioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#dc2626;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#ef4444;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M60 90 Q70 80 85 85 Q100 90 115 85 Q130 80 140 90 Q130 100 120 110 Q110 120 100 115 Q90 110 80 115 Q70 120 60 110 Q50 100 60 90 Z" 
          fill="url(#scorpioGradient)" stroke="#dc2626" stroke-width="2" opacity="0.7"/>
    <path d="M100 110 Q110 120 120 130 Q125 135 130 140" 
          fill="none" stroke="#dc2626" stroke-width="3" opacity="0.8"/>
  </svg>`,
  
  'Sagitário': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sagittariusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M60 130 L140 70 M130 65 L140 70 L135 80" 
          stroke="#7c3aed" stroke-width="3" opacity="0.8"/>
    <path d="M80 110 L120 90" 
          stroke="#7c3aed" stroke-width="2" opacity="0.7"/>
  </svg>`,
  
  'Capricórnio': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="capricornGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#059669;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#10b981;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M70 120 Q80 110 90 105 Q100 100 110 105 Q120 110 130 120 Q120 125 110 130 Q100 135 90 130 Q80 125 70 120 Z" 
          fill="url(#capricornGradient)" stroke="#059669" stroke-width="2" opacity="0.7"/>
    <path d="M85 115 Q95 105 105 115 Q115 105 125 115" 
          fill="none" stroke="#059669" stroke-width="3" opacity="0.8"/>
  </svg>`,
  
  'Aquário': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aquariusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#38bdf8;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M50 90 Q60 85 70 90 Q80 95 90 90 Q100 85 110 90 Q120 95 130 90 Q140 85 150 90" 
          fill="none" stroke="#0ea5e9" stroke-width="3" opacity="0.8"/>
    <path d="M50 110 Q60 105 70 110 Q80 115 90 110 Q100 105 110 110 Q120 115 130 110 Q140 105 150 110" 
          fill="none" stroke="#0ea5e9" stroke-width="3" opacity="0.8"/>
  </svg>`,
  
  'Peixes': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="piscesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#67e8f9;stop-opacity:0.6" />
      </linearGradient>
    </defs>
    <path d="M60 80 Q80 70 90 80 Q100 90 90 100 Q80 110 60 100 Q50 90 60 80 Z" 
          fill="url(#piscesGradient)" stroke="#06b6d4" stroke-width="2" opacity="0.7"/>
    <path d="M140 120 Q120 110 110 120 Q100 130 110 140 Q120 150 140 140 Q150 130 140 120 Z" 
          fill="url(#piscesGradient)" stroke="#06b6d4" stroke-width="2" opacity="0.7"/>
    <path d="M90 90 L110 130" 
          stroke="#06b6d4" stroke-width="2" opacity="0.8"/>
  </svg>`
};

export function ConstellationBackground({ zodiacSign }: ConstellationBackgroundProps) {
  const constellationSvg = constellationImages[zodiacSign as keyof typeof constellationImages];
  
  const stars = useMemo(() => {
    // Generate constellation stars based on zodiac sign
    const starCount = 25;
    const generatedStars = [];
    
    for (let i = 0; i < starCount; i++) {
      generatedStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        delay: Math.random() * 2,
      });
    }
    
    return generatedStars;
  }, [zodiacSign]);

  if (!constellationSvg) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Constellation pattern */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-96 h-96 opacity-20"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          dangerouslySetInnerHTML={{ __html: constellationSvg }}
        />
      </div>
      
      {/* Scattered stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1, 0.8, 1] }}
          transition={{
            duration: 2,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}