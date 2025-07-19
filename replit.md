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
- ✓ Adicionados emojis nos botões: 💬 (comentar à esquerda), ⬆ (seta grossa para cima, compartilhar à esquerda)
- ✓ Aumentado espaçamento entre botões de interação (space-x-8)

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