import { api } from './client';
import { toConversation, toMessage } from './mappers';
import * as S from './schemas/messaging';
import type { Conversation, Message } from './types';

export async function listConversations(): Promise<Conversation[]> {
  const res = await api().request(S.ConversationsResponse, { path: '/message/conversations' });
  return res.data.map(toConversation);
}

export async function listMessages(
  conversationId: string,
  page = 1,
  limit = 50,
): Promise<{ items: Message[]; total: number | null }> {
  const res = await api().request(S.MessagesResponse, {
    path: `/message/${conversationId}`,
    query: { page, limit },
  });
  return { items: res.data.map(toMessage), total: res.pagination?.total ?? null };
}

export async function sendMessage(receiverMemberId: string, content: string): Promise<Message> {
  const res = await api().request(S.SendMessageResponse, {
    method: 'POST',
    path: '/message',
    body: { receiverId: receiverMemberId, content },
  });
  return toMessage(res.data);
}

export async function markRead(conversationId: string): Promise<number> {
  const res = await api().request(S.MarkReadResponse, {
    method: 'POST',
    path: '/message/mark-read',
    body: { conversationId },
  });
  return res.data.count ?? 0;
}

export async function unreadCount(): Promise<number> {
  const res = await api().request(S.UnreadCountResponse, { path: '/message/unread/count' });
  return res.data.unreadCount;
}

export async function deleteMessage(messageId: string): Promise<void> {
  await api().request(S.MarkReadResponse, { method: 'DELETE', path: `/message/${messageId}` });
}
