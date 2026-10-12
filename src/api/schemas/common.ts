import { z } from 'zod';

/** Server envelope: { success: true, data, message? } */
export const envelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ success: z.literal(true), data, message: z.string().optional() });

export const pagePagination = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const cursorPagination = z.object({
  limit: z.number(),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});

export const isoDate = z.string();
export const uuid = z.string().uuid();
export const nullableString = z.string().nullable().optional();
