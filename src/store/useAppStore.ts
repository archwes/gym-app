import { create } from 'zustand';
import { User, WorkoutPlan, ScheduleSession, StudentProgress, Notification, Exercise } from '@/types';
import * as api from '@/lib/api';

interface AppState {
  currentUser: User | null;
  users: User[];
  exercises: Exercise[];
  workoutPlans: WorkoutPlan[];
  sessions: ScheduleSession[];
  progress: StudentProgress[];
  notifications: Notification[];
  sidebarOpen: boolean;
  loading: boolean;
  initialized: boolean;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: string; phone?: string; cref?: string }) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;

  // Data fetching
  fetchUsers: () => Promise<void>;
  fetchExercises: () => Promise<void>;
  fetchWorkouts: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  fetchProgress: (studentId?: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;

  // UI actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Workout actions
  addWorkoutPlan: (data: {
    name: string;
    description?: string;
    student_id: string;
    day_of_week: string[];
    exercises: { exercise_id: string; sets: number; reps: string; rest_seconds: number; weight?: string }[];
  }) => Promise<void>;
  deleteWorkoutPlan: (id: string) => Promise<void>;
  updateWorkoutPlan: (id: string, data: {
    name?: string;
    description?: string;
    day_of_week?: string[];
    is_active?: boolean;
    exercises?: { exercise_id: string; sets: number; reps: string; rest_seconds: number; weight?: string }[];
  }) => Promise<void>;

  // Session actions
  addSession: (data: {
    student_id: string;
    date: string;
    time: string;
    duration?: number;
    type?: string;
    notes?: string;
  }) => Promise<void>;
  cancelSession: (id: string) => Promise<void>;

  // Progress actions
  addProgress: (data: Partial<StudentProgress>) => Promise<void>;

  // Student management
  addStudent: (data: { email: string; name?: string; phone?: string }) => Promise<{ created: boolean; tempPassword?: string; message: string }>;

  // Profile
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<void>;

  // Notification actions
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [],
  exercises: [],
  workoutPlans: [],
  sessions: [],
  progress: [],
  notifications: [],
  sidebarOpen: false,
  loading: false,
  initialized: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { user } = await api.apiLogin(email, password);
      set({ currentUser: user, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      await api.apiRegister(data);
      set({ loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: () => {
    api.apiLogout();
    set({
      currentUser: null,
      users: [],
      exercises: [],
      workoutPlans: [],
      sessions: [],
      progress: [],
      notifications: [],
      initialized: false,
    });
  },

  restoreSession: async () => {
    if (!api.hasToken()) {
      set({ initialized: true });
      return;
    }
    try {
      const user = await api.apiGetMe();
      set({ currentUser: user, initialized: true });
    } catch {
      api.apiLogout();
      set({ initialized: true });
    }
  },

  fetchUsers: async () => {
    try {
      const users = await api.apiGetUsers();
      set({ users });
    } catch { /* ignore */ }
  },

  fetchExercises: async () => {
    try {
      const exercises = await api.apiGetExercises();
      set({ exercises });
    } catch { /* ignore */ }
  },

  fetchWorkouts: async () => {
    try {
      const workoutPlans = await api.apiGetWorkouts();
      set({ workoutPlans });
    } catch { /* ignore */ }
  },

  fetchSessions: async () => {
    try {
      const sessions = await api.apiGetSessions();
      set({ sessions });
    } catch { /* ignore */ }
  },

  fetchProgress: async (studentId) => {
    try {
      const progress = await api.apiGetProgress(studentId);
      set({ progress });
    } catch { /* ignore */ }
  },

  fetchNotifications: async () => {
    try {
      const notifications = await api.apiGetNotifications();
      set({ notifications });
    } catch { /* ignore */ }
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addWorkoutPlan: async (data) => {
    await api.apiCreateWorkout(data);
    await get().fetchWorkouts();
  },

  deleteWorkoutPlan: async (id) => {
    await api.apiDeleteWorkout(id);
    set((state) => ({
      workoutPlans: state.workoutPlans.filter((p) => p.id !== id),
    }));
  },

  updateWorkoutPlan: async (id, data) => {
    await api.apiUpdateWorkout(id, data);
    await get().fetchWorkouts();
  },

  addSession: async (data) => {
    await api.apiCreateSession(data);
    await get().fetchSessions();
  },

  cancelSession: async (id) => {
    await api.apiUpdateSession(id, { status: 'cancelled' });
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, status: 'cancelled' as const } : s
      ),
    }));
  },

  addProgress: async (data) => {
    await api.apiCreateProgress(data);
    await get().fetchProgress(data.student_id);
  },

  addStudent: async (data) => {
    const result = await api.apiAddStudent(data);
    await get().fetchUsers();
    return result;
  },

  updateProfile: async (data) => {
    const user = get().currentUser;
    if (!user) throw new Error('Não logado');
    const updated = await api.apiUpdateUser(user.id, data);
    set({ currentUser: { ...user, ...updated } });
  },

  markNotificationRead: async (id) => {
    await api.apiMarkNotificationRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: 1 } : n
      ),
    }));
  },

  markAllNotificationsRead: async () => {
    await api.apiMarkAllNotificationsRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: 1 })),
    }));
  },
}));
