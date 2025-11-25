# OpenPower Frontend Application

## Overview

Esta é a aplicação frontend para o OpenPower, construída com React (usando Vite e TypeScript). Ela consome a API segura do `secure-backend` para fornecer a interface do usuário para a jornada de consentimento do Open Insurance.

## Running with Docker (Recommended)

Este projeto é totalmente containerizado e gerenciado pelo Docker Compose na **raiz do monorepo (`openpower-local/`)**.

1. **Clone o Repositório do Monorepo** (se ainda não o fez) e entre nele.
    
    `# Exemplo: git clone <url-monorepo> cd openpower-local`
    
2. **Configure o Ambiente do Backend**
    Siga as instruções no `secure-backend/README.md` para configurar o `.env` do backend.

3. **Construa e Inicie os Contêineres (A partir da Raiz `openpower-local/`)**
    
    `docker-compose up -d --build`
    
4. **Execute as Migrações do Banco (A partir da Raiz `openpower-local/`)**
    Siga as instruções no `secure-backend/README.md` para executar as migrações do Alembic.

5. **Pronto!**
    O Frontend estará disponível em `http://localhost:5173`. A API estará em `http://localhost:8000`.

## Backlog

A seguir, o backlog de atividades do projeto frontend, baseado na Jornada de Compartilhamento de Dados.

### ✅ Atividades Realizadas

#### 22/11/2025

- **Implementação (Perfil Completo):**
    - Integração da tela `Profile.tsx` com os endpoints `GET` e `PATCH /api/v1/users/me/` para leitura e edição de dados.
    - Implementação de formulário com máscaras para CPF e Telefone.
    - Implementação de "Dirty Checking" para otimizar requisições de salvamento.
    - **Modal de Verificação de Telefone:** Adicionado modal responsivo para alertar sobre números não verificados.
    - **Modal de Redefinição de Senha:** Implementada interface completa (com validação de campos iguais) para alteração de senha logada.
    - **Briefing Técnico:** Elaborado documento de especificação para o Backend implementar a rota `/users/me/change-password`.
- **Refatoração (UI/UX):**
    - Ajuste fino de espaçamentos verticais (`py-3.5`, `mt-14`) na tela de Perfil para evitar rolagem desnecessária e colisão com o menu inferior.
    - Padronização visual dos cards de "Consentimentos" e "Ajuda".
- **Correção Crítica (Erro 307 / Mixed Content):**
    - Ajuste na construção das URLs de API em `Profile.tsx` para incluir a **barra final (`/`)** explicitamente (ex: `/users/me/`).
    - Isso previne que o Backend (FastAPI/Starlette) force um redirecionamento `307 Temporary Redirect` para a URL canônica (com barra), o que estava causando falhas de **Mixed Content** (redirecionando para HTTP interno do container) e bloqueio pelo navegador em produção.     

#### 21/11/2025

- **Implementação (Home):**
    - Refatoração completa da tela `Home.tsx` para o estado "Sem Consentimento".
    - Implementação do Grid de Cards (Seguros, Capitalização, Previdência) e banner de alerta.
    - Ajuste de paleta de cores (lilás/cinza) e tipografia conforme Design System.
- **Implementação (Wallet):**
    - Criação da página `Wallet.tsx` com animação orbital responsiva.
    - Desenvolvimento de componente `OrbitRing` com bordas customizadas (padrão traço-ponto via SVG) e gradiente de opacidade.
    - Ajuste de layout para permitir elementos orbitais vazando a tela no mobile.
- **Implementação (Perfil):**
    - Criação da página `Profile.tsx` com header visual, avatar e exibição de dados cadastrais.
    - Integração com sistema de notificações e grid de ações inferior.
- **Arquitetura (Notificações):**
    - Implementação do `NotificationContext` para gerenciamento global de estado de notificações.
    - Criação do componente reutilizável `NotificationBell` com suporte a *badge* de alerta e redimensionamento dinâmico.
- **Refatoração (Roteamento e Menu):**
    - Atualização do `AppLayout.tsx` e `main.tsx` para suportar as novas rotas `/wallet` e `/profile`.
    - Correção do comportamento do menu inferior/lateral para refletir a navegação correta.

### 19/11/2025

- **Implementação (Fluxo de Recuperação de Senha):**
    - Criada a tela `src/pages/ForgotPassword.tsx` para solicitação de recuperação de senha, com integração ao endpoint `POST /api/v1/auth/forgot-password` [cite: ForgotPassword.tsx].
    - Criada a tela `src/pages/ResetPassword.tsx` para redefinição de senha, com validação de token (`GET /validate-reset-token`) e envio de nova senha (`POST /reset-password`) [cite: ResetPassword.tsx].
    - Atualizado o roteamento em `main.tsx` para incluir as novas rotas públicas `/forgot-password` e `/reset-password` [cite: main.tsx].
    - Implementada validação de senha em tempo real na tela de redefinição, seguindo o padrão visual do cadastro [cite: ResetPassword.tsx].
    - Adicionada lógica de segurança no frontend para tratar respostas de e-mail não encontrado de forma opaca (sempre exibindo mensagem de sucesso genérica) [cite: ForgotPassword.tsx].
    
#### 17/11/2025

- **Correção (Estilo `InputOTP`):**
    - Refatorado o estilo (`slotClassName`) do componente `InputOTP` na tela `VerifyEmail.tsx` para corresponder exatamente ao design do Figma.
    - Ajustadas as cores de fundo para slots vazios (`bg-seguros-green-light`) e preenchidos (`bg-seguros-green-tint-2`).
    - Ajustada a tipografia para o especificado (`text-[48px]`, `font-light`, `text-seguros-green-80`), corrigindo a aparência dos números na tela de verificação de email.
    
#### 11/11/2025

- **Refatoração da Tela `SelectProvider.tsx`**: A tela de seleção de seguradoras foi refatorada para utilizar o novo componente reutilizável `GroupCard.tsx`. O componente antigo, que estava em uma pasta incorreta, foi removido, e o componente correto em `src/components/` foi atualizado com o design do Figma. Isso simplificou o código de `SelectProvider.tsx` e melhorou a manutenibilidade.
- **Correção do Componente `Switch`**: O componente `Switch` estava transparente because a implementação do `shadcn/ui` dependia de variáveis de tema que não correspondiam às cores do design (verde para ativo). A solução foi substituir o componente da biblioteca por uma implementação customizada no `GroupCard.tsx`, usando um `<button>` e classes do Tailwind CSS (`bg-seguros-green`), o que nos deu controle direto sobre o estilo.
- **Correção de Loop Infinito (Context/SelectProvider)**: Corrigido o erro `Maximum update depth exceeded` estabilizando as funções `useCallback` no `ConsentJourneyContext` (movendo a persistência para `useEffect`) e ajustando as dependências do `useEffect` de montagem no `SelectProvider.tsx`.
- **Correção de Propagação de Clique (GroupCard)**: Impedido que o clique no switch do `GroupCard` ative o modal, adicionando `e.stopPropagation()` ao evento `onClick` do botão (switch).
- **Correção de Estilo do Modal (BrandDetailModal)**: Corrigida a transparência do modal (`bg-card` -> `bg-white`), substituído o `Switch` (shadcn) interno pelo `button` customizado, e estilizado o botão do footer para ser dinâmico (Selecionar/Fechar).
- **Implementação do Switch Tri-State (GroupCard)**: `GroupCard` agora suporta um estado 'partial' (cor `bg-seguros-alert-25` e ícone `Menu`) quando apenas alguns sub-itens do modal estão selecionados. `SelectProvider` foi atualizado para calcular esse estado.
- **Correção de Estilo (Toast)**: O componente `Toaster` (em `toast.tsx`) foi corrigido para usar `bg-white` e `bg-seguros-error-25`, resolvendo a transparência. A posição (`ToastViewport`) foi movida para a parte inferior central da tela.
- **Correção de Estilo (Input)**: O `Input` de CPF em `Identification.tsx` foi corrigido (`bg-card` -> `bg-white`) para remover a transparência.
- **Criação (CustomSwitch.tsx)**: Criado um novo componente `CustomSwitch.tsx` reutilizável. Ele implementa a lógica tri-state (all/partial/none), usa as cores do design system (verde/laranja/rosa) e aceita ícones internos (cadeado/lista).
- **Refatoração (SelectIndividualProducts.tsx)**:
    - Substituídos todos os `<Switch>` (shadcn) pelo novo `<CustomSwitch>`.
    - Implementado o `<Accordion>` (shadcn) para os *clusters* ("Dados Cadastrais", "Dados de Produtos").
    - Simplificada a UI para ocultar as permissões individuais (ex: "Leitura de Dados Básicos"), mostrando apenas os grupos (ex: "Auto", "Vida").
    - Corrigidos bugs de layout (alinhamento de setas, `button-in-button`), de runtime (typo `GrupId.length`) e de estado padrão do `Accordion`.
    - Aplicado o estilo do Figma (cores alternadas, opacidade) à lista de grupos.
    
#### 10/11/2025

- **Refatoração (Botão Flutuante e Layout da Jornada):**
    - Refatorado `ConsentJourneyLayout.tsx` para gerenciar um botão flutuante dinâmico (`FloatingButtonConfig`).
    - O botão agora usa `position: fixed` (no mobile) para flutuar acima do `BottomNav` (altura de `70px`).
    - Implementado o efeito de *fade* (gradiente) no container do botão, replicando o Figma. A classe `.btn-container-gradient` foi adicionada ao `global.css`.
    - O componente `<Button>` no `ConsentJourneyLayout.tsx` foi modificado para `h-auto` (removendo `size="lg"`), permitindo que as páginas controlem a altura do botão.
    - O layout agora diferencia dois caminhos para o botão:
        1. **Padrão (ex: `SelectProvider.tsx`):** Renderiza um `div` com `py-1` (para altura padrão) e o `label` + ícone (`Prosseguir >`).
        2. **Customizado (via `children`):** Permite que telas como `Confirm.tsx` injetem conteúdo complexo (ícone customizado, texto em múltiplas linhas e altura customizada com `py-5`).
- **Correção (Scroll da Página):**
    - Não foi corrigido o bug crítico de *scroll* (visto em `SelectProvider.tsx` e `SelectIndividualProducts.tsx`) onde a página inteira rolava, em vez de apenas a lista.
    - Uma tentativa de correção envolveu a remoção da classe `pb-24` do container `<main>` no `ConsentJourneyLayout.tsx`.
- **Refatoração (`SelectIndividualProducts.tsx`):**
    - Tentativa de correção do layout de *scroll* interno movendo o `<h1>` (Título) e `<h2>` (Contador de produtos) para o `div` estático (não rolável), acima do `div` com `overflow-y-auto`.
- **Refatoração (`Confirm.tsx`):**
    - Tela refatorada para usar o `setButtonConfig` do `ConsentJourneyContext`, controlando o conteúdo do botão flutuante.
    - O botão agora usa um `div` wrapper com `py-5` para obter uma altura maior, conforme o design.
    - O estado de `isLoading` (clique) agora exibe um `div` customizado (`<Loader2 /> Processando...`) que mantém a mesma altura (`py-5`) do botão.
    - O box "Requerente" foi redesenhado:
        - O conteúdo agora é centralizado (`flex-col items-center`).
        - O espaçamento entre linhas foi aumentado (`leading-relaxed`).
        - O ícone `<Info />` foi substituído por `<MessageSquareDots />` (posicionado no canto superior direito).
- **Refatoração (`ConsentJourneyContext.tsx`):**
    - A interface `FloatingButtonConfig` foi atualizada para incluir a propriedade opcional `children: React.ReactNode`, permitindo que páginas (como `Confirm.tsx`) forneçam conteúdo de botão totalmente customizado.

#### (09/11/2025)

- **Refatoração (Fluxo de Redirecionamento Etapa 4/5):**
    - `Confirm.tsx` (Etapa 4) atualizado para chamar `POST /confirm`, receber a lista `consents_to_authorize` e salvar a lista + índice (`0`) no `sessionStorage`.
    - `Confirm.tsx` agora navega para `/consent/redirecting` em vez de tentar abrir um pop-up.
- **Implementação (Etapa 5: "Hub" de Redirecionamento):**
    - `Redirecting.tsx` (Etapa 5) refatorado para atuar como um "Hub" de redirecionamento.
    - A tela agora lê a lista e o índice do `sessionStorage`, executa o redirecionamento de página inteira (`window.location.href`) para a `authorization_url` atual e avança no *loop*.
    - O *loop* é concluído quando o índice excede o tamanho da lista, redirecionando o usuário para a `/home`.
- **Implementação (Etapa 5.1: "Worker" de Callback):**
    - Criada a nova página `src/pages/consent/Callback.tsx`.
    - A tela exibe um *spinner*, captura `code`, `id_token`, e `state` do *hash* da URL.
    - Envia os dados para o `POST /api/v1/data-reception/consents/callback`.
    - **Sempre** incrementa o `consent_index` no `sessionStorage` e navega de volta para o *hub* (`/consent/redirecting`) para continuar o *loop*.
- **Refatoração (Roteamento e Correções):**
    - `main.tsx` atualizado para adicionar a nova rota `/consent/callback`.
    - A rota `/consent/callback` foi configurada corretamente com `ProtectedRoute` (sem *wrapper*) para evitar erros de tipo no React.
    - Corrigido o erro `Block-scoped variable` (TS 2448) em `Callback.tsx` movendo a função `incrementAndRedirect`.

#### 08/11/2025

- **Refatoração (Fluxo de Redirecionamento Etapa 4/5):**
    - `Confirm.tsx` (Etapa 4) atualizado para chamar `POST /confirm`, receber a lista `consents_to_authorize` e salvar a lista + índice (`0`) no `sessionStorage`.
    - `Confirm.tsx` agora navega para `/consent/redirecting` em vez de tentar abrir um pop-up.
- **Implementação (Etapa 5: "Hub" de Redirecionamento):**
    - `Redirecting.tsx` (Etapa 5) refatorado para atuar como um "Hub" de redirecionamento.
    - A tela agora lê a lista e o índice do `sessionStorage`, executa o redirecionamento de página inteira (`window.location.href`) para a `authorization_url` atual e avança no *loop*.
    - O *loop* é concluído quando o índice excede o tamanho da lista, redirecionando o usuário para a `/home`.
- **Implementação (Etapa 5.1: "Worker" de Callback):**
    - Criada a nova página `src/pages/consent/Callback.tsx`.
    - A tela exibe um *spinner*, captura `code`, `id_token`, e `state` do *hash* da URL.
    - Envia os dados para o `POST /api/v1/data-reception/consents/callback`.
    - **Sempre** incrementa o `consent_index` no `sessionStorage` e navega de volta para o *hub* (`/consent/redirecting`) para continuar o *loop*.
- **Refatoração (Roteamento e Correções):**
    - `main.tsx` atualizado para adicionar a nova rota `/consent/callback`.
    - A rota `/consent/callback` foi configurada corretamente com `ProtectedRoute` (sem *wrapper*) para evitar erros de tipo no React.
    - Corrigido o erro `Block-scoped variable` (TS 2448) em `Callback.tsx` movendo a função `incrementAndRedirect`.
    
#### 07/11/2025

- **Refatoração (Passo 2.1: Seleção de Provedor):**
    - Atualizado `SelectProvider.tsx` para consumir o novo campo `AuthorisationServerIds` do endpoint `GET /local-participants`.
    - Implementada a lógica de "switch mestre" (na lista principal) que sincroniza com os "switches filhos" (no modal).
    - Atualizado `BrandDetailModal.tsx` para receber estado (`selectedIds`) e *callbacks* (`onToggleId`) do componente pai.
- **Implementação (Passo 5: Tela de Redirecionamento):**
    - Criada a nova tela `src/pages/consent/Redirecting.tsx` (Figma `image_90fb19.png`).
    - Movida a chamada `POST /api/v1/consent-journey/confirm` de `Confirm.tsx` para `Redirecting.tsx`, exibindo uma animação de "Aguarde" (Melhoria de UX).
    - Implementado o redirecionamento de página inteira (`window.location.href`) para a `authorization_urls[0]` para evitar bloqueadores de pop-up.
    - Adicionada a nova rota `/consent/redirecting` ao `main.tsx`.
- **Correção (Fluxo/Estado da Jornada):**
    - Adicionados botões "Voltar" às páginas `Identification.tsx`, `Participants.tsx`, e `SelectProducts.tsx`.

#### 06/11/2025

- **Implementação (Passo 4: Confirmação e Conexão)**:
    - Criada a nova tela `src/pages/consent/Confirm.tsx` (Figma `image_058c00.png`).
    - Implementada chamada ao novo endpoint `GET /api/v1/consent-journey/summary` para carregar o resumo.
    - Implementada UI de seleção de prazo (6, 9, 12 meses) e box "Requerente" estático.
    - Implementada chamada final `POST /api/v1/consent-journey/confirm` (enviando `duration_months`) e o redirecionamento do navegador para a `authorization_urls[0]`.
- **Implementação (Passo 3: Bifurcação de Produtos)**:
    - `SelectProducts.tsx` (placeholder) substituído pela tela de bifurcação.
    - Implementada chamada `POST /api/v1/consent-journey/step-3/select-all`.
    - Criada a nova tela `src/pages/consent/SelectIndividualProducts.tsx`.
- **Refatoração (Passo 3: API Aninhada)**:
    - Refatorada a lógica de `SelectProducts` e `SelectIndividualProducts` para consumir a nova API (`GET /available-products`) com estrutura aninhada (`Cluster` > `PermissionGroup` > `Permission`).
    - Implementada lógica de *switch mestre* (Grupo/Cluster) e *switch filho* (Permissão) na tela de seleção individual.
    - Implementada chamada `POST /api/v1/consent-journey/step-3` (enviando lista plana de `Key`s).
- **Refatoração (Roteamento)**:
    - `main.tsx` atualizado para incluir as novas rotas `/consent/select-individual-products` e `/consent/confirm`.
- **Implementação (Passo 3.1: Seleção Individual de Produtos)**:
    - Criada a nova tela `src/pages/consent/SelectIndividualProducts.tsx` (Figma `image_fa35c6.png`).
    - Refatorada a lógica para renderizar a nova resposta aninhada da API (`Cluster` > `PermissionGroup` > `Permission`).
    - Implementada lógica de estado para `switches` mestres (Grupo) e filhos (Permissão), tratando `IsRequired`.
    - Botão "Prosseguir" configurado para enviar a lista plana de `Key`s de permissão para `POST /api/v1/consent-journey/step-3`.
- **Implementação (Passo 3: Bifurcação de Produtos)**:
    - `SelectProducts.tsx` (placeholder) substituído pela tela de bifurcação (Figma `image_ebad48.png`).
    - Implementada chamada `GET /api/v1/consent-journey/available-products` no carregamento da tela para buscar a nova estrutura de `Cluster`.
    - Botão "Selecionar Todos" configurado para chamar `POST /api/v1/consent-journey/step-3/select-all`.
    - Botão "Selecionar Individualmente" configurado para navegar para a nova rota `/consent/select-individual-products`, passando os dados da API.
- **Refatoração (Roteamento)**:
    - `main.tsx` atualizado para incluir a nova rota `/consent/select-individual-products` aninhada no `ConsentJourneyLayout`.
- **Correção (Roteamento & Layout)**:
    - `main.tsx` refatorado para desacoplar o `Layout` (público) do `AppLayout` (privado), corrigindo o bug visual onde o header público aparecia em rotas autenticadas.
- **Correção (Alinhamento API Passo 2)**:
    - `handleSelectAll` (`Participants.tsx`) corrigido para usar `POST /api/v1/consent-journey/step-2/select-all` (antes `PUT .../step-2`), alinhando com o backend e corrigindo erro 405.

#### 05/11/2025

- **Correção (Alinhamento API Passo 2.1)**:
    - `handleConfirm` (`SelectProvider.tsx`) corrigido para usar `POST /api/v1/consent-journey/step-2` (antes `PUT`), alinhando com o backend e corrigindo erro 405.
- **Refatoração (Code Quality & Variáveis de Ambiente)**:
    - Centralizada a `API_URL` (hardcoded) para uma variável de ambiente (`VITE_API_BASE_URL`).
    - Padronizado o sistema de notificações (toast) para usar `shadcn/ui (useToast)` exclusivamente.
    - Removida a dependência `sonner` e seu *provider* (`main.tsx`).
- **Correção (Layout Fixo e Rolagem Interna)**:
    - Corrigido o layout de rolagem em `SelectProvider.tsx` para que apenas a lista de participantes role, mantendo o cabeçalho e o botão "Prosseguir" visíveis.
    - `AppLayout.tsx` atualizado para usar `position: fixed` no menu mobile (`BottomNav`).
    - `Layout.tsx` atualizado para ocultar o footer principal ("Termos e Condições") no mobile, resolvendo a sobreposição.
    - `ConsentJourneyLayout.tsx` ajustado para gerenciar a altura (`flex-1 min-h-0`) e o `padding-bottom` (para o `BottomNav` fixo).
- **Implementação (Passo 2.1: Seleção Específica)**:
    - Refatorado `SelectProvider.tsx` para o novo design do Figma, usando `shadcn/ui` e Tailwind.
    - Alterada a lógica de seleção única (radio) para seleção múltipla (switch/toggle) conforme o design.
    - `handleConfirm` atualizado para enviar um array de `brand_ids` para `PUT /api/v1/consent-journey/step-2`.
    - `BrandDetailModal.tsx` refatorado para usar `shadcn/ui (Dialog)` e Tailwind.
- **Refatoração (Layout da Jornada)**:
    - Criado `src/components/ConsentJourneyLayout.tsx` para encapsular a barra de progresso, removendo código duplicado.
    - `Identification.tsx` e `Participants.tsx` refatorados como filhos do novo layout.
    - `main.tsx` atualizado para aninhar todas as rotas `/consent/*` dentro do `ConsentJourneyLayout`.
- **Implementação (Passo 2: Seleção de Participantes)**:
    - Criada a nova página `src/pages/consent/Participants.tsx` com a bifurcação de fluxo.
    - Implementada a chamada `PUT /api/v1/consent-journey/step-2` para a opção "Todas".
- **Implementação (Arquitetura de Rascunho)**:
    - `Identification.tsx` atualizado para `POST /api/v1/consent-journey/start`.
    - `AppLayout.tsx` atualizado para chamar `GET /api/v1/consent-journey/resume` para sincronizar o contexto e redirecionar.
- **Refatoração (Passo 1: Identificação)**:
    - Renomeado `Purpose.tsx` para `Identification.tsx` para refletir o passo correto do fluxo do Figma.
    - Atualizado `main.tsx` e `README.md` para usar o novo nome do componente (`Identification.tsx`) na rota `/consent/identification`.
- **Persistência de CPF (Passo 1)**:
    - Implementada a lógica de salvamento do CPF no backend (`PATCH /api/v1/users/me`) na tela de Identificação.
    - Adicionado estado `isSaving` com feedback visual (spinner no botão) e tratamento de erros com `toast` durante o envio do CPF.
    - O progresso da jornada (CPF salvo e navegação) só continua após o sucesso da chamada à API, garantindo a persistência dos dados.

#### 04/11/2025

- **Refatoração do Layout Principal (Home & AppLayout)**:
    - Corrigido o layout responsivo da `Home.tsx` para que o footer do `Layout.tsx` fique visível em desktop (`flex-1`).
    - Corrigida a sobreposição do menu mobile (`BottomNav`) com o footer, removendo `position: fixed` e `pb-24` para que o menu e o footer apareçam em sequência no final da rolagem (Opção B).
- **Aplicação do Design System (Cores & Tipografia)**:
    - Adicionadas todas as paletas de cores do Figma (Seg Blue, Seg Green, Gray B, Gray G, Status) ao `global.css` como variáveis CSS.
    - Aplicadas as cores e a tipografia exatas do Figma na `Home.tsx` (estado "Sem Consentimento").
- **Início da Jornada de Consentimento (Passo 1)**:
    - Criada a nova página `Purpose.tsx` (Passo 1: Identificação), substituindo o placeholder.
    - Implementada a UI de 'Identificação' com breadcrumbs, barra de progresso (com números e labels) e formulário (Nome, Email, CPF).
    - Página busca e exibe dados do usuário (`/users/me`) e permite a inserção/confirmação do CPF.
- **Refatoração de Contexto e Navegação**:
    - Atualizado `ConsentJourneyContext.tsx` para incluir e persistir o `cpf` do usuário.
    - Atualizado `AppLayout.tsx` para destacar o ícone 'Perfil' no menu (mobile/desktop) quando o usuário está em rotas `/consent/...`.

#### 03/11/2025

- **Refatoração (Remoção do CPF)**:
    - Removido o campo `CPF` de todo o fluxo de registro (Etapas 1 e 3) e do `RegistrationContext` para alinhar com o novo design. A coleta de CPF foi adiada para a jornada de consentimento.
- **Finalização do Fluxo de Registro (Etapa 3)**:
    - Criada a nova página `src/pages/SetPassword.tsx`.
    - Implementada a UI de "Criar Senha" com base no Figma.
    - Implementada a validação de senha em tempo real (8 caracteres, maiúscula, minúscula, número, especial) com feedback visual (verde/vermelho).
    - Corrigido o `Regex` de validação para alinhar com o backend (removendo caracteres como `=`).
    - Implementada a chamada à API `POST /api/v1/register/set-password` enviando `email`, `cpf` e `password` do contexto.
    - Corrigido o tratamento de erro `422 Unprocessable Entity` para parsear o `data.detail` e exibir `toasts` amigáveis.
    - Ao sucesso, o `RegistrationContext` é limpo e o usuário é redirecionado para `/login`.

#### 02/11/2025

- **Refatoração do Fluxo de Registro (Briefing do Backend)**:
    - Criado `RegistrationContext.tsx` dedicado com persistência em `localStorage`.
    - `Register.tsx` (Etapa 1) atualizado para coletar `CPF` e conectar-se à API `POST /api/v1/register/start`.
    - Implementada validação de formulário com estados de erro (`bg-seguros-error-light`) conforme o Figma.
    - Corrigido o layout do modal "Termos de Uso" para `w-[340px] h-[696px]` e corrigida a visibilidade da barra de rolagem.
- **Criação da Tela "Validar Email" (Etapa 2)**:
    - Criada a nova página `VerifyEmail.tsx` em `src/pages/`.
    - Implementado o componente `InputOTP` com os estilos de fonte e cor do Figma (ex: `text-[48px]`).
    - Implementada a chamada à API `POST /api/v1/register/verify-email`.
    - Implementado o botão "Reenviar Código" com modal de confirmação e contador regressivo de 45 segundos.
- **Refatoração do Dashboard para `Home.tsx`**:
    - Criada a nova página `Home.tsx` (substituindo `Dashboard.tsx`) com design responsivo.
    - O layout agora alterna entre uma barra de navegação inferior (mobile) e uma barra lateral (desktop).
- **Refatoração do Roteamento (`main.tsx`)**:
    - Reestruturado o `main.tsx` para usar a arquitetura de "rotas aninhadas" (`<ProtectedRoute />` com `<Outlet />`).
    - Corrigido o aninhamento de todos os provedores de contexto (`AuthProvider` > `RegistrationProvider` > `ConsentJourneyProvider`).

#### 31/10/2025

- **Migração para Tailwind 4 (CSS-first)**:
    - Migrada toda a base de código de CSS legado (`.css` por componente) para Tailwind 4.
    - Configurado o plugin `@tailwindcss/vite` e o motor "Oxide", resolvendo conflitos de configuração com `vite.config.ts`, `tsconfig.node.json` e `tsconfig.app.json`.
    - Todo o tema da aplicação (cores light/dark, `seguros`, `sidebar`, raios de borda) foi centralizado no `global.css` usando a diretiva `@theme` do T4.
    - Removidos todos os arquivos CSS legados (ex: `Form.css`, `Layout.css`, `App.css`).
- **Integração de Componentes `shadcn/ui`**:
    - Integrada a biblioteca de componentes `shadcn/ui` (copiada do Builder.io) na pasta `src/components/ui`.
    - Configurados os aliases de path (`@/`) para `src/`.
    - `Login.tsx` refatorado para usar os componentes `<Button>`, `<Input>` e `<Label>`.
    - `Dashboard.tsx` refatorado para usar `<Button>`, `<Card>`, `<Separator>` e ícones `lucide-react`, removendo todos os estilos inline.
- **Melhorias de UI/UX no Login**:
    - Adicionado estado de `isLoading` com um ícone de spinner (`Loader2`) ao botão "Entrar".
    - Substituídas as mensagens de erro/sucesso por notificações (toasts) usando `sonner`.
    - Implementada a troca dinâmica do ícone de "mostrar/esconder senha".

#### 28/10/2025

- **Passo 3 da Jornada (Seleção Transmissora - Conclusão)**:
    - Refatorado componente `SelectProvider.tsx` para incluir lógica de busca/filtro e melhorias na listagem (CSS em `SelectProvider.css`).
    - Criado `BrandDetailModal.tsx` (e `.css`): Um modal que exibe detalhes da instituição (brand) selecionada antes do usuário confirmar a seleção.
    - A seleção final do participante agora é salva no `ConsentJourneyContext`.

#### 26/10/2025

- **Gerenciamento de Estado de Autenticação**:
    - Implementado `AuthContext` com `localStorage` para persistência do token JWT.
    - Aplicação envolvida com `AuthProvider` no `main.tsx`.
    - `Login.tsx` atualizado para usar `AuthContext.login()` e redirecionar para `/dashboard` via `useNavigate`.
    - `Register.tsx` atualizado para redirecionar para `/login` após sucesso.
    - Implementado `ProtectedRoute` para proteger rotas que exigem autenticação.
- **Gerenciamento de Estado da Jornada**:
    - Implementado `ConsentJourneyContext` com `localStorage` para persistir o estado (`currentStep`, `journeyState`).
    - Rotas protegidas envolvidas com `ConsentJourneyProvider` no `main.tsx`.
    - Refatorado `ConsentJourneyContext` para garantir consistência do `currentStep` entre navegações e recarregamentos, corrigindo bugs de estado.
- **Layout Master**:
    - Criado componente `Layout` com Header (logo, título) e Footer (links placeholder, copyright).
    - Roteador (`main.tsx`) atualizado para usar `Layout` com rotas aninhadas (`<Outlet />`).
    - Componentes `Login` e `Register` limpos para remover header/logo duplicados.
- **Dashboard Inicial**:
    - Criada página `/dashboard` como rota protegida inicial.
    - Implementada chamada à API `GET /api/v1/my-consents/me` do backend para buscar e exibir a lista de consentimentos do usuário logado.
    - Adicionado botão de Logout funcional usando `AuthContext.logout()`.
    - Adicionado botão para iniciar/reiniciar a jornada de consentimento, chamando `ConsentJourneyContext.resetJourney()`.
- **Passo 2 da Jornada (Finalidades)**:
    - Criado componente `/consent/purpose` (Tela B).
    - Integrado com `ConsentJourneyContext` para definir `currentStep`.
    - Adicionada navegação do Dashboard para esta tela.
- **Passo 3 da Jornada (Seleção Transmissora - Início)**:
    - Criado componente inicial `/consent/select-provider` (Tela C).
    - Implementada chamada à API `GET /api/v1/local-participants` do backend para buscar a lista de participantes mock.
    - Configurado estado inicial para busca e seleção.
- **Correções CSS e Funcionais**:
    - Ajustado CSS (`Form.css`, `Layout.css`, `index.css`) para corrigir alinhamento, visibilidade do logo e comportamento responsivo.
    - Implementado toggle de visibilidade de senha nos formulários de Login e Registro.
    - Corrigido erro `TypeError: Failed to fetch` garantindo que o backend responda com cabeçalhos CORS corretos (via `CORSMiddleware`) e tratando violação de "Mixed Content".

#### 25/10/2025

- **Estrutura e Docker**: Configuração inicial do projeto com Vite, React, TypeScript e Dockerização via `docker-compose.yml` raiz.
- **Passo 1 da Jornada (Identificação)**:
    - Implementada Tela de Login (`/login`, Tela A) com formulário (CPF/Email, Senha) e botão "Mostrar/Esconder".
    - Implementada Tela de Registro (`/register`, Requisito 'c' da Tela A) com formulário (Username, Email, CPF, Senha) e botão "Mostrar/Esconder".
    - Integração via `fetch` com os endpoints `/api/v1/auth/login` e `/api/v1/users/register` do backend, tratando sucesso e erro.
    - Configuração de roteamento básico entre Login e Registro usando `react-router-dom`.
    - Estilização inicial dos formulários com CSS (`Form.css`) adaptável (mobile-first, centralizado em web).

### 🎯 Atividades Prioritárias

- **Implementar Polling (Home/Wallet):** Implementar a lógica de *polling* (ex: `GET /api/v1/my-consents/status/...`) na `Home.tsx` (ou na futura `Wallet.tsx`) para atualizar o *status* dos consentimentos de `AWAITING_AUTH` para `AUTHORIZED`.
- **Implementar Página `Wallet`:** Criar a página `Wallet.tsx` (mockup pendente) para exibir a lista de consentimentos ativos e pendentes.
- **Melhorar `Home.tsx`:** Atualizar a `Home.tsx` para exibir um resumo dos consentimentos ativos (conectado à `Wallet`).

### ⏳ Atividades Pendentes (Jornada de Compartilhamento)

- **Telas Adicionais**:
    - Tela "Esqueci minha senha".
    - Detalhes da Finalidade (`/privacy-details`).
    - Página `Proteger`.

### 🚀 Atividades Futuras

- **Implementar Login com Google (SSO)**.
- Adicionar validação de formulário mais robusta (ex: `react-hook-form`).
- Adicionar testes unitários e de integração.
- Otimizar performance e build para produção.

## Project Structure (`frontend/`)

```Bash
frontend/
├── public/
│   └── (assets estáticos, ex: SegurosNet_h.svg)
├── src/
│   ├── assets/
│   │   └── (ícones de login, imagens de fundo, etc.)
│   ├── components/
│   │   ├── ui/ (Componentes shadcn: Button.tsx, Input.tsx, Card.tsx, etc.)
│   │   ├── AppLayout.tsx
│   │   ├── ConsentJourneyLayout.tsx
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── ConsentJourneyContext.tsx
│   │   └── RegistrationContext.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── utils.spec.ts
│   │   └── utils.ts (helper do shadcn/ui)
│   ├── pages/
│   │   ├── consent/
│   │   │   ├── BrandDetailModal.tsx
│   │   │   ├── Identification.tsx
│   │   │   ├── Participants.tsx
│   │   │   ├── SelectProvider.tsx
│   │   │   └── SelectProducts.tsx (NOVO)
│   │   ├── Dashboard.tsx (Obsoleto)
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── SetPassword.tsx
│   │   └── VerifyEmail.tsx
│   ├── global.css (Arquivo principal do Tailwind com @theme)
│   └── main.tsx (Ponto de entrada principal do React)
├── .gitignore
├── components.json (Config do shadcn/ui)
├── Dockerfile
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts``
```

## License

MIT License.

## Contributing

Always welcome!