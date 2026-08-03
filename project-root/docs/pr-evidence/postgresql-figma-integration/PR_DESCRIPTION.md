# Figma parity for Activity, Notifications, Settings, and the application shell

## Summary

This PR retains the UI and behavior updates identified while comparing the application with the TrustShare Figma prototype. Analytics remains owned by its existing implementation and is not changed by this PR.

## Before and after

All screenshots below were taken from authenticated local builds at the same `812 x 958` browser viewport. The **Before** column is the previously running application on `localhost:3000`; the **After** column is this branch on `localhost:3001`.

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
- Frontend production build passed.
- Browser checks passed at desktop, `812 x 958`, and `390 x 844` viewports.

## Reviewer checklist

- Check Activity filters for Viewed, Login, Failed, and Suspicious only.
- Check notification category counts and row severity styles with seeded data.
- Revoke a non-current session and confirm the action is not sent until approval.
- Verify the sidebar switches to a drawer below `1024px` and returns on desktop.
