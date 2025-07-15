from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import swisseph as swe
import datetime
import pytz
from typing import Dict, List, Optional
import math
import random

app = FastAPI()
swe.set_ephe_path(".")

class MapaAstralRequest(BaseModel):
    nome: str
    data_nascimento: str
    hora_nascimento: str
    local_nascimento: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

SIGNOS = [
    "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
    "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
]

PLANETAS = {
    swe.SUN: "Sol",
    swe.MOON: "Lua",
    swe.MERCURY: "Mercúrio",
    swe.VENUS: "Vênus",
    swe.MARS: "Marte",
    swe.JUPITER: "Júpiter",
    swe.SATURN: "Saturno",
    swe.URANUS: "Urano",
    swe.NEPTUNE: "Netuno",
    swe.PLUTO: "Plutão"
}

CASAS = [
    "Casa 1 (Ascendente)", "Casa 2", "Casa 3", "Casa 4", "Casa 5", "Casa 6",
    "Casa 7", "Casa 8", "Casa 9", "Casa 10 (Meio do Céu)", "Casa 11", "Casa 12"
]

ASPECTOS = {
    0: "Conjunção",
    60: "Sextil",
    90: "Quadratura",
    120: "Trígono",
    180: "Oposição"
}

ORBE = 6.0

# Interpretações expandidas dos planetas em signos
INTERPRETACOES_PLANETAS = {
    "Sol": {
        "Áries": "Liderança natural, pioneirismo, energia dinâmica e iniciativa",
        "Touro": "Estabilidade, determinação, apreciação da beleza e conforto",
        "Gêmeos": "Comunicação versátil, curiosidade intelectual, adaptabilidade",
        "Câncer": "Sensibilidade emocional, intuição, cuidado com a família",
        "Leão": "Criatividade, generosidade, necessidade de reconhecimento",
        "Virgem": "Perfeccionismo, análise detalhada, serviço aos outros",
        "Libra": "Busca por harmonia, diplomacia, senso estético refinado",
        "Escorpião": "Intensidade emocional, transformação, magnetismo pessoal",
        "Sagitário": "Otimismo, busca por conhecimento, amor pela liberdade",
        "Capricórnio": "Ambição, responsabilidade, construção de estruturas sólidas",
        "Aquário": "Originalidade, humanitarismo, visão futurista",
        "Peixes": "Intuição, compaixão, conexão espiritual"
    },
    "Lua": {
        "Áries": "Reações emotivas rápidas, independência emocional",
        "Touro": "Necessidade de segurança material, estabilidade emocional",
        "Gêmeos": "Curiosidade emocional, mudanças de humor frequentes",
        "Câncer": "Intuição poderosa, necessidade de proteção familiar",
        "Leão": "Expressão emocional dramática, necessidade de admiração",
        "Virgem": "Análise das emoções, necessidade de ordem interna",
        "Libra": "Busca por equilíbrio emocional, harmonia nos relacionamentos",
        "Escorpião": "Intensidade emocional profunda, transformação constante",
        "Sagitário": "Otimismo emocional, busca por experiências expandidas",
        "Capricórnio": "Controle emocional, responsabilidade nos sentimentos",
        "Aquário": "Desapego emocional, necessidade de liberdade",
        "Peixes": "Sensibilidade extrema, empatia natural"
    }
}

# Interpretações das casas astrológicas
INTERPRETACOES_CASAS = {
    "Casa 1": "Personalidade, aparência física, primeira impressão",
    "Casa 2": "Valores pessoais, recursos materiais, autoestima",
    "Casa 3": "Comunicação, irmãos, ambiente próximo",
    "Casa 4": "Lar, família, raízes, base emocional",
    "Casa 5": "Criatividade, romance, filhos, expressão pessoal",
    "Casa 6": "Trabalho, saúde, rotina, serviço",
    "Casa 7": "Relacionamentos, parcerias, casamento",
    "Casa 8": "Transformação, sexualidade, recursos compartilhados",
    "Casa 9": "Filosofia, estudos superiores, viagens",
    "Casa 10": "Carreira, reputação, realizações públicas",
    "Casa 11": "Amizades, grupos, esperanças, objetivos",
    "Casa 12": "Espiritualidade, subconsciente, limitações"
}

# Elementos e qualidades dos signos
ELEMENTOS = {
    "Áries": "Fogo", "Leão": "Fogo", "Sagitário": "Fogo",
    "Touro": "Terra", "Virgem": "Terra", "Capricórnio": "Terra",
    "Gêmeos": "Ar", "Libra": "Ar", "Aquário": "Ar",
    "Câncer": "Água", "Escorpião": "Água", "Peixes": "Água"
}

QUALIDADES = {
    "Áries": "Cardinal", "Câncer": "Cardinal", "Libra": "Cardinal", "Capricórnio": "Cardinal",
    "Touro": "Fixo", "Leão": "Fixo", "Escorpião": "Fixo", "Aquário": "Fixo",
    "Gêmeos": "Mutável", "Virgem": "Mutável", "Sagitário": "Mutável", "Peixes": "Mutável"
}

# Regentes planetários
REGENTES = {
    "Áries": "Marte", "Touro": "Vênus", "Gêmeos": "Mercúrio",
    "Câncer": "Lua", "Leão": "Sol", "Virgem": "Mercúrio",
    "Libra": "Vênus", "Escorpião": "Marte/Plutão", "Sagitário": "Júpiter",
    "Capricórnio": "Saturno", "Aquário": "Saturno/Urano", "Peixes": "Júpiter/Netuno"
}

# Cores e pedras associadas
CORES_SIGNOS = {
    "Áries": ["Vermelho", "Laranja"], "Touro": ["Verde", "Rosa"],
    "Gêmeos": ["Amarelo", "Azul claro"], "Câncer": ["Branco", "Prateado"],
    "Leão": ["Dourado", "Laranja"], "Virgem": ["Azul marinho", "Cinza"],
    "Libra": ["Rosa", "Azul pastel"], "Escorpião": ["Vermelho escuro", "Preto"],
    "Sagitário": ["Roxo", "Turquesa"], "Capricórnio": ["Marrom", "Preto"],
    "Aquário": ["Azul elétrico", "Prata"], "Peixes": ["Verde mar", "Lilás"]
}

PEDRAS_SIGNOS = {
    "Áries": ["Rubi", "Jaspe vermelho"], "Touro": ["Esmeralda", "Quartzo rosa"],
    "Gêmeos": ["Ágata", "Citrino"], "Câncer": ["Pedra da lua", "Pérola"],
    "Leão": ["Diamante", "Topázio"], "Virgem": ["Safira", "Cornalina"],
    "Libra": ["Opala", "Quartzo rosa"], "Escorpião": ["Topázio", "Obsidiana"],
    "Sagitário": ["Turquesa", "Lápis-lazúli"], "Capricórnio": ["Granito", "Ônix"],
    "Aquário": ["Ametista", "Quartzo azul"], "Peixes": ["Água-marinha", "Ametista"]
}

# Compatibilidade entre signos
COMPATIBILIDADE = {
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
}

def calcular_signo(grau: float) -> str:
    return SIGNOS[int(grau // 30)]

def calcular_casas(julian_day, lat, lon):
    return swe.houses(julian_day, lat, lon)

def identificar_casa(grau_planeta, casas):
    for i in range(12):
        inicio = casas[i]
        fim = casas[(i + 1) % 12]
        if fim < inicio:
            fim += 360
        pos = grau_planeta if grau_planeta >= inicio else grau_planeta + 360
        if inicio <= pos < fim:
            return i + 1
    return 1

def calcular_aspectos(planetas_dict):
    aspectos = []
    nomes = list(planetas_dict.keys())
    for i in range(len(nomes)):
        for j in range(i + 1, len(nomes)):
            p1, p2 = nomes[i], nomes[j]
            g1, g2 = planetas_dict[p1]['graus'], planetas_dict[p2]['graus']
            distancia = abs(g1 - g2)
            if distancia > 180:
                distancia = 360 - distancia
            for angulo, nome in ASPECTOS.items():
                if abs(distancia - angulo) <= ORBE:
                    aspectos.append({
                        "entre": f"{p1} e {p2}",
                        "aspecto": nome,
                        "graus": round(distancia, 2),
                        "interpretacao": interpretar_aspecto(p1, p2, nome)
                    })
    return aspectos

def interpretar_aspecto(planeta1, planeta2, aspecto):
    interpretacoes = {
        "Sol": {
            "Lua": {
                "Conjunção": "Harmonia entre consciência e emoção",
                "Trígono": "Facilidade para expressar sentimentos",
                "Quadratura": "Conflito interno entre razão e emoção"
            }
        }
    }
    return interpretacoes.get(planeta1, {}).get(planeta2, {}).get(aspecto, "Influência a ser explorada")

def calcular_elemento_dominante(planetas_dict):
    elementos_count = {"Fogo": 0, "Terra": 0, "Ar": 0, "Água": 0}
    for planeta_info in planetas_dict.values():
        signo = planeta_info['signo']
        elemento = ELEMENTOS[signo]
        elementos_count[elemento] += 1
    return max(elementos_count, key=elementos_count.get)

def calcular_qualidade_dominante(planetas_dict):
    qualidades_count = {"Cardinal": 0, "Fixo": 0, "Mutável": 0}
    for planeta_info in planetas_dict.values():
        signo = planeta_info['signo']
        qualidade = QUALIDADES[signo]
        qualidades_count[qualidade] += 1
    return max(qualidades_count, key=qualidades_count.get)

def gerar_previsao_diaria(signo_solar):
    previsoes = {
        "Áries": "Dia favorável para iniciar novos projetos. Sua energia estará em alta.",
        "Touro": "Momento ideal para focar nas finanças e cuidar do bem-estar.",
        "Gêmeos": "Comunicação em destaque. Bom dia para networking.",
        "Câncer": "Dia para cuidar da família e do lar. Intuição aguçada.",
        "Leão": "Sua criatividade estará em alta. Momento de se expressar.",
        "Virgem": "Foco na organização e nos detalhes. Produtividade aumentada.",
        "Libra": "Relacionamentos em destaque. Busque o equilíbrio.",
        "Escorpião": "Dia de transformações. Confie em sua intuição.",
        "Sagitário": "Oportunidades de aprendizado. Mantenha-se otimista.",
        "Capricórnio": "Foco nos objetivos profissionais. Persistência será recompensada.",
        "Aquário": "Dia para inovação e conexões sociais. Seja original.",
        "Peixes": "Sensibilidade em alta. Confie em sua intuição."
    }
    return previsoes.get(signo_solar, "Dia de possibilidades infinitas.")

@app.post("/mapa-astral")
def gerar_mapa_astral(dados: MapaAstralRequest):
    try:
        # Parse da data e hora
        data = datetime.datetime.strptime(dados.data_nascimento + ' ' + dados.hora_nascimento, "%Y-%m-%d %H:%M")
        data_utc = pytz.timezone("America/Sao_Paulo").localize(data).astimezone(pytz.utc)
        julian_day = swe.julday(data_utc.year, data_utc.month, data_utc.day, data_utc.hour + data_utc.minute / 60)

        # Usar coordenadas fornecidas ou padrão (São Paulo)
        lat = dados.latitude if dados.latitude else -23.5505
        lon = dados.longitude if dados.longitude else -46.6333

        casas, ascmc = calcular_casas(julian_day, lat, lon)

        resultado_planetas = {}
        signo_solar = ""

        # Calcular posições planetárias
        for planeta, nome in PLANETAS.items():
            pos, _ = swe.calc_ut(julian_day, planeta)
            grau = round(pos[0], 2)
            signo = calcular_signo(pos[0])
            casa_num = identificar_casa(grau, casas)
            
            resultado_planetas[nome] = {
                "graus": grau,
                "signo": signo,
                "casa": casa_num,
                "elemento": ELEMENTOS[signo],
                "qualidade": QUALIDADES[signo],
                "regente": REGENTES[signo],
                "interpretacao": INTERPRETACOES_PLANETAS.get(nome, {}).get(signo, "Influência única a ser explorada"),
                "casa_significado": INTERPRETACOES_CASAS.get(f"Casa {casa_num}", "Área de influência")
            }
            
            if nome == "Sol":
                signo_solar = signo

        # Calcular aspectos
        aspectos = calcular_aspectos(resultado_planetas)
        
        # Calcular elementos e qualidades dominantes
        elemento_dominante = calcular_elemento_dominante(resultado_planetas)
        qualidade_dominante = calcular_qualidade_dominante(resultado_planetas)
        
        # Informações do Ascendente e Meio do Céu
        ascendente_signo = calcular_signo(ascmc[0])
        meio_ceu_signo = calcular_signo(ascmc[1])
        
        # Compatibilidade
        signos_compativeis = COMPATIBILIDADE.get(signo_solar, [])
        
        # Previsão diária
        previsao_hoje = gerar_previsao_diaria(signo_solar)
        
        return {
            "dados_basicos": {
                "nome": dados.nome,
                "data_nascimento": dados.data_nascimento,
                "hora_nascimento": dados.hora_nascimento,
                "local_nascimento": dados.local_nascimento,
                "coordenadas": {"latitude": lat, "longitude": lon}
            },
            "informacoes_principais": {
                "signo_solar": signo_solar,
                "ascendente": ascendente_signo,
                "meio_do_ceu": meio_ceu_signo,
                "elemento_dominante": elemento_dominante,
                "qualidade_dominante": qualidade_dominante
            },
            "planetas": resultado_planetas,
            "aspectos": aspectos,
            "perfil_personalidade": {
                "sol": INTERPRETACOES_PLANETAS.get("Sol", {}).get(signo_solar, ""),
                "lua": INTERPRETACOES_PLANETAS.get("Lua", {}).get(resultado_planetas.get("Lua", {}).get("signo", ""), ""),
                "ascendente": f"Como {ascendente_signo} ascendente, você se apresenta ao mundo com características deste signo"
            },
            "compatibilidade": {
                "signos_compativeis": signos_compativeis,
                "elemento_compativel": elemento_dominante
            },
            "recomendacoes": {
                "cores_favoraveis": CORES_SIGNOS.get(signo_solar, []),
                "pedras_recomendadas": PEDRAS_SIGNOS.get(signo_solar, []),
                "dias_favoraveis": ["Terça-feira", "Domingo"] if signo_solar in ["Áries", "Leão", "Sagitário"] else ["Sexta-feira", "Sábado"]
            },
            "previsao_diaria": previsao_hoje,
            "areas_vida": {
                "carreira": f"Com {signo_solar} dominante, você tem potencial em áreas que envolvem {INTERPRETACOES_PLANETAS['Sol'][signo_solar]}",
                "relacionamentos": f"Nos relacionamentos, busque parceiros que complementem sua energia de {elemento_dominante}",
                "saude": f"Como {signo_solar}, cuide especialmente da saúde relacionada ao elemento {elemento_dominante}",
                "espiritualidade": f"Sua jornada espiritual será influenciada pela energia {qualidade_dominante} do seu signo"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)