import { z } from 'zod';

import { envelope, isoDate } from './common';

const Party = z.looseObject({
  id: z.string(),
  profile: z
    .looseObject({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      profilePhoto: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const Message = z.looseObject({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  isRead: z.boolean(),
  readAt: isoDate.nullable().optional(),
  createdAt: isoDate,
  sender: Party.optional(),
});

export const Conversation = z.looseObject({
  id: z.string(),
  otherUser: Party.nullable().optional(),
  lastMessage: Message.nullable().optional(),
  unreadCount: z.number().optional().default(0),
  lastMessageAt: isoDate.optional(),
});

export const ConversationsResponse = envelope(z.array(Conversation));
export const MessagesResponse = z.looseObject({
  success: z.literal(true),
  data: z.array(Message),
  pagination: z
    .looseObject({
      page: z.number().optional(),
      limit: z.number().optional(),
      total: z.number().optional(),
    })
    .optional(),
});
export const SendMessageResponse = envelope(Message);
export const MarkReadResponse = envelope(z.looseObject({ count: z.number().optional() }));
export const UnreadCountResponse = envelope(z.looseObject({ unreadCount: z.number() }));
