#!/bin/bash

echo "Inserindo todos os municípios brasileiros em lotes..."

# Criar lotes menores do arquivo SQL
head -1000 /tmp/all_municipios.sql > /tmp/chunk1.sql
sed -n '1001,2000p' /tmp/all_municipios.sql | sed '1i\INSERT INTO brazilian_municipalities (name, state_code, ibge_code) VALUES' | sed '$s/,$/;/' > /tmp/chunk2.sql
sed -n '2001,3000p' /tmp/all_municipios.sql | sed '1i\INSERT INTO brazilian_municipalities (name, state_code, ibge_code) VALUES' | sed '$s/,$/;/' > /tmp/chunk3.sql
sed -n '3001,4000p' /tmp/all_municipios.sql | sed '1i\INSERT INTO brazilian_municipalities (name, state_code, ibge_code) VALUES' | sed '$s/,$/;/' > /tmp/chunk4.sql
sed -n '4001,5000p' /tmp/all_municipios.sql | sed '1i\INSERT INTO brazilian_municipalities (name, state_code, ibge_code) VALUES' | sed '$s/,$/;/' > /tmp/chunk5.sql
sed -n '5001,$p' /tmp/all_municipios.sql | sed '1i\INSERT INTO brazilian_municipalities (name, state_code, ibge_code) VALUES' | sed '$s/,$/;/' > /tmp/chunk6.sql

echo "Lotes criados:"
ls -la /tmp/chunk*.sql

echo "Primeiro lote tem $(wc -l < /tmp/chunk1.sql) linhas"
echo "Segundo lote tem $(wc -l < /tmp/chunk2.sql) linhas"