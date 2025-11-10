# 20 Tester Community – Matching & Testing Flow

## 1. Register Apps
- Authenticated devs create apps via `/app/create`
- Each app stores:
  - `targetTesterCount` – total testers needed (user supplied)
  - `fulfilledTesterCount` – testers already allocated by groups

## 2. Join the Matchmaking Queue
- Route `/group/create` now renders the queue manager
- For every app still needing testers:
  - `POST /api/queue` enqueues the app with `remainingSlots = target − fulfilled`
  - Re-joining refreshes `joinedAt` and recomputes remaining slots
  - `DELETE /api/queue` lets owner withdraw
- UI shows queue status per app and explains the automated matching rules

## 3. Server Queue Processing
- `processQueue()` (in `lib/matchmaking.ts`) runs whenever an app joins/leaves:
  1. Pulls all queue entries oldest-first
  2. Builds a cohort of unique developers who joined within 48 hours
  3. Cohort size must be between 5 and 25
  4. Inside a Prisma transaction:
     - Reserve the next `groupNumber`
     - Create `Group` + `GroupUser` rows
     - Attach each app through `GroupApps`
     - Increment every app’s `fulfilledTesterCount` by `cohortSize − 1`
     - Update or delete `QueueEntry` depending on remaining slots
     - Notify members they have been matched
  5. Call `checkAndUpdateGroupStatus` to allow Step 2 progression

## 4. Group Lifecycle (unchanged)
1. **OPEN** – starts once group is created
   - No manual joins; status flips automatically when `groupUsers.length === maxMembers`
2. **PENDING** – members exchange tester confirmations
   - Triggered when everyone in group has an accepted request
3. **INPROGRESS** – 14-day testing timer starts
   - Scheduled job moves to COMPLETE after timer
4. **COMPLETE** – notifications + emails emitted

## 5. Notifications & Email
- Queue match: in-app notification to each member (“You have been matched to a group!”)
- Existing emails for:
  - Step transitions (start testing, testers confirmed, 14-day completion)
  - Request confirmation / rejection
- Leaving restrictions: once a group forms, members cannot leave unless kicked by owner/admin

## 6. Key API Endpoints
- `POST /api/app` → create app
- `GET /api/app` → list my apps with tester progress
- `POST /api/queue` → enqueue app
- `GET /api/queue` → list my queue entries
- `DELETE /api/queue` → remove app from queue
- `POST /api/group/:id { action: "leave" }` → owner/admin remove member
- `POST /api/request` / `PUT /api/request` → send / resend tester request
- `POST /api/request/confirm` → accept / reject tester request

## 7. Developer Notes
- Prisma schema changes require `npx prisma db push` + `npx prisma generate`
- When running locally, restart `npm run dev` after regenerating Prisma client
- If multiple groups need to be formed, `processQueue()` loops until fewer than 5 entries remain
- Existing “open” groups created prior to the queue remain untouched

