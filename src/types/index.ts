export type UserRole = 'trainer' | 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  cref?: string;
  email_verified?: number;
  created_at: string;
  trainer_id?: string | null;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  equipment: string;
  description: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  created_by?: string;
  created_at?: string;
}

export interface WorkoutExercise {
  id: string;
  workout_plan_id: string;
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  weight?: string;
  notes?: string;
  sort_order: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  trainer_id: string;
  student_id: string;
  day_of_week: string;
  is_active: number;
  created_at: string;
  exercises: WorkoutExercise[];
  student?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

export interface ScheduleSession {
  id: string;
  trainer_id: string;
  student_id: string;
  student_name?: string;
  student_avatar?: string;
  trainer_name?: string;
  trainer_avatar?: string;
  date: string;
  time: string;
  duration: number;
  type: 'Treino' | 'Avaliação' | 'Consulta';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  session_id?: string;
  date: string;
  weight: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  is_read: number;
  created_at: string;
}

export type MuscleGroup =
  | 'Peito'
  | 'Costas'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Quadríceps'
  | 'Posterior'
  | 'Glúteos'
  | 'Panturrilha'
  | 'Abdômen'
  | 'Core'
  | 'Corpo Inteiro';

export interface TrainerDashboardData {
  stats: {
    totalStudents: number;
    activePlans: number;
    todaySessions: number;
    completedSessions: number;
  };
  todaySchedule: ScheduleSession[];
  recentStudents: User[];
}

export interface StudentDashboardData {
  stats: {
    activePlans: number;
    todayCompletedExercises: number;
    totalSessions: number;
    unreadNotifications: number;
  };
  latestProgress: StudentProgress | null;
  upcomingSessions: ScheduleSession[];
}
