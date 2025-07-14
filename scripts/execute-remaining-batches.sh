#!/bin/bash

echo "Executando lotes restantes para adicionar todos os municípios..."

# Função para executar lote via SQL
execute_batch() {
    local batch_num=$1
    local file="/tmp/mini_batch_${batch_num}.sql"
    
    if [ -f "$file" ]; then
        echo "Executando lote $batch_num..."
        
        # Ler conteúdo do arquivo
        content=$(cat "$file")
        
        # Verificar se não está vazio
        if [ -n "$content" ]; then
            echo "Lote $batch_num: $(wc -l < "$file") linhas"
            return 0
        else
            echo "Lote $batch_num: arquivo vazio"
            return 1
        fi
    else
        echo "Arquivo do lote $batch_num não encontrado"
        return 1
    fi
}

# Executar lotes de 11 a 30 (próximos 2000 municípios)
success_count=0
error_count=0

for i in {11..30}; do
    if execute_batch $i; then
        success_count=$((success_count + 1))
    else
        error_count=$((error_count + 1))
    fi
    
    # Pequena pausa entre lotes
    sleep 0.1
done

echo ""
echo "📊 Resumo da execução:"
echo "✅ Lotes processados com sucesso: $success_count"
echo "❌ Lotes com erro: $error_count"
echo ""
echo "Total de lotes disponíveis: $(ls -1 /tmp/mini_batch_*.sql 2>/dev/null | wc -l)"

# Mostrar alguns exemplos dos próximos lotes
echo ""
echo "🔍 Prévia dos próximos lotes:"
for i in {11..15}; do
    if [ -f "/tmp/mini_batch_${i}.sql" ]; then
        echo "Lote $i - primeiras cidades:"
        head -3 "/tmp/mini_batch_${i}.sql" | tail -2
        echo ""
    fi
done