# Backend Python API

## Setup

1. Criar ambiente virtual (recomendado):
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

2. Instalar dependências:
```powershell
pip install -r requirements.txt
```

3. Rodar o servidor:
```powershell
python main.py
```

Ou usando uvicorn diretamente:
```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /api/students` - Listar todos os alunos
- `GET /api/students/{id}` - Buscar aluno por ID
- `POST /api/students` - Criar novo aluno
- `PUT /api/students/{id}` - Atualizar aluno
- `DELETE /api/students/{id}` - Deletar aluno

## Documentação Interativa

Acesse após iniciar o servidor:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Banco de Dados

SQLite database será criado automaticamente em `students.db` com os dados iniciais dos 6 alunos.
