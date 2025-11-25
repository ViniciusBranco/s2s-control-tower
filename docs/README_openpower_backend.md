# Secure Backend Application (OpenPower API)

## Overview
This project is a secure backend application designed to provide robust authentication and authorization mechanisms using JWT (JSON Web Tokens) and best practices for cryptography.It is built with a modular structure to facilitate maintainability and scalability. 

O backend evoluiu de um proxy M2M (Máquina-para-Máquina) para um sistema B2C (Business-to-Consumer) completo, com gestão de usuários, autenticação baseada em banco de dados e persistência de consentimentos, servindo como API para o OpenPower Frontend. 

## Running with Docker (Recommended)

Este projeto é totalmente containerizado e gerenciado pelo Docker Compose na **raiz do monorepo (`openpower-local/`)**. 

1. **Clone o Repositório do Monorepo** (se ainda não o fez) e entre nele. 
    ```bash
    # Exemplo: git clone <url-monorepo>
    cd openpower-local
    ```

2.  **Configure o Ambiente do Backend**
    Dentro da pasta `secure-backend/`, copie o arquivo `.env.example` para `.env`. As credenciais padrão devem funcionar localmente. 

3.  **Construa e Inicie os Contêineres (A partir da Raiz `openpower-local/`)**
    Isso iniciará o servidor FastAPI (`op-server`), o banco de dados (`op-postgres`) e o frontend (`op-frontend`). 
    ```bash
    docker-compose up -d --build
    ```

4.  **Execute as Migrações do Banco (A partir da Raiz `openpower-local/`)**
    Com os contêineres rodando, execute as migrações do Alembic dentro do contêiner do backend para criar as tabelas: 
    ```bash
    # O nome do serviço é 'backend' no docker-compose.yml raiz
    docker-compose exec backend alembic upgrade head
    ```

5.  **Pronto!**
    A API estará disponível em `http://localhost:8000` e a documentação (Swagger) em `http://localhost:8000/docs`. O Frontend estará em `http://localhost:5173`. 

## Backlog

A seguir, o backlog de atividades do projeto, organizado por status.

### ✅ Atividades Realizadas

#### 22/11/2025

- **Implementação Completa do Fluxo de Recuperação de Senha ("Esqueci minha senha")**:
    - **Novos Endpoints (`auth.py`)**:
        - `POST /api/v1/auth/forgot-password`: Gera token seguro, salva no banco e envia e-mail com link (retorna 200 OK sempre por segurança).
        - `GET /api/v1/auth/validate-reset-token`: Valida o token (existência, uso e expiração) ao carregar a tela de reset.
        - `POST /api/v1/auth/reset-password`: Efetiva a troca da senha e invalida o token.
    - **Infraestrutura**:
        - Criada tabela `password_reset_tokens` e relacionamento com `users`.
        - Criado `PasswordService` para encapsular a lógica de tokens e segurança.
        - Atualizado `EmailService` para enviar templates HTML de recuperação.
        - Adicionada configuração `FRONTEND_URL` para geração correta de links em diferentes ambientes.

- **Gestão de Perfil do Usuário (Fase 1 - Dados)**:
    - **Atualização de Modelo**: Adicionadas colunas `phone_number` e `phone_verified` à tabela `users` via migração Alembic.
    - **Endpoint de Atualização**: Implementado `PATCH /api/v1/users/me` permitindo que o usuário logado atualize seu Nome, CPF e Telefone.
    - **Schemas**: Criado `UserUpdate` com validação e sanitização de dados.

- **Funcionalidade de Alteração de Senha (Logado)**:
    - **Novo Endpoint**: Implementado `POST /api/v1/users/me/change-password`.
    - **Regras de Negócio**: Exige a senha atual para validação, verifica a força da nova senha e atualiza o hash no banco.
    - **Correção Técnica**: Implementado validador customizado no Pydantic v2 para contornar limitações de Regex com *look-arounds*.

- **Refatoração Arquitetural (SQLAlchemy/Alembic)**:
    - **Correção de Importação Circular**: Reestruturada a base do banco de dados. Criado `src/app/db/base_class.py` para definição pura da `Base`, separando-a do registro de modelos em `src/app/db/base.py`.
    - **Resolução de Conflitos de Migração**: Corrigido estado inconsistente ("Split Brain") do Alembic entre ambiente local (Windows) e VM (Linux), unificando o histórico de versões.

#### 19/11/2025

- **Implementação Completa do Fluxo de Recuperação de Senha**:
    - **Novos Endpoints (`auth.py`)**:
        - `POST /api/v1/auth/forgot-password`: Recebe e-mail, gera token seguro e envia link (retorna 200 OK sempre por segurança).
        - `GET /api/v1/auth/validate-reset-token`: Valida token na carga da página (verifica existência, uso e expiração).
        - `POST /api/v1/auth/reset-password`: Efetiva a troca da senha e invalida o token usado.
    - **Banco de Dados**:
        - Criada tabela `password_reset_tokens` para gerenciamento de estado dos tokens (expiração de 15 min).
        - Adicionado relacionamento na tabela `users`.
    - **Serviços**:
        - Implementado `PasswordService` com lógica de geração de hash seguro (`secrets`), validação de timezone (UTC) e interação com banco.
        - Atualizado `EmailService` com template HTML para "Redefinição de Senha".
    - **Configuração**: Adicionada variável `FRONTEND_URL` em `config.py` e `.env` para geração correta de links em ambientes distintos (Docker/Prod).
- **Refatoração Arquitetural (SQLAlchemy/Alembic)**:
    - Solucionado problema de **Importação Circular** entre modelos e `base.py`.
    - Criado `src/app/db/base_class.py` para definição pura da `Base`.
    - Refatorado `src/app/db/base.py` para atuar como hub central de importação de modelos para o Alembic.
    - Limpeza de importações redundantes no `main.py` e `env.py`.
    
#### 17/11/2025
- **Implementação do Envio de E-mail Assíncrono (Registro)**: Substituído o "mock" de envio de código de verificação (da atividade de 02/11/2025 ) por um envio de e-mail real e assíncrono.
    - **Tecnologia**: Instalada e configurada a biblioteca `fastapi-mail` para envio via SMTP (ex: Gmail com Senha de App).
    - **Novo Utilitário**: Criado o `src/app/utils/email_service.py` para encapsular a lógica de formatação (HTML) e envio dos e-mails.
    - **Assíncrono (BackgroundTasks)**: O endpoint `POST /api/v1/register/start` (em `users.py`) foi atualizado para injetar `BackgroundTasks`.
    - **Serviço**: O `user_service.py` (método `start_registration`)  agora adiciona o envio de e-mail à fila do `BackgroundTasks`, permitindo resposta imediata da API ao frontend.
    - **Configuração**: Atualizado o `config.py` para ler as variáveis de ambiente SMTP (ex: `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SERVER`, etc.).
    - **Correção (Validação)**: Adicionado o diretório `src/app/utils/templates/` (vazio) para satisfazer a validação de `ConnectionConfig` do `fastapi-mail`.

#### 08/11/2025

- **Implementação (Fluxo de Callback - Etapa 5)**: Implementado o endpoint `POST /api/v1/callbacks/consent-auth` (`callbacks.py`).
    - O endpoint recebe `code`, `id_token` e `state` da página de callback do frontend.
    - Valida o `state` recebido contra o `state_parameter` salvo no banco de dados para o usuário logado.
    - Atualiza o `Consent` com o `code_received`, `callback_access_token` (que é o `id_token`) e altera o `status` de `AWAITING_AUTH` para `AUTHORIZED`.
- **Implementação (Fluxo de Polling - Etapa 5)**: Implementado o endpoint de polling `GET /api/v1/my-consents/me/consents/status/{internal_consent_id}` (adicionado ao `consents.py`).
    - Permite que o frontend (tela `Redirecting.tsx`) verifique o status do consentimento de forma segura usando o ID interno (PK) do banco.
- **Refatoração (Endpoint de Confirmação - Etapa 4)**: Atualizado o endpoint `POST /api/v1/consent-journey/confirm` (`consent_journey.py`) e seu helper `request_data_consent` (`receptor.py`).
    - O endpoint agora retorna o `internal_consent_id` (PK do banco) junto com a `authorization_url`, em vez do `consent_id` sensível (ex: `urn:raidiaminsurance:...`), permitindo que o frontend inicie o polling.
    - Criados novos schemas (`ConsentConfirmationAuthResponse`, `ConsentAuthInfo`) para a nova estrutura de resposta.
- **Refatoração (Limpeza)**: Identificado que o endpoint `POST /api/v1/data-reception/consents/callback` (`receptor.py`) é redundante e pode ser removido (substituído pela lógica mais robusta em `callbacks.py`).
- **Configuração (Callback URI)**: Definida a `redirect_uri` oficial para registro na Celcoin como `http://54.237.215.231:5173/consent/callback`, com base na URL do frontend.

#### 07/11/2025

- **Depuração e Correção (API Externa - `POST /confirm`)**:
    - Corrigido `400 Bad Request` na chamada da API externa. A lógica em `consent_draft_service.py` foi ajustada para que a expiração de 12 meses seja "1 ano menos 1 dia", satisfazendo a regra de negócio da API (`"The expiration time cannot be greater than one year"`).
    - Corrigido `502 Bad Gateway` na chamada ao `receptor.py` implementando um timeout de 30 segundos no `httpx`, resolvendo o `ReadTimeout` padrão de 5s.
    - Implementada serialização manual (`json.dumps()`) e cabeçalhos HTTP (`Content-Type: application/json;charset=UTF-8`, `User-Agent`, `Accept-Encoding`, `Connection`) para espelhar a requisição do Postman, garantindo a aceitação do payload pela API externa.
- **Melhoria (Log de Erros)**: Adicionado tratamento de exceção detalhado (`HTTPStatusError`, `RequestError`) em `receptor.py` para capturar e logar o corpo da resposta de erros da API externa, o que foi crucial para a depuração.
- **Correção (Banco de Dados - `receptor.py`)**:
    - Corrigidos múltiplos `TypeError` (`'user_cpf' is invalid`, `'full_response_json' is invalid`) ao salvar o consentimento.
    - Corrigido `NotNullViolationError` ao salvar o consentimento. O objeto `Consent` agora é populado com todos os dados obrigatórios retornados pela API externa (`consent_id`, `state_parameter`, `code_verifier`, etc.) e os dados da requisição (`permissions`, `expiration_date_time`).
- **Sucesso (Etapa 4)**: O endpoint `POST /api/v1/consent-journey/confirm` agora chama a API externa com sucesso, recebe a `authorization_url` e salva o consentimento no banco com status `AWAITING_AUTH`.

#### 06/11/2025

- **Implementação da Jornada de Consentimento (Etapa 4 - Confirmação)**: Implementado o endpoint final da jornada de rascunho, `POST /api/v1/consent-journey/confirm`, que finaliza a coleta de dados (tela "Conectar").
- **Novos Schemas (Etapa 4)**:
    - Criado `proxy_schema.py` para definir `ConsentRequestData` e `ConsentRequestPayload` (o payload esperado pela API externa).
    - Adicionado `ConsentDraftStep4` (para receber `duration_months`) e `ConsentConfirmationResponse` (para retornar `authorization_urls`) ao `consent_draft_schema.py`.
- **Novo Serviço (Etapa 4)**: Criado o método `prepare_consent_confirmation` (`consent_draft_service.py`) para:
    - Ler o rascunho completo (`ConsentDraft`).
    - Calcular a data de expiração (instalando e usando `python-dateutil`).
    - Deletar o rascunho.
    - Retornar a lista de payloads (um por `brand_id`) e o `cpf` do rascunho.
- **Integração (Rascunho -> Proxy)**: O endpoint `/confirm` agora chama internamente o endpoint `POST /data-reception/consents` (`receptor.py`) em loop (um por `brand_id`).
- **Refatoração (receptor.py)**: Atualizado o `request_data_consent` para:
    - Receber `user_cpf` como argumento (corrigindo `SyntaxError` e bug de CPF nulo).
    - Salvar a resposta *completa* da API externa (incluindo `state`, `code_verifier`, `nonce`, etc.) na tabela `consents`.
- **Correção de Payload (400/422 Bad Request)**:
    - Corrigida a ordem das chaves (`loggedUser` antes de `permissions`) em `proxy_schema.py` para corresponder ao esperado pela API externa.
    - Corrigido o formato `expirationDateTime` (removendo microssegundos via `strftime`) em `consent_draft_service.py`.
- **Implementação da Jornada de Consentimento (Etapa 3 - Seleção de Produtos)**: Implementados os endpoints para a "Etapa 3: Selecionar Produtos" (Telas 3.0 e 3.1).
- **Refatoração (Estrutura de Produtos)**: Refatorado o `utils/product_translator.py` para usar uma estrutura de dados aninhada (Cluster -> Grupo -> Permissão) para alinhar ao design do Figma (ex: `Dados Cadastrais > Dados Pessoais > ..._READ`), baseado na lista de *scopes* reais.
- **Novo Schema (Etapa 3)**: `consent_draft_schema.py` atualizado para incluir `ApiPermissionRead`, `PermissionGroupRead`, `DataClusterRead` (para a resposta agrupada) e `ConsentDraftStep3` (para salvar a seleção).
- **Novo Endpoint (Leitura Etapa 3)**: Criado `GET /api/v1/consent-journey/available-products` (público) para retornar a lista mestra de produtos/permissões agrupada e traduzida (DisplayName).
- **Novos Endpoints (Salvar Etapa 3)**:
    - Criado `POST /api/v1/consent-journey/step-3` (Seleção Individual), que garante a inclusão de permissões obrigatórias (ex: "Dados Cadastrais").
    - Criado `POST /api/v1/consent-journey/step-3/select-all` (Botão "Selecionar todos"), que salva a lista mestra completa de *scopes*.
- **Atualização (Estrutura do Projeto)**: O `README.md` foi atualizado para refletir a adição dos novos arquivos de serviço, schema e endpoint da jornada de rascunho.

- **Correção do "Data Gap" (Jornada de Rascunho - Etapa 2)**: Corrigido erro 500 no endpoint `POST /api/v1/consent-journey/step-2/select-all`.
    - **Causa:** O `ConsentDraftService` (`process_step_2_select_all`) tentava iterar sobre um modelo SQL (`Brand`) como se fosse um JSON (causando `AttributeError`).
    - **Problema Raiz:** O `ParticipantService` (`get_all_participants`) lia do banco SQL (tabelas `Brand`, `Organization`), que não continha o `AuthorisationServerId` (o `brand_id` real) necessário para o fluxo. Os dados corretos (JSON completo) estavam apenas nos relatórios em `/reports/` salvos pelo `participant-updater`.
    - **Solução:**
        - Refatorado `ParticipantService`: O método (`get_all_participants_data`) agora lê e parseia o **arquivo JSON** mais recente do diretório `/reports/`, em vez de consultar o SQL.
        - Refatorado `ConsentDraftService`: O método `process_step_2_select_all` foi atualizado para consumir a lista de `dict` (JSON) retornada pelo `ParticipantService`, corrigindo a lógica de iteração.

#### 05/11/2025
- **Implementação da Jornada de Consentimento "Rascunho" (Salvar Progresso)**: Criada a arquitetura para salvar o progresso da jornada de consentimento (múltiplas etapas) para melhorar a UX e permitir a recuperação do estado.
    - **Contexto:** Permite que o frontend salve o progresso do usuário a cada etapa (ex: salvar CPF), e recupere esse progresso (ex: `resume`) se o usuário fechar a aba ou expirar o token, evitando que ele preencha tudo novamente.
    - **Refatoração (Múltipla Seleção)**: O fluxo foi atualizado para permitir que o usuário selecione *múltiplas* seguradoras na Etapa 2.
    - **Migração (Tabela `consent_drafts`)**:
        - Criado novo modelo `ConsentDraft` (`consent_draft.py`) para armazenar dados parciais da jornada e a etapa atual (`journey_step`).
        - Criada relação 1-para-1 `User` <-> `ConsentDraft` (com `uselist=False`).
        - Criado e aplicado script de migração (Alembic) para criar `consent_drafts` e alterar `brand_id` (String) para `brand_ids` (ARRAY(String)).
    - **Novos Schemas (`consent_draft_schema.py`)**:
        - `ConsentDraftStep1`: Payload para a Etapa 1 (coleta de CPF).
        - `ConsentDraftStep2`: Payload para a Etapa 2 (coleta de `brand_ids: List[str]`).
        - `ConsentDraftRead`: Resposta (GET) para exibir o rascunho.
    - **Novo Serviço (`consent_draft_service.py`)**:
        - `process_step_1_identification`: (Etapa 1) Salva o CPF na tabela `users` (se nulo) e cria/atualiza o `ConsentDraft`.
        - `process_step_2_institution`: (Etapa 2) Salva a lista de `brand_ids` no rascunho.
        - `get_active_draft`: Busca o rascunho ativo de um usuário (para o `resume`).
    - **Novos Endpoints (`consent_journey.py`)**:
        - `POST /api/v1/consent-journey/start`: Endpoint da Etapa 1 (Identificação).
        - `GET /api/v1/consent-journey/resume`: Endpoint para o frontend "hidratar" o contexto e recuperar o progresso da jornada.
        - `POST /api/v1/consent-journey/step-2`: Endpoint da Etapa 2 (Seleção).

#### 04/11/2025
- **Implementação do Callback de Consentimento Automatizado (Server-to-Server)**: Criado o fluxo automatizado para a jornada de consentimento, eliminando o processo manual de callback.
    - **Contexto:** Após o usuário autorizar no frontend da seguradora, o backend da seguradora (API Externa) chama diretamente nosso novo endpoint (fluxo S2S), enquanto nosso frontend aguarda (via polling).
    - **Migração da Tabela `consents`**: Adicionadas colunas (via Alembic) `state_parameter` (para validação OIDC/OAuth2), `code_received` (auditoria) e `callback_access_token` (para armazenar o `id_token` final).
    - **Novo Schema**: Criado `InsurerCallbackPayload` (em `callback_schema.py`) para aceitar o `POST` da seguradora com `code`, `id_token` e `state`.
    - **Novo Serviço**: Criado `ConsentCallbackService` (`consent_callback_service.py`) para:
        - Validar o `state` recebido contra o `state` salvo no banco (tabela `consents`, status `AWAITING_AUTH`).
        - Armazenar o `id_token` (recebido da seguradora) como o `callback_access_token` (que será usado para acessar os recursos da API Externa).
        - Atualizar o status do consentimento de `AWAITING_AUTH` para `AUTHORIZED`.
    - **Novo Endpoint**: Criado `POST /api/v1/callbacks/consent-auth` (em `callbacks.py`) como o `redirect_uri` público para a API Externa. O endpoint foi ocultado da documentação pública do Swagger (via `include_in_schema=False`).

#### 03/11/2025
- **Refatoração do Fluxo de Registro (Remoção do CPF)**: Removido o campo `CPF` do fluxo de registro inicial (Etapas 1 e 3) para alinhamento com a nova diretriz de design. O CPF será coletado pós-login.
- **Migração da Tabela `users`**:
    - Criado script de migração (Alembic) para tornar o campo `cpf` `nullable=True`.
- **Atualização de Schemas (`user_schema.py`)**:
    - `RegistrationStartRequest`: Removido o campo `cpf`.
    - `SetPasswordRequest`: Removido o campo `cpf`.
    - `UserRead`: Atualizado para `cpf: Optional[str]`.
- **Atualização de Serviços (`user_service.py`)**:
    - `start_registration`: Removida a lógica de validação de CPF e usuário agora é criado com `cpf=NULL`.
    - `set_password_and_activate`: Removida a validação cruzada de CPF.

#### 02/11/2025
- **Refatoração Completa do Fluxo de Registro (Figma 3 Etapas)**: O fluxo de registro foi totalmente reescrito para se alinhar ao design do Figma (Tela 1: Dados -> Tela 2: Código -> Tela 3: Senha). O fluxo anterior de 2 etapas foi descartado.
- **Migração da Tabela `users` (Refatoração)**:
    - Criado script de migração (Alembic) para:
        - Tornar `hashed_password` `nullable=True` (a senha agora é definida na Etapa 3).
        - Adicionar `email_verified` (Boolean, `NOT NULL`, `server_default='false'`).
    - Corrigido `NotNullViolationError` em usuários existentes ao adicionar `email_verified` (usando `server_default='false'` no script de migração).
- **Atualização de Schemas (`user_schema.py`)**:
    - `UserCreate` (usado no fluxo de 2 etapas) foi substituído por:
        - `RegistrationStartRequest`: (Etapa 1) Coleta `full_name`, `email`, `cpf`, `agreed_to_terms`.
        - `EmailVerificationRequest`: (Etapa 2) Coleta `email`, `code`.
        - `SetPasswordRequest`: (Etapa 3) Coleta `email`, `password` (com validação complexa de Regex).
    - `UserRead` atualizado para incluir `email_verified`.
- **Atualização de Serviços (`user_service.py`)**:
    - `create_user` (do fluxo de 2 etapas) foi substituído por 3 novos métodos:
        - `start_registration`: (Etapa 1) Cria usuário com `password=NULL`, `is_active=False`, `email_verified=False` e gera/mocka o código de verificação.
        - `verify_email_code`: (Etapa 2) Valida o código e define `email_verified=True`.
        - `set_password_and_activate`: (Etapa 3) Valida o status, define a `hashed_password` e define `is_active=True`.
- **Atualização de Endpoints (`users.py`)**:
    - `POST /users/register` e `POST /verify-email` (do fluxo de 2 etapas) foram removidos/substituídos.
    - Criado `POST /api/v1/register/start` (Etapa 1).
    - Criado `POST /api/v1/register/verify-email` (Etapa 2).
    - Criado `POST /api/v1/register/set-password` (Etapa 3).

#### 28/10/2025
- **Implementação de Scheduler (Tarefas Agendadas)**: Adicionado e configurado `apscheduler` para executar tarefas periódicas.
    - Integrada a biblioteca `apscheduler` ao ciclo de vida da aplicação FastAPI (eventos `startup` e `shutdown`).
    - Criado um job de exemplo (ex: `check_expired_data`) que roda em intervalo fixo para demonstrar a funcionalidade.
    - Configurado o scheduler para iniciar e parar corretamente junto com o servidor no `main.py`.

#### 26/10/2025
- **Gerenciamento de Consentimentos (Usuário - Leitura)**: Implementado endpoint `GET /api/v1/my-consents/me` para o usuário logado listar seus próprios consentimentos.
- **Dados Mock de Participantes**: Implementada funcionalidade para servir dados locais de participantes.
- **Endpoints de Participantes**:
    - Restaurado endpoint original `GET /api/v1/participants`.
    - Criado novo endpoint `GET /api/v1/local-participants`.
- **Integração `brandId`**: Modificado endpoint `POST /api/v1/data-reception/consents`.
- **Correção Core**: Resolvido erro `InvalidRequestError` do SQLAlchemy.

#### 25/10/2025
- **Endpoints de Gestão (Admin)**: Iniciada Fase 4 com o router `/api/v1/admin`.
- **Correção e Validação CORS**: Configurado `CORSMiddleware`.
- **Integração Frontend**: Validada comunicação Docker (Login/Registro).
- **Ajustes de Execução (Docker/Alembic)**: Corrigido comando de execução do Alembic.

#### 24/10/2025
- **Integração com Banco de Dados (PostgreSQL)**: Configurado PostgreSQL via Docker, SQLAlchemy assíncrono e Alembic para migrações.
- **Modelagem de Dados**: Criadas tabelas `users`, `consents`, etc.
- **Sistema de Gestão de Usuários (B2C)**:
    - Implementado `POST /api/v1/users/register` e `POST /api/v1/auth/login`.
- **Proteção de Rotas (RBAC)**: Criadas dependências (ex: `get_current_active_user`).
- **Integração Usuário-Consentimento**: Refatorados endpoints de consentimento para exigir login e associar `consent_id` ao `user.id`.

#### 22/10/2025
- **Proxy para Listagem de Participantes**: `GET /api/v1/participants`.
- **Proxy para Solicitação de Consentimento**: `POST /api/v1/data-reception/consents`.
- **Proxy para Finalização de Consentimento**: `POST /api/v1/data-reception/consents/callback`.
- **Proxy Genérico para Dados de Consentimento**: `GET /api/v1/consents/{consent_id}/{path:path}`.
- **Proxy Genérico para Operações de Consentimento**.

#### 17/10/2025
- **Estrutura do Projeto**: Configuração inicial (FastAPI, Poetry).
- **CI/CD**: Pipeline de integração contínua.
- **Cliente de Autenticação Externa**: Implementação do `AuthClient`.
- **Segurança Interna (JWT)**: `POST /api/v1/auth/token` (M2M).
- **Renovação de Token de Consentimento**: `GET /api/v1/consents/{consent_id}/token`.
- **Cache de Token em Memória**.

### 🎯 Atividades Prioritárias

- **Implementar Fluxo de Recuperação de Senha**: Criar endpoints para "Esqueci minha senha", que deve usar o `verification_code`.
- **Expandir Endpoints de Gestão (Admin)**: Implementar CRUD (quase) completo para usuários (`GET /admin/users/{id}`, `PUT`) e endpoints para visualizar/gerenciar consentimentos por usuário.
- **Gerenciamento de Consentimentos (Usuário - Revogação)**: Criar endpoint para o usuário comum revogar (`DELETE /api/v1/my-consents/{consent_id}`) seus próprios consentimentos.
- **Filtrar retorno da lista de seguradoras participantes**: API de Participants continua trazendo a Open Power e a Guru. Precisamos filtrar para que o retorno elimine as duas quando acessarmos esta rota.

### ⏳ Atividades Pendentes

- **Expandir Cobertura de Testes**: Aumentar a cobertura de testes de integração para os novos endpoints B2C (Registro 3-etapas, Jornada de Rascunho) e Admin.
- **Refatorar Autenticação M2M**: Substituir a autenticação M2M estática (`FRONTEND_CLIENT_ID`) por um modelo de "Clientes API" no banco de dados.
- **Suporte a Consentimentos de Serviço (Fase 03)**: Implementar os endpoints de proxy necessários para o fluxo de iniciação de serviços (Fase 03).

### 🚀 Atividades Futuras

- **Implementar Login com SSO (Google)**: Adicionar fluxo de login/registro via Google OAuth 2.0. Requer configuração no Google Cloud Console, um novo endpoint `POST /api/v1/auth/google` (callback) e lógica de serviço (`login_or_register_with_google`) para trocar o código, validar o `id_token` e criar/logar o usuário (sem senha local).
- **Cache Distribuído com Redis**: Substituir o cache em memória por Redis.
- **Filas de Tarefas Assíncronas (Task Queue)**: Implementar uma fila de tarefas (ex: Celery) e substituir o "mock" de e-mail por um envio real (ex: via SendGrid/Celery).
- **Monitoramento e Logging Avançado**: Integrar ferramentas de monitoramento.

## License

MIT License.

## Contributing

Always welcome!

## Project Structure

```bash
secure-backend/
├── .github/
├── collections/
├── migrations/
│   ├── versions/
│   └── `env.py`
├── src/
│   └── app/
│       ├── api/
│       │   ├── `api.py`
│       │   ├── `dependencies.py`
│       │   └── endpoints/
│       │       ├── `admin.py`
│       │       ├── `auth.py`
│       │       ├── `callbacks.py`
│       │       ├── `consent_journey.py`  # <-- NOVO
│       │       ├── `consents.py`
│       │       ├── `operations.py`
│       │       ├── `proxy.py`
│       │       ├── `receptor.py`
│       │       └── `users.py`
│       ├── db/
│       │   ├── `base.py`
│       │   └── `session.py`
│       ├── models/
│       │   ├── `brand.py`
│       │   ├── `consent.py`
│       │   ├── `consent_draft.py`  # <-- NOVO
│       │   ├── `organization.py`
│       │   └── `user.py`
│       ├── schemas/
│       │   ├── `callback_schema.py`
│       │   ├── `consent_draft_schema.py` # <-- NOVO
│       │   ├── `token.py`
│       │   └── `user_schema.py`
│       ├── services/
│       │   ├── `auth_client.py`
│       │   ├── `consent_callback_service.py`
│       │   ├── `consent_draft_service.py` # <-- NOVO
│       │   ├── `participant_service.py` # <-- Adicionado/Refatorado
│       │   └── `user_service.py`
│       ├── utils/
│       │   ├── `email_service.py`
│       │   ├── `security.py`
│       │   ├── `templates/`
│       │   └── `verification.py`
│       ├── `config.py`
│       ├── `main.py`
│       └── `security.py`
├── tests/
├── `.env`
├── `.env.production.example`
├── `.gitignore`
├── `alembic.ini`
├── `Dockerfile`
├── `LICENSE`
├── `pyproject.toml`
└── `README.md`
```