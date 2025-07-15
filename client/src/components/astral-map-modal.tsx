import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Star, Sun, Moon, Heart, Briefcase, Sparkles, AlertTriangle, Calendar, Users, Target } from 'lucide-react';

interface AstralMapData {
  nome: string;
  data: string;
  hora: string;
  local: string;
  ascendente: string;
  meio_do_ceu: string;
  numero_da_sorte: number;
  nomes_sugeridos: string[];
  signo_solar: string;
  perfil_resumido: string;
  sugestoes: {
    carreira: string;
    amor: string;
    espiritualidade: string;
    nodo_lunar: string;
    missao_de_vida: string;
    potenciais_ocultos: string[];
  };
  fase_lua: {
    fase_lua_natal: string;
    mensagem: string;
  };
  planetas: Array<{
    planeta: string;
    signo: string;
    grau: number;
  }>;
  aspectos: Array<{
    planeta1: string;
    planeta2: string;
    aspecto: string;
    orbe: number;
  }>;
  casas: Array<{
    numero: number;
    signo: string;
    grau: number;
  }>;
  mapa_completo: string;
  alertas: string[];
}

interface AstralMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AstralMapData | null;
}

export function AstralMapModal({ isOpen, onClose, data }: AstralMapModalProps) {
  if (!data) return null;

  const getAspectColor = (aspecto: string) => {
    switch (aspecto) {
      case 'trígono':
      case 'sextil':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'quadratura':
      case 'oposição':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'conjunção':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            Mapa Astral de {data.nome}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[75vh] w-full">
          <div className="space-y-6 p-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">{data.data}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <p className="font-medium">{data.hora}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium">{data.local}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Número da Sorte</p>
                    <p className="font-medium text-purple-600">{data.numero_da_sorte}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">Signo Solar</Badge>
                    <p className="font-semibold text-lg">{data.signo_solar}</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">Ascendente</Badge>
                    <p className="font-semibold text-lg">{data.ascendente}</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">Meio do Céu</Badge>
                    <p className="font-semibold text-lg">{data.meio_do_ceu}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Perfil Resumido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{data.perfil_resumido}</p>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
                <TabsTrigger value="planets">Planetas</TabsTrigger>
                <TabsTrigger value="aspects">Aspectos</TabsTrigger>
                <TabsTrigger value="houses">Casas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="suggestions" className="space-y-4">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Carreira
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{data.sugestoes.carreira}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Amor e Relacionamentos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{data.sugestoes.amor}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Espiritualidade
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{data.sugestoes.espiritualidade}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Missão de Vida
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{data.sugestoes.missao_de_vida}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Potenciais Ocultos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {data.sugestoes.potenciais_ocultos.map((potencial, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            {potencial}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="planets" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Posições Planetárias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {data.planetas.map((planeta, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                            <span className="font-medium">{planeta.planeta}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{planeta.signo}</p>
                            <p className="text-sm text-muted-foreground">{planeta.grau.toFixed(1)}°</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="aspects" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Aspectos Planetários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.aspectos.map((aspecto, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{aspecto.planeta1}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-medium">{aspecto.planeta2}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getAspectColor(aspecto.aspecto)}>
                              {aspecto.aspecto}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{aspecto.orbe.toFixed(1)}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="houses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Casas Astrológicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {data.casas.map((casa, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="font-medium">Casa {casa.numero}</span>
                          <div className="text-right">
                            <p className="font-medium">{casa.signo}</p>
                            <p className="text-sm text-muted-foreground">{casa.grau.toFixed(1)}°</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Moon Phase */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-blue-400" />
                  Fase Lunar de Nascimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">{data.fase_lua.fase_lua_natal}</Badge>
                  <p className="text-sm text-muted-foreground">{data.fase_lua.mensagem}</p>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Names */}
            <Card>
              <CardHeader>
                <CardTitle>Nomes Sugeridos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.nomes_sugeridos.map((nome, index) => (
                    <Badge key={index} variant="secondary">{nome}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comprehensive Map */}
            <Card>
              <CardHeader>
                <CardTitle>Interpretação Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{data.mapa_completo}</p>
              </CardContent>
            </Card>

            {/* Alerts */}
            {data.alertas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Alertas e Cuidados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {data.alertas.map((alerta, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">⚠️</span>
                        {alerta}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}