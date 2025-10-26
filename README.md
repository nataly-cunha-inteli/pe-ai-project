![PE.ai Banner](docs/static/img/banner.png)

#  🟠PE.ai (Inteligência para Planos Educacionais Individualizados)

Projeto de resolução do Hackathon Devs de Impacto, com solução focada em impacto tecnológico com Inteligência Artificial.

- **Acesse a documentação completa disponível em:** [https://nataly-cunha-inteli.github.io/pe-ai-project/](https://nataly-cunha-inteli.github.io/pe-ai-project/)

- **Acesse a solução desenvolvida em:** [link](link)

## Sobre o Projeto

O **PE.AI** é uma plataforma de inteligência artificial que democratiza a criação de Planos Educacionais Individualizados (PEI) no Brasil. Desenvolvido durante o Hackathon Devs de Impacto, o projeto transforma um processo burocrático de **10-18 semanas em apenas 5-8 dias**, utilizando um sistema multiagente que automatiza a coleta de informações, geração de documentos e adaptação de materiais didáticos.

A solução atende **1,7 milhões de alunos com necessidades educacionais especiais** (Censo Escolar INEP, 2024), combatendo a crise silenciosa onde **45,5% estudam em escolas sem Atendimento Educacional Especializado** (Instituto Pensi, 2025) e **568 municípios brasileiros** não oferecem qualquer suporte especializado.

## Impacto

O PE.AI reduz **85-92% do tempo** de elaboração de PEIs e proporciona uma economia de **R$ 10 milhões** ao sistema público brasileiro em 3 anos. Mais do que eficiência: transforma o PEI de privilégio inacessível em direito garantido, conectando coordenadores, famílias e profissionais em um único fluxo onde a IA amplifica a capacidade humana de promover educação de qualidade para todos.

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.10+** - Linguagem principal para agentes de IA
- **FastAPI** - Framework assíncrono de alta performance para API REST
- **LangGraph + LangChain** - Orquestração de agentes multiagente e gerenciamento de estados complexos
- **Gemini API** (gemini-2.5-flash) - Modelo de linguagem para PEI Generator e Material Adapter
- **SQLAlchemy** - ORM para banco de dados
- **SQLite** (MVP) / **PostgreSQL** (Produção) - Banco de dados relacional
- **PyPDF2/PDFPlumber** - Extração e processamento de PDFs
- **Twilio API** - Envio massivo de SMS com rastreamento de entrega

## 🚀 Como Rodar o Projeto

### ⚡ Pré-requisitos

Certifique-se de ter instalado:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **Git** para clonar o repositório

### 📦 1. Em uma pasta desejada, clone e prepare o projeto

```bash
# Clone o repositório
git clone https://github.com/nataly-cunha-inteli/pe-ai-project.git
cd pe-ai-project

```

### 🐍 2. Configure o Backend (API Python)

**Terminal 1 (Backend):**
```bash
# Navegue para o backend e crie ambiente virtual
cd backend
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Execute o servidor
python main.py
```

✅ **Backend rodando em**: `http://localhost:8000`

### ⚛️ 3. Configure o Frontend (React)

**Terminal 2 (Frontend):**
```bash
# Na pasta raiz do projeto, instale as dependências
npm install

# Execute o app em modo desenvolvimento
npm run dev
```

**Acesse pelo navegador:**
- API: `http://localhost:8000/`
- Interface web: `http://localhost:8080`

### 🔧 Troubleshooting

**Problema comum - Porta ocupada:**
```bash
# Matar processo na porta 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

**Erro de dependências Python:**
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```


## 👤 Usuários para Teste

Na tela inicial de login, ao clicar em **"Criar conta"**, pode-se criar um usuário para testagem do sistema. Seus dados de login devem ser lembrados, pois serão necessários para fazer login corretamente.

### 🎮 Fluxo de Teste Sugerido

1. **Crie um usuário e faça login**
2. **Na visão geral, clique em "Criar novo PEI**
3. **Crie um PEI de um novo aluno, siga os passos de preenchimento, adicionando dados de 3 participantes que responderão o Questionário de Plano Educacional Individualizado do aluno**
4. **Volte para a Dashboard**
5. **Visualize o novo PEI que você criou na seção "PEI's recentes", com status de "Em coleta"**
6. **Clique na página "🧪 Testar formulário" na barra de navegação superior**
7. **Selecione o PEI que você criou e insira respostas de todos os participantes que você inseriu. Caso deseje agilizar a testagem, para cada profissional, clique no botão "Preencher com Dados de Exemplo", o qual insere dados de exemplo nos campos do questionário.**
8. **Clique em "Voltar"**
9. **Acesse a página "PEIs"**
10. **Visualize o progresso de processamento do seu PEI em coleta, e acesse se desejado. Quando o processamento é concluído, o status altera de "Em coleta" para "Concluído"**
11. **Clique no símbolo de 👁️ para visualizar o PEI**
12. **Clique em "Enviar para Auditor". Isso simulará a aprovação do PEI por um auditor externo.**
13. **Clique em "Alunos", na barra de navegação superior.**
14. **Observe que o aluno para o qual o PEI foi aprovado, surge botões de "Gerar aula" e "Ver PEI**
15. **Clique em "Gerar aula"**
16. **Simule a adaptação de um material didático ao fazer o upload de um documento pdf**
17. **Aguarde o processamento do download, e baixe o arquivo na lista de "Materiais adaptados"**

## 📱 Funcionalidades gerais da plataforma

### 🏠 Dashboard Principal
Navegação com seções principais:

| Seção | O que faz |
|-------|-----------|
| **📊 Painel** | Visão geral de PEIs, alunos e métricas |
| **👥 Alunos** | Lista e detalhes de alunos cadastrados |
| **📝 PEIs** | Gerenciamento de Planos Educacionais |

### 🤖 Funcionalidades Inteligentes

**Workflow Orchestrator:**
- Disparo automático de SMS para responsáveis
- Lembretes inteligentes após 48h
- Consolidação de respostas em tempo real
- Taxa de resposta: 95% em 7 dias

**PEI Generator:**
- Geração baseada em LLM (GPT-4)
- Conformidade com LBI (Lei 13.146/2015)
- Estrutura: diagnóstico, metas, estratégias, avaliação
- Tempo: 5-8 dias (vs 10-18 semanas manual)

**Material Adapter:**
- Adaptação de PDFs, slides, textos
- Ajustes para diferentes necessidades (visual, auditiva, cognitiva)
- Biblioteca de templates acessíveis
- Tempo: 5 minutos (vs 2-3 horas manual)

## 🎯 Casos de Uso Reais

### 🏫 **Escolas Particulares**
- Automatização completa do processo de PEI
- Redução de custos operacionais
- Conformidade com legislação
- Garantia de inclusão para uma escola pública (modelo 1:1)

### 🏛️ **Redes Públicas de Ensino**
- Acesso gratuito via parceria com escolas particulares
- Capacitação de coordenadores pedagógicos
- Padronização de processos entre unidades
- Redução de sobrecarga administrativa

### 👨‍👩‍👧 **Famílias**
- Participação ativa via SMS (não precisa app)
- Acompanhamento do desenvolvimento do filho
- Transparência no plano educacional
- Canal direto com escola

### 👩‍🏫 **Profissionais de AEE**
- Centralização de informações do aluno
- Sugestões de adaptações baseadas em IA
- Biblioteca de recursos prontos
- Colaboração com equipe multidisciplinar

## 📊 Métricas de Impacto

- **85-92%** redução no tempo de criação de PEIs
- **95%** taxa de resposta em workflows SMS
- **R$ 10 milhões** economia projetada em 3 anos
- **1,7 milhões** potencial de alunos beneficiados
- **2-3 horas → 5 minutos** adaptação de materiais
- **Modelo 1:1:** Cada escola particular que assina garante acesso gratuito para uma escola pública


