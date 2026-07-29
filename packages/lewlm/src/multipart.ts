/**
 * Multipart request bodies for the surfaces that accept attachments.
 *
 * LewLM's contract is small and specific: the JSON request goes in a
 * `payload_json` form field, and every other file part is keyed by the exact
 * string a content part names in `upload_name`. Field names must be unique —
 * LewLM rejects a duplicate rather than silently keeping one — so this asserts
 * that here, where the message is useful, instead of after a round trip.
 */

export interface Upload {
  /** Must match the `upload_name` of the content part that references it. */
  uploadName: string;
  file: Blob;
  /** Filename LewLM sanitizes and stores the bytes under. */
  fileName?: string;
}

export function buildMultipart(uploads: readonly Upload[]): FormData {
  const form = new FormData();
  const seen = new Set<string>();

  for (const upload of uploads) {
    if (upload.uploadName === 'payload_json') {
      throw new Error('`payload_json` is reserved for the request body.');
    }
    if (seen.has(upload.uploadName)) {
      throw new Error(`Duplicate upload_name: ${upload.uploadName}`);
    }
    seen.add(upload.uploadName);
    form.append(upload.uploadName, upload.file, upload.fileName);
  }

  // `payload_json` is set by the request builder in stream.ts, which is the only
  // place that knows the final payload.
  return form;
}

/** The content-part type LewLM expects for a given media type. */
export function partTypeFor(mediaType: string): 'input_image' | 'input_audio' | 'input_file' {
  if (mediaType.startsWith('image/')) return 'input_image';
  if (mediaType.startsWith('audio/')) return 'input_audio';
  return 'input_file';
}
