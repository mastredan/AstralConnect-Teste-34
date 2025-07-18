import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

type RegisterData = z.infer<typeof insertUserSchema>;

// Denominações cristãs em ordem alfabética
const denominations = [
  "Adventista do Sétimo Dia",
  "Anglicana / Episcopal",
  "Assembleia de Deus",
  "Batista",
  "Comunidade Apostólica",
  "Comunidade Cristã",
  "Exército da Salvação",
  "Igreja Católica Apostólica Brasileira",
  "Igreja Católica Apostólica Romana",
  "Igreja Católica Ortodoxa",
  "Igreja Celular",
  "Igreja Cristã Maranata",
  "Igreja de Cristo",
  "Igreja de Jesus Cristo dos Santos dos Últimos Dias (Mórmon)",
  "Igreja do Evangelho Pleno",
  "Igreja Local / Independente",
  "Igreja Luterana",
  "Igreja Metodista",
  "Igreja Mundial",
  "Igreja Ortodoxa Copta",
  "Igreja Ortodoxa Grega",
  "Igreja Ortodoxa Russa",
  "Igreja Presbiteriana",
  "Igreja Quadrangular",
  "Igreja Renascer",
  "Igreja Sara Nossa Terra",
  "Igreja Universal",
  "Igreja Videira",
  "Movimento de Renovação",
  "Neopentecostal",
  "Não pertenço a uma denominação",
  "Outra evangélica",
  "Outra Ortodoxa",
  "Pentecostal Tradicional",
  "Renovação Carismática Católica",
  "Testemunha de Jeová",
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<RegisterData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      city: "",
      state: "",
      denomination: "",
    },
  });

  // Fetch Brazilian states
  const { data: states } = useQuery({
    queryKey: ["/api/states"],
    queryFn: async () => {
      const response = await apiRequest("/api/states", "GET");
      return response;
    },
  });

  // Fetch cities based on selected state
  const selectedState = form.watch("state");
  const { data: cities } = useQuery({
    queryKey: ["/api/cities", selectedState],
    queryFn: async () => {
      if (!selectedState) return [];
      const response = await apiRequest(`/api/cities?state=${selectedState}`, "GET");
      return response;
    },
    enabled: !!selectedState,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest('/api/auth/register', 'POST', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo(a) ao OrLev! Faça login para continuar.",
      });
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Verifique os dados e tente novamente",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="h-screen w-screen orlev-gradient flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="orlev-card p-4 flex items-center justify-center">
            <img 
              src="/attached_assets/icon_1752876239664.png" 
              alt="OrLev" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-[#257b82] orlev-logo">OrLev</h1>
          <p className="text-lg text-[#6ea1a7] font-medium">Conecte. Ilumine. Transforme.</p>
        </div>

        {/* Register Form */}
        <Card className="orlev-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-[#257b82]">Criar Conta</CardTitle>
            <CardDescription className="text-center text-[#6ea1a7]">
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-[#257b82]">Nome Completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu nome completo"
                            {...field}
                            className="border-[#7fc7ce] focus:border-[#257b82] focus:ring-[#257b82]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#257b82]">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            {...field}
                            className="border-[#7fc7ce] focus:border-[#257b82] focus:ring-[#257b82]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#257b82]">Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="border-[#7fc7ce] focus:border-[#257b82] focus:ring-[#257b82]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#257b82]">Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Sua senha"
                            {...field}
                            className="border-[#7fc7ce] focus:border-[#257b82] focus:ring-[#257b82]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#257b82]">Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirme sua senha"
                            {...field}
                            className="border-[#7fc7ce] focus:border-[#257b82] focus:ring-[#257b82]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#257b82]">Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-[#7fc7ce] focus:border-[#257b82] focus:ring-[#257b82]">
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states?.map((state: any) => (
                              <SelectItem key={state.code} value={state.name}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#257b82]">Cidade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}>
                          <FormControl>
                            <SelectTrigger className="border-[#7fc7ce] focus:border-[#257b82] focus:ring-[#257b82]">
                              <SelectValue placeholder="Selecione a cidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities?.map((city: any) => (
                              <SelectItem key={city.id} value={city.name}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="denomination"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-[#257b82]">Denominação Cristã</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-[#7fc7ce] focus:border-[#257b82] focus:ring-[#257b82]">
                              <SelectValue placeholder="Selecione sua denominação" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {denominations.map((denomination) => (
                              <SelectItem key={denomination} value={denomination}>
                                {denomination}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#257b82] hover:bg-[#6ea1a7] text-white"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-[#6ea1a7]">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-[#257b82] hover:text-[#6ea1a7] font-medium">
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}