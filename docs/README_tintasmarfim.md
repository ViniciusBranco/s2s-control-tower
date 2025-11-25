# Documentação do Sistema de Chatbot Comercial

## Resumo

Este documento descreve a arquitetura de um chatbot proativo para WhatsApp, desenvolvido em Python com o framework FastAPI. O sistema visa auxiliar representantes comerciais, fornecendo informações da empresa (clientes, faturamento, campanhas) e respondendo a dúvidas técnicas através de uma integração com um serviço de IA externo.

A aplicação foi projetada para ser robusta, segura e escalável, utilizando um banco de dados **PostgreSQL** para persistência e um agendador para tarefas proativas.

## Arquitetura Atual

A arquitetura do sistema é composta por componentes principais que se comunicam via APIs. A aplicação central foi dividida em dois serviços Docker, além de um serviço de banco de dados, para garantir a estabilidade e a responsabilidade única:

1.  **Aplicação Central (Docker)**
    * **`db` (Serviço de Banco de Dados):** Contêiner **PostgreSQL** (imagem oficial `postgres:15-alpine`) que armazena todos os dados persistentes (representantes, sessões, logs). Configurado para usar o fuso horário `America/Sao_Paulo`.
    * **`chatbot_api` (Serviço Web):** O cérebro da interação. É uma API Python (FastAPI) servida por Gunicorn com 4 workers. É responsável por:
        * Receber todas as mensagens do WhatsApp através do webhook (`/api/webhook`).
        * Gerenciar o estado da conversa (máquina de estados), incluindo a lógica de paginação para respostas longas e o bloqueio de usuários inativos.
        * Consultar a API comercial externa e o n8n (IA) para obter respostas.
        * Enviar as respostas de volta para o usuário através do WAHA.
    * **`scheduler_service` (Serviço de Agendamento):** Um serviço isolado que roda a partir da mesma imagem Docker da API, mas com um comando diferente. É responsável por:
        * Inicializar as tabelas no banco de dados (`database.create_db_and_tables`).
        * Executar o `APScheduler` para disparar tarefas proativas (mensagens matinais) e de manutenção (geração de relatórios, limpeza de DB, reset de estado e gerenciamento de inatividade).

2.  **WAHA (WhatsApp HTTP API):** Atua como a ponte de comunicação entre nossa aplicação e o WhatsApp. Ele recebe as mensagens dos representantes e as encaminha para o webhook do `chatbot_api`. Inclui atrasos aleatórios entre as ações para evitar detecção como bot.

3.  **API Comercial Externa:** Uma API REST que serve como a fonte da verdade para todos os dados de negócio (representantes, clientes, faturamento, etc.).

4.  **Serviço de IA (n8n):** Um fluxo de trabalho no n8n que recebe uma pergunta do `chatbot_api`, a processa usando IA (modelo `gpt-4.1-mini` com prompt de segurança aprimorado) e envia a resposta de volta.

## Estrutura de Arquivos do Projeto

O projeto está organizado de forma modular para facilitar a manutenção e o desenvolvimento.

### Diretórios Principais

* `/app/`: Contém todo o código-fonte da aplicação FastAPI.
* `/data/`: **(OBSOLETO)** Usado anteriormente para o SQLite. Pode ser removido ou arquivado.
* `/reports/`: Armazena os relatórios de engajamento gerados em formato JSON.

### Descrição dos Arquivos

| Arquivo                                     | Descrição                                                                                                                                                                            | Relações                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| **`app/main.py`** | **Ponto de Entrada da API Web.** Define o app FastAPI e inclui os roteadores. Não inicializa mais o banco de dados nem o scheduler.                                                  | Importa e usa `endpoints`.                                                |
| **`app/api/endpoints.py`** | **Controlador de Rotas.** Define todos os endpoints da API. Contém a lógica principal da máquina de estados, incluindo paginação e bloqueio de usuários inativos (`INACTIVE_BLOCKED`). | Usa `crud`, `waha_service`, `comercial_api_service`, `response_formatter` e `security`. |
| **`app/core/database.py`** | **Configuração do Banco de Dados.** Define os modelos de dados (tabelas) usando SQLAlchemy, incluindo `is_active` e `days_inactive` na tabela `representatives`. | Usado por `crud`, `scheduler`.                                            |
| **`app/core/crud.py`** | **Operações de Banco de Dados.** Centraliza todas as funções de CRUD. **Não reativa usuários automaticamente**; apenas reseta a inatividade no `create_interaction_log` se já estiver ativo e se for uma interação de usuário. | Usa `endpoints` e `scheduler`.                                      |
| **`app/core/scheduler.py`** | **Agendador de Tarefas.** Script executável que roda no contêiner `scheduler_service`. Gerencia tarefas proativas (filtrando inativos) e de manutenção (atualizando `days_inactive` e desativando usuários que não estão na API/`.env`). | Usa `crud`, `comercial_api_service` e `waha_service`.                     |
| **`app/core/config.py`** | **Gerenciador de Configurações.** Carrega todas as variáveis de ambiente (tokens, URLs, credenciais DB) do arquivo `.env` usando Pydantic.                                   | Usado por quase todos os outros módulos.                                  |
| **`app/core/security.py`** | **Módulo de Segurança.** Implementa a lógica de autenticação por token (`X-API-KEY`), protegendo os endpoints da aplicação.                                                            | Usado por `endpoints` como uma dependência.                               |
| **`app/core/utils.py`** | **Funções Utilitárias.** Contém funções de ajuda, como a normalização de números de telefone para um formato padrão.                                                                 | Usado por `endpoints` e `scheduler`.                                      |
| **`app/core/response_formatter.py`** | **Formatador de Mensagens.** Contém funções que pegam os dados brutos da API externa (incluindo tratamento de múltiplos faturamentos e fallback para dados do representante) e os formatam para o usuário. | Usado por `endpoints`.                                                    |
| **`app/services/comercial_api_service.py`** | **Serviço da API Externa.** Encapsula toda a comunicação com a API de dados comerciais e com o webhook do n8n.                                                                       | Usado por `endpoints` e `scheduler`.                                      |
| **`app/services/waha_service.py`** | **Serviço do WAHA.** Centraliza toda a comunicação de saída para o WAHA, incluindo atrasos aleatórios entre as ações.                                                                        | Usado por `endpoints` e `scheduler`.                                      |
| **`dockerfile` & `docker-compose.yaml`** | **Conteinerização.** `Dockerfile` constrói a imagem da aplicação. `docker-compose.yaml` orquestra os três serviços (`db`, `chatbot_api`, `scheduler_service`), volumes, redes, fuso horário (`TZ`, `PGTZ`) e mapeamentos de fuso (`/etc/...`). | Ferramentas de deploy.                                                    |
| **`pyproject.toml`** | **Gerenciador de Projeto.** Arquivo de configuração do Poetry que define as dependências (incluindo `psycopg2-binary`).                                                                      | Ferramenta de desenvolvimento.                                            |

## Backlog do Projeto

Esta seção documenta o histórico de desenvolvimento do chatbot e delineia as atividades futuras para a evolução do sistema.

### Histórico de Atividades (Concluídas)

#### 03/10/2025 (Fundação e PoC)
* **[CONCLUÍDO]** Definição da Arquitetura Técnica (Python, FastAPI).
* **[CONCLUÍDO]** Estruturação do Projeto (Poetry).
* **[CONCLUÍDO]** Implementação da Máquina de Estados.

#### 10/10/2025 (Integração Core e Persistência)
* **[CONCLUÍDO]** Integração com a API Externa (`comercial_api_service.py`).
* **[CONCLUÍDO]** Implementação da Persistência de Dados (SQLite inicial).
* **[CONCLUÍDO]** Desenvolvimento do Agendador (APScheduler).
* **[CONCLUÍDO]** Lógica de Analytics e Relatórios.

#### 17/10/2025 (Integração Externa e Robustez)
* **[CONCLUÍDO]** Integração com WAHA.
* **[CONCLUÍDO]** Integração com a IA (n8n - fluxo inicial).
* **[CONCLUÍDO]** Implementação da Camada de Segurança (API Key).
* **[CONCLUÍDO]** Dockerização da Aplicação.

#### 21/10/2025 (Deploy e Refinamento)
* **[CONCLUÍDO]** Implantação em Múltiplas VMs Azure.
* **[CONCLUÍDO]** Correção no Fluxo de Autenticação (API externa vs .env).
* **[CONCLUÍDO]** Ajuste no Fluxo Proativo (Envio de Faturamento).
* **[CONCLUÍDO]** Melhoria na Consulta de Cidades (Nomes compostos).
* **[CONCLUÍDO]** Ocultação de Endpoints Internos (Swagger).
* **[CONCLUÍDO]** Padronização de Logs (Timestamp e conteúdo).
* **[CONCLUÍDO]** Atualização do Formatador (Status 'PERDIDO').
* **[CONCLUÍDO]** Correção do Agendador (Lógica `check_for_any_interaction_today`).
* **[CONCLUÍDO]** Implementação do Reset Diário de Estado e Limpeza de Logs.
* **[CONCLUÍDO]** Correção de "Graduação" de Teste para Real.
* **[CONCLUÍDO]** Resiliência da API de Autenticação (`get_rep_id_by_phone`).
* **[CONCLUÍDO]** Refatoração de Arquitetura (Docker - Serviço Scheduler isolado).

#### 23/10/2025 (Estabilização do PostgreSQL e IA)
* **[CONCLUÍDO]** Configuração de Fuso Horário (TZ/PGTZ/Volumes) nos contêineres Docker.
* **[CONCLUÍDO]** Aprimoramento de Segurança do Prompt da IA (n8n - Versão 3).
* **[CONCLUÍDO]** Migração do Banco de Dados: Migração da base de dados de SQLite para **PostgreSQL** (Dockerizado).

#### 24/10/2025 (Refinamento de Funcionalidades)
* **[CONCLUÍDO]** Implementação de Paginação de Faturamento: Adiciona lógica em `endpoints.py` para exibir múltiplos registros de faturamento em lotes.
* **[CONCLUÍDO]** Correção de `TypeError` em Faturamento: Ajusta `response_formatter.py` para tratar valores `None` retornados pela API para metas.
* **[CONCLUÍDO]** Aprimoramento do Formatador de Faturamento: Prioriza dados do representante vindos da API e utiliza a mensagem da API.
* **[CONCLUÍDO]** Adição de Atraso Aleatório: Modifica `waha_service.py` para usar tempos de espera aleatórios (2-5s) entre as ações.

#### 28/10/2025 (Correções de Fluxo)
* **[CONCLUÍDO]** Correção de Duplicidade de Faturamento: Ajusta `endpoints.py` para definir o flag `greeting_sent` corretamente no fluxo proativo.
* **[CONCLUÍDO]** Inclusão de Faturamento na Mensagem Matinal: Modifica `scheduler.py` para buscar e incluir o resumo de faturamento (se único) na mensagem automática das 7h.

#### 30/10/2025 (Implementação de Ciclo de Vida)
* **[CONCLUÍDO]** Implementação do Ciclo de Vida de Inatividade: Adiciona `is_active` (default False) e `days_inactive` ao `database.py`. O `scheduler.py` agora desativa usuários por inatividade (>2 dias) ou se não constarem mais na API/'.env'. O `crud.py` foi modificado para **NÃO reativar usuários automaticamente** (reativação agora é manual). O `endpoints.py` bloqueia usuários inativos (`is_active=False`) com o estado `INACTIVE_BLOCKED`.

#### 05/11/2025 (Correções Pós-Deploy)
* **[CONCLUÍDO]** Correção no Contador de Inatividade: Ajusta `crud.py` para que o contador `days_inactive` só seja resetado por interações reais do usuário, e não por logs do sistema (ex: `proactive_sent`).
* **[CONCLUÍDO]** Correção de Violação de Chave Única: Ajusta `crud.py` para evitar o erro `UniqueViolation` (`ix_representatives_api_rep_id`) ao atualizar `api_rep_id` de usuários de teste.

#### 09/11/2025 (Entrada em Produção)
* **[CONCLUÍDO]** Ativação da consulta ao endpoint `/representantes` da API externa em `scheduler.py`.

#### 11/11/2025 (Ajustes em Produção)
* **[CONCLUÍDO]** Implementação de lógica de "merge" em `scheduler.py` para unir a lista da API (prioritária) com a lista de admin/teste do `.env` sem duplicatas.
* **[CONCLUÍDO]** Remoção da restrição `UNIQUE` (`DROP INDEX`) da coluna `api_rep_id` no PostgreSQL para permitir sincronização de dados da API.
* **[CONCLUÍDO]** Refatoração da lógica de atualização em `crud.py` para usar `phone` como chave primária e sempre sincronizar `api_rep_id` e `name` da fonte da verdade (API/`.env`).

#### 11/11/2025 (Ajustes de Regra de Negócio)
* **[CONCLUÍDO]** Implementação da Regra de Gerente: Adiciona a lógica para impedir a inativação automática de representantes que são gerentes (`A3_YGERBOT='S'`), atualizando o `database.py`, `comercial_api_service.py`, `crud.py`, `scheduler.py` e `endpoints.py`.
* **[CONCLUÍDO]** Extensão da Regra de Gerente: Garante que os usuários administrativos/de teste definidos na variável de ambiente `TEST_REP_PHONE_LIST` também sejam protegidos contra a desativação por inatividade.

#### 12/11/2025 (Resolução de Infraestrutura e WAHA)
* **[CONCLUÍDO]** Diagnóstico de Falha de Carga (WAHA): Identificado que o crash do dia 10/11 foi causado por esgotamento de RAM (OOM Killer) na VM de 2GiB, acionado pelo pico de carga do scheduler, e não por banimento do número.
* **[CONCLUÍDO]** Upgrade de Infraestrutura: Migração da VM do Azure para Standard B2s (4 GiB RAM) para suportar a carga de trabalho.
* **[CONCLUÍDO]** Correção do "Split-Brain" (WAHA): Descartada a engine WEBJS (Chromium) devido a um bug de estado. Adotada a engine GOWS (leve).

* **[CONCLUÍDO]** Correção de Conexão (WAHA+Redis): Forçada a conexão do WAHA ao Redis (via WAHA_APPS_ENABLED e REDIS_URL) para gerenciamento de filas de tarefas.
* **[CONCLUÍDO]** Correção de Autenticação (Webhook): Configurada a sessão 'default' (via Dashboard) para usar o IP público e enviar o 'X-Api-Key' (customHeaders), resolvendo o erro 403 do 'chatbot_api'.

#### 13/11/2025 (Otimização e Refinamento de Carga do Scheduler e Serviço WAHA)
* **[CONCLUÍDO]** Refatoração de Envio Proativo: Modificado o 'scheduler.py' para remover 'asyncio.gather', que causava o pico de carga (crash).
* **[CONCLUÍDO]** Implementação de Rate Limiting: O envio de mensagens matinais agora é sequencial, com pausas (asyncio.sleep) entre cada usuário para evitar sobrecarga na API e risco de banimento.
* **[CONCLUÍDO]** Correção de Chamadas Bloqueantes: Substituído `time.sleep()` por `await asyncio.sleep()` no `waha_service.py` para impedir o congelamento do *event loop* do `scheduler_service` durante as pausas aleatórias.

#### 13/11/2025 (Segregação da API de Relatórios)
* **[CONCLUÍDO]** Implementação de autenticação **OAuth2 com JWT** para a API de relatórios (`python-jose`, `passlib`, `bcrypt`).
* **[CONCLUÍDO]** Criação de um novo ponto de entrada (`app/reports_main.py`) e roteador (`app/api/reports_endpoints.py`).
* **[CONCLUÍDO]** Criação do módulo de segurança JWT (`app/core/security_jwt.py`) e atualização das configurações (`app/core/config.py`).
* **[CONCLUÍDO]** Atualização do `docker-compose.yaml` para lançar o `reports_api` como um serviço separado na porta 8008.
* **[CONCLUÍDO]** Remoção dos endpoints de relatórios da API principal do bot (`app/api/endpoints.py`).

#### 14/11/2025 (Correção da Lógica Proativa)
* **[CONCLUÍDO]** Correção no `scheduler.py`: A lógica de envio matinal estava ignorando os representantes da API que estavam inativos *no banco de dados*.
* **[CONCLUÍDO]** Atualização no `comercial_api_service.py`: A função `get_rep_id_by_phone` agora também busca o status `A3_YLISTBO` (ativo na API).
* **[CONCLUÍDO]** Refinamento da Regra: O envio proativo agora usa um "filtro triplo", checando se o usuário está ativo na API (`A3_YLISTBO='S'`), ativo no bot (`is_active=True` no DB) e se ainda não interagiu no dia. A reativação no DB permanece manual, como planejado.

#### 19/11/2025 (Prevenção de Spam de Números Desconhecidos)
* **[CONCLUÍDO]** Implementação de persistência para números desconhecidos: O bot agora salva no banco de dados os números que não constam na API nem na lista do `.env`.
* **[CONCLUÍDO]** Bloqueio automático de novos contatos inválidos: Esses registros são criados imediatamente com `is_active=False`, garantindo que a mensagem de "número não encontrado" seja enviada apenas uma vez. As interações subsequentes são ignoradas silenciosamente pela lógica de bloqueio de inativos, evitando loops de respostas (spam).

#### 19/11/2025 (Suporte a Identidade Persistente - LID)
* **[CONCLUÍDO]** Implementação de Suporte a LID (Linked Device ID): Adicionada lógica para reconhecer e mapear identificadores únicos do WhatsApp (`@lid`), garantindo que o histórico e a sessão do representante sejam preservados mesmo em caso de troca de número de telefone ou alteração de criptografia.
* **[CONCLUÍDO]** Migração de Banco de Dados: Criação do script `migrate_add_lid.py` e alteração no schema (`representatives`) para persistir o `whatsapp_lid`.
* **[CONCLUÍDO]** Atualização do Webhook: O `endpoints.py` agora intercepta mensagens vindas de LIDs, consulta o mapeamento no banco ou na API do WAHA, e realiza o "swap" transparente para o número de telefone correspondente.

#### 20/11/2025 (Saneamento e Sincronização de Identidade)
* **[CONCLUÍDO]** Implementação Total de Suporte a LID: Finalizada a lógica de interceptação e tratamento de IDs únicos do WhatsApp (`@lid`). O sistema agora realiza o "swap" transparente para o número de telefone, garantindo a continuidade do atendimento independente de mudanças no dispositivo do usuário.
* **[CONCLUÍDO]** Saneamento da Base de Dados: Execução de script de força bruta (`force_lid_sync.py`) que consultou a API do WAHA e atualizou em massa o cadastro de 16 representantes, vinculando seus LIDs aos telefones existentes e prevenindo falhas de identificação futuras.
* **[CONCLUÍDO]** Correção de Cadastros Fantasmas: Remoção de registros "Desconhecidos" gerados por falhas de mapeamento anteriores.

### Atualizações Prioritárias

#### Infraestrutura e Produção

* **[A FAZER]** Configuração de CI/CD: Criar um pipeline no **GitHub Actions** para automatizar os testes e o deploy a cada atualização no repositório.

#### Melhorias de Funcionalidade

* **[A FAZER]** Implementar Fila de Mensagens: Integrar **Celery** e **Redis** para gerenciar o envio de mensagens e chamadas de API. Esta é a solução arquitetural definitiva para o crash do dia 10/11, substituindo o 'rate limit' (asyncio.sleep) por uma fila robusta que previne picos de carga, garante o 'rate limit' e impede a perda de mensagens se o WAHA falhar.

### Atividades Futuras (Sugestões de Backlog)

#### Infraestrutura e Produção

* **[A FAZER]** Implementar Stack de Observabilidade: Adotar uma estratégia de logging estruturado (JSON) e integrar a aplicação com **Prometheus** (para métricas), **Loki** (para logs) e **Grafana** (para dashboards), criando uma visão unificada da saúde e do comportamento do sistema.
* **[A FAZER]** Painel de Visualização (Dashboard): Criar uma interface web simples para consumir o endpoint de relatórios e exibir os dados de engajamento em gráficos.
* **[A FAZER]** Monitoramento de Erros: Integrar uma ferramenta de monitoramento (como **Sentry**) para capturar e alertar sobre erros que ocorram em produção.

#### Melhorias de Funcionalcidade

* **[A FAZER]** Histórico de Relatórios: Criar um novo endpoint (`/reports/all` ou `/reports?date=...`) que permita consultar relatórios de datas específicas.
* **[A FAZER]** Envio de Mensagens sob Demanda: Desenvolver um endpoint seguro para que um administrador possa disparar uma mensagem customizada para todos os representantes.
* **[A FAZER]** Aprimorar Busca de Clientes: Permitir que o representante busque um cliente específico diretamente no chat (ex: "buscar cliente <nome>"), sem precisar listar todos os da cidade.
* **[A FAZER]** Novas Opções no Menu: Adicionar funcionalidades de autoatendimento, como "solicitar 2ª via de boleto" ou "verificar status de um pedido".

#### Melhorias na IA

* **[A FAZER]** Aprimorar a Base de Conhecimento da IA: Conectar o fluxo do n8n a mais fontes de dados (planilhas, PDFs de produtos) para expandir a capacidade de resposta.

### Log de manutenções no banco de dados local

* **[ERR01 - números anônimos]** São anônimos anônimos que foram incluídos erroneamente para teste ou após interação expontânea sem tratamento e precisaram ser desativados manualmente para o bot não interagir com eles.

* **[ERR02 - números de testes]** São números usados para o teste interno pela Equipe da Marfim e foram desativados manualmente. 

* **Comando no Banco de Dados local do Bot**: `update representatives set (id, is_active, days_inactive)=('<ERRO>', false, 3) where phone='<numero>';`

---

## Segurança do Prompt para IA do Chatbot Comercial

### Introdução

Este documento descreve as estratégias de segurança e privacidade implementadas no prompt de sistema da IA (modelo `gpt-4.1-mini`) utilizada no fluxo do n8n para o Chatbot Comercial. O objetivo é proteger a IA contra manipulação maliciosa (Jailbreaking, Prompt Injection) e prevenir o vazamento de informações sensíveis, garantindo que ela opere estritamente dentro de seu escopo definido.

*(Para o prompt completo e os casos de teste detalhados, veja o documento específico "Seguranca_Prompt_IA.md")*

### Conceitos de Segurança Implementados (Resumo)

O prompt revisado (Versão 3) incorpora várias camadas de segurança:

1.  **Guardrails (Tópico, Privacidade, Comportamento):** Regras explícitas que limitam o que a IA pode discutir, revelar ou fazer.
2.  **Prevenção de Injeção de Prompt / Jailbreaking:** Tolerância zero e rejeição imediata de inputs que contenham instruções proibidas.
3.  **Resposta Padrão ("Safety Net"):** Uma única resposta genérica para falhas ou violações, dificultando a engenharia reversa.
4.  **Mitigação de Envenenamento de Memória:** Instrução explícita para ignorar comandos maliciosos encontrados no histórico da conversa.

### Validação

A eficácia do prompt foi validada através de testes específicos cobrindo Injeção de Prompt, Privacidade, Tópico e Funcionalidade básica. A Versão 3 do prompt passou nos testes de rejeição de instruções maliciosas (ex: "cocoricó").

### Conclusão

A implementação dessas regras e guardrails no prompt de sistema aumenta significativamente a segurança e a confiabilidade da IA. A validação contínua através de testes é essencial.