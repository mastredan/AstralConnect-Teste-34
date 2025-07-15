import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Sun, Moon, Heart, Briefcase, Sparkles, AlertTriangle, Calendar, 
  Users, Target, Brain, Zap, Eye, DollarSign, Activity, ChevronRight, 
  Download, FileText 
} from 'lucide-react';

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
  interpretacao_completa?: {
    introducao: string;
    personalidade_nucleo: string;
    temperamento_emocional: string;
    expressao_social: string;
    potencial_profissional: string;
    relacionamentos: string;
    desafios_evolutivos: string;
    dons_naturais: string;
    conselhos_espirituais: string;
  };
  sugestoes: {
    carreira: string;
    amor: string;
    espiritualidade: string;
    saude?: string;
    financas?: string;
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  if (!data) return null;

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mapa Astral - ${data.nome}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333; 
              line-height: 1.6; 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #6b46c1; 
              padding-bottom: 15px;
            }
            .section { 
              margin-bottom: 25px; 
              padding: 15px; 
              border: 1px solid #e5e7eb; 
              border-radius: 8px;
            }
            .section h2 { 
              color: #6b46c1; 
              margin-top: 0; 
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
              gap: 15px; 
              margin-bottom: 20px;
            }
            .info-item { 
              background: #f8fafc; 
              padding: 10px; 
              border-radius: 5px;
            }
            .info-item strong { 
              color: #6b46c1; 
            }
            .planets-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 10px;
            }
            .planet { 
              background: #f1f5f9; 
              padding: 8px; 
              border-radius: 5px; 
              border-left: 3px solid #6b46c1;
            }
            .aspect { 
              background: #fef3c7; 
              padding: 5px 10px; 
              border-radius: 3px; 
              margin: 2px 0;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌟 Mapa Astral de ${data.nome}</h1>
            <p><strong>Data:</strong> ${data.data} às ${data.hora}</p>
            <p><strong>Local:</strong> ${data.local}</p>
          </div>

          <div class="section">
            <h2>ℹ️ Informações Básicas</h2>
            <div class="info-grid">
              <div class="info-item"><strong>Signo Solar:</strong> ${data.signo_solar}</div>
              <div class="info-item"><strong>Ascendente:</strong> ${data.ascendente}</div>
              <div class="info-item"><strong>Meio do Céu:</strong> ${data.meio_do_ceu}</div>
              <div class="info-item"><strong>Número da Sorte:</strong> ${data.numero_da_sorte}</div>
              <div class="info-item"><strong>Fase da Lua:</strong> ${data.fase_lua.fase_lua_natal}</div>
            </div>
          </div>

          <div class="section">
            <h2>👤 Perfil Personalizado</h2>
            <p>${data.perfil_resumido}</p>
          </div>

          <div class="section">
            <h2>💼 Sugestões de Carreira</h2>
            <p>${data.sugestoes?.carreira || 'Informações sobre carreira não disponíveis.'}</p>
          </div>

          <div class="section">
            <h2>❤️ Vida Amorosa</h2>
            <p>${data.sugestoes?.amor || 'Informações sobre amor não disponíveis.'}</p>
          </div>

          <div class="section">
            <h2>🌙 Espiritualidade</h2>
            <p>${data.sugestoes?.espiritualidade || 'Informações sobre espiritualidade não disponíveis.'}</p>
          </div>

          <div class="section">
            <h2>🎯 Missão de Vida</h2>
            <p>${data.sugestoes?.missao_de_vida || 'Informações sobre missão de vida não disponíveis.'}</p>
          </div>

          <div class="section">
            <h2>🌟 Planetas</h2>
            <div class="planets-grid">
              ${data.planetas.map(planeta => `
                <div class="planet">
                  <strong>${planeta.planeta}</strong> em ${planeta.signo}
                  <br><small>${planeta.grau.toFixed(1)}°</small>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <h2>🔗 Aspectos</h2>
            ${data.aspectos.map(aspecto => `
              <div class="aspect">
                <strong>${aspecto.planeta1}</strong> ${aspecto.aspecto} <strong>${aspecto.planeta2}</strong>
                <small>(orbe: ${aspecto.orbe.toFixed(1)}°)</small>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>🏠 Casas Astrológicas</h2>
            <div class="planets-grid">
              ${data.casas.map(casa => `
                <div class="planet">
                  <strong>Casa ${casa.numero}</strong> em ${casa.signo}
                  <br><small>${casa.grau.toFixed(1)}°</small>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <h2>⚠️ Alertas</h2>
            ${data.alertas.map(alerta => `<p>• ${alerta}</p>`).join('')}
          </div>

          <div class="section">
            <h2>🌙 Mensagem da Lua</h2>
            <p>${data.fase_lua.mensagem}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(pdfContent);
    printWindow.document.close();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="pb-6">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <DialogTitle className="flex items-center justify-between text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Star className="w-6 h-6 text-purple-600" />
                      </motion.div>
                      Mapa Astral de {data.nome}
                    </div>
                    <Button
                      onClick={generatePDF}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </Button>
                  </DialogTitle>
                </motion.div>
              </DialogHeader>
              
              <ScrollArea className="h-[80vh] w-full">
                <motion.div 
                  className="space-y-6 p-4"
                  variants={staggerChildren}
                  initial="initial"
                  animate="animate"
                >
                  {/* Hero Section */}
                  <motion.div variants={fadeInUp}>
                    <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none shadow-xl">
                      <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                          <div className="text-center">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Sun className="w-16 h-16 mx-auto mb-3 text-yellow-300" />
                            </motion.div>
                            <h3 className="text-xl font-bold">{data.signo_solar}</h3>
                            <p className="text-purple-100">Signo Solar</p>
                          </div>
                          <div className="text-center">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            >
                              <Users className="w-16 h-16 mx-auto mb-3 text-blue-300" />
                            </motion.div>
                            <h3 className="text-xl font-bold">{data.ascendente}</h3>
                            <p className="text-purple-100">Ascendente</p>
                          </div>
                          <div className="text-center">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                            >
                              <Target className="w-16 h-16 mx-auto mb-3 text-green-300" />
                            </motion.div>
                            <h3 className="text-xl font-bold">{data.meio_do_ceu}</h3>
                            <p className="text-purple-100">Meio do Céu</p>
                          </div>
                          <div className="text-center">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                            >
                              <Sparkles className="w-16 h-16 mx-auto mb-3 text-pink-300" />
                            </motion.div>
                            <h3 className="text-xl font-bold">{data.numero_da_sorte}</h3>
                            <p className="text-purple-100">Número da Sorte</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Birth Information */}
                  <motion.div variants={fadeInUp}>
                    <Card className="shadow-lg border-purple-200 dark:border-purple-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                          <Calendar className="w-5 h-5" />
                          Informações de Nascimento
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                            <p className="text-sm text-muted-foreground">Data</p>
                            <p className="font-semibold text-lg">{data.data}</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                            <p className="text-sm text-muted-foreground">Horário</p>
                            <p className="font-semibold text-lg">{data.hora}</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                            <p className="text-sm text-muted-foreground">Local</p>
                            <p className="font-semibold text-lg">{data.local}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Enhanced Profile Summary */}
                  <motion.div variants={fadeInUp}>
                    <Card className="shadow-lg border-purple-200 dark:border-purple-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                          <Brain className="w-5 h-5" />
                          Perfil Astrológico Personalizado
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-purple dark:prose-invert max-w-none">
                          <div className="text-base leading-relaxed whitespace-pre-line">
                            {data.perfil_resumido && data.perfil_resumido.trim() !== '' ? (
                              data.perfil_resumido
                            ) : (
                              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Perfil personalizado não disponível no momento.</p>
                                <p className="text-sm mt-2">Tente gerar um novo mapa astral para obter uma análise personalizada.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Comprehensive Interpretation */}
                  {data.interpretacao_completa && (
                    <motion.div variants={fadeInUp}>
                      <Card className="shadow-lg border-purple-200 dark:border-purple-800">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            <Eye className="w-5 h-5" />
                            Interpretação Completa
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {Object.entries(data.interpretacao_completa).map(([key, value], index) => {
                            const sectionTitles: Record<string, { title: string; icon: React.ReactNode }> = {
                              introducao: { title: 'Introdução', icon: <Sparkles className="w-4 h-4" /> },
                              personalidade_nucleo: { title: 'Personalidade Núcleo', icon: <Brain className="w-4 h-4" /> },
                              temperamento_emocional: { title: 'Temperamento Emocional', icon: <Heart className="w-4 h-4" /> },
                              expressao_social: { title: 'Expressão Social', icon: <Users className="w-4 h-4" /> },
                              potencial_profissional: { title: 'Potencial Profissional', icon: <Briefcase className="w-4 h-4" /> },
                              relacionamentos: { title: 'Relacionamentos', icon: <Heart className="w-4 h-4" /> },
                              desafios_evolutivos: { title: 'Desafios Evolutivos', icon: <Zap className="w-4 h-4" /> },
                              dons_naturais: { title: 'Dons Naturais', icon: <Star className="w-4 h-4" /> },
                              conselhos_espirituais: { title: 'Conselhos Espirituais', icon: <Sparkles className="w-4 h-4" /> }
                            };
                            
                            const section = sectionTitles[key];
                            if (!section) return null;

                            return (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden"
                              >
                                <Button
                                  variant="ghost"
                                  className="w-full p-4 justify-between hover:bg-purple-50 dark:hover:bg-purple-900"
                                  onClick={() => toggleSection(key)}
                                >
                                  <div className="flex items-center gap-2">
                                    {section.icon}
                                    <span className="font-semibold">{section.title}</span>
                                  </div>
                                  <motion.div
                                    animate={{ rotate: expandedSections[key] ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </motion.div>
                                </Button>
                                <AnimatePresence>
                                  {expandedSections[key] && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="p-4 bg-purple-50 dark:bg-purple-900 border-t border-purple-200 dark:border-purple-800">
                                        <div className="prose prose-purple dark:prose-invert max-w-none">
                                          <div className="text-sm leading-relaxed whitespace-pre-line">
                                            {value}
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Enhanced Suggestions */}
                  <motion.div variants={fadeInUp}>
                    <Card className="shadow-lg border-purple-200 dark:border-purple-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                          <Target className="w-5 h-5" />
                          Orientações Personalizadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          {[
                            { key: 'carreira', title: 'Carreira', icon: <Briefcase className="w-4 h-4" />, color: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800' },
                            { key: 'amor', title: 'Amor', icon: <Heart className="w-4 h-4" />, color: 'bg-pink-50 dark:bg-pink-900 border-pink-200 dark:border-pink-800' },
                            { key: 'espiritualidade', title: 'Espiritualidade', icon: <Sparkles className="w-4 h-4" />, color: 'bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-800' },
                            { key: 'saude', title: 'Saúde', icon: <Activity className="w-4 h-4" />, color: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800' },
                            { key: 'financas', title: 'Finanças', icon: <DollarSign className="w-4 h-4" />, color: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800' }
                          ].map((item, index) => {
                            const content = data.sugestoes?.[item.key as keyof typeof data.sugestoes];
                            if (!content) return null;

                            return (
                              <motion.div
                                key={item.key}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-lg border ${item.color}`}
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  {item.icon}
                                  <h4 className="font-semibold">{item.title}</h4>
                                </div>
                                <p className="text-sm leading-relaxed">{content}</p>
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Detailed Tabs */}
                  <motion.div variants={fadeInUp}>
                    <Tabs defaultValue="planets" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="planets">Planetas</TabsTrigger>
                        <TabsTrigger value="aspects">Aspectos</TabsTrigger>
                        <TabsTrigger value="houses">Casas</TabsTrigger>
                        <TabsTrigger value="lunar">Lunar</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="planets" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Posições Planetárias</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-3">
                              {data.planetas.map((planeta, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                                    <span className="font-medium">{planeta.planeta}</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{planeta.signo}</p>
                                    <p className="text-sm text-muted-foreground">{planeta.grau.toFixed(1)}°</p>
                                  </div>
                                </motion.div>
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
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
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
                                </motion.div>
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
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                  <span className="font-medium">Casa {casa.numero}</span>
                                  <div className="text-right">
                                    <p className="font-medium">{casa.signo}</p>
                                    <p className="text-sm text-muted-foreground">{casa.grau.toFixed(1)}°</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="lunar" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Moon className="w-5 h-5 text-blue-400" />
                              Fase Lunar de Nascimento
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                <Badge variant="outline" className="mb-2">{data.fase_lua.fase_lua_natal}</Badge>
                                <p className="text-sm text-muted-foreground">{data.fase_lua.mensagem}</p>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="font-semibold">Nomes Sugeridos</h4>
                                <div className="flex flex-wrap gap-2">
                                  {data.nomes_sugeridos.map((nome, index) => (
                                    <Badge key={index} variant="secondary">{nome}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </motion.div>

                  {/* Alerts */}
                  {data.alertas.length > 0 && (
                    <motion.div variants={fadeInUp}>
                      <Card className="shadow-lg border-yellow-200 dark:border-yellow-800">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                            <AlertTriangle className="w-5 h-5" />
                            Alertas e Cuidados
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {data.alertas.map((alerta, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-sm flex items-start gap-2"
                              >
                                <span className="text-yellow-600 mt-1">⚠️</span>
                                {alerta}
                              </motion.li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              </ScrollArea>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}