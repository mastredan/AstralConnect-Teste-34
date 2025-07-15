import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarField } from "@/components/star-field";
import { GlassCard } from "@/components/glass-card";
import { Star, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = (data: LoginForm) => {
    // Simular login bem-sucedido
    console.log("Login data:", data);
    // Redirecionar para /api/login para processar autenticação
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen mystical-gradient relative overflow-hidden">
      <StarField />
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative z-10">
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link href="/">
            <motion.div
              className="animate-float cursor-pointer"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Star className="text-6xl text-[hsl(45,93%,63%)] mb-2 mx-auto" size={64} />
            </motion.div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
            ASTRUS
          </h1>
          <p className="text-lg text-[hsl(220,13%,91%)] font-light">
            Conectando vidas através das estrelas
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div 
          className="max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlassCard className="p-8">
            <div className="flex items-center mb-6">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-[hsl(220,13%,91%)] hover:text-white p-0">
                  <ArrowLeft className="mr-2" size={16} />
                  Voltar
                </Button>
              </Link>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-6 text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
              Entrar na sua conta
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[hsl(220,13%,91%)]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="input-dark"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[hsl(220,13%,91%)]">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="input-dark"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-[hsl(258,84%,60%)] to-[hsl(220,70%,60%)] hover:from-[hsl(258,84%,65%)] hover:to-[hsl(220,70%,65%)] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <Star className="mr-2" size={16} />
                Entrar
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-[hsl(220,13%,91%)]">
                Não tem uma conta?{" "}
                <Link href="/astrology-register" className="text-[hsl(258,84%,60%)] hover:text-[hsl(258,84%,65%)] font-semibold">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}