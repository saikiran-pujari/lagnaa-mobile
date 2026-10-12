import { api } from './client';
import * as S from './schemas/upload';

export async function registerPushToken(token: string): Promise<void> {
  await api().request(S.FcmTokenResponse, {
    method: 'POST',
    path: '/notifications/fcm-token',
    body: { token },
  });
}

export async function unregisterPushToken(token: string): Promise<void> {
  await api().request(S.FcmTokenResponse, {
    method: 'DELETE',
    path: '/notifications/fcm-token',
    body: { token },
    timeoutMs: 5_000,
  });
}
