# OrLev - Rede Social Cristã

## Overview
OrLev é uma rede social cristã inovadora com o slogan "Conecte. Ilumine. Transforme". A plataforma foi completamente redesenhada a partir do projeto ASTRUS original, mantendo apenas o banco de dados de cidades e estados brasileiros.

## Project Architecture
- **Frontend**: React com TypeScript
- **Backend**: Express.js com TypeScript
- **Database**: PostgreSQL com Drizzle ORM
- **Styling**: Tailwind CSS com paleta customizada do OrLev
- **Authentication**: Sistema de login/cadastro customizado

## Color Palette (OrLev Brand)
- Primary: #257b82 (teal escuro)
- Light: #e7f5f6 (teal muito claro)  
- Medium: #6ea1a7 (teal médio)
- Accent: #7fc7ce (teal claro)
- Complementary: #89bcc4 (azul-teal)

## Recent Changes (19/01/2025)
- ✓ Transformação completa do ASTRUS para OrLev
- ✓ Nova identidade visual com paleta de cores teal
- ✓ Sistema de cadastro com denominações cristãs
- ✓ Implementação do logo e fonte personalizada (Morn Demibold)
- ✓ Páginas de Login e Cadastro redesenhadas
- ✓ Corrigido erro de JavaScript no index.html (template string sem backticks)
- ✓ Restaurado arquivo index.html para estrutura React correta
- ✓ Aplicados controles CSS rigorosos para eliminar scroll e duplicação de páginas
- ✓ Sistema de login corrigido com redirecionamento automático
- ✓ Seção "Conectar-se" movida para sidebar esquerda
- ✓ Upload de mídia implementado (fotos: máx 5, vídeo: máx 1)
- ✓ Pré-visualização de mídia no formulário de posts
- ✓ Exibição de fotos e vídeos nos posts do feed
- ✓ Backend multer configurado para upload de arquivos
- ✓ Expansão de fotos/vídeos com modal clicável
- ✓ Botão de download para mídia
- ✓ Sistema de "Amém" (likes) funcional
- ✓ Sistema de comentários com interface completa
- ✓ Sistema de compartilhamento de posts
- ✓ Navegação entre múltiplas imagens no modal
- ✓ Contador em tempo real de interações (likes, comentários, shares)
- ✓ Novas tabelas: post_likes, post_comments, post_shares
- ✓ Seção de comentários habilitada por padrão no feed
- ✓ Sistema de comentários completo no feed (máximo 1 comentário visível)
- ✓ Link "Ver mais comentários" que abre modal com todos os comentários
- ✓ Tooltip nos contadores mostrando usuários que comentaram
- ✓ Sincronização de comentários entre feed e modal
- ✓ Formatação de data/hora em português brasileiro
- ✓ Sistema de resposta a comentários implementado (nested replies)
- ✓ Adicionado campo parentCommentId na tabela postComments
- ✓ Backend atualizado para suportar comentários hierárquicos
- ✓ Frontend exibe respostas indentadas abaixo dos comentários originais
- ✓ Nomes de usuários clicáveis que direcionam para perfis
- ✓ Sistema de respostas funcionando em todos os modais (feed, comentários, fotos)
- ✓ Corrigido problema de conexão com banco de dados (DATABASE_URL)
- ✓ Atualizado logo do OrLev em todas as páginas (login, registro, home)
- ✓ Configurado servidor para servir arquivos attached_assets em desenvolvimento
- ✓ Removida barra branca por trás do logo nas páginas de login e registro
- ✓ Aumentado tamanho da palavra "OrLev" em 100% (de text-4xl para text-8xl)
- ✓ Corrigida caixa de edição de comentários para ter mesmo tamanho e layout da caixa inicial
- ✓ Adicionado atalho Enter para salvar comentário editado
- ✓ Ajustada caixa de edição para ter exato mesmo layout da caixa de comentário normal
- ✓ Botões "Salvar" e "Cancelar" organizados ao lado direito igual caixa original
- ✓ Aumentada área horizontal da caixa de edição (w-full + flex-1 na textarea)
- ✓ Botões "Salvar" e "Cancelar" movidos para baixo da caixa e reduzidos em tamanho
- ✓ Caixa de edição expandida para largura total (w-full) com altura maior (min-h-[3rem])
- ✓ Restaurado padrão anterior dos botões de interação (sem ícones, apenas texto)
- ✓ Contadores só aparecem quando há interações (Amém, Comentários, Compartilhamentos)
- ✓ Botão "Amém" mantém emoji de coração ❤️ do lado esquerdo
- ✓ Implementado layout com contadores acima dos botões (como primeira imagem)
- ✓ Coração do botão "Amém" sem cor, só fica colorido quando clicado
- ✓ Contadores de comentários e compartilhamentos só aparecem quando > 0
- ✓ Layout final: likes à esquerda, comentários/compartilhamentos à direita
- ✓ Adicionados emojis nos botões: 💬 (comentar à esquerda), ✈ (avião sem cor, compartilhar à esquerda)
- ✓ Aumentado espaçamento entre botões de interação (space-x-8)
- ✓ Botões "Salvar" e "Cancelar" movidos para o lado direito (justify-end)
- ✓ Sistema de edição e exclusão de posts com menu dropdown nos três pontos
- ✓ Opção "Editar" permite editar conteúdo diretamente na postagem
- ✓ Opção "Excluir" mostra diálogo de confirmação "Tem certeza que quer excluir a postagem?"
- ✓ Backend API para editar (PUT /api/posts/:id) e deletar (DELETE /api/posts/:id) posts
- ✓ Exibição do nome completo e denominação real do usuário que fez a postagem
- ✓ Nome do usuário clicável redirecionando para a página home (/)
- ✓ API para buscar dados do usuário (GET /api/users/:userId) 
- ✓ Página home funciona como perfil do usuário exibindo suas informações e posts
- ✓ Feed principal serve como página home/perfil unificada
- ✓ Removidas notificações toast do botão "Amém" (sem mais mensagem popup ao curtir)
- ✓ Implementada atualização otimística no botão "Amém" para resposta instantânea
- ✓ Coração e contagem de likes aparecem imediatamente ao clicar (sem esperar servidor)
- ✓ Removidas notificações toast para criação e edição de comentários (operações silenciosas)
- ✓ Adicionado label "Editado" ao lado direito do nome do usuário para comentários modificados
- ✓ Campo updatedAt adicionado na tabela postComments para rastrear edições
- ✓ Comparação timestamp corrigida para detectar comentários editados corretamente
- ✓ Label "Editado" aplicado consistentemente em todas as seções de comentários
- ✓ Adicionado label "Editado" ao lado do nome do autor quando posts são editados
- ✓ Opções de editar/excluir posts agora só aparecem para o próprio autor da postagem
- ✓ Removida notificação toast da edição de posts (operação silenciosa)
- ✓ Sistema de autorização implementado para proteger edição/exclusão de posts
- ✓ Removida notificação toast indesejada do botão "Responder" em comentários
- ✓ Corrigido problema de duplicação da página de login removendo rotas redundantes
- ✓ Ajustado sistema de roteamento para exibir apenas uma página de login
- ✓ Sistema de foto de perfil implementado com dropdown "Ver" e "Upload"
- ✓ Upload de foto de perfil limitado a imagens (máx 8MB) via API /api/upload/profile
- ✓ Foto de perfil exibida como círculo pequeno com bordas arredondadas
- ✓ Modal "Ver" para visualizar foto de perfil em tamanho completo
- ✓ Validação de arquivos no frontend e backend para aceitar apenas imagens
- ✓ Tamanho da foto de perfil aumentado em 60% total (agora 32x32px)
- ✓ Modal "Ver" otimizado para mostrar imagem original em alta resolução
- ✓ Foto de perfil aparece imediatamente após upload em todas as seções
- ✓ Adicionado botão "Mensagem" no perfil do usuário abaixo da denominação
- ✓ Interface preparada para sistema de mensagens privadas entre usuários
- ✓ Corrigido problema de duplicação da página home removendo CSS conflitante
- ✓ Limite de upload de foto de perfil aumentado para 8MB

## User Registration Fields
- Nome Completo
- E-mail
- Data de Nascimento  
- Senha e Confirmação
- Cidade e Estado (usando BD existente)
- Denominação Cristã (41 opções em ordem alfabética)

## User Preferences
- Language: Portuguese (Brazilian)
- Theme: Christian social network focused
- Design: Clean, modern with teal color scheme
- Logo: OrLev with custom Morn Demibold font

## Denominações Cristãs (Alphabetical Order)
1. Adventista do Sétimo Dia
2. Anglicana / Episcopal
3. Assembleia de Deus
4. Batista
5. Comunidade Apostólica
6. Comunidade Cristã
7. Exército da Salvação
8. Igreja Católica Apostólica Brasileira
9. Igreja Católica Apostólica Romana
10. Igreja Católica Ortodoxa
11. Igreja Celular
12. Igreja Cristã Maranata
13. Igreja de Cristo
14. Igreja de Jesus Cristo dos Santos dos Últimos Dias (Mórmon)
15. Igreja do Evangelho Pleno
16. Igreja Local / Independente
17. Igreja Luterana
18. Igreja Metodista
19. Igreja Mundial
20. Igreja Ortodoxa Copta
21. Igreja Ortodoxa Grega
22. Igreja Ortodoxa Russa
23. Igreja Presbiteriana
24. Igreja Quadrangular
25. Igreja Renascer
26. Igreja Sara Nossa Terra
27. Igreja Universal
28. Igreja Videira
29. Movimento de Renovação
30. Neopentecostal
31. Não pertenço a uma denominação
32. Outra evangélica
33. Outra Ortodoxa
34. Pentecostal Tradicional
35. Renovação Carismática Católica
36. Testemunha de Jeová

## Technologies
- React 18 with TypeScript
- Express.js backend
- PostgreSQL with Drizzle ORM
- Tailwind CSS for styling
- Wouter for routing
- React Hook Form for forms
- TanStack Query for data fetching