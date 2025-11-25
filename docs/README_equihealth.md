# 🐴 EquiMiner: Projeto Mestre de Curadoria de Dados

Este documento é o guia oficial para o projeto **EquiHealth - Fase 1: Engenharia de Dados e Curadoria de Negativos e Positivos (Negative & Safety Mining)**.

O objetivo principal é a triagem de frames de **"Baias Vazias"** (Negativos) e de **"Hard Positives"** (Positivos de Segurança) com alta velocidade, respeitando restrições críticas de I/O e garantindo a integridade do conjunto de dados para futuros modelos de Visão Computacional.

## I. Arquitetura e Engenharia de Dados (Contexto Crítico)

### 1.1. Restrições e a Regra de Ouro do I/O

O projeto foi construído para lidar com 2.3 TB de dados em um ambiente com recursos limitados.

| Item | Restrição | Solução de Engenharia |
| --- | --- | --- |
| **Volume de Dados** | ~2.3 TB de vídeo (5.000h) | Leitura "streamada" usando `cv2.CAP_PROP_POS_MSEC` (seek). |
| **Armazenamento** | SSD principal com apenas 17GB livres. | **REGRA DE OURO:** Proibido copiar arquivos de vídeo. A leitura ocorre diretamente da unidade montada do Google Drive (`G:\...`). |
| **GPU** | GTX 1060 6GB (uso não permitido na Fase 1). | O processamento do frame (decodificação e redimensionamento) é feito na CPU e é **ultra-leve**, pois apenas um frame estático é decodificado por salto. |

### 1.2. O Split Determinístico 80/20 (Integridade de MLOps)

Para prevenir o **Data Leakage** (Vazamento de Dados) em todas as futuras tarefas de treinamento (Detecção, Pose, etc.), implementamos uma fonte de verdade única para a separação dos dados:

1. **Unidade de Amostragem:** O split é feito **por VÍDEO**, e não por frame.
2. **Lógica:** O script `catalog_splitter.py` usa o Hash MD5 do nome do arquivo como *seed* para classificar permanentemente o vídeo como **TRAIN (80%)** ou **VAL/TEST (20%)**.
3. **Garantia:** Os mineradores (`negative_miner.py` e `safety_miner.py`) **LÊM** este mapa (`video_split_master.csv`) e garantem que **NENHUM** vídeo classificado como `VAL/TEST` seja carregado para curadoria.

### 1.3. Progress Tracking Persistente, Anti-Duplicação e Correção de Anomalias (QA)

As funcionalidades mais importantes para a eficiência e qualidade da curadoria:

- **Progress Tracking:** Ao iniciar, ao pular de vídeo e ao sair, os scripts **varrem os arquivos salvos** e geram um relatório mostrando o total de frames coletados por categoria (Transição, Dia, Noite) e quantos frames **FALTAM** para atingir as metas. **A contagem é persistente** (não se perde ao fechar o script).
- **Anti-Duplicação:** Os scripts **BLOQUEIAM** o curador de salvar ou pular para um *timestamp* (segundo) que já foi salvo para o set em questão (Negativos ou Positivos), eliminando o trabalho redundante.
- **Correção de Iluminação (Override Manual):** O curador pode forçar a classificação de um frame para a categoria visualmente correta (Dia, Noite ou Transição) quando o metadado de hora do vídeo estiver incorreto (exemplo: vídeo noturno com iluminação de dia).
- **Nomenclatura Persistente (Sufixo _mX):** O arquivo salvo carrega o ID da missão no nome (`_m2.jpg`) para garantir que a correção manual não seja perdida ao reabrir o software.

### 1.4. Estratégia de Amostragem Estratificada (Variação de Negativos e Positivos)

A curadoria é dividida em duas missões complementares: Negativos (Baias Vazias) e Positivos (Hard Positives). O objetivo é garantir que o modelo lide bem com a variabilidade do ambiente:

**Foco da Curadoria (Negative Mining):**

| Categoria | ID | Meta | Foco Principal (Negativos) |
| --- | --- | --- | --- |
| **Transição/Sombras** | 1 | 300 | **Hard Negatives:** Sombras longas, luz oblíqua (nascer/pôr do sol). |
| **Dia Claro** | 2 | 400 | Cenários com luz natural e alta definição. |
| **Noturno (IR)** | 3 | 300 | Cenários em P&B, com ruído e iluminação infravermelha. |

**Foco da Curadoria (Positive Mining/Safety):** Cavalos e/ou Pessoas em poses atípicas, oclusão, baixa luz e transições. A meta total é 1000 frames, seguindo a distribuição por categoria acima.

## II. Estrutura de Diretórios e Configuração

### 2.1. Estrutura do Projeto

```
equihealth_local/
├── code/
│   ├── curadoria/        (<- Local dos scripts de execução)
│       ├── `catalog_splitter.py`
│       ├── `negative_miner.py`
│       ├── `safety_miner.py`     (<- Minerador de Positivos)
│       └── `README.md`     (README do minerador de negativos)
│   ├── metadata/
│       └── `video_split_master.csv` (<- Catálogo Mestre)
│   └── aws_scripts/
├── temp_curated_data/
│   ├── negatives/        (<- Destino final dos frames Negativos)
│   └── safety/           (<- Destino dos frames Positivos/Anotações)
└── `README.md`           (<- README do projeto - ainda não existe.)

```

### 2.2. Configuração do Ambiente (VS Code)

Instale as dependências no ambiente virtual (`.venv`):

```
# Navegue para a raiz do projeto e ative o .venv
cd equihealth_local
.venv\Scripts\Activate

# Instale as dependências
pip install opencv-python

```

## III. Fluxo de Trabalho (Três Etapas Mandatórias)

### Passo 1: Catalogação Mestra (`catalog_splitter.py`)

**OBJETIVO:** Gerar o mapa `video_split_master.csv` que define o Pool de TRAIN e VAL/TEST para todo o acervo de 2.3 TB.

1. **Verifique o `SOURCE_PATH`** (o caminho absoluto para o Google Drive) em `code/curadoria/catalog_splitter.py`.
2. **Execute:** `python code/curadoria/catalog_splitter.py`
3. **Resultado:** O arquivo `code/metadata/video_split_master.csv` será criado.

### Passo 2: Mineração de Negativos (`negative_miner.py`)

**OBJETIVO:** Curadoria eficiente de frames de "Baias Vazias" usando apenas o set de **TRAIN** e os filtros de horário.

1. **Certifique-se de que o CSV (Passo 1) foi gerado.**
2. **Execute:** `python code/curadoria/negative_miner.py`
3. **Seleção de Missão:** O script pedirá a escolha da missão (1, 2, 3 ou 4).

| Tecla | Função | Justificativa |
| --- | --- | --- |
| **D/A** | **Avançar/Voltar 60s** | Salto rápido. Bloqueado se o timestamp de destino já foi salvo. |
| **Z** | **Voltar 5s** | **Ajuste fino** para cravar o frame exato. |
| **S** | **Salvar Padrão** | Salva na Missão que o vídeo pertence (Baseado no horário do metadado). |
| **Y** | **Salvar DIA** | **Override:** Salva como `_m2` (Dia Claro), **IGNORANDO** o horário do vídeo. |
| **T** | **Salvar TRANSICAO** | **Override:** Salva como `_m1` (Transição), **IGNORANDO** o horário do vídeo. |
| **N** | **Salvar NOITE** | **Override:** Salva como `_m3` (Noite), **IGNORANDO** o horário do vídeo. |
| **Espaço** | **Próximo Vídeo** | Pula vídeos inúteis. |
| **ESC** | **Sair** | Encerra o programa. |

### Passo 3: Mineração de Positivos (`safety_miner.py`)

**OBJETIVO:** Curadoria eficiente de frames de **Hard Positives (Cavalos e/ou Pessoas)**, focando em oclusão, poses atípicas e condições de luz difíceis (Dia/Noite/IR/Transição).

**Restrição Crítica Adicional:** O `safety_miner.py` **LÊ** o cache de segundos salvos na pasta `negatives/` e **BLOQUEIA** o salvamento em qualquer *timestamp* que já tenha sido classificado como Negativo (Exclusão Mútua).

1. **Certifique-se de que o CSV (Passo 1) foi gerado.**
2. **Execute:** `python code/curadoria/safety_miner.py`
3. **Seleção de Missão:** O script pedirá a escolha da missão (1, 2, 3 ou 4) para focar na categoria de iluminação desejada. **Os controles de teclado são idênticos aos do Minerador de Negativos (incluindo o ajuste fino X/Z e o Override Manual).**