# Deployment Readiness & Data Cleanup

This document tracks the requirements for transitioning the MUSB Research platform from development/demo mode to a production/hosted environment.

## USER INSTRUCTION
**When the website is hosted, all fake/mock data must be removed.** However, during development and demo phases, the data should continue to be shown as it currently appears (as "real" demonstration data). Cleanup should ONLY occur when explicitly requested by the USER.

## Fake Data Locations (Frontend)
The following components currently contain hardcoded mock data for demonstration purposes:

1.  **`app/dashboard/participant/page.tsx`**:
    - `todayTasks`: Mock task list.
    - `upcomingEvents`: Mock calendar items.
    - `supplementSchedule`: Mock medication tracking.
    - KPI values (Adherence, Total Earned, etc.).

2.  **`app/dashboard/participant/layout.tsx`**:
    - `notifications`: Initial mock notifications for the bell icon.

3.  **`app/dashboard/participant/messages/page.tsx`**:
    - Sidebar announcements (Study Alerts).

4.  **`app/page.tsx`**:
    - Testimonials or specific study counts if hardcoded (Pending review).

## Database Cleanup (Backend)
The backend database is currently populated using:
- `seed.py`: General user and system data.
- `seed_studies.py`: Randomized study data.

**To Reset for Production:**
1.  Run a script to drop the `messages`, `notifications`, `screenerResponses`, `consents`, `taskInstances`, and `participants` collections.
2.  Maintain a clean `users` collection with only initial Admin credentials.
3.  Clear the `studies` collection to allow for actual protocol input.

## Production Toggle Strategy
Consider implementing a `NEXT_PUBLIC_DEMO_MODE=true/false` environment variable.
- If `true`: Show hardcoded mock data for UI demonstration.
- If `false`: Fetch all data from the API and show empty states (`No Tasks Today`, `Inbox Empty`) if no real data exists.
