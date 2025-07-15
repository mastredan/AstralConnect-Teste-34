import swisseph as swe
import pytz
from datetime import datetime
from dataclasses import dataclass
from typing import Dict, List, Optional, Any
import json
import sys
import os

# Configure Swiss Ephemeris path
swe.set_ephe_path("/usr/share/ephe")

@dataclass
class DadosUsuario:
    nome: str
    data_nascimento: datetime
    hora_nascimento: str
    local_nascimento: str

def interpretar_nodo_lunar(nodos):
    nodo = nodos.get("Nodo Norte", {}).get("signo", "Desconhecido")
    return f"Sua evolução espiritual e propósito de vida apontam para lições relacionadas ao signo de {nodo}. Abraçar essas qualidades pode desbloquear um senso mais profundo de realização."

def identificar_missao(sol, nodos, meio_ceu):
    signo_nodo = nodos.get("Nodo Norte", {}).get("signo", "")
    if signo_nodo == sol.get("signo", ""):
        return "Sua missão de vida está fortemente alinhada com sua essência solar, indicando um caminho claro e direto rumo à realização."
    elif signo_nodo == meio_ceu:
        return "Seu propósito está fortemente conectado à sua carreira ou imagem pública. Ao seguir esse chamado, você cumpre seu destino."
    else:
        return f"Sua missão é desenvolver qualidades de {signo_nodo} mesmo que não pareçam naturais no início. Isso trará equilíbrio e propósito."

def detectar_potenciais(aspectos, casas):
    talentos = []
    for asp in aspectos:
        if asp['aspecto'] in ["trígono", "sextil"]:
            planeta = asp['planeta1']
            talentos.append(f"Facilidade em temas relacionados a {planeta} devido a aspectos harmônicos.")
    for i, casa in enumerate(casas):
        if casa['signo'] == "Leão":
            talentos.append("Habilidade para se destacar em áreas de exposição e liderança.")
        elif casa['signo'] == "Peixes":
            talentos.append("Conexão com o místico, ideal para artes e espiritualidade.")
    return talentos if talentos else ["Seus potenciais estão em construção, e cada descoberta é parte da jornada."]

def gerar_interpretacao_mapa_completa(signo_solar, ascendente, meio_ceu, planeta_dominante, aspectos, casas):
    primeiro_aspecto = aspectos[0]['aspecto'] if aspectos else "aspectos únicos"
    return (
        f"Seu mapa revela uma alma {signo_solar.lower()}, com uma presença social guiada por {ascendente} e ambições profissionais voltadas a {meio_ceu}. "
        f"{planeta_dominante} rege boa parte de suas ações internas, e aspectos como {primeiro_aspecto} entre planetas moldam suas experiências. "
        f"As casas astrológicas mostram onde essas energias se manifestam, criando uma tapeçaria única de propósito e potencial."
    )

def gerar_alertas_de_cuidado(aspectos):
    alertas = []
    for asp in aspectos:
        if asp['aspecto'] in ["quadratura", "oposição"]:
            alertas.append(f"Fique atento aos desafios envolvendo {asp['planeta1']} e {asp['planeta2']} — esse aspecto pode trazer tensão e crescimento necessário.")
    return alertas if alertas else ["Nenhum alerta crítico identificado neste momento. Mantenha-se centrado."]

def datas_favoraveis_fase_lua(fase_lua):
    if fase_lua.lower() == "lua nova":
        return "Excelente período para iniciar projetos, definir intenções e começar ciclos."
    elif fase_lua.lower() == "lua crescente":
        return "Ótimo momento para colocar ideias em prática e ganhar impulso."
    elif fase_lua.lower() == "lua cheia":
        return "Energia máxima para colher frutos, realizar rituais ou celebrar conquistas."
    elif fase_lua.lower() == "lua minguante":
        return "Período ideal para introspecção, limpeza e encerramento de ciclos."
    else:
        return "Momento neutro. Observe e sinta o que precisa ser ajustado em seu caminho."

def calcular_signo(grau: float) -> str:
    """Converte grau eclíptico para signo do zodíaco"""
    signos = [
        "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
        "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
    ]
    signo_index = int(grau // 30)
    return signos[signo_index % 12]

def calcular_fase_lua(data_nascimento):
    try:
        jd = swe.julday(data_nascimento.year, data_nascimento.month, data_nascimento.day)
        lua_long, _ = swe.calc_ut(jd, swe.MOON)
        sol_long, _ = swe.calc_ut(jd, swe.SUN)
        fase = (lua_long[0] - sol_long[0]) % 360
        
        if fase < 45:
            return "Lua Nova"
        elif fase < 90:
            return "Lua Crescente"
        elif fase < 135:
            return "Lua Quase Cheia"
        elif fase < 180:
            return "Lua Cheia"
        elif fase < 225:
            return "Lua Minguante"
        elif fase < 270:
            return "Lua Quarto Minguante"
        elif fase < 315:
            return "Lua Balsâmica"
        else:
            return "Lua Nova"
    except:
        return "Lua Nova"

def calcular_ascendente(lat, lon, data_nascimento):
    try:
        jd = swe.julday(data_nascimento.year, data_nascimento.month, data_nascimento.day, 
                       data_nascimento.hour + data_nascimento.minute/60.0)
        houses, ascmc = swe.houses(jd, lat, lon, b'P')  # Placidus system
        asc_grau = ascmc[0]
        return calcular_signo(asc_grau)
    except:
        return "Libra"

def calcular_meio_ceu(lat, lon, data_nascimento):
    try:
        jd = swe.julday(data_nascimento.year, data_nascimento.month, data_nascimento.day, 
                       data_nascimento.hour + data_nascimento.minute/60.0)
        houses, ascmc = swe.houses(jd, lat, lon, b'P')
        mc_grau = ascmc[1]
        return calcular_signo(mc_grau)
    except:
        return "Câncer"

def calcular_signo_solar(data_nascimento):
    try:
        jd = swe.julday(data_nascimento.year, data_nascimento.month, data_nascimento.day)
        sol_pos, _ = swe.calc_ut(jd, swe.SUN)
        return calcular_signo(sol_pos[0])
    except:
        return "Áries"

def calcular_planetas(data_nascimento):
    planetas = []
    planetas_swe = [
        (swe.SUN, "Sol"),
        (swe.MOON, "Lua"),
        (swe.MERCURY, "Mercúrio"),
        (swe.VENUS, "Vênus"),
        (swe.MARS, "Marte"),
        (swe.JUPITER, "Júpiter"),
        (swe.SATURN, "Saturno"),
        (swe.URANUS, "Urano"),
        (swe.NEPTUNE, "Netuno"),
        (swe.PLUTO, "Plutão")
    ]
    
    try:
        jd = swe.julday(data_nascimento.year, data_nascimento.month, data_nascimento.day, 
                       data_nascimento.hour + data_nascimento.minute/60.0)
        
        for planeta_id, nome in planetas_swe:
            pos, _ = swe.calc_ut(jd, planeta_id)
            signo = calcular_signo(pos[0])
            planetas.append({"planeta": nome, "signo": signo, "grau": pos[0]})
    except:
        # Fallback data
        return [{"planeta": "Sol", "signo": "Áries", "grau": 0}, {"planeta": "Lua", "signo": "Touro", "grau": 30}]
    
    return planetas

def calcular_aspectos(planetas):
    aspectos = []
    aspectos_graus = {
        "conjunção": 0,
        "sextil": 60,
        "quadratura": 90,
        "trígono": 120,
        "oposição": 180
    }
    
    for i, planeta1 in enumerate(planetas):
        for j, planeta2 in enumerate(planetas):
            if i >= j:
                continue
                
            diff = abs(planeta1["grau"] - planeta2["grau"])
            if diff > 180:
                diff = 360 - diff
                
            for aspecto, grau_aspecto in aspectos_graus.items():
                if abs(diff - grau_aspecto) <= 8:  # Orbe de 8 graus
                    aspectos.append({
                        "planeta1": planeta1["planeta"],
                        "planeta2": planeta2["planeta"],
                        "aspecto": aspecto,
                        "orbe": abs(diff - grau_aspecto)
                    })
                    break
    
    return aspectos if aspectos else [{"planeta1": "Sol", "planeta2": "Lua", "aspecto": "trígono", "orbe": 0}]

def calcular_casas(lat, lon, data_nascimento):
    try:
        jd = swe.julday(data_nascimento.year, data_nascimento.month, data_nascimento.day, 
                       data_nascimento.hour + data_nascimento.minute/60.0)
        houses, ascmc = swe.houses(jd, lat, lon, b'P')
        
        casas = []
        for i, casa_grau in enumerate(houses):
            signo = calcular_signo(casa_grau)
            casas.append({"numero": i+1, "signo": signo, "grau": casa_grau})
        
        return casas
    except:
        return [{"numero": i+1, "signo": "Leão" if i%2==0 else "Peixes", "grau": i*30} for i in range(12)]

def descobrir_planeta_dominante(planetas):
    # Lógica simples baseada no primeiro planeta não luminar
    for planeta in planetas:
        if planeta["planeta"] not in ["Sol", "Lua"]:
            return planeta["planeta"]
    return "Marte"

def gerar_nomes_sugeridos(signo_solar):
    nomes_por_signo = {
        "Áries": ["Aurora", "Marte", "Ígnea"],
        "Touro": ["Terra", "Vênus", "Estela"],
        "Gêmeos": ["Gema", "Mercúrio", "Dual"],
        "Câncer": ["Luna", "Maré", "Cárie"],
        "Leão": ["Solar", "Dourado", "Régia"],
        "Virgem": ["Pura", "Ceres", "Analítica"],
        "Libra": ["Equilíbrio", "Justiça", "Harmonia"],
        "Escorpião": ["Intensa", "Plutão", "Mistério"],
        "Sagitário": ["Flecha", "Júpiter", "Aventura"],
        "Capricórnio": ["Montanha", "Saturno", "Determinação"],
        "Aquário": ["Água", "Urano", "Inovação"],
        "Peixes": ["Oceano", "Netuno", "Intuição"]
    }
    
    return nomes_por_signo.get(signo_solar, ["Astral", "Cósmica", "Estelar"])

def gerar_numero_sorte(data_nascimento):
    return sum([int(x) for x in data_nascimento.strftime("%d%m%Y") if x.isdigit()]) % 99 + 1

def gerar_perfil_resumido(signo_solar, ascendente, planeta_dominante):
    return f"Você é uma alma {signo_solar.lower()} com ascendente em {ascendente} e forte influência de {planeta_dominante}. Isso te torna alguém único(a) em sua jornada."

def sugestoes_por_mapa(signo, ascendente, planeta_dominante):
    return {
        "carreira": f"Sua carreira floresce em áreas que combinem a energia {signo.lower()} com a presença {ascendente.lower()}, especialmente onde {planeta_dominante} possa se expressar.",
        "amor": f"Nos relacionamentos, sua essência {signo.lower()} se manifesta através de uma personalidade {ascendente.lower()}, criando conexões autênticas e profundas.",
        "espiritualidade": f"Sua jornada espiritual é guiada pela energia transformadora de {planeta_dominante}, que te conecta com propósitos mais elevados."
    }

def calcular_nodos_lunares(data_nascimento):
    try:
        jd = swe.julday(data_nascimento.year, data_nascimento.month, data_nascimento.day, 
                       data_nascimento.hour + data_nascimento.minute/60.0)
        nodo_norte, _ = swe.calc_ut(jd, swe.MEAN_NODE)
        nodo_sul_grau = (nodo_norte[0] + 180) % 360
        
        return {
            "Nodo Norte": {"signo": calcular_signo(nodo_norte[0]), "grau": nodo_norte[0]},
            "Nodo Sul": {"signo": calcular_signo(nodo_sul_grau), "grau": nodo_sul_grau}
        }
    except:
        return {"Nodo Norte": {"signo": "Capricórnio", "grau": 270}, "Nodo Sul": {"signo": "Câncer", "grau": 90}}

def integrar_fase_lua_no_retorno(data_nascimento):
    fase = calcular_fase_lua(data_nascimento)
    mensagem = datas_favoraveis_fase_lua(fase)
    return {
        "fase_lua_natal": fase,
        "mensagem": mensagem
    }

def gerar_resultado_final(dados, ascendente_signo, meio_ceu_signo, numero_sorte, nomes_sugeridos,
                         signo_solar, perfil_resumido, sugestao_carreira, sugestao_amor,
                         sugestao_espiritual, nodos, sol, resultado_planetas, aspectos,
                         casas_astrologicas, planeta_dominante):

    fase_lua_info = integrar_fase_lua_no_retorno(dados.data_nascimento)

    return {
        "nome": dados.nome,
        "data": dados.data_nascimento.strftime("%d/%m/%Y"),
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
            "espiritualidade": sugestao_espiritual,
            "nodo_lunar": interpretar_nodo_lunar(nodos),
            "missao_de_vida": identificar_missao(sol, nodos, meio_ceu_signo),
            "potenciais_ocultos": detectar_potenciais(aspectos, casas_astrologicas)
        },
        "fase_lua": fase_lua_info,
        "planetas": resultado_planetas,
        "aspectos": aspectos,
        "casas": casas_astrologicas,
        "mapa_completo": gerar_interpretacao_mapa_completa(signo_solar, ascendente_signo, meio_ceu_signo, planeta_dominante, aspectos, casas_astrologicas),
        "alertas": gerar_alertas_de_cuidado(aspectos)
    }

def gerar_mapa_astral_completo(dados_usuario, lat, lon):
    """Função principal que orquestra todo o cálculo do mapa astral"""
    asc = calcular_ascendente(lat, lon, dados_usuario.data_nascimento)
    mc = calcular_meio_ceu(lat, lon, dados_usuario.data_nascimento)
    ss = calcular_signo_solar(dados_usuario.data_nascimento)
    planetas = calcular_planetas(dados_usuario.data_nascimento)
    aspectos = calcular_aspectos(planetas)
    casas = calcular_casas(lat, lon, dados_usuario.data_nascimento)
    dominante = descobrir_planeta_dominante(planetas)
    nomes = gerar_nomes_sugeridos(ss)
    sorte = gerar_numero_sorte(dados_usuario.data_nascimento)
    perfil = gerar_perfil_resumido(ss, asc, dominante)
    sugestoes = sugestoes_por_mapa(ss, asc, dominante)
    nodos = calcular_nodos_lunares(dados_usuario.data_nascimento)
    sol = next((p for p in planetas if p['planeta'] == "Sol"), {"signo": ss})

    return gerar_resultado_final(
        dados_usuario, asc, mc, sorte, nomes, ss, perfil,
        sugestoes['carreira'], sugestoes['amor'], sugestoes['espiritualidade'],
        nodos, sol, planetas, aspectos, casas, dominante
    )

def processar_mapa_astral(dados_json):
    """Função para processar dados vindos do frontend"""
    try:
        # Parse dos dados de entrada
        nome = dados_json.get('nome', '')
        data_str = dados_json.get('data_nascimento', '')
        hora_str = dados_json.get('hora_nascimento', '12:00')
        local = dados_json.get('local_nascimento', '')
        lat = dados_json.get('latitude', -23.5505)
        lon = dados_json.get('longitude', -46.6333)
        
        # Converter data
        data_nascimento = datetime.strptime(data_str, '%Y-%m-%d')
        
        # Adicionar hora à data
        hora_parts = hora_str.split(':')
        data_nascimento = data_nascimento.replace(
            hour=int(hora_parts[0]), 
            minute=int(hora_parts[1]) if len(hora_parts) > 1 else 0
        )
        
        # Criar objeto de dados do usuário
        dados_usuario = DadosUsuario(
            nome=nome,
            data_nascimento=data_nascimento,
            hora_nascimento=hora_str,
            local_nascimento=local
        )
        
        # Gerar o mapa astral completo
        resultado = gerar_mapa_astral_completo(dados_usuario, lat, lon)
        
        return {"success": True, "data": resultado}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Para uso via linha de comando
    if len(sys.argv) > 1:
        dados_json = json.loads(sys.argv[1])
        resultado = processar_mapa_astral(dados_json)
        print(json.dumps(resultado, ensure_ascii=False, indent=2))