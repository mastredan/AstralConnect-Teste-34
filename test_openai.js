// Teste simples para verificar conexão com OpenAI
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function testOpenAI() {
  try {
    console.log('Testando conexão com OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um assistente útil que responde em português brasileiro."
        },
        {
          role: "user",
          content: "Diga 'Olá! A API do OpenAI está funcionando perfeitamente!' em uma única linha."
        }
      ],
      max_tokens: 50,
      temperature: 0.1,
    });

    console.log('✅ Sucesso! Resposta da API:', response.choices[0].message.content);
    console.log('✅ Modelo usado:', response.model);
    console.log('✅ Tokens usados:', response.usage?.total_tokens || 'N/A');
    
  } catch (error) {
    console.error('❌ Erro na conexão com OpenAI:', error);
    
    if (error.code === 'insufficient_quota') {
      console.error('❌ Problema: Quota da API excedida');
    } else if (error.code === 'invalid_api_key') {
      console.error('❌ Problema: Chave da API inválida');
    } else if (error.code === 'rate_limit_exceeded') {
      console.error('❌ Problema: Limite de taxa excedido');
    } else {
      console.error('❌ Erro desconhecido:', error.message);
    }
  }
}

testOpenAI();