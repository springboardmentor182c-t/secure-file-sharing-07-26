/**
 * Simple health check utility to verify the backend is running and accessible.
 * Helpful for debugging "failed to fetch" errors.
 */

const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

export async function checkBackendHealth(apiBaseUrl) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    const response = await fetch(`${apiBaseUrl}/health`, {
      method: "GET",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return { ok: true, status: response.status, data };
    } else {
      return { ok: false, status: response.status, message: "Backend returned an error" };
    }
  } catch (err) {
    if (err.name === "AbortError") {
      return { ok: false, message: `Backend health check timed out after ${HEALTH_CHECK_TIMEOUT}ms` };
    }
    return { ok: false, message: `Failed to reach backend: ${err.message}` };
  }
}

/**
 * Check if the backend is running and log the result to console.
 * Call this once when the app initializes.
 */
export async function logBackendStatus(apiBaseUrl) {
  const result = await checkBackendHealth(apiBaseUrl);
  if (result.ok) {
    console.log(`✓ Backend is running on ${apiBaseUrl}`, result.data);
  } else {
    console.error(`✗ Backend health check failed: ${result.message}`);
    console.error(`  Make sure the backend is running at ${apiBaseUrl}`);
    console.error("  To start the backend, run: uvicorn src.main:app --reload");
  }
  return result;
}
