---
sidebar_position: 7
slug: /hackathon-peai/roadmap
description: "Roadmap de Implementação"
---

# Roadmap de Implementação

## Estado Atual: O Que Funciona no MVP

:::tip[Entregáveis do Hackathon]
**Backend funcional** (FastAPI + SQLite) com API REST documentada  
**Workflow Orchestrator** implementado com LangGraph  
**PEI Generator Agent** gerando documentos baseados em templates  
**Dashboard do coordenador** (React + Tailwind) com gestão de alunos  
**Fluxo completo:** Criação de PEI → Envio de SMS → Visualização de status  
**Demonstração end-to-end** de 1 caso de uso completo
:::

## Gaps Críticos Identificados

### 1. Interface de Coleta para Respondentes

**Gap:** Respondentes recebem SMS mas não há interface finalizada para preenchimento dos questionários.

**Solução (Mês 1):**
- Formulário mobile-first com perguntas condicionais
- Progresso visual e salvamento automático
- Acessibilidade WCAG 2.1

### 2. Formatação e Exportação do PEI

**Gap:** PEI gerado em texto simples sem estrutura profissional.

**Solução (Mês 2):**
- Exportação em PDF estruturado com logo da escola
- Assinatura digital do coordenador
- Conformidade visual com LBI e BNCC

### 3. Expansão para Outras NEEs

**Gap:** MVP testado apenas com TDAH e Dislexia.

**Solução (Meses 3-6):**

| Fase | NEE Incluída | Prazo |
|------|--------------|-------|
| Fase 2 | TEA + Deficiência Intelectual | Mês 3-4 |
| Fase 3 | Deficiências Sensoriais (LIBRAS, audiodescrição) | Mês 5-6 |
| Fase 4 | Deficiências Físicas | Mês 7-8 |
| Fase 5 | Deficiências Múltiplas | Mês 9-12 |

### 4. Integração com WhatsApp

**Gap:** MVP usa apenas SMS, excluindo regiões com baixo sinal.

**Solução (Mês 4):**
- WhatsApp Business API via Twilio
- Fallback automático: WhatsApp → SMS → E-mail
- Redução de custo de R$ 0,10 para R$ 0,03 por mensagem

### 5. Segurança e Conformidade LGPD

**Gap:** Dados sensíveis sem criptografia em repouso.

**Solução (Mês 2-3):**
- Criptografia AES-256 para laudos e diagnósticos
- Logs de auditoria completos
- Política de retenção: 5 anos após conclusão do Ensino Médio
- Termo de consentimento LGPD no cadastro
- Direito ao esquecimento implementado

### 6. Piloto em Escolas Modelo

**Gap:** MVP não testado com usuários reais.

**Solução (Mês 2-3):**

| Escola | Tipo | Localização | Alunos NEE |
|--------|------|-------------|------------|
| Escola A | Particular | São Paulo - SP | 8 |
| Escola B | Particular | Campinas - SP | 5 |
| Escola C | Municipal | São Paulo - SP | 12 |
| Escola D | Municipal | Diadema - SP | 10 |
| Escola E | Estadual | Guarulhos - SP | 15 |

**Protocolo:**
1. Treinamento de 2h com coordenadores
2. Criação de 5 PEIs por escola no primeiro mês
3. Entrevistas semanais para coleta de feedback
4. Ajustes prioritários baseados em feedbacks

**Métricas de Sucesso:**
- Taxa de resposta maior que 85%
- Tempo médio menor que 7 dias
- NPS maior que 50

## Cronograma Consolidado (12 Meses)

| Período | Entregas |
|---------|----------|
| **Mês 1** | Interface respondentes + Testes usabilidade |
| **Mês 2** | Formatação PDF + Segurança LGPD + Início piloto 5 escolas |
| **Mês 3** | Ajustes pós-piloto + TEA/Def. Intelectual |
| **Mês 4** | WhatsApp Business + Expansão para 50 escolas |
| **Mês 5-6** | Deficiências Sensoriais (LIBRAS) |
| **Mês 7-8** | Deficiências Físicas |
| **Mês 9-12** | Deficiências Múltiplas + Integração Secretarias de Educação |

## Marcos Principais

**Mês 2:** Interface completa + Piloto em 5 escolas  
**Mês 3:** Conformidade LGPD + Exportação PDF profissional  
**Mês 6:** Cobertura de 80% dos tipos de NEE  
**Mês 12:** 50 escolas ativas + Submissão editais FINEP/FAPESP

**De protótipo para produto. De impacto local para sistêmico.**