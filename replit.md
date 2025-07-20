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
- ✓ Sistema completo de mensagens privadas implementado
- ✓ Tabelas conversations e messages criadas no banco de dados
- ✓ APIs backend para criar conversas, buscar mensagens e enviar mensagens
- ✓ Componente ChatPopup criado com interface moderna
- ✓ Chat aparece no canto inferior direito sem escurecer a página
- ✓ Sistema de polling automático para sincronização de mensagens em tempo real
- ✓ Interface responsiva com avatar, histórico de mensagens e campo de input
- ✓ Corrigido problema de duplicação da página removendo conflitos CSS de height
- ✓ Layout principal otimizado sem duplicação de conteúdo no scroll
- ✓ Background gradiente fixo sem causar problemas de overflow
- ✓ Chat popup com avatars do usuário em cada mensagem
- ✓ Persistência de mensagens usando localStorage para demonstração
- ✓ Auto-focus no campo de input do chat com retorno automático após Enter
- ✓ Experiência de digitação contínua no chat sem necessidade de cliques
- ✓ Sistema completo de chat reformulado (19/01/2025)
- ✓ Fotos de perfil corretas: usuário atual vs usuário de destino no chat
- ✓ Mensagens ordenadas corretamente (usuário atual à direita, outros à esquerda)
- ✓ Persistência real das mensagens na base de dados (sem localStorage temporário)
- ✓ Botão de envio de imagens no chat com preview e validação
- ✓ Botão lixeira para excluir todas as mensagens da conversa
- ✓ Histórico permanente de mensagens (só apaga com botão de lixeira)
- ✓ Suporte completo para envio e exibição de imagens no chat
- ✓ Campo imageUrl adicionado na tabela messages
- ✓ APIs backend para upload de imagem do chat e exclusão de conversa
- ✓ Interface melhorada com diálogo de confirmação para exclusão
- ✓ Sistema de autenticação integrado para exibir dados corretos do usuário
- ✓ Chat popup funcional testado com persistência real no banco de dados
- ✓ Configuração multer corrigida para aceitar uploads de imagem do chat
- ✓ Usuários demo criados para testes (Maria Silva, João Santos, Ana Costa)
- ✓ Botão "Mensagem" restaurado no perfil com funcionalidade de teste
- ✓ Botões de chat emoji 💬 adicionados na seção "Conectar-se"
- ✓ Sistema completo validado e funcionando perfeitamente
- ✓ Corrigido posicionamento das fotos: usuário atual à direita, destinatário à esquerda
- ✓ Melhorada cor das mensagens recebidas (cinza claro como comentários)
- ✓ Cabeçalho do chat mostra dados corretos do usuário alvo
- ✓ API /api/users/:userId integrada para buscar dados reais dos usuários
- ✓ Corrigido posicionamento das notificações toast para centro-inferior da tela
- ✓ Removido posicionamento canto inferior direito das mensagens de sucesso
- ✓ Toast de "Login realizado com sucesso!" agora aparece centralizado na parte inferior
- ✓ Corrigido posicionamento da caixa de resposta em sub comentários
- ✓ Caixa de texto "Responder" agora aparece diretamente abaixo do botão "Responder"
- ✓ Aplicado em PostInteractions, CommentsModal e MediaExpansionModal
- ✓ Implementado scroll limitado para sub comentários (máximo 3 visíveis por padrão)
- ✓ Sub comentários com mais de 3 respostas agora têm área de scroll com borda visual
- ✓ Altura máxima de 320px (max-h-80) com scroll vertical para sub comentários extensos
- ✓ Padronizada interface de resposta em sub comentários para igualar comentário principal
- ✓ Botão de envio agora aparece ao lado da caixa de texto (ícone Send)
- ✓ Atalho Enter para enviar resposta em sub comentários implementado
- ✓ Corrigido bug de respostas a sub comentários não sendo salvas
- ✓ Função handleNestedReply agora usa parentCommentId correto (comentário original)
- ✓ Respostas aos sub comentários agora aparecem corretamente no feed
- ✓ Sistema de @ menções removido conforme solicitação do usuário
- ✓ Caixas de resposta agora têm placeholder simples "Escreva uma resposta..."
- ✓ Valores iniciais vazios sem @ menções automáticas
- ✓ Auto-focus mantido funcionando para todas as caixas de resposta
- ✓ Contador de comentários agora é clicável e abre o modal de comentários
- ✓ Mesmo comportamento do link "Ver mais comentários" aplicado ao contador
- ✓ Hover effect adicionado ao contador para indicar interatividade
- ✓ Modal de comentários ajustado para scroll completo incluindo imagem
- ✓ Cabeçalho do modal fixo (sticky) para sempre mostrar título
- ✓ Imagem agora faz parte da área de scroll junto com comentários
- ✓ Sistema completo de edição e exclusão de comentários implementado
- ✓ Botões "Editar" e "Excluir" só aparecem para o autor do comentário
- ✓ Ordem dos botões: Amém, Responder, Editar, Excluir
- ✓ Edição inline com textarea e botões Salvar/Cancelar
- ✓ Label "Editado" aparece em comentários modificados
- ✓ Funcionalidade aplicada para comentários principais e respostas
- ✓ Botão "Editar" sem ícone (apenas texto limpo)
- ✓ Operações de edição silenciosas (sem toast de sucesso)
- ✓ Sistema de autorização protege edição/exclusão de comentários
- ✓ Fotos de perfil implementadas em todos os componentes de comentários
- ✓ Feed principal exibe foto de perfil do autor de cada postagem
- ✓ Modal de comentários mostra foto do autor no cabeçalho
- ✓ Comentários e respostas exibem fotos de perfil dos autores
- ✓ Sistema com fallback para ícone quando não há foto configurada
- ✓ Sistema completo de curtidas "Amém" implementado para comentários
- ✓ Botão "Amém" exibe emoji ❤️, texto e contador de curtidas
- ✓ Texto "Amém" fica vermelho quando comentário está curtido
- ✓ Contador só aparece quando há curtidas (> 0)
- ✓ Sistema aplicado em todos os modais (Feed, Comentários, Mídia)
- ✓ Funciona para comentários principais e sub-comentários (respostas)
- ✓ Contador de curtidas de comentários implementado no canto direito das linhas
- ✓ Mesmo emoji de coração (❤️) usado em contadores principais e de comentários
- ✓ Layout consistente entre botão "Amém" (esquerda) e contador (direita)
- ✓ Contagem posicionada à esquerda do emoji nos contadores de comentários (formato: "1 ❤️")
- ✓ Corrigido erro de conexão PostgreSQL durante cadastro de usuários (19/01/2025)
- ✓ Implementada configuração robusta de conexão com retry automático
- ✓ Otimizadas configurações para banco Neon com SSL e pool de conexões
- ✓ Melhorado tratamento de erros com mensagens específicas para usuário
- ✓ Sistema de cadastro testado e funcionando perfeitamente
- ✓ Corrigido problema de sincronização entre feed e modal de comentários (19/01/2025)
- ✓ Padronizadas todas as chaves de consulta do React Query entre componentes
- ✓ CommentsModal, PostInteractions e MediaExpansionModal agora sincronizados
- ✓ Redesenhado layout do botão "Amém" nos comentários conforme design solicitado
- ✓ Coração ícone Heart (Lucide) sem cor quando não curtido, vermelho quando curtido
- ✓ Contagem de curtidas separada e posicionada à direita do botão (não ao lado da palavra)
- ✓ Sistema de curtidas de comentários funcionando em todos os modais
- ✓ Corrigido problema de conexão com banco de dados (DATABASE_URL) (19/01/2025)
- ✓ Schema do banco aplicado corretamente com npm run db:push
- ✓ Aplicação funcionando perfeitamente em desenvolvimento
- ✓ Sistema de "Amém" dos sub comentários refinado para comportamento correto
- ✓ Palavra "Amém" só fica vermelha quando clicada (userLiked: true)
- ✓ Contador "número + ❤️" só aparece quando há curtidas (> 0)
- ✓ Fotos de perfil implementadas em todos os comentários e sub comentários (19/01/2025)
- ✓ Círculos dos comentários mostram foto real do autor do comentário
- ✓ Sistema de "Amém" dos sub comentários funcionando perfeitamente
- ✓ Debug realizado e funcionamento confirmado via logs do servidor
- ✓ Foto de perfil adicionada no círculo do formulário de criação de posts (19/01/2025)
- ✓ Círculo agora mostra foto real do usuário logado ou ícone User como fallback
- ✓ Corrigido erro de inicialização da aplicação por falta de DATABASE_URL (19/01/2025)
- ✓ Database PostgreSQL provisionado e variáveis de ambiente configuradas corretamente
- ✓ Schema do banco aplicado com sucesso via npm run db:push
- ✓ Estados e municípios brasileiros populados automaticamente na inicialização
- ✓ Aplicação funcionando perfeitamente em desenvolvimento na porta 5000
- ✓ Sistema de comentários reduzido para exatamente 2 níveis hierárquicos (20/01/2025)
- ✓ Estrutura final simplificada: Comentário principal (1) → Sub-comentário (2) 
- ✓ Respostas aos sub-comentários aparecem no mesmo nível 2 (não criam 3º nível)
- ✓ Botão "Responder" mantido em todos os níveis para máxima interação
- ✓ Respostas ao nível 2 usam comentário principal como pai (permanecem no nível 2)
- ✓ Sistema limitado a exatamente 2 níveis: principal→sub (final)
- ✓ Lógica otimizada: respostas a nível 2 aparecem no mesmo nível como Instagram
- ✓ Algoritmo de backend otimizado para coletar e achatar respostas de nível 3+ para nível 2
- ✓ Sistema frontend simplificado removendo complexidade de nível 3
- ✓ Interface mais limpa com apenas 2 níveis de indentação visual
- ✓ Estrutura final implementada em CommentsModal, MediaExpansionModal e PostInteractionsostInteractions
- ✓ Modal de imagens ajustado para exibir fotos em tamanho real sem redimensionamento (19/01/2025)
- ✓ Container da imagem ocupa 100% da altura da tela (topo ao fundo)
- ✓ Adicionado scroll automático para imagens maiores que a área visível
- ✓ Controles de navegação e download mantidos funcionais em overlay fixo
- ✓ Imagem ajustada para se adaptar ao tamanho da tela mantendo proporções (object-contain)
- ✓ Foto centralizada e exibida completa sem cortes dentro do container
- ✓ Imagens altas ajustadas automaticamente à altura da tela (h-full) para visualização completa
- ✓ Configuração final: maxHeight 100vh para visualização otimizada em todas as telas
- ✓ Sistema de comentários com 3 níveis exatos como Facebook (20/01/2025)
- ✓ Restaurados botões "Responder" em sub-comentários e sub-sub comentários
- ✓ Lógica frontend: resposta a sub-sub comentário usa reply.id como parent (mesmo nível)
- ✓ Backend simplificado para permitir hierarquia natural sem limitações artificiais
- ✓ Estrutura final: Comentário → Sub comentário → [Sub-sub comentários no mesmo nível]
- ✓ Sistema permite respostas infinitas no 3º nível mantendo estrutura plana
- ✓ Formulários de resposta adicionados para sub-sub comentários com IDs corretos imagens otimizadas
- ✓ Sistema de paginação de sub comentários implementado (20/01/2025)
- ✓ Removido scroll dos sub comentários em favor da paginação de 10 em 10
- ✓ Botão "Ver mais respostas" aparece quando há mais de 10 sub comentários
- ✓ Cada clique carrega mais 10 sub comentários até mostrar todos
- ✓ Funcionalidade aplicada em CommentsModal, MediaExpansionModal e PostInteractions
- ✓ Estado visibleRepliesCount controla quantos sub comentários são visíveis por comentário
- ✓ Sistema melhora performance e UX para posts com muitos sub comentários
- ✓ Sub comentários aninhados até nível 2 implementados no MediaExpansionModal (20/01/2025)
- ✓ Respostas aos sub comentários aparecem indentadas criando hierarquia visual
- ✓ Terceiro nível com avatares menores (5x5) e indentação ml-8
- ✓ Limitado a 2 níveis para manter interface limpa e usável
- ✓ Funcionalidades de editar/excluir mantidas para sub comentários aninhados
- ✓ Sistema de sub comentários expandido para 4 níveis hierárquicos (20/01/2025)
- ✓ Espaçamento progressivamente menor: ml-8, ml-6, ml-4, ml-2 para cada nível
- ✓ Avatares progressivamente menores: 5x5, 4x4, 3x3, 2x2 pixels por nível
- ✓ Função renderNestedReplies recursiva implementada para hierarquia visual
- ✓ Botão "Responder" desabilitado no 4º nível para evitar confusão visual
- ✓ Sistema completo de auto-focus e validação em todos os níveis
- ✓ Corrigida hierarquia real de comentários (20/01/2025)
- ✓ Respostas aos sub comentários agora criam verdadeiros níveis hierárquicos
- ✓ Cada resposta usa o ID do comentário pai correto para estrutura aninhada
- ✓ Sistema recursivo atualizado para funcionar com hierarquia real
- ✓ Teste funcional: respostas aparecem abaixo do comentário específico
- ✓ Sistema simplificado para 2 níveis máximos como Facebook (20/01/2025)
- ✓ Hierarquia visual: Comentário → Sub comentário → Sub-sub comentário (final)
- ✓ Espaçamento fixo: ml-11 para sub comentários, ml-8 para sub-sub
- ✓ Avatares: 6x6 para sub, 5x5 para sub-sub, 4x4 para sub-sub-sub
- ✓ Botão "Responder" removido do nível final para evitar confusão
- ✓ Texto progressivamente menor: sm, sm, xs para hierarquia visual
- ✓ Expandido para 3 níveis hierárquicos conforme solicitação (20/01/2025)
- ✓ Hierarquia visual: Comentário → Sub → Sub-sub → Sub-sub-sub (final)
- ✓ Espaçamento: ml-11 (sub), ml-8 (sub-sub), ml-6 (sub-sub-sub)
- ✓ Avatares decrescentes: 5x5 → 4x4 → 3x3 pixels
- ✓ Botão "Responder" removido apenas do 3º nível final
- ✓ Sistema completo de edição/exclusão em todos os 3 níveis
- ✓ Sistema simplificado para 2 níveis máximos como Facebook (20/01/2025)
- ✓ Hierarquia visual: Comentário → Sub comentário → Sub-sub comentário (final)
- ✓ Espaçamento fixo: ml-11 para sub comentários, ml-8 para sub-sub
- ✓ Avatares: 5x5 para sub, 4x4 para sub-sub comentários
- ✓ Botão "Responder" removido do nível final para evitar confusão
- ✓ Texto progressivamente menor: sm, xs para hierarquia visual
- ✓ Corrigida hierarquia real de comentários (20/01/2025)
- ✓ Respostas aos sub comentários agora criam verdadeiros níveis hierárquicos
- ✓ Cada resposta usa o ID do comentário pai correto para estrutura aninhada
- ✓ Sistema recursivo atualizado para funcionar com hierarquia real
- ✓ Teste funcional: respostas aparecem abaixo do comentário específicoxWidth 100% com object-contain para forçar ajuste completo
- ✓ Container com h-screen explícito para garantir altura total da tela
- ✓ Qualidade original mantida para downloads independente do redimensionamento de exibição
- ✓ Modal de comentários ajustado para scroll completo incluindo imagem (20/01/2025)
- ✓ Cabeçalho do modal fixo (sticky) para sempre mostrar título  
- ✓ Imagem agora faz parte da área de scroll junto com comentários
- ✓ Removida barra branca inferior que escondía comentários
- ✓ Scroll unificado da postagem completa (cabeçalho + botões + comentários)
- ✓ Layout similar ao modal de comentários principal
- ✓ Cronologia de comentários invertida: mais recentes no topo (20/01/2025)
- ✓ Ordenação DESC aplicada no backend (storage.ts)
- ✓ Caixa de sub comentário desaparece automaticamente após envio
- ✓ Reset de estado showReplyFor e replyTexts após comentar
- ✓ Auto-focus no cursor da caixa de texto ao clicar "Responder" nos sub comentários
- ✓ Auto-focus no cursor da caixa de texto ao clicar "Responder" nos comentários principais
- ✓ Sistema unificado de auto-focus para todos os tipos de resposta
- ✓ Removidas @ menções automáticas das caixas de resposta (20/01/2025)
- ✓ Placeholder alterado para "Escreva uma resposta..." em todas as caixas
- ✓ Valores iniciais das caixas de resposta agora são vazios
- ✓ Correção final: removidas todas @ menções restantes do CommentsModal.tsx (20/01/2025)
- ✓ Correção completa: removidas @ menções do PostInteractions.tsx (20/01/2025)
- ✓ Sistema de resposta agora é limpo em todos os componentes sem menções automáticas
- ✓ Todas as caixas de resposta em todo o site agora usam placeholder "Escreva uma resposta..."
- ✓ Auto-focus implementado: cursor vai automaticamente para a caixa de texto ao clicar "Responder" (20/01/2025)
- ✓ Auto-focus funciona para comentários principais, sub-comentários e respostas aninhadas
- ✓ Implementado em CommentsModal.tsx e PostInteractions.tsx com useRef e useEffect

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