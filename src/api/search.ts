import { api } from './client';
import { toProfileCard } from './mappers';
import * as S from './schemas/search';
import type { Paged, ProfileCard, SearchFilters } from './types';

export interface SearchPageRequest extends SearchFilters {
  cursor?: string;
  limit?: number;
  includeScore?: boolean;
}

export async function search(req: SearchPageRequest): Promise<Paged<ProfileCard>> {
  const { cursor, limit, includeScore, ...filters } = req;
  const query: Record<string, string | number | boolean | undefined> = {
    ...filters,
    limit: limit ?? 20,
    includeScore: includeScore ?? true,
  };
  if (cursor) query.cursor = cursor;
  const res = await api().request(S.SearchResponse, { path: '/search', query });
  const p = res.pagination;
  return {
    items: res.profiles.map(toProfileCard),
    page: {
      nextCursor: 'nextCursor' in p ? (p.nextCursor ?? null) : null,
      hasMore: 'hasMore' in p ? p.hasMore : p.page < p.totalPages,
      total: 'total' in p ? p.total : null,
    },
  };
}

export async function recommendations(): Promise<ProfileCard[]> {
  const res = await api().request(S.RecommendationsResponse, { path: '/search/recommendations' });
  return res.data.map(toProfileCard);
}
