/**
 * DO NOT EDIT.
 *
 * Generated from a live proof run by `npm run gen:gaps`. It is what the
 * Settings screen reports, so that screen cannot claim a gap the proof does
 * not confirm, or miss one it does.
 *
 * Regenerate against the services you are pointing at, not from memory.
 */

/** One gap probe, as the proof reported it. */
export interface ProofGap {
  id: string;
  /** Which proof script confirmed it — one per upstream. */
  suite: string;
  title: string;
  /** What the probe observed. Never a paraphrase written here. */
  note: string;
  /** `false` means the upstream fixed it and Chap can drop its workaround. */
  open: boolean;
}

/** The score line of each proof, verbatim. */
export interface ProofSuite {
  script: string;
  ranAt: string;
  passed: number;
  failed: number;
  gaps: number;
  fixed: number;
}

export const PROOF_SUITES: readonly ProofSuite[] = [
  {
    "script": "proof",
    "ranAt": "2026-08-25T01:18:41.709Z",
    "passed": 24,
    "failed": 0,
    "gaps": 5,
    "fixed": 17
  },
  {
    "script": "proof:dk",
    "ranAt": "2026-08-25T01:19:18.661Z",
    "passed": 6,
    "failed": 0,
    "gaps": 0,
    "fixed": 8
  }
] as const;

export const PROOF_GAPS: readonly ProofGap[] = [
  {
    "id": "G13",
    "suite": "proof",
    "title": "/v1/events can be resumed after a drop",
    "note": "frames carry no id:, so a reconnect has no cursor to resume from",
    "open": true
  },
  {
    "id": "G11",
    "suite": "proof",
    "title": "error envelope on malformed requests",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G1",
    "suite": "proof",
    "title": "CORS is available",
    "note": "CORS off on this server — start with LEWLM_CORS_ENABLED=true to serve a browser directly",
    "open": true
  },
  {
    "id": "G6",
    "suite": "proof",
    "title": "token counting endpoint",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G9",
    "suite": "proof",
    "title": "sessions can be renamed",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G7",
    "suite": "proof",
    "title": "chat honors client x-request-id",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G8",
    "suite": "proof",
    "title": "documents.ingest accepts uploads",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G21",
    "suite": "proof",
    "title": "inventory reports capability",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G25",
    "suite": "proof",
    "title": "audio capability is per-model",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G26",
    "suite": "proof",
    "title": "transcription multipart body is in the contract",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G33",
    "suite": "proof",
    "title": "speech formats are published, not guessed",
    "note": "format is a bare string; the accepted values are not discoverable from the contract",
    "open": true
  },
  {
    "id": "G27",
    "suite": "proof",
    "title": "synthesis voices can be listed",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G19",
    "suite": "proof",
    "title": "serving profiles can be listed",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G28",
    "suite": "proof",
    "title": "streamed text matches the non-streamed answer",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G29",
    "suite": "proof",
    "title": "streamed text arrives incrementally",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G4",
    "suite": "proof",
    "title": "streaming reports usage",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G23",
    "suite": "proof",
    "title": "streaming carries prompt_trace",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G22",
    "suite": "proof",
    "title": "prompt teaches the tool-call format",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G5",
    "suite": "proof",
    "title": "sampling controls are applied",
    "note": "contract present; this runtime honors none of [seed, top_p]",
    "open": true
  },
  {
    "id": "G32",
    "suite": "proof",
    "title": "/v1/responses reports a finish reason",
    "note": "the terminal payload carries no finish_reason, so truncation is invisible on this surface",
    "open": true
  },
  {
    "id": "G30",
    "suite": "proof",
    "title": "a caller-supplied maxLength is answered, not fatal",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "G31",
    "suite": "proof",
    "title": "a model with no published context length is capped at 4096",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "D1",
    "suite": "proof:dk",
    "title": "health reports liveness only, never downstream readiness",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "D2",
    "suite": "proof:dk",
    "title": "no committed spec and no published client",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "D3",
    "suite": "proof:dk",
    "title": "generation events are polled, never streamed",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "D4",
    "suite": "proof:dk",
    "title": "no response says which workspace the token resolved to",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "D5",
    "suite": "proof:dk",
    "title": "request size limits are keyed to content-length",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "D6",
    "suite": "proof:dk",
    "title": "a workflow the host cannot run is accepted anyway",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "D7",
    "suite": "proof:dk",
    "title": "the registered migration pairs are not published",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  },
  {
    "id": "D8",
    "suite": "proof:dk",
    "title": "a workspace's documents cannot be listed",
    "note": "fixed upstream — Chap can drop its workaround",
    "open": false
  }
] as const;

/** Gaps still confirmed open, which is what the Settings screen lists. */
export const OPEN_GAPS: readonly ProofGap[] = PROOF_GAPS.filter((entry) => entry.open);
