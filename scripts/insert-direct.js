import fs from 'fs';

try {
  // Ler o arquivo JSON que já baixamos
  const jsonData = fs.readFileSync('/tmp/municipios_completos.json', 'utf8');
  const data = JSON.parse(jsonData);
  
  console.log(`Total municípios: ${data.data.length}`);
  
  // Criar um único arquivo SQL com todos os municípios
  let sqlContent = "INSERT INTO brazilian_municipalities (name, state_code, ibge_code) VALUES\n";
  
  const values = data.data.map((municipio, index) => {
    const nome = municipio.Nome.replace(/'/g, "''"); // Escapar aspas simples
    return `('${nome}', '${municipio.Uf}', '${municipio.Codigo}')`;
  });
  
  sqlContent += values.join(',\n') + ';';
  
  // Salvar em arquivo
  fs.writeFileSync('/tmp/all_municipios.sql', sqlContent);
  
  console.log('Arquivo SQL completo criado: /tmp/all_municipios.sql');
  console.log(`Total de ${data.data.length} municípios processados`);
  
} catch (error) {
  console.error('Erro:', error);
}