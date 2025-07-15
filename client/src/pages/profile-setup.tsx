import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Calendar, Clock, Globe, MapPin, Star, Sparkles } from "lucide-react";
import { AstralMapModal } from "@/components/astral-map-modal-enhanced";

const formSchema = z.object({
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

export default function ProfileSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState("");
  const [showCountdown, setShowCountdown] = useState(false);
  const [showAstralMapModal, setShowAstralMapModal] = useState(false);
  const [astralMapData, setAstralMapData] = useState(null);

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
  const { data: statesData } = useQuery({
    queryKey: ['/api/brazilian-states'],
  });

  const states = statesData || [];

  // Fetch municipalities for selected state
  const { data: municipalitiesData, isLoading: isLoadingMunicipalities, error: municipalitiesError } = useQuery({
    queryKey: ['/api/brazilian-municipalities', selectedState],
    enabled: !!selectedState,
  });

  const municipalities = municipalitiesData || [];

  // Create astral map mutation
  const createAstralMapMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Show countdown immediately
      setShowCountdown(true);
      
      // Create astrological profile first
      const profileData = {
        birthDate: data.birthDate,
        birthTime: data.birthTime || null,
        birthCountry: data.birthCountry,
        birthState: data.birthState,
        birthCity: data.birthCity,
      };
      
      await apiRequest("POST", "/api/astrological-profiles", profileData);
      
      // Wait a moment for profile to be created
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate astral map
      const mapaAstralData = {
        nome: `${user?.firstName} ${user?.lastName}`,
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
      // Invalidate user cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Sucesso!",
        description: "Perfil astrológico criado e mapa astral gerado com sucesso!",
      });
    },
    onError: (error) => {
      setShowCountdown(false);
      toast({
        title: "Erro",
        description: "Falha ao criar perfil astrológico ou gerar mapa astral. Tente novamente.",
        variant: "destructive",
      });
      console.error("Profile setup error:", error);
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createAstralMapMutation.mutate(data);
  };

  // Handle countdown completion
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setShowAstralMapModal(true);
  };

  if (showCountdown) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white p-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6"
          >
            <Star className="w-20 h-20 text-yellow-400" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4">Criando seu Perfil Astrológico</h2>
          <p className="text-xl text-white/80">Calculando as posições planetárias do momento do seu nascimento...</p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 15, ease: "linear" }}
            className="w-full h-2 bg-purple-600 rounded-full mt-8 mx-auto max-w-md"
            onAnimationComplete={handleCountdownComplete}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-black/20 backdrop-blur-lg border-white/10 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-4"
              >
                <Star className="w-16 h-16 text-yellow-400" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Complete seu Perfil Astrológico
              </CardTitle>
              <p className="text-white/80 text-lg">
                Para gerar seu mapa astral personalizado, precisamos dos seus dados de nascimento
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Birth Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-white mb-2">
                      <Calendar className="inline mr-2" size={16} />
                      Data de nascimento *
                    </Label>
                    <Input
                      type="date"
                      {...form.register("birthDate")}
                      max={new Date().toISOString().split('T')[0]}
                      min="1900-01-01"
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {form.formState.errors.birthDate && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.birthDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-white mb-2">
                      <Clock className="inline mr-2" size={16} />
                      Hora de nascimento (opcional)
                    </Label>
                    <Input
                      type="time"
                      {...form.register("birthTime")}
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-yellow-400 text-xs mt-1">
                      Para maior precisão, inclua a hora se souber
                    </p>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <Label className="block text-sm font-medium text-white mb-2">
                    <Globe className="inline mr-2" size={16} />
                    País *
                  </Label>
                  <Select value="Brasil" disabled>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Selecione um país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brasil">Brasil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* State Selection */}
                <div>
                  <Label className="block text-sm font-medium text-white mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Estado *
                  </Label>
                  <Select
                    value={selectedState}
                    onValueChange={(value) => {
                      setSelectedState(value);
                      form.setValue("birthState", value);
                      form.setValue("birthCity", ""); // Reset city when state changes
                    }}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
                  <Label className="block text-sm font-medium text-white mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Cidade *
                  </Label>
                  <Select
                    value={form.watch("birthCity") || ""}
                    onValueChange={(value) => {
                      form.setValue("birthCity", value);
                    }}
                    disabled={!selectedState || isLoadingMunicipalities}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
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

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    disabled={createAstralMapMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 rounded-xl text-lg transition-all duration-300 shadow-lg"
                  >
                    {createAstralMapMutation.isPending ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Criando perfil...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Sparkles className="mr-2" size={20} />
                        Gerar Meu Mapa Astral
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
    </div>
  );
}