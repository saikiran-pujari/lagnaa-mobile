import React, { type ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

import { ErrorState } from './States';

export interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>;
  loading: ReactNode;
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
  errorTitle?: string;
}

/** Forces the four states (loading, error with retry, empty, content) on every data-backed view. */
export function QueryBoundary<T>({
  query,
  loading,
  empty,
  isEmpty,
  children,
  errorTitle,
}: QueryBoundaryProps<T>) {
  if (query.isPending) return <>{loading}</>;
  if (query.isError) {
    const message =
      (query.error as { message?: string } | null)?.message || 'Something went wrong.';
    return (
      <ErrorState
        title={errorTitle ?? 'Could not load'}
        body={message}
        onRetry={() => void query.refetch()}
      />
    );
  }
  const data = query.data;
  if (empty !== undefined && (isEmpty ? isEmpty(data) : Array.isArray(data) && data.length === 0))
    return <>{empty}</>;
  return <>{children(data)}</>;
}
