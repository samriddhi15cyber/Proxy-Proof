import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  availablePersonas: any[];
  isLoading: boolean;
  isDemoMode: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  switchPersona: (userId: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_FALLBACK_USER: User = {
  id: 'stu-1',
  name: 'Alex Rivera',
  email: 'alex.rivera@student.university.edu',
  role: 'student',
  studentId: 'VIT2026-CS-084',
  department: 'School of Computer Science & Engineering',
  avatarUrl: '/src/assets/images/avatar_student_alex_1792170549383.jpg',
  enrolledCourseIds: ['course-1', 'course-2', 'course-3'],
};

const DEFAULT_PERSONAS = [
  { id: 'stu-1', name: 'Alex Rivera', role: 'student', department: 'School of Computer Science & Engineering', code: 'VIT2026-CS-084' },
  { id: 'tea-1', name: 'Dr. Elena Rostova', role: 'teacher', department: 'Department of Network Engineering & Security', code: 'FAC-CS-109' },
  { id: 'adm-1', name: 'Dean Marcus Vance', role: 'admin', department: 'Office of Academic Affairs & Registrar', code: 'FAC-ADM-001' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_FALLBACK_USER);
  const [availablePersonas, setAvailablePersonas] = useState<any[]>(DEFAULT_PERSONAS);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  const refreshAuth = async () => {
    try {
      const data = await api.getAuthMe();
      if (data?.user) {
        setUser(data.user);
      }
      if (data?.availablePersonas?.length) {
        setAvailablePersonas(data.availablePersonas);
      }
    } catch (err) {
      console.warn('Initial auth fetch warning, using collegiate demo profile:', err);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const switchPersona = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await api.switchPersona(userId);
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to switch persona:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (next === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        availablePersonas,
        isLoading,
        isDemoMode,
        theme,
        toggleTheme,
        switchPersona,
        refreshAuth,
      }}
    >
      <div className={theme === 'dark' ? 'dark' : ''}>{children}</div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
