import { api } from './client';
import { toProfileView } from './mappers';
import * as S from './schemas/profile';
import type { ProfileView, Visibility } from './types';

export async function getProfile(profileId: string): Promise<ProfileView> {
  const res = await api().request(S.ProfileResponse, { path: `/profile/${profileId}` });
  return toProfileView(res.data);
}

export async function getMyProfile(): Promise<ProfileView> {
  const res = await api().request(S.ProfileResponse, { path: '/profile/me/profile' });
  return toProfileView(res.data);
}

/** Partial update; the field names are the server's (see profile.schema.ts on the server). */
export async function updateProfile(fields: Record<string, unknown>): Promise<void> {
  await api().request(S.UpdateProfileResponse, { method: 'PUT', path: '/profile', body: fields });
}

export async function createProfile(fields: Record<string, unknown>): Promise<void> {
  await api().request(S.UpdateProfileResponse, { method: 'POST', path: '/profile', body: fields });
}

export async function setPrimaryPhoto(objectKey: string): Promise<void> {
  await api().request(S.UpdateProfileResponse, {
    method: 'PUT',
    path: '/profile/update-photo',
    body: { photoKey: objectKey },
  });
}

export async function setVisibility(visibility: Visibility): Promise<void> {
  await api().request(S.UpdateProfileResponse, {
    method: 'PATCH',
    path: '/profile/visibility',
    body: { visibility },
  });
}

export async function deleteProfile(): Promise<void> {
  await api()
    .request(S.UpdateProfileResponse.or(S.ViewersResponse).or(S.ProfileResponse), {
      method: 'DELETE',
      path: '/profile',
    })
    .catch(() => undefined);
}
