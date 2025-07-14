import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para processar e converter os dados para SQL
function processarMunicipios() {
  try {
    // Ler o arquivo JSON
    const jsonData = fs.readFileSync('/tmp/municipios_completos.json', 'utf8');
    const municipios = JSON.parse(jsonData);
    
    console.log(`Total de municípios encontrados: ${municipios.data.length}`);
    
    // Processar em lotes de 500 para evitar SQL muito grandes
    const batchSize = 500;
    let sqlFiles = [];
    
    for (let i = 0; i < municipios.data.length; i += batchSize) {
      const batch = municipios.data.slice(i, i + batchSize);
      
      let sqlInsert = "INSERT INTO brazilian_municipalities (name, state_code, ibge_code) VALUES\n";
      
      const values = batch.map(municipio => 
        `('${municipio.Nome.replace(/'/g, "''")}', '${municipio.Uf}', '${municipio.Codigo}')`
      ).join(',\n');
      
      sqlInsert += values + ';\n';
      
      const fileName = `/tmp/municipios_batch_${Math.floor(i/batchSize) + 1}.sql`;
      fs.writeFileSync(fileName, sqlInsert);
      sqlFiles.push(fileName);
      
      console.log(`Lote ${Math.floor(i/batchSize) + 1} criado: ${batch.length} municípios`);
    }
    
    console.log(`\n📁 Arquivos SQL criados:`);
    sqlFiles.forEach(file => console.log(file));
    
    return sqlFiles;
    
  } catch (error) {
    console.error('❌ Erro ao processar municípios:', error);
    return [];
  }
}

// Executar processamento
const arquivos = processarMunicipios();
console.log(`\n✅ Processamento concluído! ${arquivos.length} arquivos SQL criados.`);