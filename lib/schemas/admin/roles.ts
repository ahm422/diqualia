import { z } from "zod";

import { permissionKeySchema } from "./users";

export const roleWriteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Role name must be letters, numbers, underscore, or hyphen"),
  permissionKeys: z.array(permissionKeySchema).min(1),
});
export type RoleWrite = z.infer<typeof roleWriteSchema>;
