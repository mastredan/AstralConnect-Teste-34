import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function populateAllMunicipalities() {
  try {
    console.log('Buscando dados dos municípios da API do IBGE...');
    
    // Buscar todos os municípios do Brasil
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
    const municipalities = await response.json();
    
    console.log(`Total de municípios encontrados: ${municipalities.length}`);
    
    // Limpar tabela antes de inserir novos dados
    await pool.query('DELETE FROM brazilian_municipalities');
    console.log('Tabela de municípios limpa.');
    
    // Processar em lotes para evitar problemas de performance
    const batchSize = 100;
    let processed = 0;
    
    for (let i = 0; i < municipalities.length; i += batchSize) {
      const batch = municipalities.slice(i, i + batchSize);
      
      const values = batch.map(municipality => [
        municipality.nome,
        municipality.microrregiao.mesorregiao.UF.sigla,
        municipality.id.toString()
      ]);
      
      // Construir query de inserção
      const placeholders = values.map((_, idx) => {
        const base = idx * 3;
        return `($${base + 1}, $${base + 2}, $${base + 3})`;
      }).join(', ');
      
      const flatValues = values.flat();
      
      const query = `INSERT INTO brazilian_municipalities (name, state_code, ibge_code) VALUES ${placeholders}`;
      
      await pool.query(query, flatValues);
      processed += batch.length;
      
      console.log(`Processados ${processed}/${municipalities.length} municípios...`);
    }
    
    console.log('✅ Todos os municípios foram inseridos com sucesso!');
    
    // Mostrar estatísticas por estado
    const stats = await pool.query(`
      SELECT state_code, COUNT(*) as count 
      FROM brazilian_municipalities 
      GROUP BY state_code 
      ORDER BY state_code
    `);
    
    console.log('\n📊 Municípios por estado:');
    stats.rows.forEach(stat => {
      console.log(`${stat.state_code}: ${stat.count} municípios`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao popular municípios:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Executar o script
populateAllMunicipalities();