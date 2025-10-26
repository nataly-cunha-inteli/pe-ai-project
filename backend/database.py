from sqlalchemy import create_engine, Column, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# SQLite database - SEMPRE usa backend/students.db
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "students.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

print(f"📊 Usando banco de dados em: {DATABASE_PATH}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, nullable=False)  # 'active', 'pending_form', 'resend_form'
    hasAccess = Column(Boolean, default=False)
    birth_date = Column(String, nullable=True)
    grade = Column(String, nullable=True)
    school = Column(String, nullable=True)
    
    # Relationships
    respondents = relationship("Respondent", back_populates="student", cascade="all, delete-orphan")
    peis = relationship("PEI", back_populates="student", cascade="all, delete-orphan")


class Respondent(Base):
    __tablename__ = "respondents"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    role = Column(String, nullable=False)  # 'Pai', 'Mãe', 'Professor', etc.
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=False)
    status = Column(String, nullable=False)  # 'link', 'access', 'completed'
    
    # Relationship
    student = relationship("Student", back_populates="respondents")


class PEI(Base):
    __tablename__ = "peis"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    status = Column(String, nullable=False)  # 'draft', 'in_collection', 'in_review', 'completed', 'expired'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Step 1: Student Info
    special_needs = Column(Text, nullable=True)  # JSON array of needs
    has_diagnosis = Column(String, nullable=True)  # 'yes', 'no', 'in_evaluation'
    initial_observations = Column(Text, nullable=True)
    
    # Step 2: Professionals (stored as JSON)
    professionals = Column(Text, nullable=True)  # JSON array of professionals
    
    # AI Processing metadata
    ai_processing_status = Column(String, nullable=True)  # 'pending', 'processing', 'completed', 'failed'
    ai_confidence_score = Column(String, nullable=True)
    ai_processed_at = Column(DateTime, nullable=True)
    ai_warnings = Column(Text, nullable=True)  # JSON array
    ai_suggestions = Column(Text, nullable=True)  # JSON array
    
    # Generated content
    cognitive_report = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)  # JSON array
    difficulties = Column(Text, nullable=True)  # JSON array
    short_term_goals = Column(Text, nullable=True)  # JSON array
    medium_term_goals = Column(Text, nullable=True)  # JSON array
    long_term_goals = Column(Text, nullable=True)  # JSON array
    teaching_strategies = Column(Text, nullable=True)
    assistive_resources = Column(Text, nullable=True)  # JSON array
    evaluation_methods = Column(Text, nullable=True)
    
    # Relationships
    student = relationship("Student", back_populates="peis")
    professional_responses = relationship("ProfessionalResponse", back_populates="pei", cascade="all, delete-orphan")


class ProfessionalResponse(Base):
    __tablename__ = "professional_responses"

    id = Column(String, primary_key=True, index=True)
    pei_id = Column(String, ForeignKey("peis.id"), nullable=False)
    professional_id = Column(String, nullable=False)  # ID do professional no array de professionals do PEI
    professional_type = Column(String, nullable=False)  # psicologo, professor, pai, terapeuta, etc
    professional_name = Column(String, nullable=False)
    
    # Response data (stored as JSON)
    responses = Column(Text, nullable=False)  # JSON object with all answers
    
    # Metadata
    submitted_at = Column(DateTime, default=datetime.utcnow)
    response_token = Column(String, nullable=True)  # Token único para acesso ao formulário
    
    # Relationship
    pei = relationship("PEI", back_populates="professional_responses")


class AdaptedMaterial(Base):
    __tablename__ = "adapted_materials"
    
    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    pei_id = Column(String, ForeignKey("peis.id"), nullable=True)
    
    # Original material info
    original_filename = Column(String, nullable=False)
    original_content = Column(Text, nullable=True)  # Extracted text from PDF
    
    # Metadata
    title = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    grade = Column(String, nullable=True)
    
    # AI Adaptation result (JSON)
    adaptation_result = Column(Text, nullable=True)  # Stores full JSON from MaterialAdapterAgent
    
    # Generated PDF
    adapted_pdf_path = Column(String, nullable=True)  # Path to generated PDF file
    
    # Status
    status = Column(String, default='processing')  # 'processing', 'completed', 'error'
    
    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    student = relationship("Student")
    pei = relationship("PEI")


def init_db():
    """Create tables and populate with initial data"""
    Base.metadata.create_all(bind=engine)
    
    # Check if data already exists
    db = SessionLocal()
    existing_students = db.query(Student).count()
    
    if existing_students == 0:
        # Add 9 students - NENHUM COM PEI CRIADO
        initial_students = [
            Student(id='1', name='Ana Clara Silva', status='pending_form', hasAccess=False),
            Student(id='2', name='Bruno Henrique Costa', status='pending_form', hasAccess=False),
            Student(id='3', name='Carolina Ribeiro Santos', status='pending_form', hasAccess=False),
            Student(id='4', name='Daniel Oliveira Lima', status='pending_form', hasAccess=False),
            Student(id='5', name='Eduardo Ferreira Alves', status='pending_form', hasAccess=False),
            Student(id='6', name='Fernanda Souza Martins', status='pending_form', hasAccess=False),
            Student(id='7', name='Gabriel Pereira Rocha', status='pending_form', hasAccess=False),
            Student(id='8', name='Helena Cardoso Mendes', status='pending_form', hasAccess=False),
            Student(id='9', name='Igor Barbosa Cavalcante', status='pending_form', hasAccess=False),
        ]
        
        db.add_all(initial_students)
        db.commit()
        print("✅ Database initialized with 9 students")
        print("📝 All students start with NO PEI created")
        print("💡 Use 'Criar novo PEI' button to start the workflow")
    else:
        print(f"ℹ️  Database already contains {existing_students} students")
    
    db.close()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
