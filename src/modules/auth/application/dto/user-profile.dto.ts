import { z } from 'zod';

export const UpdateMeDtoSchema = z.object({
  fullName: z.string().trim().min(3).max(120),
});

export type UpdateMeDto = z.infer<typeof UpdateMeDtoSchema>;

export const ChangePasswordDtoSchema = z.object({
  currentPassword: z.string().min(8).max(60),
  newPassword: z.string().min(8).max(60),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;
