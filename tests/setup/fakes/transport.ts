import type { Transport, TransportRequest, TransportResponse } from '@/core/http';

export interface Stub {
  match: (req: TransportRequest) => boolean;
  respond: (req: TransportRequest) => TransportResponse | Promise<TransportResponse>;
  once?: boolean;
}

export const json = (status: number, body: unknown): TransportResponse => ({
  status,
  headers: { 'content-type': 'application/json' },
  text: JSON.stringify(body),
});

/** Records requests and answers from a stub list; unmatched requests fail loudly. */
export function createFakeTransport() {
  const stubs: Stub[] = [];
  const calls: TransportRequest[] = [];
  const transport: Transport = async (req) => {
    calls.push(req);
    const i = stubs.findIndex((s) => s.match(req));
    if (i === -1) throw new Error(`No stub for ${req.method} ${req.url}`);
    const stub = stubs[i]!;
    if (stub.once) stubs.splice(i, 1);
    return stub.respond(req);
  };
  return {
    transport,
    calls,
    on(
      method: TransportRequest['method'],
      pathIncludes: string,
      respond: Stub['respond'],
      once = false,
    ) {
      stubs.push({
        match: (r) => r.method === method && r.url.includes(pathIncludes),
        respond,
        once,
      });
      return this;
    },
  };
}
