#!/usr/bin/env python3
import json
import os
import psycopg2
from psycopg2.extras import execute_values

def populate_municipalities():
    try:
        print("Carregando dados dos municípios...")
        
        # Carregar dados do arquivo JSON
        with open('/tmp/municipios.json', 'r', encoding='utf-8') as file:
            municipalities = json.load(file)
        
        print(f"Total de municípios encontrados: {len(municipalities)}")
        
        # Conectar ao banco de dados
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        # Limpar tabela antes de inserir novos dados
        cur.execute("DELETE FROM brazilian_municipalities")
        print("Tabela de municípios limpa.")
        
        # Preparar dados para inserção
        municipality_data = []
        for municipality in municipalities:
            municipality_data.append((
                municipality['nome'],
                municipality['microrregiao']['mesorregiao']['UF']['sigla'],
                str(municipality['id'])
            ))
        
        # Inserir em lotes para melhor performance
        batch_size = 1000
        total_inserted = 0
        
        for i in range(0, len(municipality_data), batch_size):
            batch = municipality_data[i:i + batch_size]
            execute_values(
                cur,
                "INSERT INTO brazilian_municipalities (name, state_code, ibge_code) VALUES %s",
                batch,
                template=None,
                page_size=100
            )
            total_inserted += len(batch)
            print(f"Inseridos {total_inserted}/{len(municipality_data)} municípios...")
        
        # Confirmar transação
        conn.commit()
        print("✅ Todos os municípios foram inseridos com sucesso!")
        
        # Mostrar estatísticas por estado
        cur.execute("""
            SELECT state_code, COUNT(*) as count 
            FROM brazilian_municipalities 
            GROUP BY state_code 
            ORDER BY state_code
        """)
        
        stats = cur.fetchall()
        print("\n📊 Municípios por estado:")
        for state_code, count in stats:
            print(f"{state_code}: {count} municípios")
        
        # Total final
        cur.execute("SELECT COUNT(*) FROM brazilian_municipalities")
        total = cur.fetchone()[0]
        print(f"\n🎉 Total de {total} municípios inseridos no banco de dados!")
        
    except Exception as error:
        print(f"❌ Erro ao popular municípios: {error}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    populate_municipalities()