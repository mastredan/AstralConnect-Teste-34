from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import swisseph as swe
import datetime
import pytz
from typing import Dict, List
import geopy.geocoders
import math
import random

app = FastAPI()
swe.set_ephe_path(".")

geolocator = geopy.geocoders.Nominatim(user_agent="astro-api")

class MapaAstralRequest(BaseModel):
    nome: str
    data_nascimento: str
    hora_nascimento: str
    local_nascimento: str

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

INTERPRETACOES_ASPECTOS = {
    "Conjunção": "Fusão de energias entre os planetas envolvidos, intensidade e foco.",
    "Sextil": "Harmonia leve, oportunidade natural entre os planetas.",
    "Quadratura": "Tensão e desafio, gera conflito e crescimento.",
    "Trígono": "Facilidade e talento nato, fluxo harmonioso.",
    "Oposição": "Polarização e necessidade de equilíbrio entre forças opostas."
}

SUGESTOES_NOMES = {
    "Áries": ["Aline", "Arthur", "Alex"],
    "Touro": ["Tatiane", "Tiago", "Tainá"],
    "Gêmeos": ["Gabriela", "Gustavo", "Giovana"],
    "Câncer": ["Camila", "Carlos", "Catarina"],
    "Leão": ["Larissa", "Lucas", "Leonardo"],
    "Virgem": ["Vanessa", "Vinícius", "Valentina"],
    "Libra": ["Lívia", "Leonel", "Lorena"],
    "Escorpião": ["Eduarda", "Eduardo", "Esther"],
    "Sagitário": ["Samuel", "Sabrina", "Sara"],
    "Capricórnio": ["Caio", "Clara", "Célio"],
    "Aquário": ["Alan", "Aline", "Ananda"],
    "Peixes": ["Paula", "Pedro", "Priscila"]
}

def calcular_signo(grau: float) -> str:
    return SIGNOS[int(grau // 30)]

def obter_lat_long(local: str):
    location = geolocator.geocode(local)
    if not location:
        raise HTTPException(status_code=400, detail="Local não encontrado")
    return location.latitude, location.longitude

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
            return CASAS[i]
    return "Desconhecida"

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
                        "explicacao": INTERPRETACOES_ASPECTOS.get(nome, "")
                    })
    return aspectos

def calcular_numero_sorte(data_nascimento: str) -> int:
    numeros = [int(d) for d in data_nascimento if d.isdigit()]
    while len(numeros) > 1:
        soma = sum(numeros)
        numeros = [int(d) for d in str(soma)]
    return numeros[0] if numeros else random.randint(1, 9)

def sugerir_nomes(signo_solar: str) -> List[str]:
    return SUGESTOES_NOMES.get(signo_solar, [])

@app.post("/mapa-astral")
def gerar_mapa_astral(dados: MapaAstralRequest):
    try:
        data = datetime.datetime.strptime(dados.data_nascimento + ' ' + dados.hora_nascimento, "%Y-%m-%d %H:%M")
        data_utc = pytz.timezone("America/Sao_Paulo").localize(data).astimezone(pytz.utc)
        julian_day = swe.julday(data_utc.year, data_utc.month, data_utc.day, data_utc.hour + data_utc.minute / 60)

        lat, lon = obter_lat_long(dados.local_nascimento)
        casas, ascmc = calcular_casas(julian_day, lat, lon)

        resultado_planetas = {}
        signo_solar = ""

        for planeta, nome in PLANETAS.items():
            pos, _ = swe.calc_ut(julian_day, planeta)
            grau = round(pos[0], 2)
            signo = calcular_signo(pos[0])
            casa_nome = identificar_casa(grau, casas)
            resultado_planetas[nome] = {
                "graus": grau,
                "signo": signo,
                "casa": casa_nome,
                "interpretacao_completa": f"{nome} em {signo}, localizado na {casa_nome}. Isso indica uma influência combinada do planeta com a energia do signo e da casa. Essa configuração pode representar características como... (interpretação personalizada pode ser expandida aqui)"
            }
            if nome == "Sol":
                signo_solar = signo

        aspectos = calcular_aspectos(resultado_planetas)

        ascendente_signo = calcular_signo(ascmc[0])
        meio_ceu_signo = calcular_signo(ascmc[1])
        numero_sorte = calcular_numero_sorte(dados.data_nascimento)
        nomes_sugeridos = sugerir_nomes(signo_solar)

        perfil_resumido = (
            f"Você possui o Sol em {signo_solar}, o que revela traços de personalidade associados a esse signo. "
            f"Seu ascendente em {ascendente_signo} indica como você se apresenta ao mundo, enquanto o Meio do Céu em {meio_ceu_signo} aponta caminhos para sua realização profissional. "
            f"Seus aspectos planetários revelam dinâmicas importantes entre as forças interiores que te movem, e sua combinação de signos e casas influencia tanto sua expressão pessoal quanto seus potenciais em diversas áreas da vida."
        )

        sugestoes_vida = {
            "carreira": {
                "Áries": "Liderança, esportes, empreendedorismo",
                "Touro": "Finanças, culinária, artes manuais",
                "Gêmeos": "Comunicação, ensino, jornalismo",
                "Câncer": "Psicologia, enfermagem, cuidado com o lar",
                "Leão": "Entretenimento, gestão, marketing",
                "Virgem": "Saúde, organização, análise",
                "Libra": "Direito, moda, mediação",
                "Escorpião": "Investigação, medicina, espiritualidade",
                "Sagitário": "Viagens, educação, filosofia",
                "Capricórnio": "Administração, engenharia, política",
                "Aquário": "Tecnologia, inovação, causas sociais",
                "Peixes": "Artes, espiritualidade, terapias integrativas"
            },
            "amor": {
                "Áries": "Precisa de paixão e desafios",
                "Touro": "Busca estabilidade e carinho",
                "Gêmeos": "Procura variedade e conversas",
                "Câncer": "Quer segurança e afeto",
                "Leão": "Deseja admiração e romance",
                "Virgem": "Valoriza cuidado e rotina",
                "Libra": "Busca harmonia e beleza",
                "Escorpião": "Quer intensidade e lealdade",
                "Sagitário": "Ama liberdade e diversão",
                "Capricórnio": "Busca seriedade e compromisso",
                "Aquário": "Quer independência e mente aberta",
                "Peixes": "Busca conexão emocional e empatia"
            },
            "espiritualidade": {
                "Áries": "Caminhos de ação e propósito",
                "Touro": "Práticas que envolvam natureza e corpo",
                "Gêmeos": "Estudos espirituais e comunicação",
                "Câncer": "Tradições familiares e meditação",
                "Leão": "Autoconhecimento e expressão espiritual",
                "Virgem": "Disciplina espiritual e serviço",
                "Libra": "Equilíbrio interior e relações",
                "Escorpião": "Transformação e misticismo",
                "Sagitário": "Filosofias e religiões globais",
                "Capricórnio": "Espiritualidade prática e sólida",
                "Aquário": "Espiritualidade alternativa e futurista",
                "Peixes": "Misticismo, oração e intuição"
            }
        }

        sugestao_carreira = sugestoes_vida["carreira"].get(signo_solar, "Diversas possibilidades")
        sugestao_amor = sugestoes_vida["amor"].get(signo_solar, "Relacionamentos únicos")
        sugestao_espiritual = sugestoes_vida["espiritualidade"].get(signo_solar, "Caminhos diversos")

        return {
            "nome": dados.nome,
            "data": dados.data_nascimento,
            "hora": dados.hora_nascimento,
            "local": dados.local_nascimento,
            "ascendente": ascendente_signo,
            "meio_do_ceu": meio_ceu_signo,
            "numero_da_sorte": numero_sorte,
            "nomes_sugeridos": nomes_sugeridos,
            "signo_solar": signo_solar,
            "perfil_resumido": perfil_resumido,
            "sugestoes": {
                "carreira": sugestao_carreira,
                "amor": sugestao_amor,
                "espiritualidade": sugestao_espiritual
            },
            "planetas": resultado_planetas,
            "aspectos": aspectos
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
