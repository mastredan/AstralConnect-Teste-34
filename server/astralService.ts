import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePersonalizedProfile, generateComprehensiveInterpretation, generatePersonalizedSuggestions } from './openaiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AstralCalculationData {
  nome: string;
  data_nascimento: string; // YYYY-MM-DD format
  hora_nascimento: string; // HH:MM format
  local_nascimento: string;
  latitude: number;
  longitude: number;
}

export interface AstralMapResult {
  success: boolean;
  data?: {
    nome: string;
    data: string;
    hora: string;
    local: string;
    ascendente: string;
    meio_do_ceu: string;
    numero_da_sorte: number;
    nomes_sugeridos: string[];
    signo_solar: string;
    perfil_resumido: string;
    interpretacao_completa?: {
      introducao: string;
      personalidade_nucleo: string;
      temperamento_emocional: string;
      expressao_social: string;
      potencial_profissional: string;
      relacionamentos: string;
      desafios_evolutivos: string;
      dons_naturais: string;
      conselhos_espirituais: string;
    };
    sugestoes: {
      carreira: string;
      amor: string;
      espiritualidade: string;
      saude?: string;
      financas?: string;
      nodo_lunar: string;
      missao_de_vida: string;
      potenciais_ocultos: string[];
    };
    fase_lua: {
      fase_lua_natal: string;
      mensagem: string;
    };
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
    mapa_completo: string;
    alertas: string[];
  };
  error?: string;
}

export async function calculateAstralMap(data: AstralCalculationData): Promise<AstralMapResult> {
  return new Promise(async (resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, 'astral_api_advanced.py');
    
    // Prepare the data for the Python script
    const jsonData = JSON.stringify(data);
    
    // Spawn Python process
    const pythonProcess = spawn('python3', [pythonScriptPath, jsonData]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error('Python script error:', stderr);
        resolve({
          success: false,
          error: `Python script failed with code ${code}: ${stderr}`
        });
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        
        if (result.success && result.data) {
          console.log('Enhancing astral map with OpenAI...');
          
          // Enhance with OpenAI-generated content
          const astralData = result.data;
          
          // Generate personalized profile
          let personalizedProfile = astralData.perfil_resumido || 'Perfil astrológico básico processado com sucesso.';
          let comprehensiveInterpretation = astralData.interpretacao_completa;
          let personalizedSuggestions = astralData.sugestoes;
          
          try {
            personalizedProfile = await generatePersonalizedProfile(astralData);
            comprehensiveInterpretation = await generateComprehensiveInterpretation(astralData);
            personalizedSuggestions = await generatePersonalizedSuggestions(astralData);
          } catch (error) {
            console.error('OpenAI enhancement failed, using basic profile:', error);
            // Keep the basic profile if OpenAI fails
          }
          
          // Enhance the result with AI-generated content
          const enhancedResult = {
            ...result,
            data: {
              ...astralData,
              perfil_resumido: personalizedProfile,
              interpretacao_completa: comprehensiveInterpretation,
              sugestoes: {
                ...astralData.sugestoes,
                ...personalizedSuggestions
              }
            }
          };
          
          resolve(enhancedResult);
        } else {
          resolve(result);
        }
      } catch (error) {
        console.error('JSON parse error:', error);
        resolve({
          success: false,
          error: `Failed to parse result: ${error}`
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('Python process error:', error);
      resolve({
        success: false,
        error: `Failed to start Python process: ${error.message}`
      });
    });
  });
}

// Helper function to convert date formats
export function formatDateForPython(dateString: string): string {
  // Convert from DD/MM/YYYY to YYYY-MM-DD
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateString;
}

// Helper function to get coordinates from location
export async function getCoordinatesFromLocation(location: string): Promise<{ latitude: number; longitude: number }> {
  // This is a simplified version. In production, you'd use a proper geocoding service
  // For now, we'll use some common Brazilian cities
  const brazilianCities: { [key: string]: { latitude: number; longitude: number } } = {
    'São Paulo': { latitude: -23.5505, longitude: -46.6333 },
    'Rio de Janeiro': { latitude: -22.9068, longitude: -43.1729 },
    'Belo Horizonte': { latitude: -19.9167, longitude: -43.9345 },
    'Salvador': { latitude: -12.9714, longitude: -38.5014 },
    'Brasília': { latitude: -15.8267, longitude: -47.9218 },
    'Fortaleza': { latitude: -3.7327, longitude: -38.5267 },
    'Recife': { latitude: -8.0476, longitude: -34.8770 },
    'Porto Alegre': { latitude: -30.0346, longitude: -51.2177 },
    'Curitiba': { latitude: -25.4284, longitude: -49.2733 },
    'Manaus': { latitude: -3.1190, longitude: -60.0217 }
  };
  
  // Try to find exact match
  const coordinates = brazilianCities[location];
  if (coordinates) {
    return coordinates;
  }
  
  // Try to find partial match
  for (const city in brazilianCities) {
    if (location.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(location.toLowerCase())) {
      return brazilianCities[city];
    }
  }
  
  // Default to São Paulo if no match found
  return { latitude: -23.5505, longitude: -46.6333 };
}