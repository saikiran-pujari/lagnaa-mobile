/** Every query key in the app is built here. Keys are arrays; the first element is the domain. */
export const queryKeys = {
  me: () => ['me'] as const,
  myProfile: () => ['myProfile'] as const,
  profile: (profileId: string) => ['profile', profileId] as const,
  search: (filters: Record<string, unknown>) => ['search', filters] as const,
  recommendations: () => ['recommendations'] as const,
  interests: (type: 'sent' | 'received', status?: string) =>
    ['interests', type, status ?? 'all'] as const,
  interestStats: () => ['interestStats'] as const,
  contactRequests: (type: 'sent' | 'received', status?: string) =>
    ['contactRequests', type, status ?? 'all'] as const,
  conversations: () => ['conversations'] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  unreadCount: () => ['unreadCount'] as const,
  shortlist: () => ['shortlist'] as const,
  shortlistedBy: () => ['shortlistedBy'] as const,
  viewers: () => ['viewers'] as const,
  blocked: () => ['blocked'] as const,
  myReports: () => ['myReports'] as const,
  uploadStatus: () => ['uploadStatus'] as const,
  publicAuthConfig: () => ['publicAuthConfig'] as const,
} as const;

/** Query keys whose data is L1 (public card data) and may be persisted to disk for 24 h. */
export const PERSISTED_DOMAINS: ReadonlySet<string> = new Set([
  'search',
  'recommendations',
  'conversations',
  'shortlist',
]);
