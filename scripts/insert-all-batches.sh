#!/bin/bash

echo "Inserindo todos os municípios brasileiros no banco de dados..."

# Usar o comando npm para executar SQL via drizzle
cd /home/runner/workspace

for i in {1..12}; do
    echo "Executando lote $i..."
    
    # Executar cada arquivo SQL usando a conexão do banco
    cat "/tmp/municipios_batch_$i.sql" | npx tsx -e "
    import { db } from './server/db.js';
    import { sql } from 'drizzle-orm';
    import fs from 'fs';
    
    const sqlContent = fs.readFileSync('/tmp/municipios_batch_$i.sql', 'utf8');
    try {
        await db.execute(sql.raw(sqlContent));
        console.log('Lote $i inserido com sucesso');
    } catch (error) {
        console.error('Erro no lote $i:', error.message);
    }
    process.exit(0);
    "
done

echo "Todos os lotes foram processados!"