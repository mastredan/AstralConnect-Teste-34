import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface AstrologicalData {
  nome: string;
  signo_solar: string;
  ascendente: string;
  meio_do_ceu: string;
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
  fase_lua: {
    fase_lua_natal: string;
    mensagem: string;
  };
  data: string;
  hora: string;
  local: string;
}

export async function generatePersonalizedProfile(data: AstrologicalData): Promise<string> {
  const prompt = `
Como um astrólogo profissional experiente, crie um perfil astrológico personalizado e completamente único para ${data.nome}, analisando profundamente seu mapa astral completo.

DADOS ASTROLÓGICOS COMPLETOS:
- Nome: ${data.nome}
- Signo Solar: ${data.signo_solar} 
- Ascendente: ${data.ascendente}
- Meio do Céu: ${data.meio_do_ceu}
- Fase Lunar Natal: ${data.fase_lua.fase_lua_natal}
- Nascimento: ${data.data} às ${data.hora} em ${data.local}

PLANETAS E POSIÇÕES:
${data.planetas.map(p => `- ${p.planeta} em ${p.signo} (${p.grau.toFixed(1)}°)`).join('\n')}

ASPECTOS PLANETÁRIOS:
${data.aspectos.map(a => `- ${a.planeta1} ${a.aspecto} ${a.planeta2} (orbe: ${a.orbe.toFixed(1)}°)`).join('\n')}

CASAS ASTROLÓGICAS:
${data.casas.map(c => `- Casa ${c.numero} em ${c.signo} (${c.grau.toFixed(1)}°)`).join('\n')}

INSTRUÇÕES ESPECÍFICAS:
1. Crie um resumo narrativo EXCLUSIVO que sintetize TODAS as seções da interpretação completa
2. Estruture o texto em 4-5 parágrafos bem organizados e fluidos para leitura agradável
3. Cada parágrafo deve abordar aspectos complementares da personalidade de forma única
4. Integre harmoniosamente: personalidade nuclear, temperamento emocional, expressão social e potencial profissional
5. Mencione como os aspectos planetários e casas influenciam concretamente o dia a dia da pessoa
6. Use linguagem acessível mas profissionalmente astrológica, evitando termos técnicos complexos
7. Torne cada perfil completamente único baseado na combinação específica do mapa astral
8. Evite generalizações - seja específico para esta configuração astrológica única
9. Escreva em português brasileiro fluente e cativante
10. Crie uma narrativa que seja um verdadeiro resumo dinâmico da interpretação completa

Crie uma narrativa envolvente que faça ${data.nome} se reconhecer completamente no texto e se surpreender com a precisão da análise.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um astrólogo mestre com 30 anos de experiência em interpretação de mapas astrais. Suas análises são precisas, profundas, personalizadas e escritas em português brasileiro fluente. Cada perfil que você cria é único e reflete perfeitamente a configuração astrológica específica da pessoa, funcionando como um resumo dinâmico da interpretação completa."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.8,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Erro ao gerar perfil personalizado:", error);
    // Fallback with basic astrological content based on sun sign and ascendant
    const sunSignTraits = {
      'Áries': 'ardente e pioneira, sempre pronta para iniciar novos projetos com coragem e determinação',
      'Touro': 'estável e determinada, que valoriza a segurança e manifesta suas qualidades de forma prática',
      'Gêmeos': 'curiosa e comunicativa, com uma mente ágil e capacidade natural para se adaptar a diferentes situações',
      'Câncer': 'intuitiva e sensível, que manifesta cuidado genuíno pelas pessoas ao seu redor',
      'Leão': 'criativa e magnética, que brilha naturalmente e inspira outros com sua presença calorosa',
      'Virgem': 'analítica e detalhista, que busca a perfeição em tudo que faz com dedicação e método',
      'Libra': 'equilibrada e diplomática, que busca harmonia em relacionamentos e situações',
      'Escorpião': 'intensa e transformadora, que possui uma capacidade única de regeneração e renovação',
      'Sagitário': 'aventureira e filosófica, que busca conhecimento e expansão de horizontes',
      'Capricórnio': 'ambiciosa e responsável, que constrói suas conquistas com paciência e determinação',
      'Aquário': 'original e humanitária, que pensa de forma inovadora e valoriza a liberdade',
      'Peixes': 'compassiva e intuitiva, que possui uma sensibilidade especial para captar as emoções ao redor'
    };
    
    const ascendantInfluence = {
      'Áries': 'Com ascendente em Áries, você se apresenta ao mundo com energia dinâmica e iniciativa',
      'Touro': 'Com ascendente em Touro, você projeta estabilidade e confiabilidade em suas interações',
      'Gêmeos': 'Com ascendente em Gêmeos, você se mostra comunicativo e adaptável nas primeiras impressões',
      'Câncer': 'Com ascendente em Câncer, você manifesta sensibilidade e cuidado na forma como se relaciona',
      'Leão': 'Com ascendente em Leão, você tem uma presença magnética e inspira confiança nos outros',
      'Virgem': 'Com ascendente em Virgem, você se apresenta de forma organizada e prestativa',
      'Libra': 'Com ascendente em Libra, você busca equilibrio e harmonia em todas as suas interações',
      'Escorpião': 'Com ascendente em Escorpião, você possui uma presença intensa e magnética',
      'Sagitário': 'Com ascendente em Sagitário, você se apresenta com otimismo e sede de conhecimento',
      'Capricórnio': 'Com ascendente em Capricórnio, você projeta seriedade e confiabilidade',
      'Aquário': 'Com ascendente em Aquário, você se destaca por sua originalidade e independência',
      'Peixes': 'Com ascendente em Peixes, você manifesta sensibilidade e intuição especiais'
    };
    
    const sunTrait = sunSignTraits[data.signo_solar] || 'única e especial';
    const ascTrait = ascendantInfluence[data.ascendente] || 'Sua forma de se apresentar ao mundo é única';
    
    return `Você possui uma alma ${sunTrait}. ${ascTrait}. Sua configuração astrológica revela uma personalidade fascinante, com dons naturais para liderança e capacidade de inspirar outros. A influência da fase lunar ${data.fase_lua.fase_lua_natal} adiciona uma dimensão especial à sua natureza emocional, criando uma harmonia única entre sua essência solar e sua intuição lunar.`;
  }
}

export async function generateComprehensiveInterpretation(data: AstrologicalData): Promise<{
  introducao: string;
  personalidade_nucleo: string;
  temperamento_emocional: string;
  expressao_social: string;
  potencial_profissional: string;
  relacionamentos: string;
  desafios_evolutivos: string;
  dons_naturais: string;
  conselhos_espirituais: string;
}> {
  const prompt = `
Como um astrólogo mestre, crie uma interpretação completa e estruturada do mapa astral de ${data.nome}. Divida a análise em seções específicas conforme solicitado.

DADOS COMPLETOS DO MAPA:
- Nome: ${data.nome}
- Signo Solar: ${data.signo_solar}
- Ascendente: ${data.ascendente}
- Meio do Céu: ${data.meio_do_ceu}
- Fase Lunar: ${data.fase_lua.fase_lua_natal}
- Nascimento: ${data.data} às ${data.hora} em ${data.local}

PLANETAS:
${data.planetas.map(p => `${p.planeta} em ${p.signo} (${p.grau.toFixed(1)}°)`).join('\n')}

ASPECTOS:
${data.aspectos.map(a => `${a.planeta1} ${a.aspecto} ${a.planeta2} (${a.orbe.toFixed(1)}°)`).join('\n')}

CASAS:
${data.casas.map(c => `Casa ${c.numero} em ${c.signo} (${c.grau.toFixed(1)}°)`).join('\n')}

Forneça uma análise JSON estruturada com as seguintes seções (cada uma com 2-3 parágrafos densos):

{
  "introducao": "Visão geral do mapa e primeiras impressões",
  "personalidade_nucleo": "Análise do Sol, Lua e Ascendente integrados",
  "temperamento_emocional": "Foco na Lua, aspectos emocionais e fase lunar",
  "expressao_social": "Ascendente, Vênus, Marte e como se relaciona",
  "potencial_profissional": "Meio do Céu, Saturno, Júpiter e vocação",
  "relacionamentos": "Vênus, Marte, Casa 7 e padrões afetivos",
  "desafios_evolutivos": "Aspectos tensos, Saturno e lições kármicas",
  "dons_naturais": "Aspectos harmônicos, Júpiter e talentos",
  "conselhos_espirituais": "Orientações para crescimento e evolução"
}

Use linguagem profissional, insights profundos e conecte todos os elementos do mapa de forma holística.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um astrólogo experiente especializado em interpretações detalhadas de mapas astrais. Responda sempre em JSON válido com textos em português brasileiro."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Erro ao gerar interpretação completa:", error);
    
    // Fallback rico baseado nos dados astrológicos
    const getSignInterpretation = (signo: string) => {
      const interpretations = {
        'Áries': {
          introducao: `Seu mapa astral revela uma personalidade pioneira e corajosa. Com o Sol em Áries, você carrega a energia do início dos ciclos, sempre pronto para novos desafios e aventuras. Sua configuração astrológica única mostra uma alma determinada e cheia de vida.`,
          personalidade_nucleo: `Sua essência solar em Áries se manifesta através de uma natureza impulsiva e determinada. Você possui uma coragem natural que inspira outros e uma capacidade única de liderar pelo exemplo. Sua personalidade é marcada pela autenticidade e pela paixão que você coloca em tudo que faz.`,
          temperamento_emocional: `Emocionalmente, você tende a ser direto e espontâneo. Suas reações são imediatas e genuínas, refletindo uma natureza que não conhece meias medidas. Você sente tudo intensamente e tem a capacidade de se recuperar rapidamente das adversidades.`,
          expressao_social: `Nas relações sociais, você se destaca pela sua energia contagiante e presença marcante. Você tem o dom natural de motivar outros e frequentemente assume papéis de liderança em grupos. Sua forma de se comunicar é direta e honesta.`,
          potencial_profissional: `Profissionalmente, você se adapta melhor a ambientes dinâmicos que oferecem desafios constantes. Sua capacidade de iniciativa e determinação fazem de você um excelente empreendedor ou líder. Você tem potencial para se destacar em áreas que exigem coragem e inovação.`,
          relacionamentos: `Nos relacionamentos, você oferece paixão e lealdade. Você valoriza a honestidade e espera o mesmo dos outros. Suas relações são intensas e você tem a capacidade de inspirar crescimento em seus parceiros através do seu exemplo de determinação.`,
          desafios_evolutivos: `Seu principal desafio é desenvolver paciência e aprender a ouvir mais antes de agir. Trabalhar a impulsividade e cultivar a diplomacia são aspectos importantes do seu crescimento pessoal.`,
          dons_naturais: `Você possui o dom natural da liderança e da iniciativa. Sua coragem e determinação são inspiradoras, e você tem a capacidade única de transformar ideias em realidade através da ação decidida.`,
          conselhos_espirituais: `Seu caminho espiritual envolve aprender a canalizar sua energia de forma construtiva. Pratique a meditação ativa e encontre formas de servir aos outros através da sua liderança natural.`
        },
        'Touro': {
          introducao: `Seu mapa astral revela uma personalidade estável e determinada. Com o Sol em Touro, você carrega a energia da perseverança e da construção sólida, sempre buscando segurança e beleza em tudo que faz.`,
          personalidade_nucleo: `Sua essência solar em Touro se manifesta através de uma natureza prática e confiável. Você possui uma determinação silenciosa que move montanhas e uma capacidade única de criar estabilidade ao seu redor. Sua personalidade é marcada pela lealdade e pela busca constante por qualidade.`,
          temperamento_emocional: `Emocionalmente, você é estável e confiável. Suas reações são ponderadas e você tem a capacidade de manter a calma mesmo em situações difíceis. Você valoriza a segurança emocional e tem necessidade de rotina para se sentir equilibrado.`,
          expressao_social: `Nas relações sociais, você se destaca pela sua confiabilidade e presença tranquilizadora. Você tem o dom de criar ambientes harmoniosos e frequentemente é procurado por conselhos devido à sua sabedoria prática.`,
          potencial_profissional: `Profissionalmente, você se adapta melhor a ambientes estáveis que valorizam a qualidade sobre a quantidade. Sua perseverança e atenção aos detalhes fazem de você um excelente profissional em áreas que exigem paciência e dedicação.`,
          relacionamentos: `Nos relacionamentos, você oferece estabilidade e lealdade. Você valoriza a fidelidade e constrói relações duradouras. Suas relações são baseadas na confiança mútua e no crescimento conjunto.`,
          desafios_evolutivos: `Seu principal desafio é desenvolver flexibilidade e abertura para mudanças. Trabalhar a resistência ao novo e cultivar a adaptabilidade são aspectos importantes do seu crescimento pessoal.`,
          dons_naturais: `Você possui o dom natural da perseverança e da construção sólida. Sua capacidade de transformar ideias em realidade através do trabalho constante é inspiradora.`,
          conselhos_espirituais: `Seu caminho espiritual envolve encontrar beleza e significado nas experiências simples da vida. Conecte-se com a natureza e pratique a gratidão pelas coisas tangíveis.`
        },
        'Gêmeos': {
          introducao: `Seu mapa astral revela uma personalidade curiosa e comunicativa. Com o Sol em Gêmeos, você carrega a energia da versatilidade e da busca constante por conhecimento, sempre pronto para novas conversas e descobertas.`,
          personalidade_nucleo: `Sua essência solar em Gêmeos se manifesta através de uma natureza adaptável e intelectual. Você possui uma mente ágil que processa informações rapidamente e uma capacidade única de se conectar com pessoas de diferentes backgrounds. Sua personalidade é marcada pela curiosidade e pela habilidade de ver múltiplas perspectivas.`,
          temperamento_emocional: `Emocionalmente, você tende a ser versátil e expressivo. Suas reações são rápidas e você tem a capacidade de se adaptar a diferentes situações emocionais. Você precisa de estímulo mental para se sentir emocionalmente satisfeito.`,
          expressao_social: `Nas relações sociais, você se destaca pela sua habilidade comunicativa e charme natural. Você tem o dom de fazer outros se sentirem ouvidos e compreendidos. Sua capacidade de networking é notável.`,
          potencial_profissional: `Profissionalmente, você se adapta melhor a ambientes dinâmicos que oferecem variedade e estímulo intelectual. Sua versatilidade e habilidades comunicativas fazem de você um excelente profissional em áreas que envolvem comunicação, educação ou mídia.`,
          relacionamentos: `Nos relacionamentos, você oferece companheirismo intelectual e comunicação aberta. Você valoriza a troca de ideias e precisa de parceiros que possam acompanhar sua necessidade de estímulo mental.`,
          desafios_evolutivos: `Seu principal desafio é desenvolver foco e profundidade. Trabalhar a dispersão e cultivar a perseverança são aspectos importantes do seu crescimento pessoal.`,
          dons_naturais: `Você possui o dom natural da comunicação e da adaptabilidade. Sua capacidade de conectar pessoas e ideias é inspiradora.`,
          conselhos_espirituais: `Seu caminho espiritual envolve encontrar unidade na diversidade. Pratique a meditação focada e busque sabedoria através do estudo e da reflexão.`
        },
        'Câncer': {
          introducao: `Seu mapa astral revela uma personalidade sensível e intuitiva. Com o Sol em Câncer, você carrega a energia do cuidado e da proteção, sempre atento às necessidades emocionais dos outros e às suas próprias.`,
          personalidade_nucleo: `Sua essência solar em Câncer se manifesta através de uma natureza empática e protetora. Você possui uma intuição aguçada que o guia em suas decisões e uma capacidade única de criar ambientes seguros e acolhedores. Sua personalidade é marcada pela sensibilidade e pela profundidade emocional.`,
          temperamento_emocional: `Emocionalmente, você é profundo e sensível. Suas reações são influenciadas por sua intuição e você tem a capacidade de captar as emoções dos outros. Você precisa de segurança emocional para expressar seu verdadeiro potencial.`,
          expressao_social: `Nas relações sociais, você se destaca pela sua capacidade de cuidar e nutrir outros. Você tem o dom natural de fazer as pessoas se sentirem em casa e é frequentemente procurado por conselhos e apoio emocional.`,
          potencial_profissional: `Profissionalmente, você se adapta melhor a ambientes que valorizam o cuidado e a atenção pessoal. Sua sensibilidade e intuição fazem de você um excelente profissional em áreas como saúde, educação ou serviços sociais.`,
          relacionamentos: `Nos relacionamentos, você oferece cuidado profundo e lealdade. Você valoriza a intimidade emocional e tem a capacidade de criar vínculos duradouros baseados na confiança e no amor genuíno.`,
          desafios_evolutivos: `Seu principal desafio é desenvolver resistência emocional e aprender a estabelecer limites saudáveis. Trabalhar a tendência ao excesso de proteção e cultivar a independência são aspectos importantes do seu crescimento.`,
          dons_naturais: `Você possui o dom natural da intuição e do cuidado. Sua capacidade de nutrir e proteger outros é inspiradora.`,
          conselhos_espirituais: `Seu caminho espiritual envolve honrar suas emoções e desenvolver sua intuição. Pratique a meditação contemplativa e conecte-se com tradições que valorizam a sabedoria ancestral.`
        },
        'Leão': {
          introducao: `Seu mapa astral revela uma personalidade magnética e criativa. Com o Sol em Leão, você carrega a energia do brilho e da expressão pessoal, sempre pronto para inspirar outros com sua presença calorosa e generosa.`,
          personalidade_nucleo: `Sua essência solar em Leão se manifesta através de uma natureza criativa e magnética. Você possui uma confiança natural que atrai outros e uma capacidade única de liderar através da inspiração. Sua personalidade é marcada pela generosidade e pelo desejo de deixar um legado positivo.`,
          temperamento_emocional: `Emocionalmente, você é caloroso e expressivo. Suas reações são dramáticas e autênticas, refletindo uma natureza que valoriza a expressão genuína dos sentimentos. Você precisa de reconhecimento e apreciação para florescer emocionalmente.`,
          expressao_social: `Nas relações sociais, você se destaca pela sua presença marcante e carisma natural. Você tem o dom de entreter e inspirar outros, frequentemente assumindo o papel de centro das atenções de forma natural e carismática.`,
          potencial_profissional: `Profissionalmente, você se adapta melhor a ambientes que valorizam a criatividade e a liderança. Sua capacidade de inspirar e motivar outros fazem de você um excelente profissional em áreas como artes, entretenimento ou liderança organizacional.`,
          relacionamentos: `Nos relacionamentos, você oferece generosidade e lealdade. Você valoriza a admiração mútua e tem a capacidade de fazer seus parceiros se sentirem especiais e valorizados.`,
          desafios_evolutivos: `Seu principal desafio é desenvolver humildade e aprender a compartilhar os holofotes. Trabalhar o ego e cultivar a modéstia são aspectos importantes do seu crescimento pessoal.`,
          dons_naturais: `Você possui o dom natural da liderança inspiradora e da criatividade. Sua capacidade de motivar outros através do exemplo é notável.`,
          conselhos_espirituais: `Seu caminho espiritual envolve usar seus dons para servir a um propósito maior. Pratique a generosidade e encontre formas de inspirar o crescimento nos outros.`
        },
        'Virgem': {
          introducao: `Seu mapa astral revela uma personalidade analítica e dedicada. Com o Sol em Virgem, você carrega a energia da perfeição e do serviço, sempre buscando melhorar e refinar tudo ao seu redor.`,
          personalidade_nucleo: `Sua essência solar em Virgem se manifesta através de uma natureza meticulosa e prestativa. Você possui uma atenção aos detalhes que é incomparável e uma capacidade única de identificar e resolver problemas. Sua personalidade é marcada pela dedicação e pela busca constante pela excelência.`,
          temperamento_emocional: `Emocionalmente, você é controlado e observador. Suas reações são cuidadosamente consideradas e você tem a capacidade de manter a calma mesmo em situações estressantes. Você precisa de ordem e propósito para se sentir emocionalmente equilibrado.`,
          expressao_social: `Nas relações sociais, você se destaca pela sua confiabilidade e capacidade de ajudar outros. Você tem o dom natural de identificar necessidades e oferecer soluções práticas, sendo frequentemente procurado por conselhos sábios.`,
          potencial_profissional: `Profissionalmente, você se adapta melhor a ambientes que valorizam a precisão e a qualidade. Sua dedicação e atenção aos detalhes fazem de você um excelente profissional em áreas que exigem análise, organização ou cuidado com a saúde.`,
          relacionamentos: `Nos relacionamentos, você oferece lealdade e cuidado prático. Você valoriza a estabilidade e tem a capacidade de apoiar seus parceiros de forma concreta e útil.`,
          desafios_evolutivos: `Seu principal desafio é desenvolver autocompaixão e aprender a aceitar a imperfeição. Trabalhar o perfeccionismo excessivo e cultivar a espontaneidade são aspectos importantes do seu crescimento.`,
          dons_naturais: `Você possui o dom natural da análise e do serviço. Sua capacidade de melhorar e refinar sistemas é inspiradora.`,
          conselhos_espirituais: `Seu caminho espiritual envolve encontrar o sagrado no trabalho e no serviço aos outros. Pratique a mindfulness e valorize o processo tanto quanto o resultado.`
        }
      };
      
      return interpretations[signo];
    };
    
    const interpretation = getSignInterpretation(data.signo_solar);
    
    return interpretation || {
      introducao: `Seu mapa astral revela uma personalidade única e fascinante, moldada pela combinação especial do seu signo solar ${data.signo_solar} com seu ascendente ${data.ascendente}. Esta configuração astrológica cria uma essência autêntica e cativante.`,
      personalidade_nucleo: `Sua essência solar em ${data.signo_solar} se combina harmoniosamente com seu ascendente ${data.ascendente}, criando uma personalidade que equilibra suas características internas com a forma como você se apresenta ao mundo. Esta combinação única define quem você é em sua essência mais profunda.`,
      temperamento_emocional: `Sua natureza emocional é influenciada pela energia especial do seu signo solar ${data.signo_solar}, criando um padrão único de respostas emocionais e necessidades afetivas que refletem sua individualidade cósmica.`,
      expressao_social: `Com ascendente em ${data.ascendente}, você se relaciona com o mundo de forma especial, projetando uma imagem que combina perfeitamente com sua essência solar em ${data.signo_solar}. Esta combinação cria uma presença marcante e autêntica.`,
      potencial_profissional: `Sua configuração astrológica única, com Sol em ${data.signo_solar} e ascendente em ${data.ascendente}, indica dons especiais que podem ser aplicados em diversas áreas profissionais, criando oportunidades únicas de sucesso e realização.`,
      relacionamentos: `Você tem capacidade especial para conexões profundas e significativas, influenciada pela combinação única do seu signo solar e ascendente. Esta configuração lhe dá ferramentas especiais para criar relacionamentos autênticos e duradouros.`,
      desafios_evolutivos: `Seu mapa aponta para oportunidades específicas de crescimento que são únicas para sua configuração astrológica particular. Estes desafios são presentes do universo para seu desenvolvimento pessoal.`,
      dons_naturais: `Você possui talentos únicos que refletem a combinação especial dos elementos em seu mapa astral. Estes dons são recursos valiosos para sua jornada de vida.`,
      conselhos_espirituais: `Seu caminho espiritual é único e moldado pela energia específica do seu signo solar ${data.signo_solar} e ascendente ${data.ascendente}. Esta configuração oferece oportunidades especiais para crescimento espiritual.`
    };
  }
}

export async function generatePersonalizedSuggestions(data: AstrologicalData): Promise<{
  carreira: string;
  amor: string;
  espiritualidade: string;
  saude: string;
  financas: string;
}> {
  const prompt = `
Analise o mapa astral de ${data.nome} e forneça sugestões personalizadas e específicas para diferentes áreas da vida.

DADOS ASTROLÓGICOS:
- Signo Solar: ${data.signo_solar}
- Ascendente: ${data.ascendente}
- Meio do Céu: ${data.meio_do_ceu}
- Planetas: ${data.planetas.map(p => `${p.planeta} em ${p.signo}`).join(', ')}
- Aspectos principais: ${data.aspectos.slice(0, 5).map(a => `${a.planeta1} ${a.aspecto} ${a.planeta2}`).join(', ')}

Forneça sugestões específicas em formato JSON:

{
  "carreira": "Sugestões detalhadas de carreira baseadas no Meio do Céu, Saturno, Júpiter e aspectos profissionais",
  "amor": "Orientações para relacionamentos baseadas em Vênus, Marte, Casa 7 e aspectos afetivos",
  "espiritualidade": "Caminhos espirituais baseados em Netuno, Plutão, Casa 12 e aspectos transcendentais",
  "saude": "Cuidados com saúde baseados no signo solar, Lua e aspectos relacionados ao bem-estar",
  "financas": "Orientações financeiras baseadas em Júpiter, Saturno, Casa 2 e aspectos materiais"
}

Seja específico, prático e conecte as sugestões aos elementos astrológicos reais do mapa.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um consultor astrológico experiente que fornece orientações práticas baseadas em mapas astrais. Responda em JSON válido com textos em português brasileiro."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Erro ao gerar sugestões personalizadas:", error);
    
    // Fallback suggestions based on sun sign and ascendant
    const careerSuggestions = {
      'Áries': 'Seu perfil natural de liderança e iniciativa se destaca em empreendedorismo, vendas, esportes e áreas que exigem coragem e pioneirismo.',
      'Touro': 'Sua natureza estável e prática se alinha com áreas financeiras, culinária, arte, agricultura e profissões que valorizam a persistência.',
      'Gêmeos': 'Sua versatilidade comunicativa floresce em jornalismo, educação, tradução, marketing e áreas que envolvem troca de informações.',
      'Câncer': 'Sua natureza cuidadora encontra propósito em área da saúde, educação infantil, psicologia e trabalhos que envolvem cuidado.',
      'Leão': 'Sua criatividade e magnetismo natural se destacam em artes, entretenimento, liderança e profissões que permitam brilhar.',
      'Virgem': 'Sua precisão e dedicação se alinham com medicina, pesquisa, organização, qualidade e trabalhos que exigem detalhamento.',
      'Libra': 'Seu senso de justiça e diplomacia se destaca em direito, relações públicas, arte, design e áreas que promovem harmonia.',
      'Escorpião': 'Sua intensidade e capacidade investigativa se alinha com psicologia, medicina, investigação e trabalhos transformadores.',
      'Sagitário': 'Sua busca por conhecimento e aventura encontra propósito em educação, turismo, filosofia e áreas internacionais.',
      'Capricórnio': 'Sua ambição e responsabilidade se destacam em administração, engenharia, arquitetura e posições de liderança.',
      'Aquário': 'Sua originalidade e visão futurista se alinha com tecnologia, inovação, causas sociais e trabalhos revolucionários.',
      'Peixes': 'Sua sensibilidade e intuição encontram propósito em artes, cura, espiritualidade e trabalhos que envolvem compaixão.'
    };
    
    const loveSuggestions = {
      'Áries': 'Em relacionamentos, você traz paixão e intensidade. Busque parceiros que valorizem sua independência e compartilhem sua energia.',
      'Touro': 'Você valoriza estabilidade e lealdade no amor. Procure relacionamentos que ofereçam segurança emocional e sensualidade.',
      'Gêmeos': 'Você precisa de estímulo mental e conversas interessantes. Busque parceiros curiosos que compartilhem sua versatilidade.',
      'Câncer': 'Você oferece cuidado profundo e busca segurança emocional. Procure relacionamentos que valorizem a intimidade.',
      'Leão': 'Você traz generosidade e calor aos relacionamentos. Busque parceiros que admirem sua personalidade e reciproquem sua lealdade.',
      'Virgem': 'Você demonstra amor através de ações práticas e cuidado. Procure relacionamentos baseados em confiança e respeito mútuo.',
      'Libra': 'Você busca harmonia e equilíbrio no amor. Procure relacionamentos que valorizem a beleza, arte e decisões compartilhadas.',
      'Escorpião': 'Você ama profundamente e com intensidade. Busque relacionamentos que permitam vulnerabilidade e transformação mútua.',
      'Sagitário': 'Você valoriza liberdade e aventura no amor. Procure parceiros que compartilhem sua busca por crescimento e experiências.',
      'Capricórnio': 'Você constrói relacionamentos sólidos e duradouros. Busque parceiros que valorizem compromisso e objetivos compartilhados.',
      'Aquário': 'Você valoriza amizade e independência no amor. Procure relacionamentos que respeitem sua individualidade e ideais.',
      'Peixes': 'Você ama com compaixão e intuição. Busque relacionamentos que valorizem a conexão emocional e espiritual profunda.'
    };
    
    const spiritualSuggestions = {
      'Áries': 'Seu caminho espiritual envolve desenvolver paciência e canalizar sua energia para causas maiores. Pratique meditação ativa.',
      'Touro': 'Sua espiritualidade se conecta com a natureza e práticas que envolvem os sentidos. Explore conexões com a Terra.',
      'Gêmeos': 'Seu crescimento espiritual vem através do aprendizado e compartilhamento de conhecimento. Estude diferentes filosofias.',
      'Câncer': 'Sua espiritualidade é intuitiva e emocional. Confie em sua intuição e desenvolva práticas que nutram sua alma.',
      'Leão': 'Seu caminho espiritual envolve expressar sua luz interior para inspirar outros. Encontre formas criativas de servir.',
      'Virgem': 'Sua espiritualidade se manifesta através do serviço e cura. Encontre propósito em ajudar outros de forma prática.',
      'Libra': 'Seu crescimento espiritual vem através do equilíbrio e harmonia. Busque práticas que promovam paz interior.',
      'Escorpião': 'Sua espiritualidade é transformadora e profunda. Abrace processos de morte e renascimento interior.',
      'Sagitário': 'Seu caminho espiritual envolve buscar verdades universais e expandir horizontes. Explore diferentes culturas e filosofias.',
      'Capricórnio': 'Sua espiritualidade se desenvolve através da disciplina e estrutura. Encontre práticas consistentes que gerem resultados.',
      'Aquário': 'Seu crescimento espiritual vem através da conexão com a humanidade. Busque práticas que promovam evolução coletiva.',
      'Peixes': 'Sua espiritualidade é naturalmente desenvolvida. Confie em sua intuição e desenvolva práticas meditativas e contemplativas.'
    };
    
    return {
      carreira: careerSuggestions[data.signo_solar] || 'Suas características únicas indicam potencial para liderança e inovação em sua área escolhida.',
      amor: loveSuggestions[data.signo_solar] || 'Você tem dons especiais para criar relacionamentos profundos e significativos.',
      espiritualidade: spiritualSuggestions[data.signo_solar] || 'Seu caminho espiritual é único e envolve desenvolver sua consciência interior.',
      saude: `Com ${data.ascendente} ascendente, preste atenção ao equilíbrio entre mente e corpo. Práticas regulares de exercício e relaxamento são essenciais.`,
      financas: `Sua configuração astrológica indica potencial para construir estabilidade financeira através de planejamento e persistência.`
    };
  }
}

export async function generateMotivationalPhrase(context: string): Promise<string> {
  const phrases = [
    "As estrelas estão se alinhando para revelar seus segredos mais profundos...",
    "O universo sussurra os mistérios únicos de sua alma...",
    "Cada planeta dança em harmonia para contar sua história...",
    "Sua jornada cósmica está sendo cuidadosamente desvendada...",
    "Os astros tecem o mapa sagrado de sua essência...",
    "O cosmos desenha com precisão o retrato de seu destino...",
    "As constelações conspiram para mostrar seus dons ocultos...",
    "Sua energia celestial está sendo calculada com amor...",
    "O mapa das estrelas revela a beleza de sua personalidade...",
    "Os planetas se movem para honrar sua unicidade...",
    "Sua carta astral está sendo bordada pelas mãos do universo...",
    "As energias cósmicas se unem para celebrar quem você é...",
    "Cada grau planetário conta uma página de sua história...",
    "O infinito cosmos reconhece e honra sua luz interior...",
    "Sua alma está sendo espelhada na dança dos astros..."
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um astrólogo experiente e inspirador. Crie frases motivacionais curtas e envolventes sobre astrologia e autodescoberta. Use linguagem poética e mística, mas acessível. Foque em despertar curiosidade e expectativa positiva."
        },
        {
          role: "user",
          content: `Crie uma frase motivacional única e inspiradora sobre a criação de mapa astral. Contexto: ${context}. A frase deve ter entre 8-15 palavras e despertar curiosidade sobre a astrologia.`
        }
      ],
      max_tokens: 100,
      temperature: 0.9,
    });

    const generatedPhrase = response.choices[0].message.content?.trim();
    return generatedPhrase || phrases[Math.floor(Math.random() * phrases.length)];
  } catch (error) {
    console.error("Erro ao gerar frase motivacional:", error);
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
}

export async function generatePersonalizedNames(data: AstrologicalData): Promise<string[]> {
  const prompt = `
Como um especialista mestre em nomenclatura astrológica, crie 3 nomes místicos COMPLETAMENTE ÚNICOS e personalizados para ${data.nome} baseados exclusivamente em seu mapa astral específico.

CONFIGURAÇÃO ASTROLÓGICA COMPLETA:
- Signo Solar: ${data.signo_solar}
- Ascendente: ${data.ascendente}
- Meio do Céu: ${data.meio_do_ceu}
- Fase Lunar Natal: ${data.fase_lua.fase_lua_natal}
- Nascimento: ${data.data} às ${data.hora} em ${data.local}

PLANETAS E POSIÇÕES ESPECÍFICAS:
${data.planetas.map(p => `- ${p.planeta} em ${p.signo} (${p.grau.toFixed(1)}°)`).join('\n')}

ASPECTOS PLANETÁRIOS ÚNICOS:
${data.aspectos.slice(0, 5).map(a => `- ${a.planeta1} ${a.aspecto} ${a.planeta2} (orbe: ${a.orbe.toFixed(1)}°)`).join('\n')}

CASAS ASTROLÓGICAS DOMINANTES:
${data.casas.slice(0, 6).map(c => `- Casa ${c.numero} em ${c.signo} (${c.grau.toFixed(1)}°)`).join('\n')}

INSTRUÇÕES ESPECÍFICAS:
1. Crie nomes que reflitam a combinação ÚNICA e ESPECÍFICA deste mapa astral
2. Considere a energia exata dos signos, planetas, aspectos e casas desta pessoa
3. Os nomes devem ser místicos, cósmicos e EXCLUSIVOS para esta configuração
4. Evite nomes genéricos - cada nome deve ser específico para esta combinação astrológica
5. Combine elementos dos signos solar, ascendente, lunar e planetas dominantes
6. Use inspiração de constelações, estrelas, elementos cósmicos relacionados aos signos
7. Incorpore a energia da fase lunar natal
8. Considere o horário e local de nascimento na criação
9. Retorne apenas os 3 nomes, separados por vírgula, sem explicações
10. Cada nome deve capturar a essência cósmica única desta pessoa

Crie nomes que somente esta pessoa poderia ter, baseados em sua configuração astrológica única.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um mestre supremo em nomenclatura astrológica, criando nomes únicos que capturam a essência cósmica específica de cada mapa astral individual. Cada nome que você cria é exclusivo e reflete perfeitamente a configuração astrológica única da pessoa."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.9,
    });

    const result = response.choices[0].message.content || "";
    const names = result.split(',').map(name => name.trim()).filter(name => name);
    
    // Garantir que temos exatamente 3 nomes
    if (names.length >= 3) {
      return names.slice(0, 3);
    } else {
      // Fallback mais específico baseado nos dados do usuário
      const fallbackNames = [
        `${data.signo_solar}lis`,
        `${data.ascendente}ria`,
        `${data.meio_do_ceu}us`
      ];
      return [...names, ...fallbackNames.slice(names.length)].slice(0, 3);
    }
  } catch (error) {
    console.error("Erro ao gerar nomes personalizados:", error);
    return ["Stellaris", "Cosmicus", "Aetheria"];
  }
}

export async function generateImprovedAlerts(data: AstrologicalData): Promise<string[]> {
  const challengingAspects = data.aspectos.filter(a => 
    a.aspecto === 'quadratura' || a.aspecto === 'oposição' || a.aspecto === 'conjunção'
  ).slice(0, 5);

  if (challengingAspects.length === 0) {
    return ["Seu mapa astral mostra harmonia geral. Continue seguindo sua intuição e mantendo o equilíbrio em suas escolhas para um crescimento contínuo."];
  }

  const prompt = `
Como um astrólogo conselheiro experiente, crie alertas práticos, construtivos e de fácil compreensão para ${data.nome} baseados nos aspectos desafiadores de seu mapa astral.

ASPECTOS DESAFIADORES IDENTIFICADOS:
${challengingAspects.map(a => `- ${a.planeta1} ${a.aspecto} ${a.planeta2} (orbe: ${a.orbe.toFixed(1)}°)`).join('\n')}

CONTEXTO COMPLETO DO MAPA:
- Signo Solar: ${data.signo_solar}
- Ascendente: ${data.ascendente}
- Meio do Céu: ${data.meio_do_ceu}
- Fase Lunar: ${data.fase_lua.fase_lua_natal}

PRINCIPAIS PLANETAS:
${data.planetas.slice(0, 5).map(p => `- ${p.planeta} em ${p.signo}`).join('\n')}

CASAS IMPORTANTES:
${data.casas.slice(0, 3).map(c => `- Casa ${c.numero} em ${c.signo}`).join('\n')}

INSTRUÇÕES ESPECÍFICAS:
1. Para cada aspecto desafiador, crie um alerta prático e construtivo
2. Explique de forma SIMPLES e ACESSÍVEL como esse aspecto pode se manifestar no dia a dia
3. Use linguagem cotidiana, evitando jargões técnicos e termos complicados
4. Ofereça conselhos práticos e acionáveis que a pessoa pode implementar imediatamente
5. Foque em crescimento, oportunidades e transformação positiva
6. Cada alerta deve ter 3-4 frases bem estruturadas: identificação + manifestação + soluções práticas
7. Torne as informações mais completas e úteis para o desenvolvimento pessoal
8. Retorne no máximo 5 alertas, separados por quebras de linha dupla
9. Use tom positivo e encorajador, transformando desafios em oportunidades

Exemplo de formato melhorado:
"Tensão entre Sol e Urano em seu mapa indica uma necessidade intensa de liberdade e mudanças. Isso pode se manifestar como inquietação, dificuldade com rotinas ou conflitos com autoridade. Para harmonizar essa energia, pratique atividades que tragam renovação gradual em sua vida, como hobbies criativos ou mudanças pequenas mas consistentes. Canalize essa energia inovadora para projetos que permitam sua expressão autêntica."
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um astrólogo conselheiro e mentor especializado em transformar aspectos desafiadores em oportunidades de crescimento, oferecendo orientações práticas, completas e construtivas em linguagem acessível."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const result = response.choices[0].message.content || "";
    const alerts = result.split('\n\n').filter(alert => alert.trim() !== '').slice(0, 5);
    
    return alerts.length > 0 ? alerts : [
      "Mantenha equilíbrio entre suas ambições e suas necessidades emocionais para um crescimento harmonioso e contínuo."
    ];
  } catch (error) {
    console.error("Erro ao gerar alertas melhorados:", error);
    return [
      "Observe os padrões de tensão em sua vida e use-os como oportunidades de crescimento pessoal e desenvolvimento."
    ];
  }
}

export async function generatePlanetsInterpretation(data: AstrologicalData): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "Você é um astrólogo experiente que explica posições planetárias de forma simples e intuitiva. Crie um resumo personalizado que explique o que significa ter os planetas nestes signos específicos, focando em como isso influencia a personalidade e vida da pessoa. Use linguagem acessível e evite termos técnicos.",
        },
        {
          role: "user",
          content: `Crie um resumo personalizado e intuitivo das posições planetárias para ${data.nome}:

PLANETAS: ${JSON.stringify(data.planetas)}
SIGNO SOLAR: ${data.signo_solar}
ASCENDENTE: ${data.ascendente}

Explique de forma simples e personalizada como essas posições influenciam a personalidade, emoções, comunicação e outros aspectos da vida. Use parágrafos curtos e linguagem amigável. Foque nos planetas principais (Sol, Lua, Mercúrio, Vênus, Marte) e explique como eles se manifestam na vida prática da pessoa.`
        }
      ],
    });

    return response.choices[0].message.content || 'Suas posições planetárias revelam aspectos únicos da sua personalidade e potencial.';
  } catch (error) {
    console.error('Error generating planets interpretation:', error);
    return 'Suas posições planetárias revelam aspectos únicos da sua personalidade e potencial.';
  }
}

export async function generateAspectsInterpretation(data: AstrologicalData): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "Você é um astrólogo experiente que explica aspectos planetários de forma simples e prática. Crie um resumo personalizado que explique como os aspectos entre os planetas criam dinâmicas na personalidade e vida da pessoa. Use linguagem acessível e foque nos aspectos mais importantes.",
        },
        {
          role: "user",
          content: `Crie um resumo personalizado dos aspectos planetários para ${data.nome}:

ASPECTOS: ${JSON.stringify(data.aspectos)}
SIGNO SOLAR: ${data.signo_solar}
ASCENDENTE: ${data.ascendente}

Explique de forma simples como essas conexões entre planetas criam padrões na personalidade, relacionamentos, talentos e desafios. Foque nos aspectos mais significativos e use linguagem amigável. Explique o que aspectos como conjunção, trígono, quadratura significam na prática da vida da pessoa.`
        }
      ],
    });

    return response.choices[0].message.content || 'Os aspectos entre seus planetas criam dinâmicas únicas em sua personalidade e experiências de vida.';
  } catch (error) {
    console.error('Error generating aspects interpretation:', error);
    return 'Os aspectos entre seus planetas criam dinâmicas únicas em sua personalidade e experiências de vida.';
  }
}

export async function generateHousesInterpretation(data: AstrologicalData): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "Você é um astrólogo experiente que explica casas astrológicas de forma simples e prática. Crie um resumo personalizado que explique como as casas mostram as áreas da vida onde as energias se manifestam. Use linguagem acessível e foque nas casas mais importantes.",
        },
        {
          role: "user",
          content: `Crie um resumo personalizado das casas astrológicas para ${data.nome}:

CASAS: ${JSON.stringify(data.casas)}
SIGNO SOLAR: ${data.signo_solar}
ASCENDENTE: ${data.ascendente}

Explique de forma simples como essas casas mostram as áreas da vida onde as energias se manifestam (carreira, relacionamentos, família, saúde, etc.). Foque nas casas mais importantes e use linguagem amigável. Explique como cada casa representa diferentes aspectos da vida e como os signos nessas casas influenciam essas áreas.`
        }
      ],
    });

    return response.choices[0].message.content || 'As casas astrológicas mostram as áreas da vida onde suas energias planetárias se manifestam.';
  } catch (error) {
    console.error('Error generating houses interpretation:', error);
    return 'As casas astrológicas mostram as áreas da vida onde suas energias planetárias se manifestam.';
  }
}