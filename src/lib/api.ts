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
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || `Erro ${res.status}`) as Error & {
      requiresVerification?: boolean;
      email?: string;
    };
    if (data.requiresVerification) {
      err.requiresVerification = true;
      err.email = data.email;
    }
    throw err;
  }
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
  cref?: string;
}): Promise<{ message: string; requiresVerification: boolean; email: string }> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

export async function apiForgotPassword(email: string): Promise<{ message: string }> {
  return request<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(token: string, password: string): Promise<{ message: string }> {
  return request<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function apiResendVerification(email: string): Promise<{ message: string }> {
  return request<{ message: string }>('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function apiVerifyEmail(token: string): Promise<{ message: string; verified?: boolean; alreadyVerified?: boolean }> {
  return request<{ message: string; verified?: boolean; alreadyVerified?: boolean }>(`/api/auth/verify-email?token=${token}`);
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

export async function apiDeleteProgress(id: string): Promise<void> {
  await request(`/api/progress/${id}`, { method: 'DELETE' });
}

// --- Student Profile (for trainers) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiGetStudentProfile(studentId: string): Promise<any> {
  return request(`/api/students/${studentId}`);
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

// --- Admin ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiAdminDashboard(): Promise<any> {
  return request('/api/admin/dashboard');
}

export async function apiAdminGetUsers(params?: { search?: string; role?: string }): Promise<User[]> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set('search', params.search);
  if (params?.role) sp.set('role', params.role);
  const qs = sp.toString();
  return request<User[]>(`/api/admin/users${qs ? `?${qs}` : ''}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiAdminCreateUser(data: any): Promise<User> {
  return request<User>('/api/admin/users', { method: 'POST', body: JSON.stringify(data) });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiAdminUpdateUser(id: string, data: any): Promise<User> {
  return request<User>(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiAdminDeleteUser(id: string): Promise<void> {
  await request(`/api/admin/users/${id}`, { method: 'DELETE' });
}

export async function apiAdminGetExercises(params?: { search?: string; muscle_group?: string }): Promise<Exercise[]> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set('search', params.search);
  if (params?.muscle_group) sp.set('muscle_group', params.muscle_group);
  const qs = sp.toString();
  return request<Exercise[]>(`/api/admin/exercises${qs ? `?${qs}` : ''}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiAdminCreateExercise(data: any): Promise<Exercise> {
  return request<Exercise>('/api/admin/exercises', { method: 'POST', body: JSON.stringify(data) });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiAdminUpdateExercise(id: string, data: any): Promise<Exercise> {
  return request<Exercise>(`/api/admin/exercises/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiAdminDeleteExercise(id: string): Promise<void> {
  await request(`/api/admin/exercises/${id}`, { method: 'DELETE' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiAdminGetWorkouts(params?: { search?: string }): Promise<any[]> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set('search', params.search);
  const qs = sp.toString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return request<any[]>(`/api/admin/workouts${qs ? `?${qs}` : ''}`);
}

export async function apiAdminDeleteWorkout(id: string): Promise<void> {
  await request('/api/admin/workouts', { method: 'DELETE', body: JSON.stringify({ id }) });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiAdminGetSessions(params?: { search?: string; status?: string }): Promise<any[]> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set('search', params.search);
  if (params?.status) sp.set('status', params.status);
  const qs = sp.toString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return request<any[]>(`/api/admin/sessions${qs ? `?${qs}` : ''}`);
}

export async function apiAdminDeleteSession(id: string): Promise<void> {
  await request('/api/admin/sessions', { method: 'DELETE', body: JSON.stringify({ id }) });
}
