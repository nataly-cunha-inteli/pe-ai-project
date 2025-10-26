from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import json
import uuid
import os
from datetime import datetime
from pypdf import PdfReader
import io

from .database import Student, Respondent, PEI, ProfessionalResponse, AdaptedMaterial, SessionLocal, get_db, init_db
from .ai import (
    PEAIOrchestrator, 
    StudentInfo, 
    ProfessionalResponse as AIProfessionalResponse, 
    PEIDocument,
    WorkflowOrchestratorAgent
)
from .pdf_generator import generate_pdf_from_json
from .pei_pdf_generator import generate_pei_pdf

app = FastAPI(title="PE-AI Student API")

# CORS configuration for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",  # Porta alternativa do Vite
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class RespondentResponse(BaseModel):
    id: str
    student_id: str
    role: str
    name: str
    email: str | None
    phone: str
    status: str

    class Config:
        from_attributes = True


class StudentResponse(BaseModel):
    id: str
    name: str
    status: str
    hasAccess: bool

    class Config:
        from_attributes = True


class StudentCreate(BaseModel):
    id: str
    name: str
    status: str
    hasAccess: bool


class StudentUpdate(BaseModel):
    name: str | None = None
    status: str | None = None
    hasAccess: bool | None = None


class PEIResponse(BaseModel):
    id: str
    student_id: str
    status: str
    created_at: str
    special_needs: str | None
    has_diagnosis: str | None
    initial_observations: str | None
    professionals: List[dict] | None
    ai_processing_status: str | None
    ai_confidence_score: str | None
    ai_processed_at: str | None
    ai_warnings: List[str] | None
    ai_suggestions: List[str] | None
    cognitive_report: str | None
    strengths: List[str] | None
    difficulties: List[str] | None
    short_term_goals: List[str] | None
    medium_term_goals: List[str] | None
    long_term_goals: List[str] | None
    teaching_strategies: str | None
    assistive_resources: List[str] | None
    evaluation_methods: str | None
    responses_count: int | None
    total_professionals: int | None
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, obj):
        # Parse JSON fields
        professionals = json.loads(obj.professionals) if obj.professionals else []
        
        data = {
            'id': obj.id,
            'student_id': obj.student_id,
            'status': obj.status,
            'created_at': obj.created_at.isoformat() if obj.created_at else None,
            'special_needs': obj.special_needs,
            'has_diagnosis': obj.has_diagnosis,
            'initial_observations': obj.initial_observations,
            'professionals': professionals,
            'ai_processing_status': obj.ai_processing_status,
            'ai_confidence_score': obj.ai_confidence_score,
            'ai_processed_at': obj.ai_processed_at.isoformat() if obj.ai_processed_at else None,
            'ai_warnings': json.loads(obj.ai_warnings) if obj.ai_warnings else None,
            'ai_suggestions': json.loads(obj.ai_suggestions) if obj.ai_suggestions else None,
            'cognitive_report': obj.cognitive_report,
            'strengths': json.loads(obj.strengths) if obj.strengths else None,
            'difficulties': json.loads(obj.difficulties) if obj.difficulties else None,
            'short_term_goals': json.loads(obj.short_term_goals) if obj.short_term_goals else None,
            'medium_term_goals': json.loads(obj.medium_term_goals) if obj.medium_term_goals else None,
            'long_term_goals': json.loads(obj.long_term_goals) if obj.long_term_goals else None,
            'teaching_strategies': obj.teaching_strategies,
            'assistive_resources': json.loads(obj.assistive_resources) if obj.assistive_resources else None,
            'evaluation_methods': obj.evaluation_methods,
            'responses_count': len(obj.professional_responses) if hasattr(obj, 'professional_responses') else 0,
            'total_professionals': len(professionals),
        }
        return cls(**data)


class ProfessionalResponseCreate(BaseModel):
    professional_id: str
    responses: Dict[str, Any]


class ProfessionalResponseData(BaseModel):
    id: str
    pei_id: str
    professional_id: str
    professional_type: str
    professional_name: str
    responses: Dict[str, Any]
    submitted_at: str
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            pei_id=obj.pei_id,
            professional_id=obj.professional_id,
            professional_type=obj.professional_type,
            professional_name=obj.professional_name,
            responses=json.loads(obj.responses) if isinstance(obj.responses, str) else obj.responses,
            submitted_at=obj.submitted_at.isoformat() if obj.submitted_at else None,
        )


class PEICreate(BaseModel):
    student_name: str
    special_needs: List[str]
    has_diagnosis: str
    initial_observations: str | None = None
    professionals: List[Dict[str, str]]


# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()


# API Endpoints
@app.get("/api/health")
def read_root():
    """Health endpoint for the API. The SPA is served at the root `/` by StaticFiles.
    This avoids a route collision where an API route at `/` prevents the frontend index.html
    from being served.
    """
    return {"message": "PE-AI Student API", "status": "running"}


@app.get("/api/students", response_model=List[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    """Get all students"""
    students = db.query(Student).all()
    return students


@app.get("/api/students/{student_id}", response_model=StudentResponse)
def get_student(student_id: str, db: Session = Depends(get_db)):
    """Get a specific student by ID"""
    student = db.query(Student).filter(Student.id == student_id).first()
    
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with id '{student_id}' not found")
    
    return student


@app.post("/api/students", response_model=StudentResponse, status_code=201)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student"""
    # Check if student with this ID already exists
    existing = db.query(Student).filter(Student.id == student.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Student with id '{student.id}' already exists")
    
    db_student = Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@app.put("/api/students/{student_id}", response_model=StudentResponse)
def update_student(student_id: str, student_update: StudentUpdate, db: Session = Depends(get_db)):
    """Update an existing student"""
    db_student = db.query(Student).filter(Student.id == student_id).first()
    
    if not db_student:
        raise HTTPException(status_code=404, detail=f"Student with id '{student_id}' not found")
    
    # Update only provided fields
    update_data = student_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_student, field, value)
    
    db.commit()
    db.refresh(db_student)
    return db_student


@app.delete("/api/students/{student_id}", status_code=204)
def delete_student(student_id: str, db: Session = Depends(get_db)):
    """Delete a student"""
    db_student = db.query(Student).filter(Student.id == student_id).first()
    
    if not db_student:
        raise HTTPException(status_code=404, detail=f"Student with id '{student_id}' not found")
    
    db.delete(db_student)
    db.commit()
    return None


# Respondent endpoints
@app.get("/api/students/{student_id}/respondents", response_model=List[RespondentResponse])
def get_student_respondents(student_id: str, db: Session = Depends(get_db)):
    """Get all respondents for a specific student"""
    # Check if student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with id '{student_id}' not found")
    
    respondents = db.query(Respondent).filter(Respondent.student_id == student_id).all()
    return respondents


# PEI endpoints
@app.get("/api/peis", response_model=List[PEIResponse])
def get_all_peis(db: Session = Depends(get_db)):
    """Get all PEIs ordered by creation date (most recent first)"""
    peis = db.query(PEI).order_by(PEI.created_at.desc()).all()
    return [PEIResponse.from_orm(pei) for pei in peis]


@app.get("/api/pei/{pei_id}/download-pdf")
async def download_pei_pdf(pei_id: str, db: Session = Depends(get_db)):
    """
    Gera e retorna o PDF do PEI
    """
    try:
        print(f"[DEBUG] Requisição de PDF para PEI: {pei_id}")
        
        # Busca o PEI do banco
        pei = db.query(PEI).filter_by(id=pei_id).first()
        
        if not pei:
            print(f"[ERROR] PEI não encontrado: {pei_id}")
            raise HTTPException(status_code=404, detail="PEI não encontrado")
        
        print(f"[DEBUG] PEI encontrado: {pei.id}, status: {pei.status}")
        
        # Busca dados do aluno
        student = db.query(Student).filter_by(id=pei.student_id).first()
        
        if not student:
            print(f"[ERROR] Estudante não encontrado: {pei.student_id}")
            raise HTTPException(status_code=404, detail="Estudante não encontrado")
        
        print(f"[DEBUG] Estudante encontrado: {student.name}")
        
        # Monta dados para o PDF
        pei_data = {
            "student_name": student.name,
            "special_needs": pei.special_needs or "Não especificado",
            "status": pei.status,
            "created_at": pei.created_at.strftime("%d/%m/%Y %H:%M") if pei.created_at else "",
            "initial_observations": pei.initial_observations or "",
            "cognitive_report": pei.cognitive_report or "",
            "strengths": json.loads(pei.strengths) if pei.strengths and pei.strengths != "[]" else [],
            "difficulties": json.loads(pei.difficulties) if pei.difficulties and pei.difficulties != "[]" else [],
            "short_term_goals": json.loads(pei.short_term_goals) if pei.short_term_goals and pei.short_term_goals != "[]" else [],
            "medium_term_goals": json.loads(pei.medium_term_goals) if pei.medium_term_goals and pei.medium_term_goals != "[]" else [],
            "long_term_goals": json.loads(pei.long_term_goals) if pei.long_term_goals and pei.long_term_goals != "[]" else [],
            "teaching_strategies": pei.teaching_strategies or "",
            "assistive_resources": json.loads(pei.assistive_resources) if pei.assistive_resources and pei.assistive_resources != "[]" else [],
            "evaluation_methods": pei.evaluation_methods or "",
        }
        
        print(f"[DEBUG] Dados do PEI preparados, gerando PDF...")
        
        # Importa e chama o gerador de PDF
        from .pei_pdf_generator import generate_pei_pdf
        pdf_buffer = generate_pei_pdf(pei_data)
        
        print(f"[DEBUG] PDF gerado com sucesso")
        
        # Nome do arquivo
        safe_name = student.name.replace(' ', '_').replace('/', '_')
        filename = f"PEI_{safe_name}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        print(f"[DEBUG] Enviando arquivo: {filename}")
        
        # Retorna o PDF
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/pdf"
            }
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[ERROR] Erro ao gerar PDF do PEI: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao gerar PDF: {str(e)}")


@app.get("/api/pei/{pei_id}", response_model=PEIResponse)
def get_pei(pei_id: str, db: Session = Depends(get_db)):
    """Get a specific PEI by ID"""
    pei = db.query(PEI).filter(PEI.id == pei_id).first()
    
    if not pei:
        raise HTTPException(status_code=404, detail=f"PEI with id '{pei_id}' not found")
    
    return PEIResponse.from_orm(pei)


@app.get("/api/students/{student_id}/pei", response_model=PEIResponse)
def get_student_pei(student_id: str, db: Session = Depends(get_db)):
    """Get the PEI for a specific student"""
    # Check if student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with id '{student_id}' not found")
    
    # Get the most recent PEI for this student
    pei = db.query(PEI).filter(PEI.student_id == student_id).order_by(PEI.created_at.desc()).first()
    
    if not pei:
        raise HTTPException(status_code=404, detail=f"No PEI found for student with id '{student_id}'")
    
    return PEIResponse.from_orm(pei)


@app.post("/api/pei", response_model=PEIResponse, status_code=201)
def create_pei(pei_data: PEICreate, db: Session = Depends(get_db)):
    """Create a new PEI for a student (creates student if doesn't exist)"""
    # Find student by exact name match
    student = db.query(Student).filter(Student.name == pei_data.student_name).first()
    
    # Create student if doesn't exist
    if not student:
        student = Student(
            id=str(uuid.uuid4().hex[:8]),
            name=pei_data.student_name,
            status='resend_form',  # Status correto: formulários enviados
            hasAccess=False
        )
        db.add(student)
        db.flush()  # Get the ID without committing
    else:
        # Update existing student status to resend_form
        student.status = 'resend_form'
    
    # Check if student already has a PEI
    existing_pei = db.query(PEI).filter(PEI.student_id == student.id).first()
    if existing_pei:
        raise HTTPException(status_code=400, detail=f"Student '{pei_data.student_name}' already has a PEI")
    
    # Create new PEI
    new_pei = PEI(
        id=f"pei_{uuid.uuid4().hex[:8]}",
        student_id=student.id,
        status="in_collection",
        special_needs=json.dumps(pei_data.special_needs),
        has_diagnosis=pei_data.has_diagnosis,
        initial_observations=pei_data.initial_observations,
        professionals=json.dumps(pei_data.professionals) if pei_data.professionals else None,
    )
    
    db.add(new_pei)
    
    # Create respondents for each professional
    for prof in pei_data.professionals:
        respondent = Respondent(
            id=f"r_{uuid.uuid4().hex[:8]}",
            student_id=student.id,
            role=prof.get('type', 'Outro'),
            name=prof.get('name', ''),
            email=prof.get('email'),
            phone=prof.get('phone', ''),
            status='link'
        )
        db.add(respondent)
    
    db.commit()
    db.refresh(new_pei)
    
    return PEIResponse.from_orm(new_pei)


# Professional Response endpoints
@app.post("/api/pei/{pei_id}/responses", response_model=ProfessionalResponseData, status_code=201)
def submit_professional_response(
    pei_id: str, 
    response_data: ProfessionalResponseCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Submit a professional's response to a PEI"""
    # Verify PEI exists
    pei = db.query(PEI).filter(PEI.id == pei_id).first()
    if not pei:
        raise HTTPException(status_code=404, detail=f"PEI with id '{pei_id}' not found")
    
    # Get professional info from PEI professionals array
    professionals = json.loads(pei.professionals) if pei.professionals else []
    professional = next((p for p in professionals if p['id'] == response_data.professional_id), None)
    
    if not professional:
        raise HTTPException(status_code=404, detail=f"Professional with id '{response_data.professional_id}' not found in PEI")
    
    # Check if response already exists
    existing = db.query(ProfessionalResponse).filter(
        ProfessionalResponse.pei_id == pei_id,
        ProfessionalResponse.professional_id == response_data.professional_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="This professional has already submitted a response")
    
    # Create new response
    new_response = ProfessionalResponse(
        id=str(uuid.uuid4()),
        pei_id=pei_id,
        professional_id=response_data.professional_id,
        professional_type=professional.get('type', 'Unknown'),
        professional_name=professional.get('name', 'Unknown'),
        responses=json.dumps(response_data.responses),
        submitted_at=datetime.utcnow()
    )
    
    db.add(new_response)
    db.commit()
    db.refresh(new_response)
    
    # Check if all professionals have responded and trigger AI processing
    background_tasks.add_task(check_and_process_pei, pei_id, db)
    
    return ProfessionalResponseData.from_orm(new_response)


@app.get("/api/pei/{pei_id}/responses", response_model=List[ProfessionalResponseData])
def get_pei_responses(pei_id: str, db: Session = Depends(get_db)):
    """Get all professional responses for a PEI"""
    # Verify PEI exists
    pei = db.query(PEI).filter(PEI.id == pei_id).first()
    if not pei:
        raise HTTPException(status_code=404, detail=f"PEI with id '{pei_id}' not found")
    
    responses = db.query(ProfessionalResponse).filter(ProfessionalResponse.pei_id == pei_id).all()
    return [ProfessionalResponseData.from_orm(r) for r in responses]


@app.post("/api/pei/{pei_id}/process-ai")
def trigger_ai_processing(pei_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Manually trigger AI processing for a PEI (for testing or re-processing)"""
    pei = db.query(PEI).filter(PEI.id == pei_id).first()
    if not pei:
        raise HTTPException(status_code=404, detail=f"PEI with id '{pei_id}' not found")
    
    # Check if we have responses
    responses = db.query(ProfessionalResponse).filter(ProfessionalResponse.pei_id == pei_id).all()
    if len(responses) == 0:
        raise HTTPException(status_code=400, detail="No professional responses available for processing")
    
    # Trigger processing in background
    background_tasks.add_task(process_pei_with_ai, pei_id, db)
    
    return {"message": "AI processing started", "pei_id": pei_id}


@app.post("/api/pei/{pei_id}/approve")
def approve_pei(pei_id: str, db: Session = Depends(get_db)):
    """Approve PEI (simulates auditor approval) - changes status to 'concluido'"""
    pei = db.query(PEI).filter(PEI.id == pei_id).first()
    if not pei:
        raise HTTPException(status_code=404, detail=f"PEI with id '{pei_id}' not found")
    
    # Check if PEI has been processed by AI
    if pei.ai_processing_status != 'completed':
        raise HTTPException(
            status_code=400, 
            detail="PEI must be processed by AI before approval"
        )
    
    # Update PEI status to concluido (concluded/approved)
    pei.status = 'concluido'
    
    # Update student hasAccess to True (enables material adaptation)
    student = db.query(Student).filter(Student.id == pei.student_id).first()
    if student:
        student.hasAccess = True
        student.status = 'active'
    
    db.commit()
    db.refresh(pei)
    
    return {
        "message": "PEI approved successfully",
        "pei_id": pei_id,
        "status": pei.status,
        "student_access_updated": student is not None
    }


# Background task functions
def check_and_process_pei(pei_id: str, db: Session):
    """Check if all professionals responded and trigger AI processing if complete"""
    # Create new session for background task
    db = SessionLocal()
    
    try:
        pei = db.query(PEI).filter(PEI.id == pei_id).first()
        if not pei:
            return
        
        # Count responses
        responses = db.query(ProfessionalResponse).filter(ProfessionalResponse.pei_id == pei_id).all()
        professionals = json.loads(pei.professionals) if pei.professionals else []
        
        print(f"📊 PEI {pei_id}: {len(responses)}/{len(professionals)} responses received")
        
        # If all professionals responded, trigger AI processing
        if len(responses) >= len(professionals):
            print(f"✅ All professionals responded for PEI {pei_id}. Starting AI processing...")
            process_pei_with_ai(pei_id, db)
    finally:
        db.close()


def process_pei_with_ai(pei_id: str, db: Session):
    """Process PEI with AI agents"""
    db = SessionLocal()
    
    try:
        pei = db.query(PEI).filter(PEI.id == pei_id).first()
        if not pei:
            print(f"❌ PEI {pei_id} not found")
            return
        
        # Update status to processing
        pei.ai_processing_status = 'processing'
        pei.status = 'in_review'
        db.commit()
        
        print(f"🤖 Starting AI processing for PEI {pei_id}...")
        
        # Get student info
        student = db.query(Student).filter(Student.id == pei.student_id).first()
        if not student:
            raise Exception("Student not found")
        
        # Get professional responses
        responses = db.query(ProfessionalResponse).filter(ProfessionalResponse.pei_id == pei_id).all()
        
        # Prepare data for AI
        special_needs_list = pei.special_needs.split(', ') if pei.special_needs else []
        
        student_info = StudentInfo(
            name=student.name,
            birth_date=student.birth_date or "Unknown",
            grade=student.grade or "Unknown",
            special_needs=special_needs_list,
            has_diagnosis=pei.has_diagnosis == 'Sim'
        )
        
        # Convert responses to AI format
        ai_responses = []
        for resp in responses:
            ai_responses.append(AIProfessionalResponse(
                professional_id=resp.professional_id,
                professional_type=resp.professional_type,
                professional_name=resp.professional_name,
                responses=json.loads(resp.responses) if isinstance(resp.responses, str) else resp.responses,
                timestamp=resp.submitted_at.isoformat()
            ))
        
        # Call AI orchestrator
        print(f"🧠 Calling PEI Generator Agent...")
        result = PEAIOrchestrator.generate_pei(student_info, ai_responses)
        
        if result['status'] == 'success':
            pei_doc = result['pei_document']
            
            # Update PEI with AI results
            pei.cognitive_report = pei_doc['detailed_report'].get('cognitive_development', '')
            pei.strengths = json.dumps(pei_doc['strengths'], ensure_ascii=False)
            pei.difficulties = json.dumps(pei_doc['difficulties'], ensure_ascii=False)
            pei.short_term_goals = json.dumps(pei_doc['educational_goals'].get('short_term', []), ensure_ascii=False)
            pei.medium_term_goals = json.dumps(pei_doc['educational_goals'].get('medium_term', []), ensure_ascii=False)
            pei.long_term_goals = json.dumps(pei_doc['educational_goals'].get('long_term', []), ensure_ascii=False)
            pei.teaching_strategies = json.dumps(pei_doc['methodological_strategies'], ensure_ascii=False)
            pei.assistive_resources = json.dumps(pei_doc['assistive_resources'].get('required', []) + pei_doc['assistive_resources'].get('recommended', []), ensure_ascii=False)
            pei.evaluation_methods = json.dumps(pei_doc['evaluation_criteria'], ensure_ascii=False)
            
            pei.ai_processing_status = 'completed'
            pei.ai_confidence_score = str(pei_doc['confidence_score'])
            pei.ai_processed_at = datetime.utcnow()
            pei.ai_warnings = json.dumps(pei_doc.get('warnings', []), ensure_ascii=False)
            pei.ai_suggestions = json.dumps(pei_doc.get('suggestions', []), ensure_ascii=False)
            pei.status = 'completed'
            
            db.commit()
            print(f"✅ AI processing completed for PEI {pei_id} with confidence score {pei_doc['confidence_score']}%")
        else:
            pei.ai_processing_status = 'failed'
            db.commit()
            print(f"❌ AI processing failed for PEI {pei_id}")
            
    except Exception as e:
        print(f"❌ Error processing PEI {pei_id}: {str(e)}")
        pei.ai_processing_status = 'failed'
        db.commit()
    finally:
        db.close()


# ============================================
# MATERIAL ADAPTATION ENDPOINTS
# ============================================

def extract_text_from_pdf(pdf_file: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_reader = PdfReader(io.BytesIO(pdf_file))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")


@app.post("/api/students/{student_id}/materials/upload")
async def upload_material(
    student_id: str,
    file: UploadFile = File(...),
    title: str = Form(...),
    subject: Optional[str] = Form(None),
    grade: Optional[str] = Form(None),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db)
):
    """Upload and process educational material for adaptation"""
    
    # Verify student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with id '{student_id}' not found")
    
    # Get student's PEI
    pei = db.query(PEI).filter(
        PEI.student_id == student_id,
        PEI.status == 'concluido'
    ).first()
    
    if not pei:
        raise HTTPException(
            status_code=400, 
            detail="Student must have an approved PEI (status='concluido') before materials can be adapted"
        )
    
    # Check if file is PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Read file content
    pdf_content = await file.read()
    
    # Extract text from PDF
    try:
        extracted_text = extract_text_from_pdf(pdf_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Create material record
    material_id = str(uuid.uuid4())
    material = AdaptedMaterial(
        id=material_id,
        student_id=student_id,
        pei_id=pei.id,
        original_filename=file.filename,
        original_content=extracted_text,
        title=title,
        subject=subject,
        grade=grade,
        status='processing'
    )
    
    db.add(material)
    db.commit()
    db.refresh(material)
    
    # Trigger AI adaptation in background
    background_tasks.add_task(adapt_material_with_ai, material_id, db)
    
    return {
        "id": material_id,
        "status": "processing",
        "message": "Material uploaded successfully. AI adaptation in progress."
    }


@app.get("/api/students/{student_id}/materials")
def get_student_materials(student_id: str, db: Session = Depends(get_db)):
    """Get all adapted materials for a student"""
    materials = db.query(AdaptedMaterial).filter(
        AdaptedMaterial.student_id == student_id
    ).order_by(AdaptedMaterial.uploaded_at.desc()).all()
    
    return [{
        "id": m.id,
        "title": m.title,
        "subject": m.subject,
        "grade": m.grade,
        "original_filename": m.original_filename,
        "status": m.status,
        "uploaded_at": m.uploaded_at.isoformat() if m.uploaded_at else None,
        "processed_at": m.processed_at.isoformat() if m.processed_at else None,
        "has_adaptation": m.adaptation_result is not None
    } for m in materials]


@app.get("/api/materials/{material_id}")
def get_material_details(material_id: str, db: Session = Depends(get_db)):
    """Get detailed information about an adapted material"""
    material = db.query(AdaptedMaterial).filter(AdaptedMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail=f"Material with id '{material_id}' not found")
    
    adaptation_data = None
    if material.adaptation_result:
        try:
            adaptation_data = json.loads(material.adaptation_result)
        except:
            pass
    
    return {
        "id": material.id,
        "student_id": material.student_id,
        "pei_id": material.pei_id,
        "title": material.title,
        "subject": material.subject,
        "grade": material.grade,
        "original_filename": material.original_filename,
        "original_content": material.original_content,
        "adaptation_result": adaptation_data,
        "status": material.status,
        "uploaded_at": material.uploaded_at.isoformat() if material.uploaded_at else None,
        "processed_at": material.uploaded_at.isoformat() if material.processed_at else None
    }


def adapt_material_with_ai(material_id: str, db: Session):
    """Background task to adapt material using AI"""
    db = SessionLocal()
    
    try:
        material = db.query(AdaptedMaterial).filter(AdaptedMaterial.id == material_id).first()
        if not material:
            print(f"❌ Material {material_id} not found")
            return
        
        # Get PEI
        pei = db.query(PEI).filter(PEI.id == material.pei_id).first()
        if not pei:
            print(f"❌ PEI not found for material {material_id}")
            material.status = 'error'
            db.commit()
            return
        
        # Get student
        student = db.query(Student).filter(Student.id == material.student_id).first()
        if not student:
            print(f"❌ Student not found for material {material_id}")
            material.status = 'error'
            db.commit()
            return
        
        # Helper function to safely parse JSON fields
        def safe_json_parse(field, default):
            if not field:
                return default
            try:
                parsed = json.loads(field)
                return parsed if parsed else default
            except:
                return default
        
        # Build PEIDocument from database PEI with safe parsing
        try:
            professionals_data = safe_json_parse(pei.professionals, {})
            
            # Build student identification
            student_identification = {
                "special_needs": professionals_data.get("special_needs", []) if isinstance(professionals_data, dict) else []
            }
            
            pei_doc = PEIDocument(
                student_identification=student_identification,
                detailed_report={"cognitive_development": pei.cognitive_report or ""},
                strengths=safe_json_parse(pei.strengths, []),
                difficulties=safe_json_parse(pei.difficulties, []),
                educational_goals={
                    "short_term": safe_json_parse(pei.short_term_goals, []),
                    "medium_term": safe_json_parse(pei.medium_term_goals, []),
                    "long_term": safe_json_parse(pei.long_term_goals, [])
                },
                methodological_strategies=safe_json_parse(pei.teaching_strategies, {}),
                assistive_resources={"required": safe_json_parse(pei.assistive_resources, [])},
                evaluation_criteria=safe_json_parse(pei.evaluation_methods, {}),
                confidence_score=int(pei.ai_confidence_score or 0),
                generated_at=pei.ai_processed_at.isoformat() if pei.ai_processed_at else datetime.utcnow().isoformat()
            )
        except Exception as pei_error:
            print(f"❌ Error building PEIDocument: {str(pei_error)}")
            import traceback
            traceback.print_exc()
            material.status = 'error'
            db.commit()
            return
        
        # Call AI adapter
        print(f"🤖 Adapting material {material_id} with AI...")
        adaptation_result = PEAIOrchestrator.adapt_material(
            material_text=material.original_content,
            material_metadata={
                "title": material.title,
                "subject": material.subject,
                "grade": material.grade
            },
            pei_document=pei_doc
        )
        
        # Save JSON result
        material.adaptation_result = json.dumps(adaptation_result, ensure_ascii=False)
        
        # Generate PDF from adaptation result
        print(f"📄 Generating PDF for material {material_id}...")
        try:
            pdf_buffer = generate_pdf_from_json(adaptation_result)
            pdf_bytes = pdf_buffer.read()
            
            # Save PDF to file
            pdf_dir = "adapted_pdfs"
            os.makedirs(pdf_dir, exist_ok=True)
            
            pdf_filename = f"{material_id}_adapted.pdf"
            pdf_path = os.path.join(pdf_dir, pdf_filename)
            
            with open(pdf_path, "wb") as f:
                f.write(pdf_bytes)
            
            material.adapted_pdf_path = pdf_path
            print(f"✅ PDF saved to {pdf_path}")
            
        except Exception as pdf_error:
            print(f"⚠️ Error generating PDF: {str(pdf_error)}")
            # Continue even if PDF generation fails - JSON is still available
        
        material.status = 'completed'
        material.processed_at = datetime.utcnow()
        db.commit()
        
        print(f"✅ Material {material_id} adapted successfully")
        
    except Exception as e:
        print(f"❌ Error adapting material {material_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        material.status = 'error'
        db.commit()
    finally:
        db.close()


@app.get("/api/materials/{material_id}/download-pdf")
def download_adapted_material_pdf(material_id: str, db: Session = Depends(get_db)):
    """
    Download adapted material as PDF
    """
    material = db.query(AdaptedMaterial).filter(AdaptedMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail=f"Material with id '{material_id}' not found")
    
    if material.status != 'completed':
        raise HTTPException(
            status_code=400, 
            detail=f"Material adaptation not completed yet. Current status: {material.status}"
        )
    
    # Get student name
    student = db.query(Student).filter(Student.id == material.student_id).first()
    student_name = student.name if student else "Unknown Student"
    
    # Check if PDF was already generated and saved
    if material.adapted_pdf_path and os.path.exists(material.adapted_pdf_path):
        # Read the pre-generated PDF
        with open(material.adapted_pdf_path, "rb") as f:
            pdf_bytes = f.read()
    else:
        # Generate PDF on-the-fly if not already generated
        if not material.adaptation_result:
            raise HTTPException(status_code=400, detail="No adaptation result available")
        
        # Parse adaptation result
        try:
            adaptation_data = json.loads(material.adaptation_result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error parsing adaptation data: {str(e)}")
        
        # Generate PDF
        try:
            pdf_buffer = generate_pdf_from_json(adaptation_data)
            pdf_bytes = pdf_buffer.read()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")
    
    # Create filename
    safe_title = "".join(c for c in material.title if c.isalnum() or c in (' ', '-', '_')).strip()
    filename = f"Material_Adaptado_{safe_title}_{student_name}.pdf"
    
    # Return PDF as streaming response
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@app.get("/api/pei/{pei_id}/download-pdf")
async def download_pei_pdf(pei_id: str, db: Session = Depends(get_db)):
    """
    Gera e retorna o PDF do PEI
    """
    try:
        print(f"[DEBUG] Requisição de PDF para PEI: {pei_id}")
        
        # Busca o PEI do banco
        pei = db.query(PEI).filter_by(id=pei_id).first()
        
        if not pei:
            print(f"[ERROR] PEI não encontrado: {pei_id}")
            raise HTTPException(status_code=404, detail="PEI não encontrado")
        
        print(f"[DEBUG] PEI encontrado: {pei.id}, status: {pei.status}")
        
        # Busca dados do aluno
        student = db.query(Student).filter_by(id=pei.student_id).first()
        
        if not student:
            print(f"[ERROR] Estudante não encontrado: {pei.student_id}")
            raise HTTPException(status_code=404, detail="Estudante não encontrado")
        
        print(f"[DEBUG] Estudante encontrado: {student.name}")
        
        # Monta dados para o PDF
        pei_data = {
            "student_name": student.name,
            "special_needs": pei.special_needs or "Não especificado",
            "status": pei.status,
            "created_at": pei.created_at.strftime("%d/%m/%Y %H:%M") if pei.created_at else "",
            "initial_observations": pei.initial_observations or "",
            "cognitive_report": pei.cognitive_report or "",
            "strengths": json.loads(pei.strengths) if pei.strengths and pei.strengths != "[]" else [],
            "difficulties": json.loads(pei.difficulties) if pei.difficulties and pei.difficulties != "[]" else [],
            "short_term_goals": json.loads(pei.short_term_goals) if pei.short_term_goals and pei.short_term_goals != "[]" else [],
            "medium_term_goals": json.loads(pei.medium_term_goals) if pei.medium_term_goals and pei.medium_term_goals != "[]" else [],
            "long_term_goals": json.loads(pei.long_term_goals) if pei.long_term_goals and pei.long_term_goals != "[]" else [],
            "teaching_strategies": pei.teaching_strategies or "",
            "assistive_resources": json.loads(pei.assistive_resources) if pei.assistive_resources and pei.assistive_resources != "[]" else [],
            "evaluation_methods": pei.evaluation_methods or "",
        }
        
        print(f"[DEBUG] Dados do PEI preparados, gerando PDF...")
        
        # Importa e chama o gerador de PDF
        from .pei_pdf_generator import generate_pei_pdf
        pdf_buffer = generate_pei_pdf(pei_data)
        
        print(f"[DEBUG] PDF gerado com sucesso")
        
        # Nome do arquivo
        safe_name = student.name.replace(' ', '_').replace('/', '_')
        filename = f"PEI_{safe_name}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        print(f"[DEBUG] Enviando arquivo: {filename}")
        
        # Retorna o PDF
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/pdf"
            }
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[ERROR] Erro ao gerar PDF do PEI: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao gerar PDF: {str(e)}")


@app.post("/api/pei/{pei_id}/approve")
def approve_pei(pei_id: str, db: Session = Depends(get_db)):
    """
    Approve a completed PEI (move from 'completed' to 'concluido')
    """
    pei = db.query(PEI).filter(PEI.id == pei_id).first()
    if not pei:
        raise HTTPException(status_code=404, detail=f"PEI with id '{pei_id}' not found")
    
    if pei.status != 'completed':
        raise HTTPException(
            status_code=400,
            detail=f"Only PEIs with status 'completed' can be approved. Current status: {pei.status}"
        )
    
    # Update PEI status
    pei.status = 'concluido'
    
    # Calculate validity period (12 months from now)
    validity_info = WorkflowOrchestratorAgent.calculate_validity_period(
        approval_date=datetime.now(),
        period_months=12
    )
    
    # Update student status
    student = db.query(Student).filter(Student.id == pei.student_id).first()
    if student:
        student.status = 'active'
    
    db.commit()
    
    return {
        "status": "success",
        "message": "PEI approved successfully",
        "pei_id": pei_id,
        "validity": validity_info,
        "approved_at": datetime.now().isoformat()
    }


@app.get("/api/pei/{pei_id}/status")
def get_pei_status(pei_id: str, db: Session = Depends(get_db)):
    """
    Get detailed status of PEI including workflow information
    """
    pei = db.query(PEI).filter(PEI.id == pei_id).first()
    if not pei:
        raise HTTPException(status_code=404, detail=f"PEI with id '{pei_id}' not found")
    
    # Get professional responses
    responses = db.query(ProfessionalResponse).filter(ProfessionalResponse.pei_id == pei_id).all()
    professionals = json.loads(pei.professionals) if pei.professionals else []
    
    # Check completion status
    completion_status = WorkflowOrchestratorAgent.check_completion_status(
        total_professionals=len(professionals),
        responses_received=[
            AIProfessionalResponse(
                professional_id=r.professional_id,
                professional_type=r.professional_type,
                professional_name=r.professional_name,
                responses=json.loads(r.responses) if isinstance(r.responses, str) else r.responses,
                timestamp=r.submitted_at.isoformat()
            ) for r in responses
        ]
    )
    
    return {
        "pei_id": pei_id,
        "status": pei.status,
        "ai_processing_status": pei.ai_processing_status,
        "ai_confidence_score": pei.ai_confidence_score,
        "completion_status": completion_status,
        "responses_received": len(responses),
        "total_professionals": len(professionals),
        "professionals": [
            {
                "id": p.get('id'),
                "name": p.get('name'),
                "type": p.get('type'),
                "has_responded": any(r.professional_id == p.get('id') for r in responses)
            } for p in professionals
        ],
        "created_at": pei.created_at.isoformat() if pei.created_at else None,
        "ai_processed_at": pei.ai_processed_at.isoformat() if pei.ai_processed_at else None
    }


@app.post("/api/notifications/send-survey-links")
def send_survey_links(pei_id: str, db: Session = Depends(get_db)):
    """
    Generate survey link notifications for all professionals
    (In production, this would send SMS via Twilio or similar)
    """
    pei = db.query(PEI).filter(PEI.id == pei_id).first()
    if not pei:
        raise HTTPException(status_code=404, detail=f"PEI with id '{pei_id}' not found")
    
    student = db.query(Student).filter(Student.id == pei.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    professionals = json.loads(pei.professionals) if pei.professionals else []
    
    notifications = []
    for prof in professionals:
        # Generate survey link (in production, this would be a unique token-based link)
        survey_link = f"http://localhost:8080/formulario/{pei_id}/{prof.get('id')}"
        
        message = WorkflowOrchestratorAgent.generate_notification_message(
            notification_type="sms_survey",
            context={
                "professional_name": prof.get('name'),
                "student_name": student.name,
                "survey_link": survey_link
            }
        )
        
        notifications.append({
            "professional_id": prof.get('id'),
            "professional_name": prof.get('name'),
            "professional_phone": prof.get('phone'),
            "message": message,
            "survey_link": survey_link
        })
    
    return {
        "status": "success",
        "pei_id": pei_id,
        "notifications_generated": len(notifications),
        "notifications": notifications,
        "message": "In production, SMS would be sent via Twilio or similar service"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)


# Serve frontend static files if present (built Vite app)
# We mount the built frontend located in backend/frontend_build (created during CI/build step)
frontend_dir = os.path.join(os.path.dirname(__file__), "frontend_build")
if os.path.isdir(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
