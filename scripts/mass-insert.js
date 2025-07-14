import fs from 'fs';
import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

async function insertAllBatches() {
  try {
    console.log('Iniciando inserção de todos os municípios brasileiros...');
    
    for (let i = 1; i <= 12; i++) {
      const filePath = `/tmp/municipios_batch_${i}.sql`;
      
      if (fs.existsSync(filePath)) {
        console.log(`Inserindo lote ${i}...`);
        
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        await db.execute(sql.raw(sqlContent));
        
        console.log(`✅ Lote ${i} inserido com sucesso`);
      } else {
        console.log(`❌ Arquivo ${filePath} não encontrado`);
      }
    }
    
    // Verificar total inserido
    const result = await db.execute(sql`SELECT COUNT(*) as total FROM brazilian_municipalities`);
    console.log(`\n🎉 Total de municípios inseridos: ${result.rows[0].total}`);
    
    // Mostrar estatísticas por estado
    const stats = await db.execute(sql`
      SELECT state_code, COUNT(*) as count 
      FROM brazilian_municipalities 
      GROUP BY state_code 
      ORDER BY state_code
    `);
    
    console.log('\n📊 Municípios por estado:');
    stats.rows.forEach(row => {
      console.log(`${row.state_code}: ${row.count} municípios`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante a inserção:', error);
  } finally {
    process.exit(0);
  }
}

insertAllBatches();