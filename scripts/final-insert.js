import fs from 'fs';

// Ler o arquivo original e dividir em lotes adequados para inserção manual
const sqlContent = fs.readFileSync('/tmp/all_municipios.sql', 'utf8');

// Remover o cabeçalho e quebrar em linhas
const lines = sqlContent.replace('INSERT INTO brazilian_municipalities (name, state_code, ibge_code) VALUES\n', '').split('\n');

// Processar em lotes de 100 municípios
const batchSize = 100;
let batches = [];

for (let i = 0; i < lines.length - 1; i += batchSize) { // -1 para ignorar linha vazia final
  const batch = lines.slice(i, i + batchSize);
  
  // Remover vírgulas do final da última linha do lote
  const lastIndex = batch.length - 1;
  if (batch[lastIndex] && batch[lastIndex].endsWith(',')) {
    batch[lastIndex] = batch[lastIndex].slice(0, -1);
  }
  
  const batchSQL = `INSERT INTO brazilian_municipalities (name, state_code, ibge_code) VALUES\n${batch.join('\n')};`;
  
  const fileName = `/tmp/mini_batch_${batches.length + 1}.sql`;
  fs.writeFileSync(fileName, batchSQL);
  batches.push(fileName);
  
  console.log(`Lote ${batches.length}: ${batch.length} municípios`);
}

console.log(`\nTotal de ${batches.length} mini-lotes criados`);
console.log('Execute cada um via SQL tool ou use cat para ver o conteúdo');