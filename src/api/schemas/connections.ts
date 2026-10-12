import { z } from 'zod';

import { envelope, isoDate, nullableString } from './common';

const MiniProfile = z.looseObject({
  id: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePhoto: nullableString,
  city: nullableString,
  profession: nullableString,
  age: z.number().nullable().optional(),
});

const Party = z.looseObject({ id: z.string(), profile: MiniProfile.nullable().optional() });

export const Interest = z.looseObject({
  id: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']),
  message: nullableString,
  responseMessage: nullableString,
  createdAt: isoDate,
  respondedAt: isoDate.nullable().optional(),
  sender: Party.optional(),
  receiver: Party.optional(),
});

export const InterestListResponse = z.looseObject({
  success: z.literal(true),
  data: z.array(Interest).optional(),
  interests: z.array(Interest).optional(),
  pagination: z
    .looseObject({
      page: z.number().optional(),
      limit: z.number().optional(),
      total: z.number().optional(),
    })
    .optional(),
});

export const InterestMutationResponse = envelope(
  z.looseObject({ id: z.string().optional() }).nullable(),
);

export const InterestStatsResponse = envelope(
  z.looseObject({
    sent: z.number(),
    received: z.number(),
    accepted: z.number(),
    connections: z.number(),
  }),
);

export const ContactRequest = z.looseObject({
  id: z.string(),
  requesterId: z.string(),
  recipientId: z.string(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
  createdAt: isoDate,
  respondedAt: isoDate.nullable().optional(),
  requester: Party.optional(),
  recipient: Party.optional(),
});

export const ContactRequestListResponse = z.looseObject({
  success: z.literal(true),
  data: z.array(ContactRequest),
});
export const ContactRequestMutationResponse = envelope(
  z.looseObject({ id: z.string().optional() }).nullable(),
);

export const ShortlistEntry = z.looseObject({
  id: z.string(),
  shortlistedUserId: z.string().optional(),
  createdAt: isoDate.optional(),
  shortlistedUser: Party.optional(),
  shortlister: Party.optional(),
});
export const ShortlistListResponse = z.looseObject({
  success: z.literal(true),
  data: z.array(ShortlistEntry),
});

export const BlockedEntry = z.looseObject({
  id: z.string(),
  blockedUserId: z.string(),
  createdAt: isoDate.optional(),
  blockedUser: Party.optional(),
});
export const BlockedListResponse = z.looseObject({
  success: z.literal(true),
  data: z.array(BlockedEntry),
});

export const Report = z.looseObject({
  id: z.string(),
  reason: z.string(),
  description: nullableString,
  status: z.string(),
  createdAt: isoDate,
  reportedUser: Party.optional(),
});
export const MyReportsResponse = envelope(z.array(Report));
