# PostgreSQL integration and Figma parity for Activity, Notifications, and Settings

## Summary

This PR combines the latest team work with the remaining integration fixes found while comparing the application against the TrustShare Figma prototype.

It makes PostgreSQL the required runtime database, prevents the PostgreSQL-only analytics queries from running accidentally on SQLite, and brings the Activity, Notifications, Settings, and responsive application shell closer to the agreed design and behavior.

## Why this change is needed

The application Compose configuration previously started the backend with SQLite. Analytics uses PostgreSQL functions such as `SPLIT_PART`, so opening Analytics against that runtime could fail even though the UI itself loaded. SQLite remains useful for isolated tests, but it is not a valid production or Compose runtime for this project.

The comparison also found that the Activity audit view exposed only basic file-event categories, Notifications did not match the Figma category model, destructive session actions lacked confirmation, and the fixed desktop sidebar squeezed the main content at tablet widths.

## Before and after

All screenshots below were taken from authenticated local builds at the same `812 x 958` browser viewport. The **Before** column is the previously running application on `localhost:3000`; the **After** column is this branch on `localhost:3001`. These are live application states, not mockups.

### 1. Responsive application shell

| Before: fixed desktop sidebar | After: tablet navigation drawer |
| --- | --- |
| ![Before - the fixed sidebar consumes a large part of the tablet viewport](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/01-dashboard-before.jpg) | ![After - the sidebar is replaced by a menu button and content uses the full viewport](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/01-dashboard-after.jpg) |

**Before:** the 260 px desktop sidebar remained visible at tablet width. Dashboard cards and content were compressed into the remaining space.

**After:** the desktop sidebar collapses below `1024px` into a menu-triggered drawer. The dashboard uses the available width while keeping navigation accessible and preserving the desktop layout above the breakpoint.

### 2. Activity and audit trail

| Before: basic file activity | After: complete audit-focused view |
| --- | --- |
| ![Before - Activity contains basic upload, download, share, and security summaries](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/02-activity-before.jpg) | ![After - Activity and Audit Log includes unique users, flagged and blocked metrics, additional filters, and suspicious-only filtering](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/02-activity-after.jpg) |

**Before:** the page summarized uploads, downloads, and generic security events. Filtering was limited to All, Uploads, Downloads, Shares, and Security, which left sign-in and access audit events difficult to investigate.

**After:** the page is explicitly presented as an **Activity & Audit Log**. Summary cards now cover total events, unique users, flagged events, and blocked attempts. Filters include Viewed, Login, and Failed events, plus a Suspicious only control. Audit rows can expose status, IP address, and location when those values are available.

### 3. Notifications

| Before: generic filters | After: Figma-aligned categories and counts |
| --- | --- |
| ![Before - Notifications uses All, Unread, Shares, Security, Uploads, and Activity filters](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/03-notifications-before.jpg) | ![After - Notifications uses counted Shares, Security, Downloads, Expirations, and System categories](https://raw.githubusercontent.com/springboardmentor182c-t/secure-file-sharing-07-26/Abhishek/postgresql-figma-integration/project-root/docs/pr-evidence/postgresql-figma-integration/03-notifications-after.jpg) |

**Before:** notification filters used a generic Unread/Uploads/Activity grouping and did not show per-category totals.

**After:** categories match the Figma information architecture: All, Shares, Security, Downloads, Expirations, and System. Every filter displays its count, notification rows receive severity styling, and the category strip remains usable through horizontal scrolling on narrow screens. Existing mark-read and delete behavior is preserved.

### 4. Settings session safety

**Before:** revoking an individual session or all other sessions executed immediately, making an accidental click destructive.

**After:** both actions require explicit confirmation before the API request is sent. The current session remains protected, and success/error feedback still uses the existing Settings notification pattern. This is a behavioral guard rather than a static restyle, so it is covered by targeted tests instead of a misleading empty-account screenshot.

## PostgreSQL integration

- Adds a PostgreSQL 16 service, persistent volume, and health check to Docker Compose.
- Starts the backend only after PostgreSQL reports healthy.
- Uses the correct `postgresql+psycopg2` URL in the shared Compose environment.
- Adds a `REQUIRE_POSTGRESQL` runtime guard so production-style startup fails clearly if SQLite is configured.
- Keeps SQLite explicit and isolated in the test configuration.
- Updates the Admin database label to identify PostgreSQL instead of implying SQLite.

This addresses the Analytics crash at its source: PostgreSQL-specific analytics queries now run in the database engine they were written for instead of being passed to SQLite.

## Validation

- `100` backend tests passed, excluding the PostgreSQL-only analytics execution file.
- `12` targeted Activity, Notifications, and Settings tests passed.
- Frontend production build passed.
- Browser checks passed at desktop, `812 x 958`, and `390 x 844` viewports.

## Environment note

Docker/PostgreSQL was not installed in the local verification environment, so the PostgreSQL-backed Analytics endpoint could not be executed end to end here. Compose wiring, runtime guards, URL configuration, unit tests, frontend build, and browser behavior were verified. CI or a reviewer with Docker should run the final PostgreSQL integration check before merge.

## Reviewer checklist

- Start the stack with Docker Compose and confirm PostgreSQL becomes healthy before the backend starts.
- Open Analytics and confirm requests complete without SQLite function errors.
- Check Activity filters for Viewed, Login, Failed, and Suspicious only.
- Check notification category counts and row severity styles with seeded data.
- Revoke a non-current session and confirm the action is not sent until approval.
- Verify the sidebar switches to a drawer below `1024px` and returns on desktop.
