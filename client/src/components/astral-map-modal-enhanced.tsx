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
  Download, FileText, Home 
} from 'lucide-react';

// Individual explanation components
const PlanetExplanation = ({ planeta, signo }: { planeta: string; signo: string }) => {
  const planetMeanings: Record<string, string> = {
    'Sol': 'Representa sua essência, personalidade central e como você brilha no mundo. É o núcleo do seu ser.',
    'Lua': 'Governa suas emoções, instintos e necessidades emocionais profundas. Reflete como você se sente seguro.',
    'Mercúrio': 'Rege sua comunicação, pensamento e aprendizado. Mostra como você processa e compartilha informações.',
    'Vênus': 'Controla o amor, beleza e valores. Revela como você ama e o que considera belo e valioso.',
    'Marte': 'Simboliza sua energia, coragem e forma de agir. Mostra como você persegue seus objetivos.',
    'Júpiter': 'Representa expansão, sabedoria e oportunidades. Indica onde você encontra crescimento e sorte.',
    'Saturno': 'Governa disciplina, responsabilidade e lições de vida. Mostra seus desafios e onde precisa amadurecer.',
    'Urano': 'Simboliza inovação, mudanças súbitas e originalidade. Revela seu lado revolucionário.',
    'Netuno': 'Rege intuição, espiritualidade e sonhos. Mostra sua conexão com o místico e imaginário.',
    'Plutão': 'Representa transformação profunda e renascimento. Indica onde você passa por mudanças intensas.'
  };

  const signMeanings: Record<string, string> = {
    'Áries': 'Traz energia pioneira, impulsividade e liderança natural.',
    'Touro': 'Adiciona estabilidade, sensualidade e determinação prática.',
    'Gêmeos': 'Proporciona versatilidade, curiosidade e habilidade comunicativa.',
    'Câncer': 'Intensifica a sensibilidade, intuição e cuidado com outros.',
    'Leão': 'Amplia criatividade, autoconfiança e desejo de reconhecimento.',
    'Virgem': 'Aprimora análise, organização e busca pela perfeição.',
    'Libra': 'Equilibra relacionamentos, diplomacia e senso estético.',
    'Escorpião': 'Aprofunda intensidade, mistério e poder de transformação.',
    'Sagitário': 'Expande visão filosófica, aventura e busca por conhecimento.',
    'Capricórnio': 'Fortalece ambição, disciplina e responsabilidade.',
    'Aquário': 'Desperta originalidade, humanitarismo e pensamento independente.',
    'Peixes': 'Amplifica sensibilidade, compaixão e conexão espiritual.'
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
          <Star className="w-3 h-3 text-white" />
        </div>
        <h5 className="font-semibold text-purple-700 dark:text-purple-300">
          {planeta} em {signo}
        </h5>
      </div>
      
      <div className="space-y-2">
        <div className="p-3 bg-white dark:bg-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-600">
          <h6 className="font-medium text-sm text-purple-600 dark:text-purple-400 mb-1">O que este planeta significa:</h6>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {planetMeanings[planeta] || 'Este planeta influencia aspectos únicos da sua personalidade e vida.'}
          </p>
        </div>
        
        <div className="p-3 bg-white dark:bg-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-600">
          <h6 className="font-medium text-sm text-purple-600 dark:text-purple-400 mb-1">Como {signo} influencia:</h6>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {signMeanings[signo] || 'Este signo adiciona características específicas à expressão deste planeta.'}
          </p>
        </div>
      </div>
    </div>
  );
};

const AspectExplanation = ({ aspecto, planeta1, planeta2 }: { aspecto: string; planeta1: string; planeta2: string }) => {
  const aspectMeanings: Record<string, { description: string; energy: string; color: string }> = {
    'Conjunção': { 
      description: 'Quando dois planetas estão muito próximos, suas energias se misturam intensamente.',
      energy: 'Fusão poderosa de energias - pode ser muito positiva ou criar tensão',
      color: 'text-yellow-600'
    },
    'Oposição': { 
      description: 'Planetas em lados opostos criam uma dinâmica de equilíbrio e tensão.',
      energy: 'Busca por equilíbrio entre forças opostas - crescimento através de desafios',
      color: 'text-red-600'
    },
    'Trígono': { 
      description: 'Aspectos harmoniosos que fluem naturalmente e trazem facilidades.',
      energy: 'Energia fluida e talentosa - dons naturais e oportunidades',
      color: 'text-green-600'
    },
    'Quadratura': { 
      description: 'Tensão criativa que gera motivação para superar obstáculos.',
      energy: 'Desafios que impulsionam crescimento - força através da superação',
      color: 'text-orange-600'
    },
    'Sextil': { 
      description: 'Oportunidades que surgem com um pouco de esforço consciente.',
      energy: 'Potencial que se desenvolve com dedicação - talentos cultiváveis',
      color: 'text-blue-600'
    }
  };

  const aspect = aspectMeanings[aspecto] || {
    description: 'Este aspecto cria uma dinâmica específica entre os planetas.',
    energy: 'Influência especial na interação energética',
    color: 'text-gray-600'
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <h5 className="font-semibold text-blue-700 dark:text-blue-300">
          {planeta1} {aspecto} {planeta2}
        </h5>
      </div>
      
      <div className="space-y-2">
        <div className="p-3 bg-white dark:bg-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-600">
          <h6 className="font-medium text-sm text-blue-600 dark:text-blue-400 mb-1">O que significa:</h6>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {aspect.description}
          </p>
        </div>
        
        <div className="p-3 bg-white dark:bg-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-600">
          <h6 className="font-medium text-sm text-blue-600 dark:text-blue-400 mb-1">Energia gerada:</h6>
          <p className={`text-sm leading-relaxed font-medium ${aspect.color}`}>
            {aspect.energy}
          </p>
        </div>
      </div>
    </div>
  );
};

const HouseExplanation = ({ numero, signo }: { numero: number; signo: string }) => {
  const houseMeanings: Record<number, { area: string; description: string }> = {
    1: { area: 'Personalidade e Aparência', description: 'Como você se apresenta ao mundo e sua primeira impressão.' },
    2: { area: 'Recursos e Valores', description: 'Sua relação com dinheiro, bens materiais e autoestima.' },
    3: { area: 'Comunicação e Mente', description: 'Como você se comunica e processa informações do dia a dia.' },
    4: { area: 'Lar e Família', description: 'Suas raízes, família e necessidade de segurança emocional.' },
    5: { area: 'Criatividade e Romance', description: 'Expressão criativa, diversão, romances e filhos.' },
    6: { area: 'Trabalho e Saúde', description: 'Rotina diária, trabalho, saúde e hábitos.' },
    7: { area: 'Relacionamentos e Parcerias', description: 'Casamento, parcerias e como você se relaciona com outros.' },
    8: { area: 'Transformação e Recursos Compartilhados', description: 'Mudanças profundas, herança e recursos dos outros.' },
    9: { area: 'Filosofia e Expansão', description: 'Crenças, educação superior, viagens e crescimento espiritual.' },
    10: { area: 'Carreira e Reputação', description: 'Profissão, status social e como você é visto publicamente.' },
    11: { area: 'Amizades e Grupos', description: 'Amigos, grupos sociais e seus sonhos para o futuro.' },
    12: { area: 'Espiritualidade e Subconsciente', description: 'Vida espiritual, medos ocultos e autossacrifício.' }
  };

  const house = houseMeanings[numero] || { area: 'Área da Vida', description: 'Esta casa governa aspectos específicos da sua experiência.' };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">{numero}</span>
        </div>
        <h5 className="font-semibold text-green-700 dark:text-green-300">
          Casa {numero} em {signo}
        </h5>
      </div>
      
      <div className="space-y-2">
        <div className="p-3 bg-white dark:bg-green-800/30 rounded-lg border border-green-200 dark:border-green-600">
          <h6 className="font-medium text-sm text-green-600 dark:text-green-400 mb-1">Área da vida:</h6>
          <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">{house.area}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {house.description}
          </p>
        </div>
        
        <div className="p-3 bg-white dark:bg-green-800/30 rounded-lg border border-green-200 dark:border-green-600">
          <h6 className="font-medium text-sm text-green-600 dark:text-green-400 mb-1">Influência de {signo}:</h6>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            O signo de {signo} colore esta área da sua vida com suas características únicas, influenciando como você vivencia {house.area.toLowerCase()}.
          </p>
        </div>
      </div>
    </div>
  );
};

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
  interpretacoes_abas?: {
    planetas: string;
    aspectos: string;
    casas: string;
  };
}

interface AstralMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AstralMapData | null;
  onRegenerate?: () => void;
}

export function AstralMapModal({ isOpen, onClose, data, onRegenerate }: AstralMapModalProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  if (!data) {
    return null;
  }

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
                                {onRegenerate && (
                                  <Button 
                                    onClick={onRegenerate}
                                    className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                                  >
                                    Gerar Novo Mapa Astral
                                  </Button>
                                )}
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

                  {/* Enhanced Interactive Tabs */}
                  <motion.div variants={fadeInUp}>
                    <Tabs defaultValue="planets" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 h-12">
                        <TabsTrigger value="planets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold">
                          <Star className="w-4 h-4 mr-2" />
                          Planetas
                        </TabsTrigger>
                        <TabsTrigger value="aspects" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white font-semibold">
                          <Zap className="w-4 h-4 mr-2" />
                          Aspectos
                        </TabsTrigger>
                        <TabsTrigger value="houses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white font-semibold">
                          <Home className="w-4 h-4 mr-2" />
                          Casas
                        </TabsTrigger>
                        <TabsTrigger value="lunar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-semibold">
                          <Moon className="w-4 h-4 mr-2" />
                          Lunar
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="planets" className="space-y-4 mt-6">
                        <Card className="border-purple-200 dark:border-purple-800 shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
                            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                              <Star className="w-5 h-5" />
                              Posições Planetárias
                            </CardTitle>
                            <p className="text-sm text-purple-600 dark:text-purple-400">
                              Clique em cada planeta para descobrir seu significado pessoal
                            </p>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid gap-2">
                              {(data.planetas || []).map((planeta, index) => {
                                const planetaKey = `planeta-${index}`;
                                return (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                                  >
                                    <Button
                                      variant="ghost"
                                      className="w-full p-4 justify-between hover:bg-purple-50 dark:hover:bg-purple-900/50 text-left h-auto"
                                      onClick={() => toggleSection(planetaKey)}
                                    >
                                      <div className="flex items-center gap-3">
                                        <motion.div
                                          animate={{ rotate: expandedSections[planetaKey] ? 360 : 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center"
                                        >
                                          <Star className="w-4 h-4 text-white" />
                                        </motion.div>
                                        <div>
                                          <span className="font-semibold text-base">{planeta.planeta}</span>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">{planeta.signo}</Badge>
                                            <span className="text-xs text-muted-foreground">{planeta.grau.toFixed(1)}°</span>
                                          </div>
                                        </div>
                                      </div>
                                      <motion.div
                                        animate={{ rotate: expandedSections[planetaKey] ? 90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <ChevronRight className="w-5 h-5 text-purple-600" />
                                      </motion.div>
                                    </Button>
                                    <AnimatePresence>
                                      {expandedSections[planetaKey] && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.3, ease: "easeInOut" }}
                                          className="overflow-hidden"
                                        >
                                          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 border-t border-purple-200 dark:border-purple-700">
                                            <PlanetExplanation planeta={planeta.planeta} signo={planeta.signo} />
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="aspects" className="space-y-4 mt-6">
                        <Card className="border-blue-200 dark:border-blue-800 shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                              <Zap className="w-5 h-5" />
                              Aspectos Planetários
                            </CardTitle>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              Descubra as conexões energéticas entre seus planetas
                            </p>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid gap-2">
                              {(data.aspectos || []).map((aspecto, index) => {
                                const aspectoKey = `aspecto-${index}`;
                                return (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                                  >
                                    <Button
                                      variant="ghost"
                                      className="w-full p-4 justify-between hover:bg-blue-50 dark:hover:bg-blue-900/50 text-left h-auto"
                                      onClick={() => toggleSection(aspectoKey)}
                                    >
                                      <div className="flex items-center gap-3">
                                        <motion.div
                                          animate={{ scale: expandedSections[aspectoKey] ? [1, 1.1, 1] : 1 }}
                                          transition={{ duration: 0.3 }}
                                          className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
                                        >
                                          <Zap className="w-4 h-4 text-white" />
                                        </motion.div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">{aspecto.planeta1}</span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="font-medium text-sm">{aspecto.planeta2}</span>
                                          </div>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Badge className={getAspectColor(aspecto.aspecto)}>
                                              {aspecto.aspecto}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{aspecto.orbe.toFixed(1)}°</span>
                                          </div>
                                        </div>
                                      </div>
                                      <motion.div
                                        animate={{ rotate: expandedSections[aspectoKey] ? 90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <ChevronRight className="w-5 h-5 text-blue-600" />
                                      </motion.div>
                                    </Button>
                                    <AnimatePresence>
                                      {expandedSections[aspectoKey] && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.3, ease: "easeInOut" }}
                                          className="overflow-hidden"
                                        >
                                          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 border-t border-blue-200 dark:border-blue-700">
                                            <AspectExplanation aspecto={aspecto.aspecto} planeta1={aspecto.planeta1} planeta2={aspecto.planeta2} />
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="houses" className="space-y-4 mt-6">
                        <Card className="border-green-200 dark:border-green-800 shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
                            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                              <Home className="w-5 h-5" />
                              Casas Astrológicas
                            </CardTitle>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Explore as áreas da vida representadas por cada casa
                            </p>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(data.casas || []).map((casa, index) => {
                                const casaKey = `casa-${index}`;
                                return (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                                  >
                                    <Button
                                      variant="ghost"
                                      className="w-full p-4 justify-between hover:bg-green-50 dark:hover:bg-green-900/50 text-left h-auto"
                                      onClick={() => toggleSection(casaKey)}
                                    >
                                      <div className="flex items-center gap-3">
                                        <motion.div
                                          animate={{ rotateY: expandedSections[casaKey] ? 180 : 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center"
                                        >
                                          <span className="text-white font-bold text-sm">{casa.numero}</span>
                                        </motion.div>
                                        <div>
                                          <span className="font-semibold text-base">Casa {casa.numero}</span>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">{casa.signo}</Badge>
                                            <span className="text-xs text-muted-foreground">{casa.grau.toFixed(1)}°</span>
                                          </div>
                                        </div>
                                      </div>
                                      <motion.div
                                        animate={{ rotate: expandedSections[casaKey] ? 90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <ChevronRight className="w-5 h-5 text-green-600" />
                                      </motion.div>
                                    </Button>
                                    <AnimatePresence>
                                      {expandedSections[casaKey] && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.3, ease: "easeInOut" }}
                                          className="overflow-hidden"
                                        >
                                          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 border-t border-green-200 dark:border-green-700">
                                            <HouseExplanation numero={casa.numero} signo={casa.signo} />
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="lunar" className="space-y-4 mt-6">
                        <Card className="border-indigo-200 dark:border-indigo-800 shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800">
                            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                              <Moon className="w-5 h-5" />
                              Influências Lunares
                            </CardTitle>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400">
                              Sua conexão com os ciclos lunares e nomes sugeridos
                            </p>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-6">
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-xl border border-indigo-200 dark:border-indigo-700"
                              >
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                  className="w-16 h-16 mx-auto mb-4"
                                >
                                  <Moon className="w-full h-full text-indigo-500" />
                                </motion.div>
                                <Badge variant="outline" className="mb-3 text-base px-4 py-2 bg-white dark:bg-indigo-900">
                                  {data.fase_lua?.fase_lua_natal || 'Não disponível'}
                                </Badge>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                  {data.fase_lua?.mensagem || 'Informações da fase lunar não disponíveis'}
                                </p>
                              </motion.div>
                              
                              <div className="space-y-3">
                                <h4 className="font-semibold text-lg flex items-center gap-2">
                                  <Sparkles className="w-5 h-5 text-indigo-600" />
                                  Nomes que Harmonizam com sua Energia
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {(data.nomes_sugeridos || []).map((nome, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      whileHover={{ scale: 1.05, rotate: 1 }}
                                      className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800 dark:to-purple-800 rounded-lg text-center border border-indigo-200 dark:border-indigo-700 cursor-pointer"
                                    >
                                      <span className="font-medium text-indigo-700 dark:text-indigo-300">{nome}</span>
                                    </motion.div>
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
                  {(data.alertas || []).length > 0 && (
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
                            {(data.alertas || []).map((alerta, index) => (
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
              
              {/* Action Buttons Footer */}
              <div className="sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t p-4 mt-6">
                <div className="flex gap-3 justify-center">
                  {onRegenerate && (
                    <Button 
                      onClick={onRegenerate}
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900"
                    >
                      🔄 Gerar Novo Mapa
                    </Button>
                  )}
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6"
                  >
                    🌟 Acessar Rede Social
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}