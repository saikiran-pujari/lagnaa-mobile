import { api } from './client';
import { toContactRequest, toInterest, toMiniMember } from './mappers';
import * as S from './schemas/connections';
import type { ContactRequest, Interest, InterestStats, InterestStatus, MiniMember } from './types';

export async function sendInterest(receiverMemberId: string, message?: string): Promise<void> {
  await api().request(S.InterestMutationResponse, {
    method: 'POST',
    path: '/interest/send',
    body: { receiverId: receiverMemberId, message },
  });
}

export async function respondToInterest(
  interestId: string,
  status: 'ACCEPTED' | 'REJECTED',
  responseMessage?: string,
): Promise<void> {
  await api().request(S.InterestMutationResponse, {
    method: 'POST',
    path: '/interest/respond',
    body: { interestId, status, responseMessage },
  });
}

export async function cancelInterest(interestId: string): Promise<void> {
  await api().request(S.InterestMutationResponse, {
    method: 'DELETE',
    path: `/interest/${interestId}`,
  });
}

export async function listInterests(
  type: 'sent' | 'received',
  status?: InterestStatus,
  limit = 50,
): Promise<Interest[]> {
  const res = await api().request(S.InterestListResponse, {
    path: '/interest',
    query: { type, status, limit },
  });
  return (res.data ?? res.interests ?? []).map(toInterest);
}

export async function interestStats(): Promise<InterestStats> {
  const res = await api().request(S.InterestStatsResponse, { path: '/interest/stats' });
  return res.data;
}

export async function sendContactRequest(recipientMemberId: string): Promise<void> {
  await api().request(S.ContactRequestMutationResponse, {
    method: 'POST',
    path: '/contact-request/send',
    body: { recipientId: recipientMemberId },
  });
}

export async function respondToContactRequest(
  contactRequestId: string,
  status: 'ACCEPTED' | 'REJECTED',
): Promise<void> {
  await api().request(S.ContactRequestMutationResponse, {
    method: 'POST',
    path: '/contact-request/respond',
    body: { contactRequestId, status },
  });
}

export async function listContactRequests(
  type: 'sent' | 'received',
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED',
  limit = 50,
): Promise<ContactRequest[]> {
  const res = await api().request(S.ContactRequestListResponse, {
    path: '/contact-request',
    query: { type, status, limit, page: 1 },
  });
  return res.data.map(toContactRequest);
}

export async function listShortlist(): Promise<MiniMember[]> {
  const res = await api().request(S.ShortlistListResponse, {
    path: '/shortlist',
    query: { limit: 100 },
  });
  return res.data
    .map((e) => toMiniMember(e.shortlistedUser))
    .filter((m): m is MiniMember => m !== null);
}

export async function listShortlistedBy(): Promise<MiniMember[]> {
  const res = await api().request(S.ShortlistListResponse, {
    path: '/shortlist/shortlisted-by',
    query: { page: 1, limit: 20 },
  });
  return res.data
    .map((e) => toMiniMember(e.shortlister))
    .filter((m): m is MiniMember => m !== null);
}

export async function addToShortlist(memberId: string): Promise<void> {
  await api().request(S.InterestMutationResponse, {
    method: 'POST',
    path: `/shortlist/${memberId}`,
  });
}

export async function removeFromShortlist(memberId: string): Promise<void> {
  await api().request(S.InterestMutationResponse, {
    method: 'DELETE',
    path: `/shortlist/${memberId}`,
  });
}

export async function blockMember(memberId: string): Promise<void> {
  await api().request(S.InterestMutationResponse, {
    method: 'POST',
    path: '/block',
    body: { blockedUserId: memberId },
  });
}

export async function unblockMember(memberId: string): Promise<void> {
  await api().request(S.InterestMutationResponse, { method: 'DELETE', path: `/block/${memberId}` });
}

export async function listBlocked(): Promise<MiniMember[]> {
  const res = await api().request(S.BlockedListResponse, { path: '/block', query: { limit: 100 } });
  return res.data.map(
    (e) =>
      toMiniMember(e.blockedUser) ?? {
        memberId: e.blockedUserId,
        profileId: null,
        firstName: '',
        lastName: '',
        photo: null,
        city: null,
        profession: null,
        age: null,
      },
  );
}

export async function reportMember(
  memberId: string,
  reason: string,
  description?: string,
): Promise<void> {
  await api().request(S.InterestMutationResponse, {
    method: 'POST',
    path: '/report',
    body: { reportedUserId: memberId, reason, description },
  });
}

export async function myReports() {
  const res = await api().request(S.MyReportsResponse, { path: '/report/my-reports' });
  return res.data.map((r) => ({
    reportId: r.id,
    reason: r.reason,
    description: r.description ?? null,
    status: r.status,
    createdAt: r.createdAt,
    reported: toMiniMember(r.reportedUser),
  }));
}
