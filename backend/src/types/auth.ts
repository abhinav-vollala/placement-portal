// Values match the Role enum in prisma/schema.prisma.
export type Role = 'STUDENT' | 'RECRUITER' | 'ADMIN';

// The claims we sign into the JWT and later attach to req.user.
export interface AuthUser {
  userId: string;
  role: Role;
}
