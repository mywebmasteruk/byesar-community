// Turnstile check and a small per-IP limiter. The limiter is in memory (fine for one
// demo instance); swap for Upstash before several instances run.
const hits = new Map<string, number[]>();

export function rateLimited(key: string, max = 5, windowMs = 10 * 60_000, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  hits.set(key, [...recent, now]);
  return false;
}

export async function turnstileOk(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false; // fail closed: no secret configured means no posting
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}

export type Gated = { fail: { status: number; error: string } } | { fail: null; body: Record<string, unknown> };

// Bot defence first: rate limit, then captcha, and only then does the caller validate.
// An empty or malformed body is treated as a missing token (403), never reaches validation.
export async function gate(req: Request, key: string, max = 5): Promise<Gated> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(`${key}:${ip}`, max)) return { fail: { status: 429, error: 'rate_limited' } };
  const parsed = await req.json().catch(() => null);
  const body = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  const token = typeof body.token === 'string' ? body.token : undefined;
  if (!(await turnstileOk(token, ip))) return { fail: { status: 403, error: 'captcha' } };
  return { fail: null, body };
}
