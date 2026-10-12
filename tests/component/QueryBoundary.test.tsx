import React from 'react';
import { Text } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import { screen } from '@testing-library/react-native';

import { ApiError } from '@/core/http';
import { EmptyState, QueryBoundary } from '@/design-system';

import { renderWithProviders } from '@tests/setup/render';

const q = (over: Partial<UseQueryResult<string[]>>) =>
  ({
    isPending: false,
    isError: false,
    data: undefined,
    error: null,
    refetch: jest.fn(),
    ...over,
  }) as unknown as UseQueryResult<string[]>;

const loading = <Text>loading</Text>;
const empty = <EmptyState title="Nothing yet" />;

describe('QueryBoundary', () => {
  it('renders loading, error with retry, empty and content', async () => {
    const { rerender } = await renderWithProviders(
      <QueryBoundary query={q({ isPending: true })} loading={loading} empty={empty}>
        {() => <Text>content</Text>}
      </QueryBoundary>,
    );
    expect(screen.getByText('loading')).toBeOnTheScreen();

    await rerender(
      <QueryBoundary
        query={q({
          isError: true,
          error: new ApiError({ code: 'SERVER', message: 'Server down' }),
        })}
        loading={loading}
      >
        {() => <Text>content</Text>}
      </QueryBoundary>,
    );
    expect(screen.getByText('Server down')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen();

    await rerender(
      <QueryBoundary query={q({ data: [] })} loading={loading} empty={empty}>
        {() => <Text>content</Text>}
      </QueryBoundary>,
    );
    expect(screen.getByText('Nothing yet')).toBeOnTheScreen();

    await rerender(
      <QueryBoundary query={q({ data: ['x'] })} loading={loading} empty={empty}>
        {(d) => <Text>{d.length} item</Text>}
      </QueryBoundary>,
    );
    expect(screen.getByText('1 item')).toBeOnTheScreen();
  });
});
