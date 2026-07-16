import type { AuthUser } from '@/features/auth/models/userModel';
import type { StudentProfile } from '@/features/student/models/studentProfile';

type UnknownRecord = Record<string, unknown>;
const asRecord = (value: unknown): UnknownRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
const asString = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;

export const normalizeStudentProfile = (value: unknown): StudentProfile => {
  const student = asRecord(value);
  const user = asRecord(student.user);
  const role: AuthUser['role'] = user.role === 'COMPANY' || user.role === 'ADMIN' ? user.role : 'STUDENT';
  return {
    id: String(student.id ?? ''),
    userId: String(student.userId ?? user.id ?? ''),
    phone: asString(student.phone),
    location: asString(student.location),
    educationLevel: asString(student.educationLevel),
    targetJob: asString(student.targetJob),
    bio: asString(student.bio),
    availabilityDate: asString(student.availabilityDate),
    createdAt: asString(student.createdAt),
    updatedAt: asString(student.updatedAt),
    user: {
      id: String(user.id ?? student.userId ?? ''),
      email: String(user.email ?? ''),
      role,
      firstName: asString(user.firstName),
      lastName: asString(user.lastName),
    },
  };
};

