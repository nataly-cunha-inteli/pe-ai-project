# =====================================================
# PE.AI — Sistema Multiagente para PEI
# =====================================================

import os
import json
import textwrap
from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# ----------------- Config Gemini -----------------
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("Defina GOOGLE_API_KEY no seu .env")
genai.configure(api_key=GOOGLE_API_KEY)

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

def _make_model(system_instruction: str):
    return genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=system_instruction
    )

# =====================================================
# Funções utilitárias
# =====================================================

def _clean_json_text(txt: str) -> dict:
    """Faz parse robusto de JSON vindo do modelo."""
    try:
        return json.loads(txt)
    except Exception:
        s, e = txt.find("{"), txt.rfind("}")
        if s != -1 and e != -1:
            return json.loads(txt[s:e+1])
        raise ValueError("Não foi possível parsear JSON da resposta do modelo.")

def llm_json(user_prompt: str, system: str) -> dict:
    """
    Chama o Gemini e retorna SEMPRE dict.
    """
    model = _make_model(system_instruction=system)
    prompt = (
        user_prompt
        + "\n\nIMPORTANTE: Responda ESTRITAMENTE em JSON válido. Sem explicações fora do JSON."
    )
    resp = model.generate_content(prompt)
    text = getattr(resp, "text", None)
    if not text:
        try:
            text = "".join([p.text for p in resp.candidates[0].content.parts])
        except Exception:
            raise RuntimeError("Resposta vazia do Gemini.")
    return _clean_json_text(text)

def pretty(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2)

# =====================================================
# Definições de Dados
# =====================================================

@dataclass
class StudentInfo:
    """Informações básicas do aluno"""
    name: str
    birth_date: str
    grade: str
    special_needs: List[str]
    has_diagnosis: bool

@dataclass
class ProfessionalResponse:
    """Resposta de um profissional"""
    professional_id: str
    professional_type: str  # psicologo, professor, pai, neurologista, etc
    professional_name: str
    responses: Dict[str, Any]
    timestamp: str

@dataclass
class PEIDocument:
    """Documento PEI completo"""
    student_identification: Dict[str, Any]
    detailed_report: Dict[str, Any]
    strengths: List[str]
    difficulties: List[str]
    educational_goals: Dict[str, List[str]]
    methodological_strategies: Dict[str, List[str]]
    assistive_resources: Dict[str, List[str]]
    evaluation_criteria: Dict[str, Any]
    confidence_score: int
    generated_at: str

# =====================================================
# AGENTE 1: PEI Generator
# =====================================================

class PEIGeneratorAgent:
    """
    Agente responsável por analisar respostas dos profissionais 
    e gerar o PEI provisório completo
    """
    
    SYSTEM_INSTRUCTION = textwrap.dedent("""
    Você é um especialista em educação especial e elaboração de Planos 
    Educacionais Individualizados (PEI) no Brasil.
    
    Sua expertise inclui:
    - Lei Brasileira de Inclusão (LBI - Lei 13.146/2015)
    - Diretrizes Nacionais para Educação Especial
    - Neuropsicologia educacional
    - Estratégias pedagógicas inclusivas
    - Tecnologias assistivas
    
    Você deve analisar as respostas de múltiplos profissionais (psicólogos, 
    professores, pais, terapeutas) e sintetizar um PEI completo, coerente 
    e alinhado com a legislação brasileira.
    """)
    
    SCHEMA = textwrap.dedent("""
    Responda APENAS em JSON com este formato:
    {
      "student_identification": {
        "name": "nome do aluno",
        "birth_date": "DD/MM/YYYY",
        "age": 15,
        "grade": "9º Ano",
        "special_needs": ["TEA Nível 1", "TDAH"]
      },
      "detailed_report": {
        "cognitive_development": "texto descritivo detalhado (3-4 parágrafos)",
        "attention_concentration": "texto descritivo detalhado (2-3 parágrafos)",
        "socioemotional": "texto descritivo detalhado (2-3 parágrafos)",
        "communication": "texto descritivo detalhado (2-3 parágrafos)",
        "sources": {
          "cognitive_development": ["Ana Costa (Psicóloga)", "Roberto Lima (Professor)"],
          "attention_concentration": ["Ana Costa (Psicóloga)", "Dr. Carlos (Neurologista)"],
          "socioemotional": ["Márcia Oliveira (Mãe)", "Paula Santos (Professora)"],
          "communication": ["Ana Costa (Psicóloga)", "Márcia Oliveira (Mãe)"]
        }
      },
      "strengths": [
        "Raciocínio lógico-matemático desenvolvido",
        "Excelente memória visual",
        "Facilidade com recursos tecnológicos",
        "Interesse acentuado em ciências",
        "Organização quando usa ferramentas visuais"
      ],
      "difficulties": [
        "Dificuldade em manter atenção prolongada",
        "Necessidade de instruções claras e objetivas",
        "Dificuldade com interpretação de texto",
        "Ansiedade em situações de avaliação",
        "Sensibilidade a ambientes ruidosos"
      ],
      "educational_goals": {
        "short_term": [
          "Desenvolver estratégias de autorregulação da atenção (3 meses)",
          "Melhorar compreensão de textos com apoio visual (3 meses)",
          "Ampliar tempo de concentração para 25-30 minutos (3 meses)"
        ],
        "medium_term": [
          "Aplicar técnicas de estudo de forma autônoma (6 meses)",
          "Participar ativamente de trabalhos em grupo (6 meses)",
          "Reduzir ansiedade em avaliações (6 meses)"
        ],
        "long_term": [
          "Alcançar independência acadêmica (12 meses)",
          "Concluir 9º ano com aproveitamento satisfatório (12 meses)"
        ]
      },
      "methodological_strategies": {
        "content_presentation": [
          "Uso prioritário de recursos visuais (slides, vídeos, infográficos)",
          "Mapas mentais e organizadores gráficos",
          "Exemplos concretos antes de conceitos abstratos",
          "Divisão do conteúdo em blocos de 15-20 minutos"
        ],
        "activities": [
          "Privilegiar atividades práticas e manipuláveis",
          "Uso de tecnologia educacional (apps, simuladores)",
          "Intervalos regulares (5 min a cada 20 min)"
        ],
        "environment": [
          "Preferência por ambientes silenciosos",
          "Permitir uso de fones de cancelamento de ruído",
          "Assento próximo ao professor, longe de distrações"
        ]
      },
      "assistive_resources": {
        "required": [
          "Timer visual para gestão de tempo",
          "Fones de cancelamento de ruído",
          "Software de mapas mentais",
          "Checklist visual para rotinas"
        ],
        "recommended": [
          "Tablet para anotações e organização",
          "Apps de leitura com text-to-speech",
          "Gravador de áudio para revisão de aulas"
        ]
      },
      "evaluation_criteria": {
        "adaptations": [
          "Tempo adicional: +50% do tempo regular",
          "Provas em ambiente separado e silencioso",
          "Avaliações divididas em etapas menores",
          "Uso de recursos visuais nas questões",
          "Possibilidade de resposta oral quando necessário"
        ],
        "diversified_instruments": {
          "practical_projects": 30,
          "visual_presentations": 20,
          "classroom_activities": 30,
          "adapted_tests": 20
        },
        "evaluation_focus": "Avaliar o processo de aprendizagem e evolução do aluno, não apenas o resultado final. Considerar o esforço, participação e aplicação das estratégias aprendidas."
      },
      "confidence_score": 95,
      "warnings": [
        "Verificar objetivos de prazo médio com equipe pedagógica",
        "Considerar adicionar indicadores mensuráveis para acompanhamento"
      ],
      "suggestions": [
        "Avaliar necessidade de acompanhamento psicopedagógico adicional",
        "Considerar implementação gradual das estratégias"
      ]
    }
    """)
    
    @staticmethod
    def run(
        student: StudentInfo,
        responses: List[ProfessionalResponse]
    ) -> PEIDocument:
        """
        Gera PEI completo baseado nas respostas dos profissionais
        """
        
        # Preparar contexto das respostas
        responses_text = "\n\n".join([
            f"=== {r.professional_type.upper()} - {r.professional_name} ===\n"
            f"Timestamp: {r.timestamp}\n"
            f"Respostas:\n{pretty(r.responses)}"
            for r in responses
        ])
        
        prompt = f"""
        Analise cuidadosamente as respostas de {len(responses)} profissionais sobre o aluno
        e gere um Plano Educacional Individualizado (PEI) completo, seguindo ESTRITAMENTE o SCHEMA.
        
        === INFORMAÇÕES DO ALUNO ===
        Nome: {student.name}
        Data de Nascimento: {student.birth_date}
        Série: {student.grade}
        Necessidades Especiais: {', '.join(student.special_needs)}
        Possui Laudo: {'Sim' if student.has_diagnosis else 'Não'}
        
        === RESPOSTAS DOS PROFISSIONAIS ===
        {responses_text}
        
        === INSTRUÇÕES IMPORTANTES ===
        1. Identifique padrões e convergências nas respostas
        2. Sintetize informações de forma coerente e objetiva
        3. Base suas recomendações na LBI (Lei 13.146/2015)
        4. Use linguagem clara e acessível para educadores
        5. Seja específico e prático nas estratégias
        6. Sempre cite a fonte (profissional) das informações
        7. Calcule confidence_score baseado em:
           - Completude das respostas (40%)
           - Convergência entre profissionais (30%)
           - Especificidade das informações (30%)
        
        {PEIGeneratorAgent.SCHEMA}
        """
        
        result = llm_json(prompt, system=PEIGeneratorAgent.SYSTEM_INSTRUCTION)
        
        return PEIDocument(
            student_identification=result["student_identification"],
            detailed_report=result["detailed_report"],
            strengths=result["strengths"],
            difficulties=result["difficulties"],
            educational_goals=result["educational_goals"],
            methodological_strategies=result["methodological_strategies"],
            assistive_resources=result["assistive_resources"],
            evaluation_criteria=result["evaluation_criteria"],
            confidence_score=result["confidence_score"],
            generated_at=datetime.now().isoformat()
        )

# =====================================================
# AGENTE 2: Material Adapter
# =====================================================

class MaterialAdapterAgent:
    """
    Agente responsável por adaptar materiais didáticos baseado no PEI
    """
    
    SYSTEM_INSTRUCTION = textwrap.dedent("""
    Você é um especialista em adaptação de materiais pedagógicos para educação inclusiva.
    
    Sua expertise inclui:
    - Desenho Universal para Aprendizagem (DUA)
    - Adaptação curricular
    - Simplificação de linguagem
    - Criação de recursos visuais
    - Atividades práticas e manipuláveis
    - Estratégias multissensoriais
    
    Você deve transformar materiais didáticos padrão em versões adaptadas
    que atendam às necessidades específicas do aluno conforme seu PEI.
    """)
    
    SCHEMA = textwrap.dedent("""
    Responda APENAS em JSON com este formato, sem emojis ou markdown, apenas texto corrido puro:
    {
      "original_analysis": {
        "content_type": "teórico|prático|misto",
        "complexity_level": "baixo|médio|alto",
        "main_concepts": ["conceito1", "conceito2"],
        "learning_objectives": ["objetivo1", "objetivo2"],
        "estimated_time": 50
      },
      "adaptations_applied": [
        "Adicionado título visual com objetivo claro",
        "Criada analogia concreta para conceito abstrato",
        "Incluídos diagramas color-coded",
        "Dividido conteúdo em 3 blocos de 15-20 minutos",
        "Adicionadas pausas estratégicas",
        "Transformado exemplo teórico em atividade prática",
        "Linguagem simplificada e direta",
        "Ícones e emojis para orientação visual"
      ],
      "adapted_content_structure": {
        "title": "Título visual e objetivo claro",
        "introduction": {
          "hook": "Analogia ou exemplo concreto para engajar",
          "objective": "O que vamos aprender hoje (linguagem simples)"
        },
        "blocks": [
          {
            "block_number": 1,
            "duration_minutes": 15,
            "title": "Título do bloco",
            "content_type": "visual|prático|textual",
            "content": "Conteúdo adaptado do bloco",
            "visual_aids": ["diagrama1", "imagem2"],
            "activity": "Atividade prática opcional",
            "pause": "Momento de pausa (sim/não)"
          }
        ],
        "practice_activities": [
          {
            "title": "Nome da atividade",
            "type": "individual|grupo|manipulável",
            "duration_minutes": 10,
            "instructions": ["passo 1", "passo 2"],
            "materials_needed": ["material1", "material2"]
          }
        ],
        "summary": "Resumo visual dos pontos-chave",
        "evaluation_suggestion": "Forma de avaliar aprendizado adaptada ao aluno"
      },
      "pei_compatibility_score": 95,
      "compatibility_analysis": {
        "strengths_addressed": ["força1 do PEI explorada", "força2"],
        "needs_met": ["necessidade1 atendida", "necessidade2"],
        "strategies_applied": ["estratégia1 do PEI", "estratégia2"]
      },
      "teacher_notes": [
        "Nota importante 1 para o professor",
        "Nota importante 2",
        "Sugestão de implementação"
      ],
      "warnings": [
        "Testar primeiro em ambiente silencioso",
        "Observar sinais de fadiga do aluno"
      ]
    }
    """)
    
    @staticmethod
    def run(
        original_material_text: str,
        material_metadata: Dict[str, Any],
        pei_document: PEIDocument
    ) -> Dict[str, Any]:
        """
        Adapta material didático baseado no PEI do aluno
        """
        
        # Extrair informações relevantes do PEI
        pei_summary = {
            "special_needs": pei_document.student_identification["special_needs"],
            "strengths": pei_document.strengths,
            "difficulties": pei_document.difficulties,
            "methodological_strategies": pei_document.methodological_strategies,
            "evaluation_criteria": pei_document.evaluation_criteria
        }
        
        prompt = f"""
        Adapte o material didático abaixo para atender às necessidades específicas do aluno
        conforme seu PEI. Siga ESTRITAMENTE o SCHEMA.
        
        === MATERIAL ORIGINAL ===
        Título: {material_metadata.get('title', 'Sem título')}
        Disciplina: {material_metadata.get('subject', 'Não especificada')}
        Série: {material_metadata.get('grade', 'Não especificada')}
        
        Conteúdo:
        {original_material_text}
        
        === RESUMO DO PEI DO ALUNO ===
        {pretty(pei_summary)}
        
        === DIRETRIZES DE ADAPTAÇÃO ===
        1. VISUAL: Transformar conceitos abstratos em representações visuais
        2. PRÁTICO: Criar atividades hands-on sempre que possível
        3. BLOCOS CURTOS: Dividir em segmentos de 15-20 minutos
        4. PAUSAS: Incluir momentos estratégicos de intervalo
        5. LINGUAGEM: Simplificar sem perder rigor conceitual
        6. EXEMPLOS: Usar situações concretas e do cotidiano
        7. ORIENTAÇÃO: Adicionar ícones, cores, emojis para guiar
        8. INTERATIVIDADE: Transformar exposição em participação
        
        === TRANSFORMAÇÕES ESPERADAS ===
        - Texto denso → Título visual + objetivos claros
        - Definições abstratas → Analogias concretas
        - Fórmulas/conceitos → Diagramas color-coded
        - Exemplos teóricos → Atividades passo a passo
        - Blocos longos → Segmentos curtos com pausas
        - Apenas teoria → Teoria + prática integrada
        
        {MaterialAdapterAgent.SCHEMA}
        """
        
        result = llm_json(prompt, system=MaterialAdapterAgent.SYSTEM_INSTRUCTION)
        
        return {
            "status": "success",
            "original_metadata": material_metadata,
            "adaptation_result": result,
            "generated_at": datetime.now().isoformat()
        }

# =====================================================
# AGENTE 3: Workflow Orchestrator
# =====================================================

class WorkflowOrchestratorAgent:
    """
    Agente responsável por gerenciar o fluxo de trabalho,
    notificações e acompanhamento de status
    """
    
    SYSTEM_INSTRUCTION = textwrap.dedent("""
    Você é um gerente de projetos especializado em processos educacionais
    e gestão de PEIs (Planos Educacionais Individualizados).
    
    Sua responsabilidade é garantir que:
    - Todos os profissionais respondam no prazo
    - O PEI seja gerado assim que possível
    - Notificações sejam enviadas adequadamente
    - Status seja atualizado corretamente
    - Prazos sejam monitorados
    """)
    
    @staticmethod
    def check_completion_status(
        total_professionals: int,
        responses_received: List[ProfessionalResponse]
    ) -> Dict[str, Any]:
        """
        Verifica status de completude da coleta de dados
        """
        completed = len(responses_received)
        pending = total_professionals - completed
        percentage = (completed / total_professionals * 100) if total_professionals > 0 else 0
        
        return {
            "total": total_professionals,
            "completed": completed,
            "pending": pending,
            "percentage": round(percentage, 1),
            "is_complete": pending == 0,
            "status": "complete" if pending == 0 else "in_progress"
        }
    
    @staticmethod
    def generate_notification_message(
        notification_type: str,
        context: Dict[str, Any]
    ) -> str:
        """
        Gera mensagem de notificação apropriada
        """
        messages = {
            "sms_survey": f"""Olá {context['professional_name']}!

Você foi convidado(a) a participar da elaboração do PEI do aluno {context['student_name']}.

Acesse: {context['survey_link']}

Válido por 7 dias.

PE.AI - Educação Inclusiva""",
            
            "reminder_sms": f"""Lembrete: Sua contribuição para o PEI de {context['student_name']} ainda está pendente.

Acesse: {context['survey_link']}

Expira em {context['days_left']} dias.

PE.AI""",
            
            "pei_ready": f"""✨ PEI Provisório Gerado!

O PEI de {context['student_name']} foi gerado automaticamente pela IA.

Próximo passo: Encaminhar para revisão do auditor.

Acessar: {context['dashboard_link']}""",
            
            "pei_approved": f"""✅ PEI Aprovado!

O PEI de {context['student_name']} foi aprovado pelo auditor.

Válido até: {context['validity_date']}

Acessar: {context['dashboard_link']}""",
            
            "pei_expiring": f"""⚠️ PEI Próximo do Vencimento

O PEI de {context['student_name']} vence em {context['days_until_expiry']} dias.

Inicie novo processo de coleta em breve.

Acessar: {context['dashboard_link']}"""
        }
        
        return messages.get(notification_type, "Notificação do PE.AI")
    
    @staticmethod
    def calculate_validity_period(
        approval_date: datetime,
        period_months: int = 12
    ) -> Dict[str, Any]:
        """
        Calcula período de validade do PEI
        """
        expiry_date = approval_date + timedelta(days=period_months * 30)
        days_until_expiry = (expiry_date - datetime.now()).days
        
        status = "valid"
        if days_until_expiry <= 0:
            status = "expired"
        elif days_until_expiry <= 30:
            status = "expiring_soon"
        
        return {
            "approval_date": approval_date.isoformat(),
            "expiry_date": expiry_date.isoformat(),
            "days_until_expiry": days_until_expiry,
            "status": status,
            "needs_renewal": days_until_expiry <= 30
        }

# =====================================================
# Orquestrador Principal
# =====================================================

class PEAIOrchestrator:
    """
    Orquestrador principal que coordena todos os agentes
    """
    
    @staticmethod
    def generate_pei(
        student: StudentInfo,
        professional_responses: List[ProfessionalResponse]
    ) -> Dict[str, Any]:
        """
        Fluxo completo: coleta de respostas → geração de PEI
        """
        
        # Verificar se todas as respostas foram coletadas
        status = WorkflowOrchestratorAgent.check_completion_status(
            total_professionals=len(professional_responses),
            responses_received=professional_responses
        )
        
        if not status["is_complete"]:
            return {
                "status": "incomplete",
                "message": "Nem todos os profissionais responderam ainda",
                "completion_status": status
            }
        
        # Gerar PEI com o agente
        pei_document = PEIGeneratorAgent.run(student, professional_responses)
        
        return {
            "status": "success",
            "pei_document": {
                "student_identification": pei_document.student_identification,
                "detailed_report": pei_document.detailed_report,
                "strengths": pei_document.strengths,
                "difficulties": pei_document.difficulties,
                "educational_goals": pei_document.educational_goals,
                "methodological_strategies": pei_document.methodological_strategies,
                "assistive_resources": pei_document.assistive_resources,
                "evaluation_criteria": pei_document.evaluation_criteria,
                "confidence_score": pei_document.confidence_score,
                "generated_at": pei_document.generated_at
            },
            "completion_status": status
        }
    
    @staticmethod
    def adapt_material(
        material_text: str,
        material_metadata: Dict[str, Any],
        pei_document: PEIDocument
    ) -> Dict[str, Any]:
        """
        Fluxo: material original → material adaptado
        """
        
        adaptation = MaterialAdapterAgent.run(
            material_text,
            material_metadata,
            pei_document
        )
        
        return adaptation

# =====================================================
# CLI para Testes
# =====================================================

if __name__ == "__main__":
    print("\n=== PE.AI — Sistema Multiagente para PEI ===\n")
    
    # Exemplo de uso: Gerar PEI
    print("--- TESTE 1: Geração de PEI ---\n")
    
    # Dados do aluno
    student = StudentInfo(
        name="Pedro Oliveira",
        birth_date="15/03/2010",
        grade="9º Ano",
        special_needs=["TEA (Nível 1)", "TDAH"],
        has_diagnosis=True
    )
    
    # Simular respostas de profissionais
    responses = [
        ProfessionalResponse(
            professional_id="prof_001",
            professional_type="psicologo",
            professional_name="Ana Costa",
            responses={
                "cognitive_development": "Pedro apresenta QI na média (95), com pico em raciocínio espacial. Dificuldade com abstrações.",
                "attention_concentration": "Mantém foco por 15-20 minutos. Atividades manipuláveis estendem para 30-35 min.",
                "learning_style": "Visual e cinestésico. Responde bem a diagramas e experimentos práticos."
            },
            timestamp=datetime.now().isoformat()
        ),
        ProfessionalResponse(
            professional_id="prof_002",
            professional_type="professor",
            professional_name="Roberto Lima",
            responses={
                "classroom_performance": "Excelente em matemática quando usa recursos visuais. Dificuldade com interpretação de texto.",
                "social_interaction": "Prefere trabalhar individualmente, mas aceita grupos pequenos (2-3 alunos).",
                "strategies_that_work": "Mapas mentais, exemplos práticos, divisão de tarefas em etapas."
            },
            timestamp=datetime.now().isoformat()
        ),
        ProfessionalResponse(
            professional_id="prof_003",
            professional_type="responsavel",
            professional_name="Márcia Oliveira",
            responses={
                "home_behavior": "Organizado quando tem checklist visual. Ansioso antes de provas.",
                "interests": "Astronomia, jogos de lógica, tecnologia.",
                "challenges": "Barulho o deixa muito irritado. Precisa de rotina estruturada."
            },
            timestamp=datetime.now().isoformat()
        )
    ]
    
    # Gerar PEI
    result = PEAIOrchestrator.generate_pei(student, responses)
    print("Resultado da geração de PEI:")
    print(pretty(result))
    
    print("\n\n--- TESTE 2: Adaptação de Material ---\n")
    
    # Material original
    original_material = """
    Equações do 2º Grau
    
    Uma equação do segundo grau é toda equação da forma ax² + bx + c = 0,
    onde a, b e c são números reais e a ≠ 0.
    
    Para resolver essas equações, utilizamos a fórmula de Bhaskara:
    x = (-b ± √(b²-4ac)) / 2a
    
    Exemplo: x² - 5x + 6 = 0
    a=1, b=-5, c=6
    Δ = 25 - 24 = 1
    x' = 3, x'' = 2
    """
    
    material_metadata = {
        "title": "Equações do 2º Grau - Teoria",
        "subject": "Matemática",
        "grade": "9º Ano"
    }
    
    # Criar PEI document (simulado do resultado anterior)
    if result["status"] == "success":
        pei_doc = PEIDocument(
            student_identification=result["pei_document"]["student_identification"],
            detailed_report=result["pei_document"]["detailed_report"],
            strengths=result["pei_document"]["strengths"],
            difficulties=result["pei_document"]["difficulties"],
            educational_goals=result["pei_document"]["educational_goals"],
            methodological_strategies=result["pei_document"]["methodological_strategies"],
            assistive_resources=result["pei_document"]["assistive_resources"],
            evaluation_criteria=result["pei_document"]["evaluation_criteria"],
            confidence_score=result["pei_document"]["confidence_score"],
            generated_at=result["pei_document"]["generated_at"]
        )
        
        # Adaptar material
        adaptation_result = PEAIOrchestrator.adapt_material(
            original_material,
            material_metadata,
            pei_doc
        )
        
        print("Resultado da adaptação de material:")
        print(pretty(adaptation_result))
    
    print("\n\n--- TESTE 3: Verificação de Status ---\n")
    
    # Simular verificação de completude
    status = WorkflowOrchestratorAgent.check_completion_status(
        total_professionals=5,
        responses_received=responses  # apenas 3 de 5
    )
    print("Status de completude:")
    print(pretty(status))
    
    print("\n\n--- TESTE 4: Cálculo de Validade ---\n")
    
    # Calcular validade do PEI
    validity = WorkflowOrchestratorAgent.calculate_validity_period(
        approval_date=datetime.now(),
        period_months=12
    )
    print("Validade do PEI:")
    print(pretty(validity))
    
    print("\n\n=== Testes Concluídos ===\n")