
![PE.ai Banner](docs/static/img/banner.png)

# 🟠 PE.ai — Inteligência para Planos Educacionais Individualizados

Projeto desenvolvido para o **Hackathon Devs de Impacto**, com foco em impacto social e tecnológico por meio de Inteligência Artificial aplicada à educação inclusiva.

- **🌐 Acesse a solução em produção:** [https://pe-ai-frontend.onrender.com/](https://pe-ai-frontend.onrender.com/)
- **📘 Acesse a documentação completa:** [https://nataly-cunha-inteli.github.io/pe-ai-project/](https://nataly-cunha-inteli.github.io/pe-ai-project/)

---

## 🧠 Sobre o Projeto

O **PE.AI** é uma plataforma de inteligência artificial que democratiza a criação de **Planos Educacionais Individualizados (PEI)** no Brasil.  
Desenvolvido durante o Hackathon Devs de Impacto, o projeto transforma um processo burocrático de **10–18 semanas em apenas 5–8 dias**, utilizando um sistema **multiagente** que automatiza a coleta de informações, geração de documentos e adaptação de materiais didáticos.

A solução atende **1,7 milhão de alunos com necessidades educacionais especiais** (Censo Escolar INEP, 2024), combatendo uma crise silenciosa:  
- **45,5%** estudam em escolas sem Atendimento Educacional Especializado (Instituto Pensi, 2025);  
- **568 municípios brasileiros** não oferecem suporte especializado.

---

## 💥 Impacto

O PE.AI reduz **85–92% do tempo** de elaboração de PEIs e gera uma economia de **R$ 10 milhões** ao sistema público brasileiro em 3 anos.  
Mais do que eficiência, garante **educação como direito**, conectando coordenadores, famílias e profissionais em um único fluxo, no qual a IA **amplifica a capacidade humana** de promover inclusão educacional de qualidade.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.10+** — Linguagem principal para agentes de IA  
- **FastAPI** — Framework assíncrono de alta performance para APIs REST  
- **LangGraph + LangChain** — Orquestração de agentes e gerenciamento de estados complexos  
- **Gemini API (gemini-2.5-flash)** — Modelo de linguagem para PEI Generator e Material Adapter  
- **SQLAlchemy** — ORM para banco de dados  
- **SQLite (MVP)** / **PostgreSQL (Produção)** — Banco de dados relacional  
- **PyPDF2 / PDFPlumber** — Extração e processamento de PDFs  
- **Twilio API** — Envio de SMS com rastreamento de entrega  

---

## 🚀 Como Rodar o Projeto

### ⚡ Pré-requisitos

Certifique-se de ter instalado:
- **Python 3.10+** → [Download](https://www.python.org/downloads/)  
- **Node.js 18+** → [Download](https://nodejs.org/)  
- **PostgreSQL 14+** → [Download](https://www.postgresql.org/download/)  
- **Git** → para clonar o repositório  

---

### 📦 1. Clone e prepare o projeto

```bash
git clone https://github.com/nataly-cunha-inteli/pe-ai-project.git
cd pe-ai-project
````

---

### 🐍 2. Configure o Backend (API Python)

**Terminal 1 (Backend):**

```bash
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

✅ **Backend rodando em:** [http://localhost:8000](http://localhost:8000)

---

### ⚛️ 3. Configure o Frontend (React)

**Terminal 2 (Frontend):**

```bash
npm install
npm run dev
```

**Acesse pelo navegador:**

* API → [http://localhost:8000](http://localhost:8000)
* Interface web → [http://localhost:8080](http://localhost:8080)

---

### 🔧 Troubleshooting

**Problema comum – Porta ocupada:**

```bash
# Windows
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

---

## 👤 Usuários para Teste

Na tela inicial, clique em **"Criar conta"** para gerar um usuário de teste.
Os dados de login deverão ser lembrados para acesso posterior.

---

## 🎮 Fluxo de Teste Sugerido

1. Crie um usuário e faça login
2. Clique em **“Criar novo PEI”**
3. Preencha os dados do aluno e adicione os 3 participantes (professor, responsável, especialista)
4. Vá para **“🧪 Testar formulário”** e selecione o PEI
5. Clique em **“Preencher com Dados de Exemplo”**
6. Envie as respostas e volte para a Dashboard
7. Acompanhe o status do PEI: “Em coleta” → “Concluído”
8. Clique em 👁️ para visualizar o PEI e simule o envio para auditor
9. Vá até “Alunos” e gere uma **aula adaptada**
10. Faça upload de um PDF e baixe o **material adaptado** gerado pela IA

---

## 📱 Funcionalidades Principais

| Seção         | Função                                   |
| ------------- | ---------------------------------------- |
| **📊 Painel** | Visão geral de PEIs, alunos e métricas   |
| **👥 Alunos** | Lista e detalhes de alunos cadastrados   |
| **📝 PEIs**   | Criação, coleta e acompanhamento de PEIs |

### 🤖 Módulos Inteligentes

**Workflow Orchestrator**

* Disparo automático de SMS e lembretes
* Consolidação de respostas em tempo real
* Taxa média de resposta: **95% em 7 dias**

**PEI Generator**

* Geração automática com LLM (Gemini)
* Conformidade com **LBI (Lei 13.146/2015)**
* Estrutura completa: diagnóstico, metas, estratégias, avaliação

**Material Adapter**

* Adaptação automática de PDFs, slides e textos
* Inclusão de diferentes tipos de acessibilidade (visual, auditiva, cognitiva)
* Redução de 2–3h para 5min no tempo de adaptação

---

## 🎯 Casos de Uso

### 🏫 **Escolas Particulares**

* Automatização completa do processo
* Redução de custos operacionais
* Garantia de inclusão em escolas públicas via modelo 1:1

### 🏛️ **Redes Públicas**

* Parcerias gratuitas com escolas particulares
* Padronização entre unidades e capacitação de coordenadores

### 👨‍👩‍👧 **Famílias**

* Acompanhamento via SMS
* Transparência e engajamento familiar

### 👩‍🏫 **Profissionais de AEE**

* Sugestões automáticas de adaptação
* Biblioteca de recursos acessíveis

---

## 📊 Métricas de Impacto

| Indicador               | Resultado                   |
| ----------------------- | --------------------------- |
| Redução no tempo de PEI | **85–92%**                  |
| Taxa de resposta        | **95%**                     |
| Economia pública        | **R$ 10 milhões em 3 anos** |
| Alunos beneficiados     | **1,7 milhão**              |
| Tempo de adaptação      | **5 min (vs 3h)**           |
| Modelo de inclusão      | **1:1 (pública/privada)**   |

---

## 👩‍💻 Equipe

| Nome                            | E-mail                                                                      |
| ------------------------------- | --------------------------------------------------------------------------- |
| **Cecília Beatriz Melo Galvão** | [cecilia.galvao@sou.inteli.edu.br](mailto:cecilia.galvao@sou.inteli.edu.br) |
| **Nataly de Souza Cunha**       | [nataly.cunha@sou.inteli.edu.br](mailto:nataly.cunha@sou.inteli.edu.br)     |
| **Pablo de Azevedo**            | [pablo.azevedo@sou.inteli.edu.br](mailto:pablo.azevedo@sou.inteli.edu.br)   |

---

## 🧾 Licença

Este projeto é licenciado sob a **MIT License** — veja o arquivo [LICENSE](LICENSE) para mais detalhes.
Você é livre para usar, modificar e distribuir o código, desde que mantenha os créditos à equipe original.

---

## 💬 Boas Práticas de Commits

O projeto segue o padrão **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)**.
Use os prefixos abaixo para manter histórico limpo e compreensível:

| Tipo        | Descrição                                  |
| ----------- | ------------------------------------------ |
| `feat:`     | Nova funcionalidade                        |
| `fix:`      | Correção de bug                            |
| `docs:`     | Alterações na documentação                 |
| `style:`    | Ajustes de formatação e estilo             |
| `refactor:` | Refatoração sem mudança de comportamento   |
| `test:`     | Adição ou ajuste de testes                 |
| `chore:`    | Tarefas de manutenção, build, dependências |

**Exemplo:**

```bash
git commit -m "feat(api): adicionar endpoint para geração automática de PEI"
```

---

© 2025 — Desenvolvido com 💛 por Cecília, Nataly e Pablo no **Hackathon Devs de Impacto**.


