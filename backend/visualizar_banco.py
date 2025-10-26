from database import SessionLocal, Student, PEI, ProfessionalResponse, AdaptedMaterial, Respondent
import json
from datetime import datetime
import os

# Verificar se o banco existe
DB_PATH = os.path.join(os.path.dirname(__file__), "students.db")
if not os.path.exists(DB_PATH):
    print(f"\n❌ Banco de dados não encontrado em: {DB_PATH}")
    print("   Execute o backend primeiro para criar o banco.")
    exit(1)

print(f"\n📊 Lendo banco de dados: {DB_PATH}\n")

def visualizar_dados():
    db = SessionLocal()
    
    print("\n" + "="*100)
    print("📊 VISUALIZAÇÃO DO BANCO DE DADOS - PE.AI")
    print(f"📁 Arquivo: backend/students.db")
    print("="*100 + "\n")
    
    # 1. STUDENTS
    print("👥 ALUNOS:")
    print("-" * 100)
    students = db.query(Student).all()
    if students:
        print(f"{'ID':<5} {'Nome':<30} {'Status':<15} {'Acesso':<10}")
        print("-" * 100)
        for s in students:
            acesso = "✅ Sim" if s.hasAccess else "❌ Não"
            print(f"{s.id:<5} {s.name:<30} {s.status:<15} {acesso:<10}")
        print(f"\n📊 Total: {len(students)} alunos")
    else:
        print("❌ Nenhum aluno cadastrado.")
    
    # 2. PEIs
    print("\n\n📋 PEIs CRIADOS:")
    print("-" * 100)
    peis = db.query(PEI).all()
    if peis:
        print(f"{'PEI ID':<20} {'Aluno':<30} {'Status':<15} {'IA Status':<15} {'Criado em':<12}")
        print("-" * 100)
        for p in peis:
            student = db.query(Student).filter(Student.id == p.student_id).first()
            student_name = student.name if student else 'N/A'
            created = p.created_at.strftime('%d/%m/%Y') if p.created_at else 'N/A'
            ai_status = p.ai_processing_status or 'N/A'
            print(f"{p.id:<20} {student_name:<30} {p.status:<15} {ai_status:<15} {created:<12}")
        
        print(f"\n📊 Total: {len(peis)} PEIs")
        
        # Mostrar detalhes de cada PEI
        for p in peis:
            print(f"\n{'─'*100}")
            print(f"📄 Detalhes do PEI: {p.id}")
            student = db.query(Student).filter(Student.id == p.student_id).first()
            print(f"   👤 Aluno: {student.name if student else 'N/A'}")
            print(f"   📊 Status: {p.status}")
            print(f"   🤖 IA Status: {p.ai_processing_status or 'Não processado'}")
            print(f"   🧩 Necessidades Especiais: {p.special_needs}")
            print(f"   🏥 Diagnóstico: {p.has_diagnosis}")
            
            # Mostrar profissionais
            if p.professionals:
                try:
                    profs = json.loads(p.professionals)
                    print(f"   👥 Profissionais cadastrados ({len(profs)}):")
                    for i, prof in enumerate(profs, 1):
                        prof_id = prof.get('id', 'N/A')
                        prof_name = prof.get('name', 'N/A')
                        prof_type = prof.get('type', 'N/A')
                        prof_phone = prof.get('phone', 'N/A')
                        print(f"      {i}. {prof_name} ({prof_type})")
                        print(f"         📱 Telefone: {prof_phone}")
                        print(f"         🆔 ID: {prof_id}")
                except Exception as e:
                    print(f"   ⚠️  Erro ao parsear profissionais: {e}")
    else:
        print("❌ Nenhum PEI criado ainda.")
    
    # 3. RESPONDENTES
    print("\n\n📞 RESPONDENTES:")
    print("-" * 100)
    respondents = db.query(Respondent).all()
    if respondents:
        print(f"{'ID':<15} {'Aluno':<30} {'Nome':<25} {'Papel':<15} {'Telefone':<15} {'Status':<12}")
        print("-" * 100)
        for r in respondents:
            student = db.query(Student).filter(Student.id == r.student_id).first()
            student_name = student.name if student else 'N/A'
            print(f"{r.id[:12]+'...':<15} {student_name:<30} {r.name:<25} {r.role:<15} {r.phone:<15} {r.status:<12}")
        print(f"\n📊 Total: {len(respondents)} respondentes")
    else:
        print("❌ Nenhum respondente cadastrado.")
    
    # 4. RESPOSTAS DE PROFISSIONAIS
    print("\n\n💬 RESPOSTAS DE PROFISSIONAIS:")
    print("-" * 100)
    responses = db.query(ProfessionalResponse).all()
    if responses:
        print(f"{'Response ID':<15} {'Aluno':<30} {'Profissional':<25} {'Tipo':<15} {'Enviado em':<18}")
        print("-" * 100)
        for r in responses:
            pei = db.query(PEI).filter(PEI.id == r.pei_id).first()
            student = db.query(Student).filter(Student.id == pei.student_id).first() if pei else None
            student_name = student.name if student else 'N/A'
            submitted = r.submitted_at.strftime('%d/%m/%Y %H:%M') if r.submitted_at else 'N/A'
            print(f"{r.id[:12]+'...':<15} {student_name:<30} {r.professional_name:<25} {r.professional_type:<15} {submitted:<18}")
        
        print(f"\n📊 Total: {len(responses)} respostas")
        
        # Agrupar por PEI
        peis_with_responses = {}
        for r in responses:
            if r.pei_id not in peis_with_responses:
                peis_with_responses[r.pei_id] = []
            peis_with_responses[r.pei_id].append(r)
        
        print(f"\n📋 Respostas agrupadas por PEI:")
        for pei_id, resps in peis_with_responses.items():
            pei = db.query(PEI).filter(PEI.id == pei_id).first()
            student = db.query(Student).filter(Student.id == pei.student_id).first() if pei else None
            print(f"\n   PEI: {pei_id} (Aluno: {student.name if student else 'N/A'})")
            print(f"   ✅ {len(resps)} respostas recebidas")
            for resp in resps:
                print(f"      - {resp.professional_name} ({resp.professional_type})")
    else:
        print("❌ Nenhuma resposta enviada ainda.")
    
    # 5. MATERIAIS ADAPTADOS
    print("\n\n📚 MATERIAIS ADAPTADOS:")
    print("-" * 100)
    materials = db.query(AdaptedMaterial).all()
    if materials:
        print(f"{'ID':<15} {'Aluno':<30} {'Título':<25} {'Disciplina':<12} {'Status':<12} {'Upload':<12}")
        print("-" * 100)
        for m in materials:
            student = db.query(Student).filter(Student.id == m.student_id).first()
            student_name = student.name if student else 'N/A'
            uploaded = m.uploaded_at.strftime('%d/%m/%Y') if m.uploaded_at else 'N/A'
            subject = m.subject or 'N/A'
            print(f"{m.id[:12]+'...':<15} {student_name:<30} {m.title:<25} {subject:<12} {m.status:<12} {uploaded:<12}")
        print(f"\n📊 Total: {len(materials)} materiais")
    else:
        print("❌ Nenhum material adaptado ainda.")
    
    # RESUMO FINAL
    print("\n" + "="*100)
    print(f"📊 RESUMO GERAL:")
    print(f"   👥 Alunos: {len(students)}")
    print(f"   📋 PEIs: {len(peis)}")
    print(f"   📞 Respondentes: {len(respondents)}")
    print(f"   💬 Respostas: {len(responses)}")
    print(f"   📚 Materiais: {len(materials)}")
    print("="*100 + "\n")
    
    db.close()

if __name__ == "__main__":
    try:
        visualizar_dados()
    except Exception as e:
        print(f"\n❌ Erro ao acessar banco de dados: {e}")
        print("\nVerifique se o arquivo students.db existe no diretório backend/")