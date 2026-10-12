import { namespaces } from '@/core/storage';

export { createQueryClient, createQueryPersister } from '@/core/query';

/** Namespaces that belong to one Member and are wiped on sign-out. */
export function namespacesForMember(memberId: string): string[] {
  return [namespaces.member(memberId)];
}
