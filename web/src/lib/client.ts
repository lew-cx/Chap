import { createClient } from '@chap/lewlm';

const INSTANCE_KEY = 'chap.clientInstanceId';

/** Stable per-tab identity so LewLM's audit log can correlate a session. */
function clientInstanceId(): string {
  const existing = sessionStorage.getItem(INSTANCE_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem(INSTANCE_KEY, created);
  return created;
}

/**
 * Same-origin. chap-server proxies `/v1` to LewLM and injects the API key, so
 * no credential ever reaches this bundle.
 */
export const lewlm = createClient({
  baseUrl: '',
  applicationId: 'chap',
  clientInstanceId: clientInstanceId(),
});
