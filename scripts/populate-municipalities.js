import { db } from '../server/db.js';
import { brazilianMunicipalities } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

// Função para buscar e popular todos os municípios brasileiros
async function populateAllMunicipalities() {
  try {
    console.log('Buscando dados dos municípios da API do IBGE...');
    
    // Buscar todos os municípios do Brasil
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
    const municipalities = await response.json();
    
    console.log(`Total de municípios encontrados: ${municipalities.length}`);
    
    // Limpar tabela antes de inserir novos dados
    await db.delete(brazilianMunicipalities);
    console.log('Tabela de municípios limpa.');
    
    // Processar em lotes para evitar problemas de performance
    const batchSize = 100;
    let processed = 0;
    
    for (let i = 0; i < municipalities.length; i += batchSize) {
      const batch = municipalities.slice(i, i + batchSize);
      
      const municipalityData = batch.map(municipality => ({
        name: municipality.nome,
        stateCode: municipality.microrregiao.mesorregiao.UF.sigla,
        ibgeCode: municipality.id.toString()
      }));
      
      await db.insert(brazilianMunicipalities).values(municipalityData);
      processed += batch.length;
      
      console.log(`Processados ${processed}/${municipalities.length} municípios...`);
    }
    
    console.log('✅ Todos os municípios foram inseridos com sucesso!');
    
    // Mostrar estatísticas por estado
    const stats = await db
      .select({
        stateCode: brazilianMunicipalities.stateCode,
        count: sql`count(*)`
      })
      .from(brazilianMunicipalities)
      .groupBy(brazilianMunicipalities.stateCode)
      .orderBy(brazilianMunicipalities.stateCode);
    
    console.log('\n📊 Municípios por estado:');
    stats.forEach(stat => {
      console.log(`${stat.stateCode}: ${stat.count} municípios`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao popular municípios:', error);
  } finally {
    process.exit(0);
  }
}

// Executar o script
populateAllMunicipalities();