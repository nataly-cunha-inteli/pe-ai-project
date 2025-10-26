# Guia de Execução - PE-AI com SQLite

## ✅ O que foi implementado:

1. **Backend Python com FastAPI + SQLite**
   - API REST completa para gerenciar alunos
   - Banco de dados SQLite com os 6 alunos iniciais
   - CORS configurado para integração com frontend

2. **Frontend atualizado**
   - Serviço de API (`src/services/api.ts`) para consumir endpoints
   - `Students.tsx` busca dados reais da API
   - `StudentHistory.tsx` busca dados do aluno específico por ID
   - Estados de loading e erro implementados

3. **Dados iniciais no banco:**
   - ID 1: Cecília Galvão (status: active)
   - ID 2: Pablo Azevedo (status: resend_form)
   - ID 3: Mariana Souza (status: pending_form)
   - ID 4: Nataly Cunha (status: pending_form)
   - ID 5: Heitor Cândido (status: pending_form)
   - ID 6: Caio Alcântara (status: resend_form)

---

## 🚀 Como executar:

### 1. Iniciar o Backend (Terminal 1)

```powershell
# Navegar para a pasta backend
cd backend

# Criar ambiente virtual (primeira vez)
python -m venv venv

# Ativar ambiente virtual
.\venv\Scripts\Activate.ps1

# Instalar dependências (primeira vez)
pip install -r requirements.txt

# Iniciar o servidor
python main.py
```

O backend estará rodando em: **http://localhost:8000**

Documentação interativa: **http://localhost:8000/docs**

### 2. Iniciar o Frontend (Terminal 2)

```powershell
# Na raiz do projeto
npm install  # Se ainda não instalou as dependências

# Iniciar o Vite
npm run dev
```

O frontend estará rodando em: **http://localhost:5173**

---

## 🧪 Como testar:

1. **Acesse a página de alunos:** http://localhost:5173/students

2. **Teste a navegação:**
   - Clique em "Gerar aula" para Cecília Galvão (ID 1) → deve redirecionar para `/students/1/generate-class`
   - Clique em "Reenviar formulário" para Pablo Azevedo (ID 2) → deve redirecionar para `/students/2/history`
   - Clique no ícone de histórico de qualquer aluno → deve redirecionar para `/students/{id}/history` correto

3. **Verifique os IDs:**
   - Abra o console do navegador (F12)
   - Veja os logs mostrando o ID correto do aluno
   - Na página StudentHistory, o nome do aluno deve aparecer corretamente baseado no ID da URL

4. **Teste a API diretamente:**
   - Acesse http://localhost:8000/docs
   - Teste os endpoints GET /api/students e GET /api/students/{id}

---

## 📁 Estrutura criada:

```
pe-ai-v00/
├── backend/
│   ├── main.py              # FastAPI app com endpoints
│   ├── database.py          # SQLAlchemy models e init
│   ├── requirements.txt     # Dependências Python
│   ├── README.md           # Documentação do backend
│   └── students.db         # SQLite database (criado automaticamente)
├── src/
│   ├── services/
│   │   └── api.ts          # Service para consumir API
│   ├── pages/
│   │   ├── Students.tsx    # ✅ Atualizado para usar API
│   │   └── StudentHistory.tsx  # ✅ Atualizado para usar API
└── .env                     # Variáveis de ambiente (VITE_API_BASE_URL)
```

---

## 🔧 Troubleshooting:

### Backend não inicia:
```powershell
# Verificar se o Python está instalado
python --version

# Reinstalar dependências
pip install -r requirements.txt --force-reinstall
```

### Frontend não conecta à API:
- Verifique se o backend está rodando em http://localhost:8000
- Verifique o arquivo `.env` na raiz do projeto
- Veja o console do navegador para erros de CORS

### Banco de dados corrompido:
```powershell
# Deletar o banco e recriar
cd backend
rm students.db
python main.py  # Recria automaticamente com dados iniciais
```

---

## 🎯 Próximos passos (opcional):

1. Implementar página GenerateClass.tsx para consumir API
2. Adicionar endpoint para histórico de arquivos do aluno
3. Implementar upload de PDFs
4. Adicionar autenticação/login
5. Deploy (frontend no Vercel, backend no Railway/Render)

---

**Pronto!** Agora você tem um sistema completo com backend SQLite e frontend integrado. Todos os IDs são mantidos consistentemente e a navegação funciona corretamente! 🎉
