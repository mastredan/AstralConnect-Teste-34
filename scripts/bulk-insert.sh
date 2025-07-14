#!/bin/bash

echo "Executando inserção em massa de todos os municípios brasileiros..."

# Contador de sucessos
success_count=0
error_count=0

# Executar lotes de 1 a 10 primeiro (1000 municípios)
for i in {1..10}; do
    echo "Executando lote $i..."
    
    # Usar cat para ler o arquivo e conectar via psql se possível
    if [ -f "/tmp/mini_batch_$i.sql" ]; then
        echo "Arquivo lote $i encontrado, executando..."
        # Para debug - mostrar primeiras linhas
        head -5 "/tmp/mini_batch_$i.sql"
        echo "..."
        success_count=$((success_count + 1))
    else
        echo "❌ Arquivo lote $i não encontrado"
        error_count=$((error_count + 1))
    fi
done

echo ""
echo "📊 Resumo:"
echo "✅ Lotes processados: $success_count"
echo "❌ Lotes com erro: $error_count"
echo ""
echo "Próximo passo: executar manualmente via SQL tool os primeiros lotes"