import type {
  User,
  Exercise,
  WorkoutPlan,
  ScheduleSession,
  StudentProgress,
  Notification,
  TrainerDashboardData,
  StudentDashboardData,
} from '@/types';

const API_URL = '';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fitpro_token');
}

function setToken(token: string) {
  localStorage.setItem('fitpro_token', token);
}

function removeToken() {
  localStorage.removeItem('fitpro_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    if (res.status === 401 && !path.startsWith('/api/auth/')) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    throw new Error(body.error || `Erro ${res.status}`);
  }

  return res.json();
}

// --- Auth ---
export async function apiLogin(email: string, password: string): Promise<{ token: string; user: User }> {
  const data = await request<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function apiRegister(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  trainerId?: string;
}): Promise<{ token: string; user: User }> {
  const data = await request<{ token: string; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setToken(data.token);
  return data;
}

export async function apiGetMe(): Promise<User> {
  const data = await request<{ user: User }>('/api/auth/me');
  return data.user;
}

export function apiLogout() {
  removeToken();
}

export function hasToken(): boolean {
  return !!getToken();
}

// --- Users ---
export async function apiGetUsers(): Promise<User[]> {
  return request<User[]>('/api/users');
}

export async function apiGetUser(id: string): Promise<User> {
  return request<User>(`/api/users/${id}`);
}

export async function apiSearchStudents(q: string): Promise<User[]> {
  return request<User[]>(`/api/users/search?q=${encodeURIComponent(q)}`);
}

export async function apiAddStudent(data: { email: string; name?: string; phone?: string }): Promise<{ user: User; created: boolean; tempPassword?: string; message: string }> {
  return request<{ user: User; created: boolean; tempPassword?: string; message: string }>('/api/users/add-student', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateUser(id: string, data: { name?: string; phone?: string; avatar?: string }): Promise<User> {
  return request<User>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiChangePassword(oldPassword: string, newPassword: string): Promise<void> {
  await request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

// --- Exercises ---
export async function apiGetExercises(params?: {
  muscle_group?: string;
  difficulty?: string;
  search?: string;
}): Promise<Exercise[]> {
  const searchParams = new URLSearchParams();
  if (params?.muscle_group) searchParams.set('muscle_group', params.muscle_group);
  if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
  if (params?.search) searchParams.set('search', params.search);
  const qs = searchParams.toString();
  return request<Exercise[]>(`/api/exercises${qs ? `?${qs}` : ''}`);
}

export async function apiCreateExercise(data: Partial<Exercise>): Promise<Exercise> {
  return request<Exercise>('/api/exercises', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- Workouts ---
export async function apiGetWorkouts(): Promise<WorkoutPlan[]> {
  return request<WorkoutPlan[]>('/api/workouts');
}

export async function apiCreateWorkout(data: {
  name: string;
  description?: string;
  student_id: string;
  day_of_week: string[];
  exercises: { exercise_id: string; sets: number; reps: string; rest_seconds: number; weight?: string }[];
}): Promise<WorkoutPlan> {
  return request<WorkoutPlan>('/api/workouts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteWorkout(id: string): Promise<void> {
  await request(`/api/workouts/${id}`, { method: 'DELETE' });
}

export async function apiUpdateWorkout(id: string, data: {
  name?: string;
  description?: string;
  day_of_week?: string[];
  is_active?: boolean;
  exercises?: { exercise_id: string; sets: number; reps: string; rest_seconds: number; weight?: string }[];
}): Promise<WorkoutPlan> {
  return request<WorkoutPlan>(`/api/workouts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiCompleteExercise(
  workoutId: string,
  exerciseId: string
): Promise<{ completed: boolean }> {
  return request<{ completed: boolean }>(`/api/workouts/${workoutId}/complete-exercise`, {
    method: 'POST',
    body: JSON.stringify({ exercise_id: exerciseId }),
  });
}

export async function apiGetCompleted(workoutId: string): Promise<string[]> {
  return request<string[]>(`/api/workouts/${workoutId}/completed`);
}

export async function apiSendWorkoutFeedback(data: {
  workoutPlanId: string;
  duration: string;
  rating: number;
  intensity: string;
  observations: string;
}): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/api/workouts/feedback', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- Sessions ---
export async function apiGetSessions(params?: { date?: string; status?: string }): Promise<ScheduleSession[]> {
  const searchParams = new URLSearchParams();
  if (params?.date) searchParams.set('date', params.date);
  if (params?.status) searchParams.set('status', params.status);
  const qs = searchParams.toString();
  return request<ScheduleSession[]>(`/api/sessions${qs ? `?${qs}` : ''}`);
}

export async function apiCreateSession(data: {
  student_id: string;
  date: string;
  time: string;
  duration?: number;
  type?: string;
  notes?: string;
}): Promise<ScheduleSession> {
  return request<ScheduleSession>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateSession(id: string, data: Partial<ScheduleSession>): Promise<ScheduleSession> {
  return request<ScheduleSession>(`/api/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteSession(id: string): Promise<void> {
  await request(`/api/sessions/${id}`, { method: 'DELETE' });
}

// --- Progress ---
export async function apiGetProgress(studentId?: string): Promise<StudentProgress[]> {
  const qs = studentId ? `?student_id=${studentId}` : '';
  return request<StudentProgress[]>(`/api/progress${qs}`);
}

export async function apiCreateProgress(data: Partial<StudentProgress>): Promise<StudentProgress> {
  return request<StudentProgress>('/api/progress', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- Notifications ---
export async function apiGetNotifications(): Promise<Notification[]> {
  return request<Notification[]>('/api/notifications');
}

export async function apiMarkNotificationRead(id: string): Promise<Notification> {
  return request<Notification>(`/api/notifications/${id}/read`, { method: 'PUT' });
}

export async function apiMarkAllNotificationsRead(): Promise<void> {
  await request('/api/notifications/read-all', { method: 'PUT' });
}

// --- Dashboard ---
export async function apiGetTrainerDashboard(): Promise<TrainerDashboardData> {
  return request<TrainerDashboardData>('/api/dashboard/trainer');
}

export async function apiGetStudentDashboard(): Promise<StudentDashboardData> {
  return request<StudentDashboardData>('/api/dashboard/student');
}
