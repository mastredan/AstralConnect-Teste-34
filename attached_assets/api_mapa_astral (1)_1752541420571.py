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
    return talentos if talentos else "Seus potenciais estão em construção, e cada descoberta é parte da jornada."

def gerar_interpretacao_mapa_completa(signo_solar, ascendente, meio_ceu, planeta_dominante, aspectos, casas):
    return (
        f"Seu mapa revela uma alma {signo_solar.lower()}, com uma presença social guiada por {ascendente} e ambições profissionais voltadas a {meio_ceu}. "
        f"{planeta_dominante} rege boa parte de suas ações internas, e aspectos como {aspectos[0]['aspecto']} entre planetas moldam suas experiências. "
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

from datetime import datetime
from math import floor

import swisseph as swe

def calcular_fase_lua(data_nascimento):
    swe.set_ephe_path("/usr/share/ephe")  # ou o caminho onde os arquivos .se1 estão
    jd = swe.julday(data_nascimento.year, data_nascimento.month, data_nascimento.day)
    lua_long, _ = swe.calc_ut(jd, swe.MOON)
    sol_long, _ = swe.calc_ut(jd, swe.SUN)
    fase = (lua_long - sol_long) % 360
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



import swisseph as swe
import pytz
from datetime import datetime
from dataclasses import dataclass

@dataclass
class DadosUsuario:
    nome: str
    data_nascimento: datetime
    hora_nascimento: str
    local_nascimento: str

# Simulação de funções que normalmente estariam em outros módulos ou integradas ao Swiss Ephemeris

def calcular_ascendente(lat, lon, data_nascimento):
    # Placeholder genérico
    return "Libra"

def calcular_meio_ceu(lat, lon, data_nascimento):
    return "Câncer"

def calcular_signo_solar(data_nascimento):
    # Placeholder para simular retorno
    return "Áries"

def calcular_planetas(data_nascimento):
    return [{"planeta": "Sol", "signo": "Áries"}, {"planeta": "Lua", "signo": "Touro"}]

def calcular_aspectos(planetas):
    return [{"planeta1": "Sol", "planeta2": "Lua", "aspecto": "trígono"}]

def calcular_casas(lat, lon, data_nascimento):
    return [{"numero": i+1, "signo": "Leão" if i%2==0 else "Peixes"} for i in range(12)]

def descobrir_planeta_dominante(planetas):
    return "Marte"

def gerar_nomes_sugeridos(signo_solar):
    return [f"{signo_solar}lino", f"{signo_solar}ara", f"Nova{signo_solar}"]

def gerar_numero_sorte(data_nascimento):
    return sum([int(x) for x in data_nascimento.strftime("%d%m%Y")]) % 99 + 1

def gerar_perfil_resumido(signo_solar, ascendente, planeta_dominante):
    return f"Você é uma alma {signo_solar.lower()} com ascendente em {ascendente} e forte influência de {planeta_dominante}. Isso te torna alguém único(a) em sua jornada."

def sugestoes_por_mapa(signo, ascendente, planeta_dominante):
    return {
        "carreira": [f"Carreira com influência de {signo}", f"Setor regido por {ascendente}", f"Desafios ligados a {planeta_dominante}"],
        "amor": [f"Relacionamentos guiados por {signo}", f"Atratividade influenciada por {ascendente}"],
        "espiritualidade": [f"Conexão espiritual forte com {planeta_dominante}"]
    }

def calcular_nodos_lunares(data_nascimento):
    return {"Nodo Norte": {"signo": "Capricórnio"}, "Nodo Sul": {"signo": "Câncer"}}

# Função principal que orquestra tudo
def gerar_mapa_astral_completo(dados_usuario, lat, lon):
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
