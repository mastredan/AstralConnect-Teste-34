import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/star-field";
import { GlassCard } from "@/components/glass-card";
import { Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen mystical-gradient relative overflow-hidden">
      {/* Animated Background Stars */}
      <StarField />
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative z-10">
        {/* Logo and Branding */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-4">
            <motion.div
              className="animate-float"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Star className="text-6xl text-[hsl(45,93%,63%)] mb-2 mx-auto" size={64} />
            </motion.div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
            ASTRUS
          </h1>
          <p className="text-lg md:text-xl text-[hsl(220,13%,91%)] font-light">
            Conectando vidas através das estrelas
          </p>
        </motion.div>

        {/* Main Content Container */}
        <motion.div 
          className="max-w-md w-full space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Login Form */}
          <GlassCard className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
              Entre na sua constelação
            </h2>
            
            <p className="text-[hsl(220,13%,91%)] mb-6">
              Conecte-se com outros através da astrologia e descubra sua compatibilidade cósmica.
            </p>
            
            <Button 
              className="w-full bg-gradient-to-r from-[hsl(258,84%,60%)] to-[hsl(220,70%,60%)] hover:from-[hsl(258,84%,65%)] hover:to-[hsl(220,70%,65%)] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => window.location.href = '/api/login'}
            >
              <Star className="mr-2" size={16} />
              Entrar com Replit
            </Button>
          </GlassCard>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="max-w-4xl w-full mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <GlassCard className="p-6 text-center">
            <Star className="text-3xl text-[hsl(45,93%,63%)] mb-4 mx-auto" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">Compatibilidade Astral</h3>
            <p className="text-[hsl(220,13%,91%)] text-sm">
              Descubra sua compatibilidade com outros usuários baseada em mapas astrais
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <Star className="text-3xl text-[hsl(45,93%,63%)] mb-4 mx-auto" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">Comunidades Temáticas</h3>
            <p className="text-[hsl(220,13%,91%)] text-sm">
              Participe de comunidades sobre cinema, culinária, notícias e entretenimento
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <Star className="text-3xl text-[hsl(45,93%,63%)] mb-4 mx-auto" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">Rede Social Mística</h3>
            <p className="text-[hsl(220,13%,91%)] text-sm">
              Conecte-se com pessoas que compartilham seus interesses astrológicos
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}