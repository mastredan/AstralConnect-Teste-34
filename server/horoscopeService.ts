import { openai } from './openaiService';

interface HoroscopeData {
  zodiacSign: string;
  userName: string;
  date: string;
}

const zodiacTraits = {
  'Áries': {
    element: 'Fogo',
    symbol: '♈',
    keywords: ['coragem', 'liderança', 'energia', 'iniciativa', 'determinação']
  },
  'Touro': {
    element: 'Terra',
    symbol: '♉',
    keywords: ['estabilidade', 'persistência', 'sensualidade', 'praticidade', 'confiabilidade']
  },
  'Gêmeos': {
    element: 'Ar',
    symbol: '♊',
    keywords: ['comunicação', 'versatilidade', 'curiosidade', 'adaptabilidade', 'inteligência']
  },
  'Câncer': {
    element: 'Água',
    symbol: '♋',
    keywords: ['intuição', 'proteção', 'sensibilidade', 'família', 'emoção']
  },
  'Leão': {
    element: 'Fogo',
    symbol: '♌',
    keywords: ['criatividade', 'generosidade', 'orgulho', 'liderança', 'dramaticidade']
  },
  'Virgem': {
    element: 'Terra',
    symbol: '♍',
    keywords: ['análise', 'perfeição', 'organização', 'saúde', 'dedicação']
  },
  'Libra': {
    element: 'Ar',
    symbol: '♎',
    keywords: ['equilíbrio', 'harmonia', 'justiça', 'relacionamentos', 'diplomacia']
  },
  'Escorpião': {
    element: 'Água',
    symbol: '♏',
    keywords: ['intensidade', 'transformação', 'mistério', 'poder', 'paixão']
  },
  'Sagitário': {
    element: 'Fogo',
    symbol: '♐',
    keywords: ['aventura', 'filosofia', 'otimismo', 'expansão', 'sabedoria']
  },
  'Capricórnio': {
    element: 'Terra',
    symbol: '♑',
    keywords: ['ambição', 'responsabilidade', 'disciplina', 'tradição', 'estrutura']
  },
  'Aquário': {
    element: 'Ar',
    symbol: '♒',
    keywords: ['inovação', 'independência', 'humanitarismo', 'originalidade', 'futurismo']
  },
  'Peixes': {
    element: 'Água',
    symbol: '♓',
    keywords: ['intuição', 'compaixão', 'criatividade', 'espiritualidade', 'sensibilidade']
  }
};

// Fallback horoscopes for when OpenAI is not available
const fallbackHoroscopes = {
  'Áries': {
    message: 'Hoje sua energia natural de Áries está em alta! É um excelente momento para iniciar novos projetos e tomar a liderança em situações importantes.',
    love: 4,
    work: 5,
    health: 4
  },
  'Touro': {
    message: 'Sua perseverança natural será sua maior aliada hoje. Mantenha o foco em seus objetivos e confie em sua capacidade de construir algo duradouro.',
    love: 5,
    work: 4,
    health: 5
  },
  'Gêmeos': {
    message: 'Sua versatilidade e comunicação estarão em destaque hoje. Aproveite para estabelecer novas conexões e explorar ideias inovadoras.',
    love: 4,
    work: 4,
    health: 3
  },
  'Câncer': {
    message: 'Sua intuição está especialmente aguçada hoje. Confie em seus instintos e valorize os momentos com família e pessoas queridas.',
    love: 5,
    work: 3,
    health: 4
  },
  'Leão': {
    message: 'Sua criatividade e carisma natural brilharão hoje. É um momento perfeito para se expressar e mostrar seus talentos ao mundo.',
    love: 4,
    work: 5,
    health: 4
  },
  'Virgem': {
    message: 'Sua atenção aos detalhes e organização serão fundamentais hoje. Foque em aperfeiçoar projetos existentes e cuidar da sua saúde.',
    love: 3,
    work: 5,
    health: 5
  },
  'Libra': {
    message: 'Hoje é um dia ideal para buscar equilíbrio e harmonia. Suas habilidades diplomáticas ajudarão a resolver conflitos e fortalecer relacionamentos.',
    love: 5,
    work: 4,
    health: 4
  },
  'Escorpião': {
    message: 'Sua intensidade e poder de transformação estarão em evidência hoje. Aproveite para fazer mudanças profundas e positivas em sua vida.',
    love: 4,
    work: 4,
    health: 3
  },
  'Sagitário': {
    message: 'Sua sede de aventura e conhecimento será recompensada hoje. Busque novas experiências e mantenha seu otimismo natural.',
    love: 4,
    work: 4,
    health: 5
  },
  'Capricórnio': {
    message: 'Sua determinação e disciplina serão suas maiores forças hoje. Mantenha o foco em seus objetivos de longo prazo e confie no processo.',
    love: 3,
    work: 5,
    health: 4
  },
  'Aquário': {
    message: 'Sua originalidade e visão futurista estarão em destaque hoje. É um momento ideal para inovar e contribuir para causas importantes.',
    love: 4,
    work: 4,
    health: 4
  },
  'Peixes': {
    message: 'Sua intuição e sensibilidade estarão especialmente aguçadas hoje. Confie em seus sentimentos e use sua criatividade para inspirar outros.',
    love: 5,
    work: 3,
    health: 4
  }
};

export async function generatePersonalizedHoroscope(data: HoroscopeData) {
  const traits = zodiacTraits[data.zodiacSign as keyof typeof zodiacTraits];
  const fallback = fallbackHoroscopes[data.zodiacSign as keyof typeof fallbackHoroscopes];
  
  if (!traits || !fallback) {
    throw new Error('Signo não encontrado');
  }

  try {
    if (!openai) {
      throw new Error('OpenAI não configurado');
    }

    const prompt = `
    Você é um astrólogo experiente. Crie um horóscopo personalizado para hoje (${data.date}) para ${data.userName}, que é do signo ${data.zodiacSign}.

    Características do signo:
    - Elemento: ${traits.element}
    - Palavras-chave: ${traits.keywords.join(', ')}

    Forneça uma previsão otimista e motivadora de 2-3 frases focando em:
    1. Uma mensagem principal do dia
    2. Orientação prática baseada nas características do signo
    3. Energia positiva e encorajamento

    Retorne apenas o texto da previsão, sem formatação adicional.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const aiMessage = response.choices[0]?.message?.content?.trim();
    
    if (!aiMessage) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Generate random but realistic ratings
    const generateRating = () => Math.floor(Math.random() * 2) + 3; // 3-5 stars

    return {
      zodiacSign: data.zodiacSign,
      symbol: traits.symbol,
      element: traits.element,
      message: aiMessage,
      ratings: {
        love: generateRating(),
        work: generateRating(),
        health: generateRating()
      },
      date: data.date
    };

  } catch (error) {
    console.error('Erro ao gerar horóscopo personalizado:', error);
    
    // Return fallback horoscope
    return {
      zodiacSign: data.zodiacSign,
      symbol: traits.symbol,
      element: traits.element,
      message: fallback.message,
      ratings: {
        love: fallback.love,
        work: fallback.work,
        health: fallback.health
      },
      date: data.date
    };
  }
}

export function formatStarRating(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}