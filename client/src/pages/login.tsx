import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Star, Mail, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StarField } from "@/components/star-field";
import { GlassCard } from "@/components/glass-card";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/login", data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso!",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Email não encontrado ou dados inválidos.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen mystical-gradient relative overflow-hidden">
      <StarField />
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <Star className="text-6xl text-[hsl(45,93%,63%)] animate-pulse" size={64} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bem-vindo de volta ao <span className="text-[hsl(45,93%,63%)]">ASTRUS</span>
            </h1>
            <p className="text-[hsl(220,13%,91%)] text-lg">
              Faça login para acessar sua rede social astrológica
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlassCard className="p-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                    <Mail className="inline mr-2" size={16} />
                    Email
                  </Label>
                  <Input
                    type="email"
                    {...form.register("email")}
                    placeholder="seu.email@exemplo.com"
                    className="input-dark w-full px-4 py-3 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="inline-flex items-center"
                    >
                      {showPassword ? <EyeOff className="mr-2" size={16} /> : <Eye className="mr-2" size={16} />}
                      Senha
                    </button>
                  </Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    placeholder="Digite sua senha"
                    className="input-dark w-full px-4 py-3 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                  />
                  {form.formState.errors.password && (
                    <p className="text-red-400 text-sm mt-1">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-[hsl(258,84%,60%)] hover:bg-[hsl(258,64%,32%)] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
                >
                  <LogIn className="mr-2" size={16} />
                  {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[hsl(220,13%,91%)] text-sm">
                  Não tem uma conta?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-[hsl(45,93%,63%)] hover:text-[hsl(45,93%,80%)] font-medium transition-colors"
                  >
                    Criar conta
                  </button>
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}