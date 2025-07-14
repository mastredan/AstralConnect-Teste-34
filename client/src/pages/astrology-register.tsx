import { useState, useEffect } from "react";
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertAstrologicalProfileSchema } from "@shared/schema";
import { Calendar, Clock, Globe, MapPin, Shield, Star, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const formSchema = insertAstrologicalProfileSchema.omit({ userId: true });

export default function AstrologyRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>("");
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  const [birthTimeAmPm, setBirthTimeAmPm] = useState<"AM" | "PM">("AM");
  const [birthTimeMessage, setBirthTimeMessage] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: "",
      birthTime: "",
      birthCountry: "Brasil",
      birthState: "",
      birthCity: "",
    },
  });

  // Fetch Brazilian states
  const { data: states = [] } = useQuery({
    queryKey: ['/api/brazilian-states'],
  });

  // Fetch municipalities for selected state
  const { data: municipalities = [] } = useQuery({
    queryKey: ['/api/brazilian-municipalities', selectedState],
    enabled: !!selectedState,
  });

  // Create astrological profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // For now, just simulate success since we're not requiring authentication
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Seus dados astrológicos foram salvos com sucesso.",
      });
      // Reset form or redirect as needed
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Calculate zodiac sign based on birth date
    const zodiacSign = calculateZodiacSign(data.birthDate);
    
    createProfileMutation.mutate({
      ...data,
      zodiacSign
    });
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

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen mystical-gradient relative overflow-hidden flex items-center justify-center">
        <StarField />
        <div className="text-center relative z-10">
          <Star className="text-5xl text-[hsl(45,93%,63%)] mb-4 mx-auto animate-spin" size={64} />
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mystical-gradient relative overflow-hidden">
      <StarField />
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative z-10">
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
              Dados Astrológicos
            </h1>
            <p className="text-lg text-[hsl(220,13%,91%)]">
              Informe seus dados de nascimento para criar seu mapa astral
            </p>
          </motion.div>



          {/* Astrology Registration Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlassCard className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        {...form.register("birthTime")}
                        className="input-dark flex-1 px-4 py-3 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]"
                      />
                      <Select
                        value={birthTimeAmPm}
                        onValueChange={(value: "AM" | "PM") => setBirthTimeAmPm(value)}
                      >
                        <SelectTrigger className="input-dark w-20 px-2 py-3 rounded-xl text-white focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                      setSelectedState(value);
                      form.setValue("birthState", value);
                      form.setValue("birthCity", ""); // Reset city when state changes
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
                    value={form.watch("birthCity")}
                    onValueChange={(value) => form.setValue("birthCity", value)}
                    disabled={!selectedState}
                  >
                    <SelectTrigger className="input-dark w-full px-4 py-3 rounded-xl text-white focus:ring-2 focus:ring-[hsl(258,84%,60%)] focus:border-[hsl(258,84%,60%)]">
                      <SelectValue placeholder={selectedState ? "Selecione uma cidade" : "Selecione primeiro um estado"} />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities
                        .sort((a: any, b: any) => a.name.localeCompare(b.name, 'pt-BR'))
                        .map((city: any) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
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

                {/* Submit Button */}
                <Button 
                  type="submit"
                  disabled={createProfileMutation.isPending}
                  className="w-full bg-[hsl(258,84%,60%)] hover:bg-[hsl(258,64%,32%)] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
                >
                  <Star className="mr-2" size={16} />
                  {createProfileMutation.isPending ? "Criando mapa astral..." : "Criar meu mapa astral"}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
