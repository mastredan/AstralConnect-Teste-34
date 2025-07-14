import { Star } from "lucide-react";
import { GlassCard } from "./glass-card";

export function HoroscopeCard() {
  return (
    <GlassCard className="p-6">
      <h3 className="text-white font-semibold mb-4">
        <Star className="inline mr-2" size={20} />
        Seu Horóscopo Hoje
      </h3>
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">♎</div>
        <h4 className="text-white font-semibold">Libra</h4>
      </div>
      <p className="text-[hsl(220,13%,91%)] text-sm mb-4">
        Hoje é um dia favorável para relacionamentos. Vênus em trânsito traz harmonia e oportunidades de conectar-se 
        com pessoas especiais. Mantenha o equilíbrio em todas as áreas da sua vida.
      </p>
      <div className="flex items-center justify-between text-sm">
        <div className="text-center">
          <div className="text-[hsl(45,93%,63%)] font-semibold">Amor</div>
          <div className="text-[hsl(220,13%,91%)]">★★★★☆</div>
        </div>
        <div className="text-center">
          <div className="text-[hsl(45,93%,63%)] font-semibold">Trabalho</div>
          <div className="text-[hsl(220,13%,91%)]">★★★☆☆</div>
        </div>
        <div className="text-center">
          <div className="text-[hsl(45,93%,63%)] font-semibold">Saúde</div>
          <div className="text-[hsl(220,13%,91%)]">★★★★★</div>
        </div>
      </div>
    </GlassCard>
  );
}
