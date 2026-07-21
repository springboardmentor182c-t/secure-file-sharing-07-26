// Shared fetch wrapper used by every feature's API client
// (features/sharedLinks/services/sharedLinksApi.js,
// features/myFiles/services/filesApi.js, ...). Handles attaching the
// X-User-Id auth header, JSON/multipart bodies, and turning non-2xx
// responses into a consistent ApiError.

import { getOrCreateCurrentUserId } from "./currentUser";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function parseErrorMessage(res) {
  try {
    const body = await res.json();
    if (body?.message) return body.message;
  } catch {
    // not JSON - fall through to the generic message below
  }
  return `Request failed with status ${res.status}`;
}

/** Builds a `request(path, options)` function bound to one API base URL. */
export function createApiRequest(apiBaseUrl) {
  async function authHeaders(extra = {}) {
    const userId = await getOrCreateCurrentUserId(apiBaseUrl);
    return { "X-User-Id": userId, ...extra };
  }

  async function request(path, { method = "GET", json, formData, headers = {} } = {}) {
    const finalHeaders = await authHeaders(headers);
    const init = { method, headers: finalHeaders };

    if (json !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(json);
    } else if (formData !== undefined) {
      init.body = formData; // browser sets multipart Content-Type + boundary
    }

    let res;
    try {
      res = await fetch(`${apiBaseUrl}${path}`, init);
    } catch {
      throw new ApiError(`Couldn't reach the backend. Is it running on ${apiBaseUrl}?`, 0);
    }

    if (!res.ok) {
      throw new ApiError(await parseErrorMessage(res), res.status);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  return { request, authHeaders };
}
