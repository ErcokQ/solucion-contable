import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:3000';

describe('SMOKE | /health', () => {
  it('GET /health → 200 + {status:"ok"}', async () => {
    const res = await fetch(`${BASE}/health`);
    const body = (await res.json()) as { status: string };

    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
  });
});
