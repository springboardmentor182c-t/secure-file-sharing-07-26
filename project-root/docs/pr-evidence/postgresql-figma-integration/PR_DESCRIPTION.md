# Figma parity for Activity, Notifications, Settings, and the application shell

## Summary

This PR aligns the Activity, Notifications, Settings, and responsive application shell with the TrustShare Figma prototype, then makes the local Docker stack run reliably with PostgreSQL and desktop Ollama.

**Scope clarification:** the Analytics application module is unchanged. Its runtime dependencies are configured correctly, but no Analytics source code or UI behavior is being replaced here.

## PostgreSQL runtime

The backend Compose environment now starts PostgreSQL 16, waits for its health check, and gives the backend a PostgreSQL connection URL. This allows the existing Analytics module to execute its PostgreSQL `SPLIT_PART` query without changing that module's code. SQLite remains isolated to unit tests.

## Final runtime and integration fixes

- Added the missing frontend Dockerfile and Docker ignore files so the complete stack builds reproducibly.
- Replaced the Docker backend's reload command with a stable Uvicorn process; reload was scanning mounted local cache files and could terminate the watcher.
- Added the frontend `REACT_APP_API_URL` configuration so signup, login, and all API-backed modules call port `8000` instead of posting to the React server on port `3000`.
- Replaced the container-local Ollama default (`localhost:11434`) with the desktop Ollama gateway (`host.docker.internal:11434`) and configured `qwen2.5:1.5b`.
- Verified that the desktop Ollama provider responds from inside the backend container and generates summaries successfully; existing fallback summaries remain available when an AI provider is unavailable.
- No working Analytics implementation was removed or replaced. SQLite was removed only as a Compose/runtime database; SQLite test setup remains available for isolated unit tests. The existing AI fallback remains available when Ollama is unavailable.

## Before and after

All screenshots below were taken from authenticated local builds at the same `812 x 958` browser viewport. The **Before** column is the previously running application; the **After** column is the corrected branch build.

### 1. Responsive application shell

| Before: fixed desktop sidebar | After: tablet navigation drawer |
| --- | --- |
| ![Before - the fixed sidebar consumes a large part of the tablet viewport](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/01-dashboard-before.jpg) | ![After - the sidebar is replaced by a menu button and content uses the full viewport](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/01-dashboard-after.jpg) |

**Before:** the desktop sidebar remained visible at tablet width, compressing dashboard cards and content.

**After:** the desktop sidebar collapses below `1024px` into a menu-triggered drawer while preserving the desktop layout above the breakpoint.

### 2. Activity and audit trail

| Before: basic file activity | After: complete audit-focused view |
| --- | --- |
| ![Before - Activity contains basic upload, download, share, and security summaries](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/02-activity-before.jpg) | ![After - Activity and Audit Log includes unique users, flagged and blocked metrics, additional filters, and suspicious-only filtering](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/02-activity-after.jpg) |

**Before:** filtering was limited to All, Uploads, Downloads, Shares, and Security.

**After:** the Activity & Audit Log adds audit-focused summary cards, Viewed/Login/Failed filters, Suspicious only filtering, and available audit metadata.

### 3. Notifications

| Before: generic filters | After: Figma-aligned categories and counts |
| --- | --- |
| ![Before - Notifications uses All, Unread, Shares, Security, Uploads, and Activity filters](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/03-notifications-before.jpg) | ![After - Notifications uses counted Shares, Security, Downloads, Expirations, and System categories](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/03-notifications-after.jpg) |

**Before:** notifications used a generic Unread/Uploads/Activity grouping without per-category totals.

**After:** categories align with the Figma structure: All, Shares, Security, Downloads, Expirations, and System. Filters display counts, rows receive severity styling, and narrow screens support horizontal category scrolling.

### 4. Settings session safety

**Before:** revoking an individual session or all other sessions executed immediately.

**After:** both actions require explicit confirmation. The current session remains protected and existing feedback behavior is preserved.

## Validation

- Targeted Activity, Notifications, and Settings tests passed.
- PostgreSQL-backed Docker smoke tests passed for Dashboard, Files, Activity, Notifications, Settings, and Analytics; each returned `200` for an authenticated user.
- Ollama connectivity and Qwen summary generation passed from inside the backend container.
- Frontend production build passed.
- Browser checks passed at desktop, `812 x 958`, and `390 x 844` viewports.

## Reviewer checklist

- Check Activity filters for Viewed, Login, Failed, and Suspicious only.
- Check notification category counts and row severity styles with seeded data.
- Revoke a non-current session and confirm the action is not sent until approval.
- Verify the sidebar switches to a drawer below `1024px` and returns on desktop.
