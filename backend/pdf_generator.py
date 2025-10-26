"""
Gerador de PDF para Materiais Adaptados
Segue o mesmo padrão do pei_pdf_generator.py
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import black, HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from io import BytesIO
import json


def generate_pdf_from_json(json_data) -> BytesIO:
    """
    Gera PDF do material adaptado a partir do JSON do MaterialAdapterAgent
    """
    try:
        # Parse do JSON se for string
        if isinstance(json_data, str):
            data = json.loads(json_data)
        else:
            data = json_data
        
        return create_adapted_material_pdf(data)
    
    except json.JSONDecodeError as e:
        raise ValueError(f"Erro ao parsear JSON: {e}")
    except Exception as e:
        raise Exception(f"Erro ao gerar PDF: {e}")


def create_adapted_material_pdf(material_data: dict) -> BytesIO:
    """
    Gera PDF do material adaptado com formatação limpa (mesmo padrão do PEI)
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
    
    # Estilos (iguais ao PEI)
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
    
    # Pega dados do adaptation_result
    adaptation_result = material_data.get('adaptation_result', material_data)
    
    # Título
    title = adaptation_result.get('adapted_content_structure', {}).get('title', 'Material Adaptado')
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Metadados
    original_metadata = material_data.get('original_metadata', {})
    if original_metadata.get('subject'):
        story.append(Paragraph(f"<b>Disciplina:</b> {original_metadata['subject']}", normal_style))
    if original_metadata.get('grade'):
        story.append(Paragraph(f"<b>Serie:</b> {original_metadata['grade']}", normal_style))
    if original_metadata.get('title'):
        story.append(Paragraph(f"<b>Material Original:</b> {original_metadata['title']}", normal_style))
    
    story.append(Spacer(1, 0.3*inch))
    
    # 1. Análise do Material Original
    original_analysis = adaptation_result.get('original_analysis', {})
    if original_analysis:
        story.append(Paragraph("1. ANALISE DO MATERIAL ORIGINAL", heading_style))
        
        if original_analysis.get('content_type'):
            story.append(Paragraph(f"<b>Tipo de Conteudo:</b> {original_analysis['content_type']}", normal_style))
        if original_analysis.get('complexity_level'):
            story.append(Paragraph(f"<b>Nivel de Complexidade:</b> {original_analysis['complexity_level']}", normal_style))
        
        if original_analysis.get('main_concepts'):
            story.append(Paragraph("<b>Principais Conceitos:</b>", normal_style))
            for concept in original_analysis['main_concepts']:
                story.append(Paragraph(f"- {concept}", bullet_style))
        
        if original_analysis.get('learning_objectives'):
            story.append(Paragraph("<b>Objetivos de Aprendizagem:</b>", normal_style))
            for objective in original_analysis['learning_objectives']:
                story.append(Paragraph(f"- {objective}", bullet_style))
        
        story.append(Spacer(1, 0.2*inch))
    
    # 2. Adaptações Aplicadas
    adaptations_applied = adaptation_result.get('adaptations_applied', [])
    if adaptations_applied:
        story.append(Paragraph("2. ADAPTACOES APLICADAS", heading_style))
        for adaptation in adaptations_applied:
            story.append(Paragraph(f"- {adaptation}", bullet_style))
        story.append(Spacer(1, 0.2*inch))
    
    # 3. Conteúdo Adaptado
    adapted_content = adaptation_result.get('adapted_content_structure', {})
    if adapted_content:
        story.append(Paragraph("3. CONTEUDO ADAPTADO", heading_style))
        
        # Introdução
        introduction = adapted_content.get('introduction', {})
        if introduction:
            if introduction.get('hook'):
                story.append(Paragraph("<b>Gancho Inicial:</b>", normal_style))
                story.append(Paragraph(introduction['hook'], normal_style))
            if introduction.get('objective'):
                story.append(Paragraph("<b>Objetivo:</b>", normal_style))
                story.append(Paragraph(introduction['objective'], normal_style))
            story.append(Spacer(1, 0.1*inch))
        
        # Blocos de conteúdo
        blocks = adapted_content.get('blocks', [])
        if blocks:
            story.append(Paragraph("<b>Blocos de Conteudo:</b>", normal_style))
            for i, block in enumerate(blocks, 1):
                story.append(Paragraph(f"<b>Bloco {i}: {block.get('title', '')}</b>", normal_style))
                story.append(Paragraph(f"Duracao: {block.get('duration_minutes', 0)} minutos", normal_style))
                story.append(Paragraph(f"Tipo: {block.get('content_type', '')}", normal_style))
                
                if block.get('content'):
                    story.append(Paragraph(block['content'], bullet_style))
                
                if block.get('visual_aids'):
                    story.append(Paragraph("Recursos Visuais:", normal_style))
                    for aid in block['visual_aids']:
                        story.append(Paragraph(f"  - {aid}", bullet_style))
                
                if block.get('activity'):
                    story.append(Paragraph(f"Atividade: {block['activity']}", normal_style))
                
                story.append(Spacer(1, 0.1*inch))
        
        story.append(Spacer(1, 0.2*inch))
    
    # 4. Atividades Práticas
    practice_activities = adapted_content.get('practice_activities', [])
    if practice_activities:
        story.append(Paragraph("4. ATIVIDADES PRATICAS", heading_style))
        
        for activity in practice_activities:
            story.append(Paragraph(f"<b>{activity.get('title', 'Atividade')}</b>", normal_style))
            story.append(Paragraph(f"Tipo: {activity.get('type', '')}", normal_style))
            story.append(Paragraph(f"Duracao: {activity.get('duration_minutes', 0)} minutos", normal_style))
            
            if activity.get('instructions'):
                story.append(Paragraph("Instrucoes:", normal_style))
                for instruction in activity['instructions']:
                    story.append(Paragraph(f"- {instruction}", bullet_style))
            
            if activity.get('materials_needed'):
                story.append(Paragraph("Materiais Necessarios:", normal_style))
                for material in activity['materials_needed']:
                    story.append(Paragraph(f"- {material}", bullet_style))
            
            story.append(Spacer(1, 0.1*inch))
        
        story.append(Spacer(1, 0.2*inch))
    
    # 5. Resumo
    summary = adapted_content.get('summary', '')
    if summary:
        story.append(Paragraph("5. RESUMO DOS PONTOS-CHAVE", heading_style))
        story.append(Paragraph(summary, normal_style))
        story.append(Spacer(1, 0.2*inch))
    
    # 6. Sugestão de Avaliação
    evaluation_suggestion = adapted_content.get('evaluation_suggestion', '')
    if evaluation_suggestion:
        story.append(Paragraph("6. SUGESTAO DE AVALIACAO", heading_style))
        story.append(Paragraph(evaluation_suggestion, normal_style))
        story.append(Spacer(1, 0.2*inch))
    
    # 7. Compatibilidade com o PEI
    compatibility_analysis = adaptation_result.get('compatibility_analysis', {})
    pei_compatibility_score = adaptation_result.get('pei_compatibility_score', 0)
    
    if compatibility_analysis or pei_compatibility_score:
        story.append(Paragraph("7. COMPATIBILIDADE COM O PEI", heading_style))
        
        if pei_compatibility_score:
            story.append(Paragraph(f"<b>Score de Compatibilidade:</b> {pei_compatibility_score}%", normal_style))
        
        if compatibility_analysis.get('strengths_addressed'):
            story.append(Paragraph("<b>Forcas do Aluno Exploradas:</b>", normal_style))
            for strength in compatibility_analysis['strengths_addressed']:
                story.append(Paragraph(f"- {strength}", bullet_style))
        
        if compatibility_analysis.get('needs_met'):
            story.append(Paragraph("<b>Necessidades Atendidas:</b>", normal_style))
            for need in compatibility_analysis['needs_met']:
                story.append(Paragraph(f"- {need}", bullet_style))
        
        if compatibility_analysis.get('strategies_applied'):
            story.append(Paragraph("<b>Estrategias Aplicadas:</b>", normal_style))
            for strategy in compatibility_analysis['strategies_applied']:
                story.append(Paragraph(f"- {strategy}", bullet_style))
        
        story.append(Spacer(1, 0.2*inch))
    
    # 8. Notas para o Professor
    teacher_notes = adaptation_result.get('teacher_notes', [])
    if teacher_notes:
        story.append(Paragraph("8. NOTAS PARA O PROFESSOR", heading_style))
        for note in teacher_notes:
            story.append(Paragraph(f"- {note}", bullet_style))
        story.append(Spacer(1, 0.2*inch))
    
    # 9. Avisos Importantes
    warnings = adaptation_result.get('warnings', [])
    if warnings:
        story.append(Paragraph("9. AVISOS IMPORTANTES", heading_style))
        for warning in warnings:
            story.append(Paragraph(f"- {warning}", bullet_style))
    
    # Rodapé
    story.append(Spacer(1, 0.5*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=normal_style,
        fontSize=8,
        textColor=HexColor('#6B7280'),
        alignment=1
    )
    story.append(Paragraph("Material adaptado automaticamente pelo Sistema PE.AI", footer_style))
    
    # Gerar PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
