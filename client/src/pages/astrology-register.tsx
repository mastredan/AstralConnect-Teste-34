import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarField } from "@/components/star-field";
import { GlassCard } from "@/components/glass-card";
import { AstralMapModal } from "@/components/astral-map-modal-enhanced";
import { AstralCountdown } from "@/components/astral-countdown";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertAstrologicalProfileSchema } from "@shared/schema";
import { Calendar, Clock, Globe, MapPin, Shield, Star, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Combined form schema for user registration and astrological profile
const formSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  birthDate: z.string()
    .min(1, "Data de nascimento é obrigatória")
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed < new Date() && parsed.getFullYear() > 1900;
    }, "Data de nascimento inválida"),
  birthTime: z.string().optional(),
  birthCountry: z.string().min(1, "País é obrigatório"),
  birthState: z.string().min(1, "Estado é obrigatório"),
  birthCity: z.string().min(1, "Cidade é obrigatória"),
});

export default function AstrologyRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>("");
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [astralMapData, setAstralMapData] = useState<any>(null);
  const [showAstralMapModal, setShowAstralMapModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  const [birthTimeAmPm, setBirthTimeAmPm] = useState<"AM" | "PM">("AM");
  const [birthTimeMessage, setBirthTimeMessage] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      birthDate: "",
      birthTime: "",
      birthCountry: "Brasil",
      birthState: "",
      birthCity: "",
    },
  });

  // Fetch Brazilian states
  const { data: statesData } = useQuery({
    queryKey: ['/api/brazilian-states'],
  });

  // Ensure states is always a valid array with proper validation
  const states = useMemo(() => {
    if (!Array.isArray(statesData)) {
      return [];
    }
    
    return statesData.filter((state: any) => {
      return state && 
             typeof state === 'object' && 
             state.code && 
             typeof state.code === 'string' && 
             state.name && 
             typeof state.name === 'string';
    });
  }, [statesData]);

  // Fetch municipalities for selected state
  const { data: municipalitiesData, isLoading: isLoadingMunicipalities, error: municipalitiesError } = useQuery({
    queryKey: ['/api/brazilian-municipalities', selectedState],
    enabled: !!selectedState,
  });

  // Ensure municipalities is always a valid array with proper validation and sorting
  const municipalities = useMemo(() => {
    if (!Array.isArray(municipalitiesData)) {
      return [];
    }
    
    const validMunicipalities = municipalitiesData.filter((city: any) => {
      return city && 
             typeof city === 'object' && 
             city.name && 
             typeof city.name === 'string' && 
             city.id && 
             (typeof city.id === 'number' || typeof city.id === 'string');
    });

    // Sort municipalities safely
    return validMunicipalities.sort((a: any, b: any) => {
      try {
        const nameA = String(a.name || '');
        const nameB = String(b.name || '');
        return nameA.localeCompare(nameB, 'pt-BR');
      } catch (e) {
        console.error('Error sorting municipalities:', e);
        return 0;
      }
    });
  }, [municipalitiesData]);

  // Create user account and astrological profile mutation
  const createAccountMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Show countdown immediately
      setShowCountdown(true);
      
      // Register user with all data including password
      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        birthDate: data.birthDate,
        birthTime: data.birthTime || null,
        birthCountry: data.birthCountry,
        birthState: data.birthState,
        birthCity: data.birthCity,
      };
      
      await apiRequest("POST", "/api/register", registrationData);
      
      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate astral map (now with valid session)
      const mapaAstralData = {
        nome: `${data.firstName} ${data.lastName}`,
        data_nascimento: data.birthDate,
        hora_nascimento: data.birthTime || "12:00",
        local_nascimento: `${data.birthCity}, ${data.birthState}, Brasil`,
      };
      
      const mapaAstral = await apiRequest("POST", "/api/generate-astral-map", mapaAstralData);
      
      // Set astral map data for later use
      setAstralMapData(mapaAstral);
      
      return mapaAstral;
    },
    onSuccess: () => {
      // Invalida o cache de autenticação para forçar refresh
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsRegistrationComplete(true);
      toast({
        title: "Sucesso!",
        description: "Conta criada e mapa astral gerado com sucesso!",
      });
    },
    onError: (error) => {
      setShowCountdown(false);
      toast({
        title: "Erro",
        description: "Falha ao criar conta ou gerar mapa astral. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createAccountMutation.mutate(data);
  };

  // Handle countdown completion
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setShowAstralMapModal(true);
    
    // Force modal to stay visible with a small delay to ensure state is updated
    setTimeout(() => {
      setShowAstralMapModal(true);
    }, 100);
  };

  // Calculate zodiac sign based on birth date
  const calculateZodiacSign = (birthDate: string) => {
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const signs = [
      { name: "Capricórnio", start: [12, 22], end: [1, 19] },
      { name: "Aquário", start: [1, 20], end: [2, 18] },
      { name: "Peixes", start: [2, 19], end: [3, 20] },
      { name: "Áries", start: [3, 21], end: [4, 19] },
      { name: "Touro", start: [4, 20], end: [5, 20] },
      { name: "Gêmeos", start: [5, 21], end: [6, 20] },
      { name: "Câncer", start: [6, 21], end: [7, 22] },
      { name: "Leão", start: [7, 23], end: [8, 22] },
      { name: "Virgem", start: [8, 23], end: [9, 22] },
      { name: "Libra", start: [9, 23], end: [10, 22] },
      { name: "Escorpião", start: [10, 23], end: [11, 21] },
      { name: "Sagitário", start: [11, 22], end: [12, 21] },
    ];

    for (const sign of signs) {
      const [startMonth, startDay] = sign.start;
      const [endMonth, endDay] = sign.end;
      
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay)
      ) {
        return sign.name;
      }
    }
    
    return "Capricórnio"; // Default fallback
  };

  // Function to generate birth time message
  const generateBirthTimeMessage = (time: string) => {
    if (!time) {
      setBirthTimeMessage("");
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    if (hours >= 0 && hours <= 11 && !(hours === 0 && minutes === 0)) {
      setBirthTimeMessage(`Você nasceu às ${formattedTime} horas da manhã.`);
    } else if (hours >= 12 && hours <= 17) {
      setBirthTimeMessage(`Você nasceu às ${formattedTime} horas da tarde.`);
    } else if (hours >= 18 && hours <= 23) {
      setBirthTimeMessage(`Você nasceu às ${formattedTime} horas da noite.`);
    } else {
      setBirthTimeMessage("");
    }
  };

  // Watch for changes in birth time
  const watchedBirthTime = form.watch("birthTime");
  useEffect(() => {
    generateBirthTimeMessage(watchedBirthTime);
  }, [watchedBirthTime]);

  // Handle automatic redirection after successful registration
  useEffect(() => {
    if (isAuthenticated && isRegistrationComplete && !showAstralMapModal) {
      // Only redirect if modal is not being shown
      setTimeout(() => {
        setLocation("/");
      }, 1000); // 1 second delay
    }
  }, [isAuthenticated, isRegistrationComplete, showAstralMapModal, setLocation]);

  // Redirect authenticated users to home page
  useEffect(() => {
    if (isAuthenticated && !isRegistrationComplete && !showCountdown) {
      setLocation("/");
    }
  }, [isAuthenticated, isRegistrationComplete, showCountdown, setLocation]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen w-screen mystical-gradient relative overflow-hidden fixed inset-0 flex items-center justify-center">
        <StarField />
        <div className="text-center relative z-10">
          <Star className="text-5xl text-[hsl(45,93%,63%)] mb-4 mx-auto animate-spin" size={64} />
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen mystical-gradient relative overflow-hidden fixed inset-0">
      <StarField />
      
      <div className="h-full w-full flex flex-col items-center justify-center px-4 py-8 relative z-10 overflow-y-auto">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-4">
              <Star className="text-5xl text-[hsl(45,93%,63%)] mb-2 mx-auto" size={64} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
              Criar Conta
            </h1>
            <p className="text-lg text-[hsl(220,13%,91%)]">
              Complete suas informações pessoais e astrológicas para criar sua conta
            </p>
          </motion.div>



          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlassCard className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                    Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                        <UserPlus className="inline mr-2" size={16} />
                        Nome
                      </Label>
                      <Input
                        type="text"
                        placeholder="João"
                        {...form.register("firstName")}
                        className="input-dark w-full px-4 py-3 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-red-400 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                        <UserPlus className="inline mr-2" size={16} />
                        Sobrenome
                      </Label>
                      <Input
                        type="text"
                        placeholder="Silva"
                        {...form.register("lastName")}
                        className="input-dark w-full px-4 py-3 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-red-400 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                      <LogIn className="inline mr-2" size={16} />
                      Email
                    </Label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      {...form.register("email")}
                      className="input-dark w-full px-4 py-3 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                      <Shield className="inline mr-2" size={16} />
                      Senha
                    </Label>
                    <Input
                      type="password"
                      placeholder="Digite sua senha"
                      {...form.register("password")}
                      className="input-dark w-full px-4 py-3 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                    />
                    {form.formState.errors.password && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.password.message}</p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/20 my-6"></div>

                {/* Astrological Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                    Informações Astrológicas
                  </h3>
                  
                  {/* Birth Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                      <Calendar className="inline mr-2" size={16} />
                      Data de nascimento
                    </Label>
                    <Input
                      type="date"
                      {...form.register("birthDate")}
                      max={new Date().toISOString().split('T')[0]}
                      min="1900-01-01"
                      className="input-dark w-full px-4 py-3 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                    />
                    {form.formState.errors.birthDate && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.birthDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                      <Clock className="inline mr-2" size={16} />
                      Hora de nascimento
                    </Label>
                    <Input
                      type="time"
                      {...form.register("birthTime")}
                      className="input-dark w-full px-4 py-3 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                    />
                    {form.formState.errors.birthTime && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.birthTime.message}</p>
                    )}
                    {birthTimeMessage && (
                      <p className="text-[hsl(45,93%,63%)] text-sm mt-1 font-medium">{birthTimeMessage}</p>
                    )}
                  </div>
                </div>

                {/* Country Selection */}
                <div>
                  <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                    <Globe className="inline mr-2" size={16} />
                    País
                  </Label>
                  <Select value="Brasil" disabled>
                    <SelectTrigger className="input-dark w-full px-4 py-3 rounded-xl text-white focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]">
                      <SelectValue placeholder="Selecione um país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brasil">Brasil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* State Selection */}
                <div>
                  <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Estado
                  </Label>
                  <Select
                    value={selectedState}
                    onValueChange={(value) => {
                      try {
                        setSelectedState(value);
                        form.setValue("birthState", value);
                        form.setValue("birthCity", ""); // Reset city when state changes
                      } catch (error) {
                        console.error('Error setting state value:', error);
                      }
                    }}
                  >
                    <SelectTrigger className="input-dark w-full px-4 py-3 rounded-xl text-white focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]">
                      <SelectValue placeholder="Selecione um estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state: any) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.birthState && (
                    <p className="text-red-400 text-sm mt-1">{form.formState.errors.birthState.message}</p>
                  )}
                </div>

                {/* City Selection */}
                <div>
                  <Label className="block text-sm font-medium text-[hsl(220,13%,91%)] mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Cidade
                  </Label>
                  <Select
                    value={form.watch("birthCity") || ""}
                    onValueChange={(value) => {
                      try {
                        form.setValue("birthCity", value);
                      } catch (error) {
                        console.error('Error setting city value:', error);
                      }
                    }}
                    disabled={!selectedState || isLoadingMunicipalities}
                  >
                    <SelectTrigger className="input-dark w-full px-4 py-3 rounded-xl text-white focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]">
                      <SelectValue placeholder={
                        !selectedState ? "Selecione primeiro um estado" :
                        isLoadingMunicipalities ? "Carregando cidades..." :
                        "Selecione uma cidade"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {!selectedState ? (
                        <div className="p-4 text-gray-400 text-sm">
                          Selecione um estado primeiro
                        </div>
                      ) : isLoadingMunicipalities ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[hsl(258,84%,60%)] border-t-transparent"></div>
                          <span className="ml-2 text-sm">Carregando cidades...</span>
                        </div>
                      ) : municipalitiesError ? (
                        <div className="p-4 text-red-400 text-sm">
                          Erro ao carregar cidades. Tente novamente.
                        </div>
                      ) : municipalities.length > 0 ? (
                        municipalities.map((city: any) => {
                          const cityId = String(city.id || Math.random());
                          const cityName = String(city.name || '');
                          if (!cityName) return null;
                          return (
                            <SelectItem key={cityId} value={cityName}>
                              {cityName}
                            </SelectItem>
                          );
                        }).filter(Boolean)
                      ) : (
                        <div className="p-4 text-gray-400 text-sm">
                          Nenhuma cidade encontrada
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.birthCity && (
                    <p className="text-red-400 text-sm mt-1">{form.formState.errors.birthCity.message}</p>
                  )}
                </div>

                {/* Privacy Notice */}
                <div className="glass-effect rounded-xl p-4 border border-white/20">
                  <div className="flex items-start">
                    <Shield className="text-[hsl(45,93%,63%)] mr-3 mt-1" size={20} />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Privacidade dos dados</h4>
                      <p className="text-[hsl(220,13%,91%)] text-sm">
                        Seus dados astrológicos são utilizados apenas para criar seu mapa astral e melhorar sua experiência. 
                        Não compartilhamos informações pessoais com terceiros.
                      </p>
                    </div>
                  </div>
                </div>

                </div>
                
                {/* Submit Button */}
                <Button 
                  type="submit"
                  disabled={createAccountMutation.isPending}
                  className="w-full bg-[hsl(258,84%,60%)] hover:bg-[hsl(258,64%,32%)] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
                >
                  <Star className="mr-2" size={16} />
                  {createAccountMutation.isPending ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
      
      {/* Astral Countdown */}
      <AstralCountdown
        isActive={showCountdown}
        onComplete={handleCountdownComplete}
      />
      
      {/* Astral Map Modal */}
      <AstralMapModal
        isOpen={showAstralMapModal}
        onClose={() => setShowAstralMapModal(false)}
        data={astralMapData}
        onRegenerate={() => {
          // Close modal and restart the process
          setShowAstralMapModal(false);
          setAstralMapData(null);
          setShowCountdown(true);
        }}
      />
      
      {/* Continue to Home Button */}
      {astralMapData && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-[hsl(258,84%,60%)] hover:bg-[hsl(258,64%,32%)] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
          >
            <Star className="mr-2" size={16} />
            Acessar Rede Social
          </Button>
        </div>
      )}
    </div>
  );
}
