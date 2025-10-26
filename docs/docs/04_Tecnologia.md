---
sidebar_position: 4
slug: /hackathon-peai/tecnologia
description: "Stack técnico e arquitetura"
---

# Stack Técnico

## 🏗️ Arquitetura Simplificada

```
┌─────────────────────────────────────────┐
│         INTERFACE WEB (Next.js)          │
│  Coordenador | Professor | Auditor       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         API Backend (FastAPI)            │
│  Autenticação | Fluxos | Lógica         │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────────┐
│  AGENTES IA    │  │  SERVIÇOS           │
│  LangChain     │  │  SMS (Twilio)       │
│  GPT-4, Claude │  │  PDF (PyPDF2)       │
│  LangGraph     │  │  Storage (AWS S3)   │
└───────┬────────┘  └──────┬──────────────┘
        │                  │
┌───────▼──────────────────▼──────────────┐
│         BANCO DE DADOS                   │
│  PostgreSQL | Redis | Chroma             │
└──────────────────────────────────────────┘
```

## 💻 Stack Detalhado

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18 + Tailwind CSS
- **Estado:** Zustand
- **Forms:** React Hook Form + Zod

### **Backend**
- **Framework:** FastAPI (Python 3.11)
- **Autenticação:** JWT + OAuth2
- **Permissões:** RBAC (Role-Based Access Control)
- **Tasks Assíncronas:** Celery + Redis

### **Inteligência Artificial**
- **Orquestração:** LangChain + LangGraph
- **LLMs:** 
  - GPT-4 (Geração de PEI)
  - Claude 3 Opus (Adaptação de materiais)
- **Embeddings:** OpenAI text-embedding-3-large
- **Vector DB:** Chroma (dev) / Pinecone (prod)

### **Serviços**
- **SMS:** Twilio API
- **PDF:** PyPDF2 + ReportLab
- **Storage:** AWS S3
- **Email:** SendGrid

### **Banco de Dados**
- **Relacional:** PostgreSQL 15
- **Cache:** Redis 7
- **Vetorial:** Chroma/Pinecone

### **DevOps**
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoramento:** Sentry + DataDog
- **Logs:** ELK Stack

## 🔄 Fluxo Técnico dos Agentes

### **1. Agente Gerador de PEI**

```python
# Pseudocódigo simplificado
def gerar_pei(respostas_profissionais):
    # 1. Análise contextual
    contexto = analisar_respostas(respostas_profissionais)
    
    # 2. Síntese com IA
    prompt = criar_prompt_estruturado(contexto)
    pei_draft = gpt4.complete(prompt)
    
    # 3. Validação e rastreabilidade
    pei_validado = validar_conformidade_lbi(pei_draft)
    pei_final = adicionar_referencias(pei_validado, respostas_profissionais)
    
    return pei_final
```

### **2. Agente Adaptador de Materiais**

```python
# Pseudocódigo simplificado
def adaptar_material(arquivo, pei_aluno):
    # 1. Extração de conteúdo
    conteudo = extrair_texto(arquivo)
    
    # 2. Análise de complexidade
    nivel = analisar_complexidade(conteudo)
    
    # 3. Geração de adaptações
    estrategias = extrair_estrategias(pei_aluno)
    conteudo_adaptado = claude3.adapt(conteudo, estrategias)
    
    # 4. Geração de novo documento
    documento = gerar_pdf(conteudo_adaptado)
    
    return documento
```

### **3. Agente Orquestrador**

```python
# Pseudocódigo simplificado
def orquestrar_workflow(etapa_atual, dados):
    if etapa_atual == "coleta":
        enviar_sms_profissionais(dados)
        monitorar_respostas()
    
    elif etapa_atual == "geracao":
        pei = gerar_pei(dados)
        notificar_auditor(pei)
    
    elif etapa_atual == "adaptacao":
        material = adaptar_material(dados)
        notificar_professor(material)
    
    return proxima_etapa
```

## 📦 Estrutura do Repositório

```
peai/
├── frontend/           # Next.js app
│   ├── app/           # App router
│   ├── components/    # React components
│   └── lib/           # Utilities
├── backend/           # FastAPI app
│   ├── api/           # Endpoints
│   ├── agents/        # IA agents
│   ├── services/      # Business logic
│   └── models/        # Database models
├── docs/              # Documentação
├── docker/            # Docker configs
└── tests/             # Testes automatizados
```

## 🚀 Deploy e Escalabilidade

### **Infraestrutura Atual (MVP)**
- **Hosting:** AWS EC2 (t3.medium)
- **Database:** AWS RDS PostgreSQL
- **Storage:** AWS S3
- **Cache:** AWS ElastiCache Redis

### **Escalabilidade Futura**
- **Load Balancer** AWS ALB
- **Auto-scaling** baseado em demanda
- **CDN** CloudFront para assets
- **Multi-region** para alta disponibilidade

## 🔒 Segurança Implementada

- ✅ HTTPS obrigatório (SSL/TLS)
- ✅ Criptografia AES-256 em repouso
- ✅ Rate limiting por IP
- ✅ Sanitização de inputs
- ✅ CORS configurado
- ✅ Headers de segurança (HSTS, CSP)
- ✅ Secrets em variáveis de ambiente
- ✅ Logs de auditoria imutáveis

## 📊 Performance

- ⚡ **Tempo de resposta API:** < 200ms (95th percentile)
- ⚡ **Geração de PEI:** 3-5 minutos
- ⚡ **Adaptação de material:** 30-60 segundos
- ⚡ **Uptime:** 99.9% SLA
