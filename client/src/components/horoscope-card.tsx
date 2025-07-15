import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "./glass-card";

interface HoroscopeData {
  zodiacSign: string;
  symbol: string;
  element: string;
  message: string;
  ratings: {
    love: number;
    work: number;
    health: number;
  };
  date: string;
}

function formatStarRating(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

export function HoroscopeCard() {
  const { data: horoscope, isLoading, error } = useQuery<HoroscopeData>({
    queryKey: ['/api/horoscope'],
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-white font-semibold mb-4">
          <Star className="inline mr-2" size={20} />
          Seu Horóscopo Hoje
        </h3>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[hsl(258,84%,60%)] border-t-transparent mx-auto"></div>
          <p className="text-[hsl(220,13%,91%)] text-sm mt-2">Consultando os astros...</p>
        </div>
      </GlassCard>
    );
  }

  if (error || !horoscope) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-white font-semibold mb-4">
          <Star className="inline mr-2" size={20} />
          Seu Horóscopo Hoje
        </h3>
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">✨</div>
          <h4 className="text-white font-semibold">Horóscopo</h4>
        </div>
        <p className="text-[hsl(220,13%,91%)] text-sm mb-4">
          Complete seu perfil astrológico para ver sua previsão personalizada do dia.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-white font-semibold mb-4">
        <Star className="inline mr-2" size={20} />
        {horoscope ? `Horóscopo - ${horoscope.zodiacSign}` : 'Seu Horóscopo Hoje'}
      </h3>
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{horoscope.symbol}</div>
        <h4 className="text-white font-semibold">{horoscope.zodiacSign}</h4>
        <p className="text-[hsl(220,13%,91%)] text-xs">Elemento: {horoscope.element}</p>
      </div>
      <p className="text-[hsl(220,13%,91%)] text-sm mb-4 leading-relaxed">
        {horoscope.message}
      </p>
      <div className="flex items-center justify-between text-sm">
        <div className="text-center">
          <div className="text-[hsl(45,93%,63%)] font-semibold">Amor</div>
          <div className="text-[hsl(220,13%,91%)]">{formatStarRating(horoscope.ratings.love)}</div>
        </div>
        <div className="text-center">
          <div className="text-[hsl(45,93%,63%)] font-semibold">Trabalho</div>
          <div className="text-[hsl(220,13%,91%)]">{formatStarRating(horoscope.ratings.work)}</div>
        </div>
        <div className="text-center">
          <div className="text-[hsl(45,93%,63%)] font-semibold">Saúde</div>
          <div className="text-[hsl(220,13%,91%)]">{formatStarRating(horoscope.ratings.health)}</div>
        </div>
      </div>
    </GlassCard>
  );
}
