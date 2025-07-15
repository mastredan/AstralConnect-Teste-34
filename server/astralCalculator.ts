// Simplified astral calculator for ASTRUS
interface AstralMapData {
  nome: string;
  data_nascimento: string;
  hora_nascimento: string;
  local_nascimento: string;
  latitude?: number;
  longitude?: number;
}

interface AstralMapResult {
  dados_basicos: {
    nome: string;
    data_nascimento: string;
    hora_nascimento: string;
    local_nascimento: string;
    coordenadas: { latitude: number; longitude: number };
  };
  informacoes_principais: {
    signo_solar: string;
    ascendente: string;
    elemento_dominante: string;
    qualidade_dominante: string;
  };
  perfil_personalidade: {
    sol: string;
    lua: string;
    ascendente: string;
  };
  compatibilidade: {
    signos_compativeis: string[];
    elemento_compativel: string;
  };
  recomendacoes: {
    cores_favoraveis: string[];
    pedras_recomendadas: string[];
    dias_favoraveis: string[];
  };
  previsao_diaria: string;
  areas_vida: {
    carreira: string;
    relacionamentos: string;
    saude: string;
    espiritualidade: string;
  };
}

const SIGNOS = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
];

const ELEMENTOS = {
  "Áries": "Fogo", "Leão": "Fogo", "Sagitário": "Fogo",
  "Touro": "Terra", "Virgem": "Terra", "Capricórnio": "Terra",
  "Gêmeos": "Ar", "Libra": "Ar", "Aquário": "Ar",
  "Câncer": "Água", "Escorpião": "Água", "Peixes": "Água"
};

const QUALIDADES = {
  "Áries": "Cardinal", "Câncer": "Cardinal", "Libra": "Cardinal", "Capricórnio": "Cardinal",
  "Touro": "Fixo", "Leão": "Fixo", "Escorpião": "Fixo", "Aquário": "Fixo",
  "Gêmeos": "Mutável", "Virgem": "Mutável", "Sagitário": "Mutável", "Peixes": "Mutável"
};

const INTERPRETACOES_SOL = {
  "Áries": "Pessoa dinâmica e corajosa, com grande capacidade de liderança. Pioneiro nato, você gosta de iniciar projetos e não tem medo de desafios. Sua energia é contagiante e você inspira outros com sua determinação.",
  "Touro": "Pessoa prática e determinada, com forte conexão com a natureza e os prazeres sensoriais. Você valoriza a estabilidade e tem um senso aguçado para beleza e conforto. Sua persistência é uma das suas maiores qualidades.",
  "Gêmeos": "Pessoa comunicativa e versátil, com mente ágil e curiosidade insaciável. Você se adapta facilmente a diferentes situações e tem facilidade para aprender. Sua capacidade de conectar ideias é excepcional.",
  "Câncer": "Pessoa emotiva e intuitiva, com forte ligação familiar e grande capacidade de cuidar dos outros. Você possui uma memória excepcional e um instinto protetor natural. Sua sensibilidade é tanto força quanto desafio.",
  "Leão": "Pessoa criativa e generosa, com natural magnetismo e desejo de brilhar. Você tem um coração nobre e gosta de estar no centro das atenções. Sua autoconfiança inspira outros e você é um líder nato.",
  "Virgem": "Pessoa analítica e perfeccionista, com grande atenção aos detalhes e desejo de ser útil. Você tem uma mente organizada e prática, sempre buscando melhorar e aperfeiçoar. Sua dedicação é admirável.",
  "Libra": "Pessoa diplomática e harmoniosa, com forte senso de justiça e estética. Você busca sempre o equilíbrio e tem facilidade para mediar conflitos. Sua elegância e charme são naturais.",
  "Escorpião": "Pessoa intensa e transformadora, com grande profundidade emocional e intuição poderosa. Você não tem medo de explorar os mistérios da vida e possui uma força interior impressionante. Sua lealdade é inabalável.",
  "Sagitário": "Pessoa otimista e aventureira, com sede de conhecimento e amor pela liberdade. Você tem uma visão ampla da vida e gosta de explorar novas culturas e filosofias. Sua alegria é contagiante.",
  "Capricórnio": "Pessoa ambiciosa e responsável, com grande capacidade de planejamento e construção. Você tem uma abordagem prática da vida e não desiste facilmente dos seus objetivos. Sua determinação é inspiradora.",
  "Aquário": "Pessoa original e humanitária, com visão futurista e amor pela liberdade. Você tem ideias inovadoras e se preocupa com o bem-estar coletivo. Sua independência é fundamental para você.",
  "Peixes": "Pessoa compassiva e intuitiva, com grande sensibilidade emocional e espiritual. Você tem uma imaginação rica e capacidade natural de compreender os outros. Sua empatia é um dom especial."
};

const COMPATIBILIDADE = {
  "Áries": ["Leão", "Sagitário", "Gêmeos", "Aquário"],
  "Touro": ["Virgem", "Capricórnio", "Câncer", "Peixes"],
  "Gêmeos": ["Libra", "Aquário", "Áries", "Leão"],
  "Câncer": ["Escorpião", "Peixes", "Touro", "Virgem"],
  "Leão": ["Áries", "Sagitário", "Gêmeos", "Libra"],
  "Virgem": ["Touro", "Capricórnio", "Câncer", "Escorpião"],
  "Libra": ["Gêmeos", "Aquário", "Leão", "Sagitário"],
  "Escorpião": ["Câncer", "Peixes", "Virgem", "Capricórnio"],
  "Sagitário": ["Áries", "Leão", "Libra", "Aquário"],
  "Capricórnio": ["Touro", "Virgem", "Escorpião", "Peixes"],
  "Aquário": ["Gêmeos", "Libra", "Áries", "Sagitário"],
  "Peixes": ["Câncer", "Escorpião", "Touro", "Capricórnio"]
};

const CORES_SIGNOS = {
  "Áries": ["Vermelho", "Laranja"], "Touro": ["Verde", "Rosa"],
  "Gêmeos": ["Amarelo", "Azul claro"], "Câncer": ["Branco", "Prateado"],
  "Leão": ["Dourado", "Laranja"], "Virgem": ["Azul marinho", "Cinza"],
  "Libra": ["Rosa", "Azul pastel"], "Escorpião": ["Vermelho escuro", "Preto"],
  "Sagitário": ["Roxo", "Turquesa"], "Capricórnio": ["Marrom", "Preto"],
  "Aquário": ["Azul elétrico", "Prata"], "Peixes": ["Verde mar", "Lilás"]
};

const PEDRAS_SIGNOS = {
  "Áries": ["Rubi", "Jaspe vermelho"], "Touro": ["Esmeralda", "Quartzo rosa"],
  "Gêmeos": ["Ágata", "Citrino"], "Câncer": ["Pedra da lua", "Pérola"],
  "Leão": ["Diamante", "Topázio"], "Virgem": ["Safira", "Cornalina"],
  "Libra": ["Opala", "Quartzo rosa"], "Escorpião": ["Topázio", "Obsidiana"],
  "Sagitário": ["Turquesa", "Lápis-lazúli"], "Capricórnio": ["Granito", "Ônix"],
  "Aquário": ["Ametista", "Quartzo azul"], "Peixes": ["Água-marinha", "Ametista"]
};

function calcularSigno(dia: number, mes: number): string {
  const signos = [
    { nome: "Capricórnio", inicio: [12, 22], fim: [1, 19] },
    { nome: "Aquário", inicio: [1, 20], fim: [2, 18] },
    { nome: "Peixes", inicio: [2, 19], fim: [3, 20] },
    { nome: "Áries", inicio: [3, 21], fim: [4, 19] },
    { nome: "Touro", inicio: [4, 20], fim: [5, 20] },
    { nome: "Gêmeos", inicio: [5, 21], fim: [6, 20] },
    { nome: "Câncer", inicio: [6, 21], fim: [7, 22] },
    { nome: "Leão", inicio: [7, 23], fim: [8, 22] },
    { nome: "Virgem", inicio: [8, 23], fim: [9, 22] },
    { nome: "Libra", inicio: [9, 23], fim: [10, 22] },
    { nome: "Escorpião", inicio: [10, 23], fim: [11, 21] },
    { nome: "Sagitário", inicio: [11, 22], fim: [12, 21] },
  ];

  for (const signo of signos) {
    const [mesInicio, diaInicio] = signo.inicio;
    const [mesFim, diaFim] = signo.fim;
    
    if (
      (mes === mesInicio && dia >= diaInicio) ||
      (mes === mesFim && dia <= diaFim)
    ) {
      return signo.nome;
    }
  }
  
  return "Capricórnio"; // Fallback
}

function calcularAscendente(signoSolar: string): string {
  // Simplificação: ascendente baseado no signo solar
  const ascendentes = {
    "Áries": "Leão", "Touro": "Virgem", "Gêmeos": "Libra",
    "Câncer": "Escorpião", "Leão": "Sagitário", "Virgem": "Capricórnio",
    "Libra": "Aquário", "Escorpião": "Peixes", "Sagitário": "Áries",
    "Capricórnio": "Touro", "Aquário": "Gêmeos", "Peixes": "Câncer"
  };
  return ascendentes[signoSolar] || "Leão";
}

function gerarPrevisao(signo: string): string {
  const previsoes = {
    "Áries": "Hoje é um dia favorável para iniciar novos projetos. Sua energia estará em alta e você terá coragem para enfrentar desafios. Aproveite para tomar decisões importantes.",
    "Touro": "Momento ideal para focar nas finanças e cuidar do seu bem-estar. Sua paciência será recompensada. Evite decisões precipitadas e confie no seu instinto.",
    "Gêmeos": "Dia excelente para comunicação e networking. Suas ideias serão bem recebidas. Aproveite para aprender algo novo ou compartilhar conhecimento.",
    "Câncer": "Dia para cuidar da família e do lar. Sua intuição estará aguçada. Confie nos seus sentimentos e dedique tempo às pessoas que ama.",
    "Leão": "Sua criatividade estará em alta hoje. Momento perfeito para se expressar e mostrar seus talentos. Você será notado e admirado.",
    "Virgem": "Foque na organização e nos detalhes. Sua produtividade será alta. É um bom dia para resolver pendências e colocar a vida em ordem.",
    "Libra": "Relacionamentos em destaque hoje. Busque o equilíbrio e a harmonia. Sua diplomacia será fundamental para resolver conflitos.",
    "Escorpião": "Dia de transformações e revelações. Confie em sua intuição poderosa. Mudanças positivas estão chegando em sua vida.",
    "Sagitário": "Oportunidades de aprendizado e crescimento. Mantenha-se otimista e aberto a novas experiências. Sua sorte estará em alta.",
    "Capricórnio": "Foque nos seus objetivos profissionais. Sua determinação será recompensada. Persistência é a chave do sucesso hoje.",
    "Aquário": "Dia para inovação e conexões sociais. Suas ideias originais serão valorizadas. Aproxime-se de grupos e causas que acredita.",
    "Peixes": "Sua sensibilidade estará em alta. Confie em sua intuição e dedique tempo à espiritualidade. Momentos de inspiração chegam."
  };
  return previsoes[signo] || "Dia de possibilidades infinitas e descobertas.";
}

export function gerarMapaAstral(data: AstralMapData): AstralMapResult {
  const [ano, mes, dia] = data.data_nascimento.split('-').map(Number);
  const signoSolar = calcularSigno(dia, mes);
  const ascendente = calcularAscendente(signoSolar);
  const elemento = ELEMENTOS[signoSolar];
  const qualidade = QUALIDADES[signoSolar];
  
  // Coordenadas padrão (São Paulo) se não fornecidas
  const latitude = data.latitude || -23.5505;
  const longitude = data.longitude || -46.6333;
  
  return {
    dados_basicos: {
      nome: data.nome,
      data_nascimento: data.data_nascimento,
      hora_nascimento: data.hora_nascimento,
      local_nascimento: data.local_nascimento,
      coordenadas: { latitude, longitude }
    },
    informacoes_principais: {
      signo_solar: signoSolar,
      ascendente: ascendente,
      elemento_dominante: elemento,
      qualidade_dominante: qualidade
    },
    perfil_personalidade: {
      sol: INTERPRETACOES_SOL[signoSolar],
      lua: `Com a Lua em ${ascendente}, suas emoções são influenciadas pelas características deste signo.`,
      ascendente: `Como ${ascendente} ascendente, você se apresenta ao mundo de forma ${qualidade.toLowerCase()} e com energia ${elemento.toLowerCase()}.`
    },
    compatibilidade: {
      signos_compativeis: COMPATIBILIDADE[signoSolar],
      elemento_compativel: elemento
    },
    recomendacoes: {
      cores_favoraveis: CORES_SIGNOS[signoSolar],
      pedras_recomendadas: PEDRAS_SIGNOS[signoSolar],
      dias_favoraveis: elemento === "Fogo" ? ["Terça-feira", "Domingo"] : 
                       elemento === "Terra" ? ["Sexta-feira", "Sábado"] :
                       elemento === "Ar" ? ["Quarta-feira", "Sábado"] :
                       ["Segunda-feira", "Quinta-feira"]
    },
    previsao_diaria: gerarPrevisao(signoSolar),
    areas_vida: {
      carreira: `Com ${signoSolar} dominante, você tem potencial em áreas que valorizam ${elemento === "Fogo" ? "liderança e inovação" : elemento === "Terra" ? "praticidade e estabilidade" : elemento === "Ar" ? "comunicação e criatividade" : "intuição e cuidado"}.`,
      relacionamentos: `Nos relacionamentos, você busca parceiros que complementem sua energia ${elemento}. Sua natureza ${qualidade.toLowerCase()} influencia como você se conecta com outros.`,
      saude: `Como ${signoSolar}, cuide especialmente da saúde relacionada ao elemento ${elemento}. ${elemento === "Fogo" ? "Pratique exercícios e controle o estresse" : elemento === "Terra" ? "Mantenha rotinas saudáveis" : elemento === "Ar" ? "Cuide da respiração e sistema nervoso" : "Hidrate-se bem e cuide das emoções"}.`,
      espiritualidade: `Sua jornada espiritual será influenciada pela energia ${qualidade} do seu signo. ${qualidade === "Cardinal" ? "Você é um iniciador espiritual" : qualidade === "Fixo" ? "Busque práticas consistentes" : "Explore diferentes caminhos espirituais"}.`
    }
  };
}