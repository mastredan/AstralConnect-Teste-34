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
Como um astrólogo profissional experiente, crie um perfil astrológico personalizado e único para ${data.nome}, analisando profundamente seu mapa astral completo.

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
1. Crie um resumo narrativo que sintetize TODAS as seções da interpretação completa
2. Estruture o texto em 3-4 parágrafos bem organizados e fluidos
3. Cada parágrafo deve abordar aspectos complementares da personalidade
4. Integre harmoniosamente: personalidade nuclear, temperamento emocional, expressão social e potencial
5. Mencione como os aspectos planetários e casas influenciam concretamente o dia a dia da pessoa
6. Use linguagem acessível mas profissionalmente astrológica
7. Torne cada perfil completamente único baseado na combinação específica do mapa
8. Evite generalizações - seja específico para esta configuração astrológica única
9. Escreva em português brasileiro fluente e cativante

Crie uma narrativa envolvente que faça ${data.nome} se reconhecer completamente no texto.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um astrólogo mestre com 30 anos de experiência em interpretação de mapas astrais. Suas análises são precisas, profundas, personalizadas e escritas em português brasileiro fluente. Cada perfil que você cria é único e reflete perfeitamente a configuração astrológica específica da pessoa."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.8,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Erro ao gerar perfil personalizado:", error);
    // Return empty string to fallback to basic profile
    return "";
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
    return {
      introducao: "Interpretação detalhada não disponível no momento.",
      personalidade_nucleo: "Análise temporariamente indisponível.",
      temperamento_emocional: "Análise temporariamente indisponível.",
      expressao_social: "Análise temporariamente indisponível.",
      potencial_profissional: "Análise temporariamente indisponível.",
      relacionamentos: "Análise temporariamente indisponível.",
      desafios_evolutivos: "Análise temporariamente indisponível.",
      dons_naturais: "Análise temporariamente indisponível.",
      conselhos_espirituais: "Análise temporariamente indisponível."
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
    return {
      carreira: "Sugestões de carreira temporariamente indisponíveis.",
      amor: "Orientações amorosas temporariamente indisponíveis.",
      espiritualidade: "Orientações espirituais temporariamente indisponíveis.",
      saude: "Orientações de saúde temporariamente indisponíveis.",
      financas: "Orientações financeiras temporariamente indisponíveis."
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
Como um especialista em nomenclatura astrológica, crie 3 nomes únicos e personalizados para ${data.nome} baseados em seu mapa astral específico.

CONFIGURAÇÃO ASTROLÓGICA:
- Signo Solar: ${data.signo_solar}
- Ascendente: ${data.ascendente}
- Meio do Céu: ${data.meio_do_ceu}
- Fase Lunar: ${data.fase_lua.fase_lua_natal}

PLANETAS DOMINANTES:
${data.planetas.slice(0, 5).map(p => `- ${p.planeta} em ${p.signo}`).join('\n')}

ASPECTOS PRINCIPAIS:
${data.aspectos.slice(0, 3).map(a => `- ${a.planeta1} ${a.aspecto} ${a.planeta2}`).join('\n')}

INSTRUÇÕES:
1. Crie nomes que reflitam a combinação única deste mapa astral
2. Considere a energia dos signos, planetas e aspectos dominantes
3. Os nomes devem ser místicos, astrológicos e únicos
4. Evite nomes genéricos - cada nome deve ser específico para esta configuração
5. Combine elementos dos signos solar, ascendente e lunar
6. Use inspiração de constelações, estrelas, elementos cósmicos
7. Retorne apenas os 3 nomes, separados por vírgula, sem explicações

Exemplos de estilo: "Stellaris Aurora", "Cosmicus Lunaris", "Aetheria Solaris"
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um mestre em nomenclatura astrológica, criando nomes únicos que capturam a essência cósmica específica de cada mapa astral."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.9,
    });

    const result = response.choices[0].message.content || "";
    const names = result.split(',').map(name => name.trim()).filter(name => name);
    
    // Garantir que temos exatamente 3 nomes
    if (names.length >= 3) {
      return names.slice(0, 3);
    } else {
      // Fallback se a IA não retornar 3 nomes
      const fallbackNames = ["Stellaris", "Cosmicus", "Aetheria"];
      return [...names, ...fallbackNames.slice(names.length)].slice(0, 3);
    }
  } catch (error) {
    console.error("Erro ao gerar nomes personalizados:", error);
    return ["Stellaris", "Cosmicus", "Aetheria"];
  }
}

export async function generateImprovedAlerts(data: AstrologicalData): Promise<string[]> {
  const challengingAspects = data.aspectos.filter(a => 
    a.aspecto === 'quadratura' || a.aspecto === 'oposição'
  ).slice(0, 5);

  if (challengingAspects.length === 0) {
    return ["Seu mapa astral mostra harmonia geral. Continue seguindo sua intuição e mantendo o equilíbrio em suas escolhas."];
  }

  const prompt = `
Como um astrólogo conselheiro experiente, crie alertas práticos e construtivos para ${data.nome} baseados nos aspectos desafiadores de seu mapa astral.

ASPECTOS DESAFIADORES IDENTIFICADOS:
${challengingAspects.map(a => `- ${a.planeta1} ${a.aspecto} ${a.planeta2} (orbe: ${a.orbe.toFixed(1)}°)`).join('\n')}

CONTEXTO DO MAPA:
- Signo Solar: ${data.signo_solar}
- Ascendente: ${data.ascendente}
- Meio do Céu: ${data.meio_do_ceu}

INSTRUÇÕES:
1. Para cada aspecto desafiador, crie um alerta prático e construtivo
2. Explique de forma simples como esse aspecto pode se manifestar na vida cotidiana
3. Ofereça conselhos práticos e acionáveis para lidar com cada desafio
4. Use linguagem acessível, evitando jargões técnicos excessivos
5. Foque em crescimento e oportunidades, não apenas em problemas
6. Cada alerta deve ter 2-3 frases: identificação + manifestação + solução
7. Retorne no máximo 5 alertas, separados por quebras de linha

Exemplo de formato:
"Tensão entre Sol e Urano pode gerar impaciência e mudanças bruscas. Você pode sentir necessidade de liberdade em conflito com suas responsabilidades. Pratique a paciência e planeje mudanças de forma gradual."
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um astrólogo conselheiro especializado em transformar aspectos desafiadores em oportunidades de crescimento, oferecendo orientações práticas e construtivas."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const result = response.choices[0].message.content || "";
    const alerts = result.split('\n').filter(alert => alert.trim() !== '').slice(0, 5);
    
    return alerts.length > 0 ? alerts : [
      "Mantenha equilíbrio entre suas ambições e suas necessidades emocionais para um crescimento harmonioso."
    ];
  } catch (error) {
    console.error("Erro ao gerar alertas melhorados:", error);
    return [
      "Observe os padrões de tensão em sua vida e use-os como oportunidades de crescimento pessoal."
    ];
  }
}