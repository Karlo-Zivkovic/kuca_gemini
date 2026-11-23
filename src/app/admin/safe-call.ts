"use client";

/**
 * Runs an admin server action from the app.
 * - Session expired → opens the login page.
 * - No connection / server error → tells the user nothing was saved (instead of crashing the app).
 * Returns the result, or null when the caller should stop.
 */
/** Full page load (not client navigation), so the login page starts clean. */
export function goToLogin() {
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload is intended
  window.location.href = "/admin/login";
}

export async function safeCall<T extends { expired?: true }>(action: () => Promise<T>): Promise<T | null> {
  try {
    const res = await action();
    if (res.expired) {
      goToLogin();
      return null;
    }
    return res;
  } catch (err) {
    console.error("[admin]", err);
    alert("Spremanje nije uspjelo, ništa nije promijenjeno. Provjerite internetsku vezu i pokušajte ponovno.");
    return null;
  }
}
