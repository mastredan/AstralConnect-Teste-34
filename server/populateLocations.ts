import { db } from "./db";
import { brazilianStates, brazilianMunicipalities } from "@shared/schema";

const statesData = [
  { code: "AC", name: "Acre", region: "Norte" },
  { code: "AL", name: "Alagoas", region: "Nordeste" },
  { code: "AP", name: "Amapá", region: "Norte" },
  { code: "AM", name: "Amazonas", region: "Norte" },
  { code: "BA", name: "Bahia", region: "Nordeste" },
  { code: "CE", name: "Ceará", region: "Nordeste" },
  { code: "DF", name: "Distrito Federal", region: "Centro-Oeste" },
  { code: "ES", name: "Espírito Santo", region: "Sudeste" },
  { code: "GO", name: "Goiás", region: "Centro-Oeste" },
  { code: "MA", name: "Maranhão", region: "Nordeste" },
  { code: "MT", name: "Mato Grosso", region: "Centro-Oeste" },
  { code: "MS", name: "Mato Grosso do Sul", region: "Centro-Oeste" },
  { code: "MG", name: "Minas Gerais", region: "Sudeste" },
  { code: "PA", name: "Pará", region: "Norte" },
  { code: "PB", name: "Paraíba", region: "Nordeste" },
  { code: "PR", name: "Paraná", region: "Sul" },
  { code: "PE", name: "Pernambuco", region: "Nordeste" },
  { code: "PI", name: "Piauí", region: "Nordeste" },
  { code: "RJ", name: "Rio de Janeiro", region: "Sudeste" },
  { code: "RN", name: "Rio Grande do Norte", region: "Nordeste" },
  { code: "RS", name: "Rio Grande do Sul", region: "Sul" },
  { code: "RO", name: "Rondônia", region: "Norte" },
  { code: "RR", name: "Roraima", region: "Norte" },
  { code: "SC", name: "Santa Catarina", region: "Sul" },
  { code: "SP", name: "São Paulo", region: "Sudeste" },
  { code: "SE", name: "Sergipe", region: "Nordeste" },
  { code: "TO", name: "Tocantins", region: "Norte" },
];

const municipalitiesData = [
  // São Paulo
  { name: "São Paulo", stateCode: "SP", ibgeCode: "3550308" },
  { name: "Campinas", stateCode: "SP", ibgeCode: "3509502" },
  { name: "Santos", stateCode: "SP", ibgeCode: "3548500" },
  { name: "Sorocaba", stateCode: "SP", ibgeCode: "3552205" },
  { name: "Ribeirão Preto", stateCode: "SP", ibgeCode: "3543402" },
  { name: "Osasco", stateCode: "SP", ibgeCode: "3534401" },
  { name: "Santo André", stateCode: "SP", ibgeCode: "3547809" },
  { name: "São Bernardo do Campo", stateCode: "SP", ibgeCode: "3548708" },
  { name: "Guarulhos", stateCode: "SP", ibgeCode: "3518800" },
  { name: "Jundiaí", stateCode: "SP", ibgeCode: "3525904" },
  
  // Rio de Janeiro
  { name: "Rio de Janeiro", stateCode: "RJ", ibgeCode: "3304557" },
  { name: "Niterói", stateCode: "RJ", ibgeCode: "3303302" },
  { name: "Petrópolis", stateCode: "RJ", ibgeCode: "3303906" },
  { name: "Nova Iguaçu", stateCode: "RJ", ibgeCode: "3303500" },
  { name: "Duque de Caxias", stateCode: "RJ", ibgeCode: "3301702" },
  { name: "São Gonçalo", stateCode: "RJ", ibgeCode: "3304904" },
  { name: "Volta Redonda", stateCode: "RJ", ibgeCode: "3306107" },
  { name: "Campos dos Goytacazes", stateCode: "RJ", ibgeCode: "3301009" },
  { name: "Belford Roxo", stateCode: "RJ", ibgeCode: "3300456" },
  { name: "São João de Meriti", stateCode: "RJ", ibgeCode: "3304755" },
  
  // Minas Gerais
  { name: "Belo Horizonte", stateCode: "MG", ibgeCode: "3106200" },
  { name: "Uberlândia", stateCode: "MG", ibgeCode: "3170206" },
  { name: "Contagem", stateCode: "MG", ibgeCode: "3118601" },
  { name: "Juiz de Fora", stateCode: "MG", ibgeCode: "3136702" },
  { name: "Betim", stateCode: "MG", ibgeCode: "3106705" },
  { name: "Montes Claros", stateCode: "MG", ibgeCode: "3143302" },
  { name: "Ribeirão das Neves", stateCode: "MG", ibgeCode: "3154606" },
  { name: "Uberaba", stateCode: "MG", ibgeCode: "3170107" },
  { name: "Governador Valadares", stateCode: "MG", ibgeCode: "3127701" },
  { name: "Ipatinga", stateCode: "MG", ibgeCode: "3131307" },
  
  // Rio Grande do Sul
  { name: "Porto Alegre", stateCode: "RS", ibgeCode: "4314902" },
  { name: "Caxias do Sul", stateCode: "RS", ibgeCode: "4305108" },
  { name: "Pelotas", stateCode: "RS", ibgeCode: "4314407" },
  { name: "Canoas", stateCode: "RS", ibgeCode: "4304606" },
  { name: "Santa Maria", stateCode: "RS", ibgeCode: "4316907" },
  { name: "Gravataí", stateCode: "RS", ibgeCode: "4309100" },
  { name: "Viamão", stateCode: "RS", ibgeCode: "4323002" },
  { name: "Novo Hamburgo", stateCode: "RS", ibgeCode: "4313409" },
  { name: "São Leopoldo", stateCode: "RS", ibgeCode: "4318705" },
  { name: "Rio Grande", stateCode: "RS", ibgeCode: "4315602" },
  
  // Bahia
  { name: "Salvador", stateCode: "BA", ibgeCode: "2927408" },
  { name: "Feira de Santana", stateCode: "BA", ibgeCode: "2910800" },
  { name: "Vitória da Conquista", stateCode: "BA", ibgeCode: "2933307" },
  { name: "Camaçari", stateCode: "BA", ibgeCode: "2905305" },
  { name: "Juazeiro", stateCode: "BA", ibgeCode: "2918407" },
  { name: "Lauro de Freitas", stateCode: "BA", ibgeCode: "2919207" },
  { name: "Itabuna", stateCode: "BA", ibgeCode: "2916203" },
  { name: "Ilhéus", stateCode: "BA", ibgeCode: "2913606" },
  { name: "Jequié", stateCode: "BA", ibgeCode: "2918001" },
  { name: "Teixeira de Freitas", stateCode: "BA", ibgeCode: "2931053" },
  
  // Paraná
  { name: "Curitiba", stateCode: "PR", ibgeCode: "4106902" },
  { name: "Londrina", stateCode: "PR", ibgeCode: "4113700" },
  { name: "Maringá", stateCode: "PR", ibgeCode: "4115200" },
  { name: "Ponta Grossa", stateCode: "PR", ibgeCode: "4119905" },
  { name: "Cascavel", stateCode: "PR", ibgeCode: "4104808" },
  { name: "São José dos Pinhais", stateCode: "PR", ibgeCode: "4125506" },
  { name: "Foz do Iguaçu", stateCode: "PR", ibgeCode: "4108304" },
  { name: "Colombo", stateCode: "PR", ibgeCode: "4106001" },
  { name: "Guarapuava", stateCode: "PR", ibgeCode: "4109401" },
  { name: "Paranaguá", stateCode: "PR", ibgeCode: "4118204" },
  
  // Ceará
  { name: "Fortaleza", stateCode: "CE", ibgeCode: "2304400" },
  { name: "Caucaia", stateCode: "CE", ibgeCode: "2303709" },
  { name: "Juazeiro do Norte", stateCode: "CE", ibgeCode: "2307304" },
  { name: "Sobral", stateCode: "CE", ibgeCode: "2312908" },
  { name: "Maracanaú", stateCode: "CE", ibgeCode: "2308104" },
  { name: "Crato", stateCode: "CE", ibgeCode: "2304103" },
  { name: "Itapipoca", stateCode: "CE", ibgeCode: "2306256" },
  { name: "Maranguape", stateCode: "CE", ibgeCode: "2308203" },
  { name: "Iguatu", stateCode: "CE", ibgeCode: "2305407" },
  { name: "Quixadá", stateCode: "CE", ibgeCode: "2311306" },
  
  // Pernambuco
  { name: "Recife", stateCode: "PE", ibgeCode: "2611606" },
  { name: "Jaboatão dos Guararapes", stateCode: "PE", ibgeCode: "2607901" },
  { name: "Olinda", stateCode: "PE", ibgeCode: "2609600" },
  { name: "Caruaru", stateCode: "PE", ibgeCode: "2604106" },
  { name: "Petrolina", stateCode: "PE", ibgeCode: "2611101" },
  { name: "Paulista", stateCode: "PE", ibgeCode: "2610707" },
  { name: "Cabo de Santo Agostinho", stateCode: "PE", ibgeCode: "2602902" },
  { name: "Camaragibe", stateCode: "PE", ibgeCode: "2603454" },
  { name: "Garanhuns", stateCode: "PE", ibgeCode: "2606002" },
  { name: "Vitória de Santo Antão", stateCode: "PE", ibgeCode: "2616407" },
  
  // Santa Catarina
  { name: "Florianópolis", stateCode: "SC", ibgeCode: "4205407" },
  { name: "Joinville", stateCode: "SC", ibgeCode: "4209102" },
  { name: "Blumenau", stateCode: "SC", ibgeCode: "4202404" },
  { name: "Chapecó", stateCode: "SC", ibgeCode: "4204202" },
  { name: "Criciúma", stateCode: "SC", ibgeCode: "4204608" },
  { name: "Itajaí", stateCode: "SC", ibgeCode: "4208203" },
  { name: "São José", stateCode: "SC", ibgeCode: "4216602" },
  { name: "Lages", stateCode: "SC", ibgeCode: "4209300" },
  { name: "Palhoça", stateCode: "SC", ibgeCode: "4211900" },
  { name: "Balneário Camboriú", stateCode: "SC", ibgeCode: "4202008" },
  
  // Goiás
  { name: "Goiânia", stateCode: "GO", ibgeCode: "5208707" },
  { name: "Aparecida de Goiânia", stateCode: "GO", ibgeCode: "5201108" },
  { name: "Anápolis", stateCode: "GO", ibgeCode: "5201405" },
  { name: "Rio Verde", stateCode: "GO", ibgeCode: "5218805" },
  { name: "Luziânia", stateCode: "GO", ibgeCode: "5212501" },
  { name: "Águas Lindas de Goiás", stateCode: "GO", ibgeCode: "5200258" },
  { name: "Valparaíso de Goiás", stateCode: "GO", ibgeCode: "5221502" },
  { name: "Trindade", stateCode: "GO", ibgeCode: "5221007" },
  { name: "Formosa", stateCode: "GO", ibgeCode: "5207808" },
  { name: "Novo Gama", stateCode: "GO", ibgeCode: "5215231" },
];

export async function populateLocations() {
  console.log("Populando estados brasileiros...");
  
  try {
    // Insert states
    await db.insert(brazilianStates).values(statesData).onConflictDoNothing();
    
    // Insert municipalities
    await db.insert(brazilianMunicipalities).values(municipalitiesData).onConflictDoNothing();
    
    console.log("Estados e municípios populados com sucesso!");
  } catch (error) {
    console.error("Erro ao popular localidades:", error);
  }
}