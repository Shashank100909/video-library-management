import { UserRole } from '@prisma/client';

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}