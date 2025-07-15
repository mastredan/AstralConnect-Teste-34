import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Sun, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

interface AstralCountdownProps {
  isActive: boolean;
  onComplete: () => void;
}

export function AstralCountdown({ isActive, onComplete }: AstralCountdownProps) {
  const [countdown, setCountdown] = useState(15);
  const [motivationalPhrase, setMotivationalPhrase] = useState('');
  const [isGeneratingPhrase, setIsGeneratingPhrase] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const isInitialized = useRef(false);
  const intervalsRef = useRef<{ countdown?: NodeJS.Timeout; phrase?: NodeJS.Timeout; zodiac?: NodeJS.Timeout }>({});

  const zodiacSigns = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  const [currentZodiacIndex, setCurrentZodiacIndex] = useState(0);

  const generateMotivationalPhrase = async () => {
    if (isGeneratingPhrase) return;
    
    setIsGeneratingPhrase(true);
    try {
      const response = await apiRequest('POST', '/api/generate-motivational-phrase', { context: 'astral_map_creation' });
      const data = await response.json();
      setMotivationalPhrase(data.phrase);
    } catch (error) {
      console.error('Error generating motivational phrase:', error);
      // Fallback phrases if API fails
      const fallbackPhrases = [
        "As estrelas estão se alinhando para revelar seus segredos...",
        "O universo sussurra os mistérios de sua alma...",
        "Cada planeta conta uma história única sobre você...",
        "Sua jornada cósmica está sendo desvendada...",
        "Os astros revelam o mapa de sua essência...",
        "O cosmos desenha o retrato de seu destino..."
      ];
      setMotivationalPhrase(fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)]);
    } finally {
      setIsGeneratingPhrase(false);
    }
  };

  useEffect(() => {
    console.log('AstralCountdown useEffect called, isActive:', isActive);
    console.log('AstralCountdown isActive type:', typeof isActive);
    console.log('AstralCountdown isActive value:', isActive);
    
    if (!isActive) {
      console.log('Countdown not active, useEffect returning early');
      // Clear any existing intervals when countdown becomes inactive
      Object.values(intervalsRef.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
      intervalsRef.current = {};
      isInitialized.current = false;
      return;
    }

    // Prevent re-initialization if already running
    if (isInitialized.current) {
      console.log('Countdown already initialized, skipping...');
      return;
    }

    console.log('Countdown is active, initializing...');
    isInitialized.current = true;
    
    // Generate initial phrase
    generateMotivationalPhrase();

    // Countdown timer
    intervalsRef.current.countdown = setInterval(() => {
      setCountdown(prev => {
        console.log('Countdown tick:', prev);
        if (prev <= 1) {
          console.log('Countdown reached 0, clearing interval');
          if (intervalsRef.current.countdown) {
            clearInterval(intervalsRef.current.countdown);
          }
          setShowFinalMessage(true);
          console.log('Setting final message to true');
          setTimeout(() => {
            console.log('Countdown finished, calling onComplete');
            onComplete();
          }, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Generate new phrase every 7 seconds
    intervalsRef.current.phrase = setInterval(() => {
      generateMotivationalPhrase();
    }, 7000);

    // Zodiac animation
    intervalsRef.current.zodiac = setInterval(() => {
      setCurrentZodiacIndex(prev => (prev + 1) % zodiacSigns.length);
    }, 500);

    return () => {
      // Cleanup intervals on unmount
      Object.values(intervalsRef.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
      intervalsRef.current = {};
    };
  }, [isActive]); // Remove onComplete from dependencies to prevent resets

  if (!isActive) {
    console.log('Countdown not active, returning null');
    return null;
  }
  
  console.log('Rendering countdown with:', { isActive, countdown, showFinalMessage });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]"
    >
      <div className="relative">
        {/* Zodiac Circle Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="w-80 h-80 border-2 border-purple-500 rounded-full relative"
          >
            {zodiacSigns.map((sign, index) => (
              <motion.div
                key={index}
                className={`absolute w-8 h-8 flex items-center justify-center text-2xl ${
                  index === currentZodiacIndex ? 'text-yellow-400 scale-125' : 'text-purple-400'
                }`}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${index * 30}deg) translateY(-140px) rotate(-${index * 30}deg)`,
                }}
                animate={{
                  scale: index === currentZodiacIndex ? 1.3 : 1,
                  color: index === currentZodiacIndex ? '#fbbf24' : '#a855f7',
                }}
                transition={{ duration: 0.3 }}
              >
                {sign}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Main Content */}
        <Card className="w-96 bg-gradient-to-br from-purple-900 to-blue-900 border-purple-500 text-white shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Countdown or Final Message */}
            <AnimatePresence mode="wait">
              {!showFinalMessage ? (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-6xl font-bold text-yellow-400 mb-2"
                  >
                    {countdown}
                  </motion.div>
                  <p className="text-purple-200 text-lg">segundos</p>
                </motion.div>
              ) : (
                <motion.div
                  key="final"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  >
                    <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-xl font-semibold text-yellow-400">
                    Seu mapa astral está pronto!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Motivational Phrase */}
            <AnimatePresence mode="wait">
              <motion.div
                key={motivationalPhrase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-sm"
                />
                <div className="relative bg-black bg-opacity-50 p-4 rounded-lg border border-purple-400">
                  <div className="flex items-center justify-center mb-2">
                    <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Sun className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                    <Sparkles className="w-5 h-5 text-purple-400 ml-2" />
                  </div>
                  <p className="text-purple-100 italic text-sm leading-relaxed">
                    {motivationalPhrase}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Loading Animation */}
            <div className="mt-6 flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-purple-400 border-t-yellow-400 rounded-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}