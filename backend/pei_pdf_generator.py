"""
Gerador de PDF para PEI (Plano Educacional Individualizado)
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import black, HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from io import BytesIO
import json


def generate_pei_pdf(pei_data: dict) -> BytesIO:
    """
    Gera PDF do PEI com formatação limpa
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=60,
        leftMargin=60,
        topMargin=60,
        bottomMargin=60
    )
    
    styles = getSampleStyleSheet()
    
    # Estilos
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=HexColor('#E65100'),
        spaceAfter=20,
        alignment=1  # Center
    )
    
    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=HexColor('#3A3D5B'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=black,
        spaceAfter=8,
        leading=14
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=normal_style,
        leftIndent=20,
        bulletIndent=10
    )
    
    # Construir conteúdo
    story = []
    
    # Título
    story.append(Paragraph("PLANO EDUCACIONAL INDIVIDUALIZADO (PEI)", title_style))
    story.append(Paragraph(pei_data['student_name'], title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Status e Data
    status_map = {
        'draft': 'Rascunho',
        'review': 'Em Revisão',
        'completed': 'Processado pela IA',
        'concluido': 'Concluído',
        'active': 'Ativo',
        'expired': 'Expirado'
    }
    status_label = status_map.get(pei_data['status'], pei_data['status'])
    
    story.append(Paragraph(f"<b>Status:</b> {status_label}", normal_style))
    if pei_data.get('created_at'):
        story.append(Paragraph(f"<b>Data de Criacao:</b> {pei_data['created_at']}", normal_style))
    story.append(Spacer(1, 0.3*inch))
    
    # 1. Identificação
    story.append(Paragraph("1. IDENTIFICACAO DO ESTUDANTE", heading_style))
    story.append(Paragraph(f"<b>Nome:</b> {pei_data['student_name']}", normal_style))
    story.append(Paragraph(f"<b>Necessidades Educacionais Especiais:</b> {pei_data['special_needs']}", normal_style))
    
    if pei_data.get('initial_observations'):
        story.append(Paragraph("<b>Observacoes Iniciais:</b>", normal_style))
        story.append(Paragraph(pei_data['initial_observations'], normal_style))
    story.append(Spacer(1, 0.2*inch))
    
    # 2. Relatório
    if pei_data.get('cognitive_report'):
        story.append(Paragraph("2. RELATORIO CIRCUNSTANCIADO", heading_style))
        story.append(Paragraph("<b>Relatorio Cognitivo:</b>", normal_style))
        story.append(Paragraph(pei_data['cognitive_report'], normal_style))
        story.append(Spacer(1, 0.2*inch))
    
    # 3. Pontos Fortes
    if pei_data.get('strengths') and len(pei_data['strengths']) > 0:
        story.append(Paragraph("3. HABILIDADES E PONTOS FORTES", heading_style))
        for strength in pei_data['strengths']:
            story.append(Paragraph(f"- {strength}", bullet_style))
        story.append(Spacer(1, 0.2*inch))
    
    # 4. Dificuldades
    if pei_data.get('difficulties') and len(pei_data['difficulties']) > 0:
        story.append(Paragraph("4. DIFICULDADES E NECESSIDADES", heading_style))
        for difficulty in pei_data['difficulties']:
            story.append(Paragraph(f"- {difficulty}", bullet_style))
        story.append(Spacer(1, 0.2*inch))
    
    # 5. Objetivos
    has_goals = (
        (pei_data.get('short_term_goals') and len(pei_data['short_term_goals']) > 0) or
        (pei_data.get('medium_term_goals') and len(pei_data['medium_term_goals']) > 0) or
        (pei_data.get('long_term_goals') and len(pei_data['long_term_goals']) > 0)
    )
    
    if has_goals:
        story.append(Paragraph("5. OBJETIVOS EDUCACIONAIS", heading_style))
        
        if pei_data.get('short_term_goals') and len(pei_data['short_term_goals']) > 0:
            story.append(Paragraph("<b>Curto Prazo:</b>", normal_style))
            for goal in pei_data['short_term_goals']:
                story.append(Paragraph(f"- {goal}", bullet_style))
        
        if pei_data.get('medium_term_goals') and len(pei_data['medium_term_goals']) > 0:
            story.append(Paragraph("<b>Medio Prazo:</b>", normal_style))
            for goal in pei_data['medium_term_goals']:
                story.append(Paragraph(f"- {goal}", bullet_style))
        
        if pei_data.get('long_term_goals') and len(pei_data['long_term_goals']) > 0:
            story.append(Paragraph("<b>Longo Prazo:</b>", normal_style))
            for goal in pei_data['long_term_goals']:
                story.append(Paragraph(f"- {goal}", bullet_style))
        
        story.append(Spacer(1, 0.2*inch))
    
    # 6. Estratégias
    if pei_data.get('teaching_strategies'):
        story.append(Paragraph("6. ESTRATEGIAS PEDAGOGICAS", heading_style))
        try:
            strategies = json.loads(pei_data['teaching_strategies']) if isinstance(pei_data['teaching_strategies'], str) else pei_data['teaching_strategies']
            
            translate = {
                'content_presentation': 'Apresentacao de Conteudo',
                'activities': 'Atividades',
                'environment': 'Ambiente'
            }
            
            for key, value in strategies.items():
                key_label = translate.get(key, key.replace('_', ' ').title())
                story.append(Paragraph(f"<b>{key_label}:</b>", normal_style))
                if isinstance(value, list):
                    for item in value:
                        story.append(Paragraph(f"- {item}", bullet_style))
                else:
                    story.append(Paragraph(str(value), normal_style))
        except:
            story.append(Paragraph(str(pei_data['teaching_strategies']), normal_style))
        story.append(Spacer(1, 0.2*inch))
    
    # 7. Recursos
    if pei_data.get('assistive_resources') and len(pei_data['assistive_resources']) > 0:
        story.append(Paragraph("7. RECURSOS DE APOIO", heading_style))
        for resource in pei_data['assistive_resources']:
            story.append(Paragraph(f"- {resource}", bullet_style))
        story.append(Spacer(1, 0.2*inch))
    
    # 8. Avaliação
    if pei_data.get('evaluation_methods'):
        story.append(Paragraph("8. METODOS DE AVALIACAO", heading_style))
        try:
            methods = json.loads(pei_data['evaluation_methods']) if isinstance(pei_data['evaluation_methods'], str) else pei_data['evaluation_methods']
            
            translate = {
                'adaptations': 'Adaptacoes',
                'diversified_instruments': 'Instrumentos Diversificados',
                'evaluation_focus': 'Foco da Avaliacao',
                'practical_projects': 'Projetos Praticos',
                'visual_presentations': 'Apresentacoes Visuais',
                'classroom_activities': 'Atividades em Sala',
                'adapted_tests': 'Testes Adaptados'
            }
            
            for key, value in methods.items():
                key_label = translate.get(key, key.replace('_', ' ').title())
                story.append(Paragraph(f"<b>{key_label}:</b>", normal_style))
                
                if isinstance(value, list):
                    for item in value:
                        story.append(Paragraph(f"- {item}", bullet_style))
                elif isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        sub_label = translate.get(sub_key, sub_key.replace('_', ' ').title())
                        story.append(Paragraph(f"  {sub_label}: {sub_value}%", bullet_style))
                else:
                    story.append(Paragraph(str(value), normal_style))
        except:
            story.append(Paragraph(str(pei_data['evaluation_methods']), normal_style))
    
    # Rodapé
    story.append(Spacer(1, 0.5*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=normal_style,
        fontSize=8,
        textColor=HexColor('#6B7280'),
        alignment=1
    )
    story.append(Paragraph("Documento gerado automaticamente pelo Sistema PE.AI", footer_style))
    
    # Gerar PDF
    doc.build(story)
    buffer.seek(0)
    return buffer