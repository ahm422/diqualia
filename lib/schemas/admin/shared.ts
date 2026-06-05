import { z } from "zod";

export const shortStr  = z.string().min(1).max(200);
export const longStr   = z.string().min(1).max(2000);
export const urlStr    = z.string().min(1).max(500);
export const labelStr  = z.string().min(1).max(100);
export const statStr   = z.string().min(1).max(50);
export const orderNum  = z.number().int().min(0);
