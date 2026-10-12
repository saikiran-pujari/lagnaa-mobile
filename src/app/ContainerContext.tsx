import React, { createContext, type PropsWithChildren, useContext } from 'react';

import type { Container } from './container';

const Ctx = createContext<Container | null>(null);

export function ContainerProvider({
  container,
  children,
}: PropsWithChildren<{ container: Container }>) {
  return <Ctx.Provider value={container}>{children}</Ctx.Provider>;
}

export function useContainer(): Container {
  const c = useContext(Ctx);
  if (!c) throw new Error('useContainer must be used within ContainerProvider');
  return c;
}
