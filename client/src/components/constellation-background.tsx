import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ConstellationBackgroundProps {
  zodiacSign: string;
}

// Constellation patterns for each zodiac sign
const constellationPatterns = {
  'Áries': [
    { x: 10, y: 20, size: 2 },
    { x: 20, y: 15, size: 3 },
    { x: 30, y: 25, size: 2 },
    { x: 35, y: 10, size: 2 },
  ],
  'Touro': [
    { x: 15, y: 25, size: 3 },
    { x: 25, y: 20, size: 2 },
    { x: 35, y: 30, size: 2 },
    { x: 40, y: 15, size: 2 },
    { x: 45, y: 25, size: 2 },
  ],
  'Gêmeos': [
    { x: 12, y: 18, size: 2 },
    { x: 22, y: 12, size: 2 },
    { x: 32, y: 18, size: 2 },
    { x: 42, y: 12, size: 2 },
    { x: 25, y: 30, size: 3 },
    { x: 35, y: 30, size: 3 },
  ],
  'Câncer': [
    { x: 18, y: 22, size: 2 },
    { x: 28, y: 18, size: 3 },
    { x: 38, y: 28, size: 2 },
    { x: 32, y: 35, size: 2 },
  ],
  'Leão': [
    { x: 20, y: 15, size: 3 },
    { x: 30, y: 20, size: 2 },
    { x: 40, y: 25, size: 2 },
    { x: 25, y: 30, size: 2 },
    { x: 35, y: 35, size: 2 },
    { x: 45, y: 30, size: 2 },
  ],
  'Virgem': [
    { x: 15, y: 20, size: 2 },
    { x: 25, y: 15, size: 2 },
    { x: 35, y: 25, size: 3 },
    { x: 45, y: 20, size: 2 },
    { x: 30, y: 35, size: 2 },
  ],
  'Libra': [
    { x: 20, y: 18, size: 2 },
    { x: 30, y: 22, size: 3 },
    { x: 40, y: 18, size: 2 },
    { x: 30, y: 30, size: 2 },
  ],
  'Escorpião': [
    { x: 18, y: 15, size: 2 },
    { x: 28, y: 20, size: 3 },
    { x: 38, y: 25, size: 2 },
    { x: 42, y: 35, size: 2 },
    { x: 35, y: 40, size: 2 },
    { x: 25, y: 35, size: 2 },
  ],
  'Sagitário': [
    { x: 22, y: 20, size: 2 },
    { x: 32, y: 15, size: 2 },
    { x: 42, y: 25, size: 3 },
    { x: 35, y: 35, size: 2 },
    { x: 45, y: 40, size: 2 },
  ],
  'Capricórnio': [
    { x: 15, y: 25, size: 2 },
    { x: 25, y: 20, size: 2 },
    { x: 35, y: 30, size: 3 },
    { x: 45, y: 25, size: 2 },
    { x: 40, y: 35, size: 2 },
  ],
  'Aquário': [
    { x: 20, y: 18, size: 2 },
    { x: 30, y: 25, size: 2 },
    { x: 40, y: 20, size: 3 },
    { x: 25, y: 35, size: 2 },
    { x: 35, y: 40, size: 2 },
    { x: 45, y: 35, size: 2 },
  ],
  'Peixes': [
    { x: 18, y: 22, size: 2 },
    { x: 28, y: 18, size: 2 },
    { x: 38, y: 28, size: 2 },
    { x: 42, y: 22, size: 3 },
    { x: 22, y: 35, size: 2 },
    { x: 32, y: 40, size: 2 },
  ],
};

export function ConstellationBackground({ zodiacSign }: ConstellationBackgroundProps) {
  const stars = useMemo(() => {
    const pattern = constellationPatterns[zodiacSign as keyof typeof constellationPatterns] || constellationPatterns['Libra'];
    
    // Create multiple variations of the constellation across the screen
    const allStars = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        pattern.forEach((star, index) => {
          allStars.push({
            id: `${i}-${j}-${index}`,
            x: star.x + (i * 30) + (Math.random() * 5),
            y: star.y + (j * 40) + (Math.random() * 5),
            size: star.size + (Math.random() * 0.5),
            opacity: 0.3 + (Math.random() * 0.4),
            delay: Math.random() * 3,
          });
        });
      }
    }
    
    return allStars;
  }, [zodiacSign]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-[hsl(45,93%,63%)] rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [star.opacity, star.opacity * 1.5, star.opacity],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
      
      {/* Connecting lines for constellation effect */}
      <svg className="absolute inset-0 w-full h-full">
        {constellationPatterns[zodiacSign as keyof typeof constellationPatterns]?.map((star, index, array) => {
          if (index === array.length - 1) return null;
          const nextStar = array[index + 1];
          return (
            <motion.line
              key={`line-${index}`}
              x1={`${star.x}%`}
              y1={`${star.y}%`}
              x2={`${nextStar.x}%`}
              y2={`${nextStar.y}%`}
              stroke="hsl(45,93%,63%)"
              strokeWidth="0.5"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: index * 0.3 }}
            />
          );
        })}
      </svg>
    </div>
  );
}