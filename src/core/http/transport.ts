export interface TransportRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: Record<string, string>;
  body?: string;
  signal: AbortSignal;
}

export interface TransportResponse {
  status: number;
  headers: Record<string, string>;
  text: string;
}

/** The seam between the API client and the network. `fetch` in the app, fakes in tests. */
export type Transport = (req: TransportRequest) => Promise<TransportResponse>;

export const fetchTransport: Transport = async (req) => {
  const res = await fetch(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    signal: req.signal,
  });
  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });
  return { status: res.status, headers, text: await res.text() };
};
