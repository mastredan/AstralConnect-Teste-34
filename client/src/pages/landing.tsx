import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarField } from "@/components/star-field";
import { GlassCard } from "@/components/glass-card";
import { Star, Users, TrendingUp, Heart, User, Lock, Mail, AtSign } from "lucide-react";

export default function Landing() {
  const [showRegister, setShowRegister] = useState(false);

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
          {/* Login/Register Form */}
          <GlassCard className="p-8">
            {!showRegister ? (
              <>
                <h2 className="text-2xl font-semibold text-white mb-6 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
                  Entrar na sua constelação
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                      <User className="inline mr-2" size={16} />
                      Email ou usuário
                    </Label>
                    <Input 
                      type="text" 
                      className="w-full px-4 py-3 bg-black/40 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                      placeholder="Digite seu email ou usuário"
                    />
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                      <Lock className="inline mr-2" size={16} />
                      Senha
                    </Label>
                    <Input 
                      type="password" 
                      className="w-full px-4 py-3 bg-black/40 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                      placeholder="Digite sua senha"
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-[hsl(258,84%,60%)] hover:bg-[hsl(258,64%,32%)] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    <User className="mr-2" size={16} />
                    Entrar
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <button className="text-[hsl(220,13%,91%)] hover:text-white text-sm transition-colors">
                    Esqueceu sua senha?
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-[hsl(220,13%,91%)] text-sm">
                    Não tem uma conta?
                    <button 
                      onClick={() => setShowRegister(true)}
                      className="text-[hsl(45,93%,63%)] hover:text-yellow-300 font-semibold ml-1 transition-colors"
                    >
                      Criar conta
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-white mb-6 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
                  Criar sua constelação
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                      <User className="inline mr-2" size={16} />
                      Nome completo
                    </Label>
                    <Input 
                      type="text" 
                      className="w-full px-4 py-3 bg-black/40 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                      <Mail className="inline mr-2" size={16} />
                      Email
                    </Label>
                    <Input 
                      type="email" 
                      className="w-full px-4 py-3 bg-black/40 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                      placeholder="Digite seu email"
                    />
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                      <AtSign className="inline mr-2" size={16} />
                      Usuário
                    </Label>
                    <Input 
                      type="text" 
                      className="w-full px-4 py-3 bg-black/40 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                      placeholder="Escolha um nome de usuário"
                    />
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                      <Lock className="inline mr-2" size={16} />
                      Senha
                    </Label>
                    <Input 
                      type="password" 
                      className="w-full px-4 py-3 bg-black/40 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                      placeholder="Crie uma senha segura"
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-[hsl(258,84%,60%)] hover:bg-[hsl(258,64%,32%)] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    <Star className="mr-2" size={16} />
                    Continuar
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-[hsl(220,13%,91%)] text-sm">
                    Já tem uma conta?
                    <button 
                      onClick={() => setShowRegister(false)}
                      className="text-[hsl(45,93%,63%)] hover:text-yellow-300 font-semibold ml-1 transition-colors"
                    >
                      Entrar
                    </button>
                  </p>
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>

        {/* Features Preview */}
        <motion.div 
          className="mt-12 max-w-4xl w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center transform hover:scale-105 transition-transform">
              <Users className="text-3xl text-[hsl(45,93%,63%)] mb-3 mx-auto" size={48} />
              <h3 className="text-white font-semibold mb-2">Comunidades</h3>
              <p className="text-[hsl(220,13%,91%)] text-sm">Conecte-se com pessoas que compartilham seus interesses</p>
            </GlassCard>
            <GlassCard className="p-6 text-center transform hover:scale-105 transition-transform">
              <TrendingUp className="text-3xl text-[hsl(45,93%,63%)] mb-3 mx-auto" size={48} />
              <h3 className="text-white font-semibold mb-2">Mapa Astral</h3>
              <p className="text-[hsl(220,13%,91%)] text-sm">Descubra sua personalidade através das estrelas</p>
            </GlassCard>
            <GlassCard className="p-6 text-center transform hover:scale-105 transition-transform">
              <Heart className="text-3xl text-[hsl(45,93%,63%)] mb-3 mx-auto" size={48} />
              <h3 className="text-white font-semibold mb-2">Compatibilidade</h3>
              <p className="text-[hsl(220,13%,91%)] text-sm">Encontre conexões baseadas em afinidades astrais</p>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
