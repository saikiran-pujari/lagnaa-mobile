import { z } from 'zod';

import { cursorPagination, envelope, isoDate, nullableString, pagePagination } from './common';

export const SearchCard = z.looseObject({
  id: z.string(),
  name: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  age: z.number().nullable().optional(),
  gender: z.string().optional(),
  height: z.number().nullable().optional(),
  city: nullableString,
  state: nullableString,
  education: nullableString,
  profession: nullableString,
  profileImage: nullableString,
  profilePhoto: nullableString,
  isPremium: z.boolean().optional(),
  lastActive: isoDate.nullable().optional(),
  activeToday: z.boolean().optional(),
  maritalStatus: nullableString,
  subCaste: nullableString,
  profileFor: z.string().nullable().optional(),
  compatibilityScore: z.number().optional(),
  interestStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']).optional(),
  user: z.looseObject({ id: z.string(), isVerified: z.boolean().optional() }).optional(),
  userId: z.string().optional(),
});

/** Search uses the `profiles` key (not `data`) and either pagination shape. */
export const SearchResponse = z.looseObject({
  success: z.literal(true),
  profiles: z.array(SearchCard),
  pagination: z.union([cursorPagination, pagePagination]),
});

export const RecommendationsResponse = envelope(z.array(SearchCard));
