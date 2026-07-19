// Temporary stand-in for real authentication.
//
// The Auth module (client/src/features/authentication, server/src/auth)
// isn't implemented yet - login.js, getUsers.js, LoginForm.js are all
// still empty stubs. Every Shared Links request needs a real
// `X-User-Id: <uuid>` header (the backend has no fallback user anymore -
// see server/src/shared_links/dependencies.py), so until real login/JWT
// exists we bootstrap ONE real user row the first time the app runs and
// remember its id in localStorage.
//
// This is NOT fake/mock data - it's a real row created through the
// backend's own dev-only `POST /users` endpoint (server/src/shared_links/
// dev_data_service.py), the same seam the whole team is already using.
// The moment the Auth teammate's login flow lands, delete this file and
// pull the user id from the real session instead - nothing else in the
// Shared Links module needs to change.

const STORAGE_KEY = "trustshare_dev_user_id";

let inFlight = null;

export async function getOrCreateCurrentUserId(apiBaseUrl) {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) return cached;

  // Guard against firing two bootstrap requests if multiple components
  // mount at once before the id is cached.
  if (inFlight) return inFlight;

  inFlight = (async () => {
    // NOTE: the backend validates this with Pydantic's EmailStr, which
    // rejects reserved/special-use TLDs like ".local" or ".test" - so this
    // needs to look like a real (if fake) domain, not trustshare.local.
    const email = `dev-${Date.now()}@trustshare-dev-users.com`;
    const res = await fetch(`${apiBaseUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, full_name: "Dev User" }),
    });

    if (!res.ok) {
      throw new Error("Could not start a local dev session. Is the backend running?");
    }

    const json = await res.json();
    const id = json?.data?.id;
    if (!id) throw new Error("Backend did not return a user id.");

    localStorage.setItem(STORAGE_KEY, id);
    return id;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

export function clearCurrentUserId() {
  localStorage.removeItem(STORAGE_KEY);
}
