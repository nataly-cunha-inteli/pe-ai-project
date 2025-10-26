// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface Student {
  id: string;
  name: string;
  status: 'active' | 'pending_form' | 'resend_form';
  hasAccess: boolean;
}

export interface StudentCreate {
  id: string;
  name: string;
  status: 'active' | 'pending_form' | 'resend_form';
  hasAccess: boolean;
}

export interface StudentUpdate {
  name?: string;
  status?: 'active' | 'pending_form' | 'resend_form';
  hasAccess?: boolean;
}

export interface Respondent {
  id: string;
  student_id: string;
  role: string;
  name: string;
  email: string | null;
  phone: string;
  status: 'link' | 'access' | 'completed';
}

export interface PEI {
  id: string;
  student_id: string;
  status: string;
  created_at: string;
  special_needs: string | null;
  has_diagnosis: string | null;
  initial_observations: string | null;
  professionals: Array<{
    id: string;
    type: string;
    name: string;
    phone: string;
    email?: string;
    specialty?: string;
  }> | null;
  ai_processing_status: string | null;
  ai_confidence_score: string | null;
  ai_processed_at: string | null;
  ai_warnings: string[] | null;
  ai_suggestions: string[] | null;
  cognitive_report: string | null;
  strengths: string[] | null;
  difficulties: string[] | null;
  short_term_goals: string[] | null;
  medium_term_goals: string[] | null;
  long_term_goals: string[] | null;
  teaching_strategies: string | null;
  assistive_resources: string[] | null;
  evaluation_methods: string | null;
  responses_count?: number;
  total_professionals?: number;
}

export interface ProfessionalResponse {
  id: string;
  pei_id: string;
  professional_id: string;
  professional_type: string;
  professional_name: string;
  responses: Record<string, unknown>;
  submitted_at: string;
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Fetch all students
 */
export async function getStudents(): Promise<Student[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students`);
    
    if (!response.ok) {
      throw new APIError(response.status, `Failed to fetch students: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch a single student by ID
 */
export async function getStudent(id: string): Promise<Student> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new APIError(404, `Student with ID '${id}' not found`);
      }
      throw new APIError(response.status, `Failed to fetch student: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new student
 */
export async function createStudent(student: StudentCreate): Promise<Student> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.detail || 'Failed to create student');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing student
 */
export async function updateStudent(id: string, updates: StudentUpdate): Promise<Student> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.detail || 'Failed to update student');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a student
 */
export async function deleteStudent(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.detail || 'Failed to delete student');
    }
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch all respondents for a specific student
 */
export async function getStudentRespondents(studentId: string): Promise<Respondent[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/respondents`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new APIError(404, `Student with ID '${studentId}' not found`);
      }
      throw new APIError(response.status, `Failed to fetch respondents: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch all PEIs (ordered by most recent)
 */
export async function getAllPEIs(): Promise<PEI[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/peis`);
    
    if (!response.ok) {
      throw new APIError(response.status, `Failed to fetch PEIs: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch PEI by ID
 */
export async function getPEI(peiId: string): Promise<PEI> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pei/${peiId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new APIError(404, `PEI with ID '${peiId}' not found`);
      }
      throw new APIError(response.status, `Failed to fetch PEI: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch PEI for a specific student
 */
export async function getStudentPEI(studentId: string): Promise<PEI> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/pei`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new APIError(404, `No PEI found for student with ID '${studentId}'`);
      }
      throw new APIError(response.status, `Failed to fetch student PEI: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new PEI
 */
export async function createPEI(peiData: {
  student_name: string;
  special_needs: string[];
  has_diagnosis: string;
  initial_observations?: string;
  professionals: Array<{
    id: string;
    type: string;
    name: string;
    phone: string;
    email?: string;
    specialty?: string;
  }>;
}): Promise<PEI> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pei`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(peiData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.detail || 'Failed to create PEI');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Submit professional response to a PEI
 */
export async function submitProfessionalResponse(
  peiId: string, 
  professionalId: string, 
  responses: Record<string, unknown>
): Promise<ProfessionalResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pei/${peiId}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pei_id: peiId,
        professional_id: professionalId,
        responses,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.detail || 'Failed to submit response');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all professional responses for a PEI
 */
export async function getPEIResponses(peiId: string): Promise<ProfessionalResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pei/${peiId}/responses`);
    
    if (!response.ok) {
      throw new APIError(response.status, `Failed to fetch PEI responses: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Trigger AI processing for a PEI (manual trigger for testing)
 */
export async function triggerAIProcessing(peiId: string): Promise<{ message: string; pei_id: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pei/${peiId}/process-ai`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.detail || 'Failed to trigger AI processing');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Approve PEI (simulates auditor approval) - changes status to 'concluido'
 */
export async function approvePEI(peiId: string): Promise<{ message: string; pei_id: string; status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pei/${peiId}/approve`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.detail || 'Failed to approve PEI');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload educational material for AI adaptation
 */
export async function uploadMaterial(
  studentId: string,
  file: File,
  title: string,
  subject?: string,
  grade?: string
): Promise<{ id: string; status: string; message: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (subject) formData.append('subject', subject);
    if (grade) formData.append('grade', grade);

    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/materials/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.detail || 'Failed to upload material');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all adapted materials for a student
 */
export interface AdaptedMaterial {
  id: string;
  title: string;
  subject: string | null;
  grade: string | null;
  original_filename: string;
  status: 'processing' | 'completed' | 'error';
  uploaded_at: string | null;
  processed_at: string | null;
  has_adaptation: boolean;
}

export async function getStudentMaterials(studentId: string): Promise<AdaptedMaterial[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/materials`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.detail || 'Failed to fetch materials');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get detailed information about an adapted material
 */
export interface MaterialDetails extends AdaptedMaterial {
  student_id: string;
  pei_id: string | null;
  original_content: string | null;
  adaptation_result: Record<string, unknown> | null;
}

export async function getMaterialDetails(materialId: string): Promise<MaterialDetails> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/materials/${materialId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.detail || 'Failed to fetch material details');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
