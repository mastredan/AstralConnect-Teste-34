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
Como um astrólogo profissional experiente, analise o mapa astral completo de ${data.nome} e crie um perfil resumido profundo e abrangente que integre TODAS as informações astrológicas disponíveis.

DADOS ASTROLÓGICOS:
- Nome: ${data.nome}
- Signo Solar: ${data.signo_solar}
- Ascendente: ${data.ascendente}
- Meio do Céu: ${data.meio_do_ceu}
- Fase Lunar de Nascimento: ${data.fase_lua.fase_lua_natal}
- Data: ${data.data}
- Hora: ${data.hora}
- Local: ${data.local}

PLANETAS E POSIÇÕES:
${data.planetas.map(p => `- ${p.planeta} em ${p.signo} (${p.grau.toFixed(1)}°)`).join('\n')}

ASPECTOS PLANETÁRIOS:
${data.aspectos.map(a => `- ${a.planeta1} ${a.aspecto} ${a.planeta2} (orbe: ${a.orbe.toFixed(1)}°)`).join('\n')}

CASAS ASTROLÓGICAS:
${data.casas.map(c => `- Casa ${c.numero} em ${c.signo} (${c.grau.toFixed(1)}°)`).join('\n')}

INSTRUÇÕES PARA O PERFIL:
1. Crie uma análise profunda que integre TODOS os elementos do mapa
2. Use linguagem fluida, envolvente e profissional
3. Conecte as informações de forma holística (como os aspectos influenciam a personalidade, como as casas modificam as energias planetárias, etc.)
4. Inclua insights sobre como a fase lunar natal influencia o temperamento
5. Mencione padrões dominantes e tensões importantes no mapa
6. Use terminologia astrológica apropriada mas acessível
7. Escreva em português brasileiro
8. Máximo 4 parágrafos, cada um com 3-4 frases densas em conteúdo

Forneça um perfil psicológico e espiritual completo que demonstre verdadeiro conhecimento astrológico.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um astrólogo profissional especializado em interpretação de mapas astrais. Suas análises são precisas, profundas e escritas em português brasileiro fluente."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
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