import { z } from "zod";

import { PERMISSION_KEYS } from "@/lib/auth/session";

export const permissionKeySchema = z.enum(PERMISSION_KEYS);

export const userCreateSchema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().max(200).optional().nullable(),
  roleId: z.string().uuid(),
  password: z.string().min(8).max(1024),
});
export type UserCreate = z.infer<typeof userCreateSchema>;

export const userPatchSchema = z.object({
  email: z.string().trim().email().max(254).optional(),
  name: z.string().trim().max(200).optional().nullable(),
  roleId: z.string().uuid().optional(),
  password: z.string().min(8).max(1024).optional(),
});
export type UserPatch = z.infer<typeof userPatchSchema>;
