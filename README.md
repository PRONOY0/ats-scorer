<div align="center">

# 📄 ATS Scorer

### AI-Powered Resume Analysis Platform

*An async, queue-based system for scoring resumes against target roles, built to learn how production background-job architecture actually works.*

**[Live Demo →](https://ats-scorer-pearl.vercel.app)**

</div>

---

## What This Is

ATS Scorer lets a user upload a PDF resume, pick a target role, and get back a structured ATS-style report: score, strengths, weaknesses, suggestions, role alignment, extracted resume sections, plus an email once the analysis is done.

The scorer itself was the easy part. The real project is everything built *around* the AI call: a queue-based background processing system that keeps API routes fast, survives worker crashes, avoids double-emailing users, and runs long-lived workers outside of Vercel's serverless model.

> **The core architecture:** the API only accepts a request and queues the job. Dedicated background workers handle the AI analysis, database writes, Redis caching, and email delivery, completely decoupled from the original HTTP request.

---

## Why I Built This

The first version was simple: upload a resume → send text to an AI model → return a score. That part took an afternoon.

What actually took the time was answering the questions that show up the moment you try to ship that idea for real:

- What happens if the AI request takes too long?
- What happens if the user closes the page mid-analysis?
- What happens if the email fails *after* the analysis succeeds?
- What happens if the same resume gets uploaded twice?
- What happens if the worker crashes mid-job?
- How do you stop API routes from blocking on a slow AI call?
- How do you show progress when the worker has no way to talk back to the frontend?
- How do you cache a result without accidentally caching a `PENDING` placeholder?
- How do you even run BullMQ workers when Vercel won't run long-lived processes?

This project exists to answer those questions properly, not just patch around them.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [High-Level Architecture](#high-level-architecture)
- [Request Flow](#request-flow-step-by-step)
- [Resume Status Lifecycle](#resume-status-lifecycle)
- [Why Workers Don't Return Data](#why-workers-dont-return-data-to-the-frontend)
- [BullMQ Deep Dive](#bullmq-deep-dive): queue naming, retries, backoff, chaining, idempotency, concurrency
- [Redis Caching](#redis-caching): cache-aside pattern, the `PENDING`-cache bug, Upstash limits
- [Operational Concepts](#operational-concepts): cron, dead letter queues, job cleanup, priority, rate limiting
- [Deployment Architecture](#deployment-architecture)
- [Local Setup](#local-setup)
- [Production Deployment (EC2 + PM2)](#production-worker-deployment-on-ec2)
- [Updating Code on EC2](#updating-code-on-ec2)
- [Production Notes & Gotchas](#production-notes--gotchas)
- [Scalability](#scalability-notes)
- [Future Improvements](#future-improvements)
- [Summary](#summary)

---

## Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Axios
- date-fns
- Lucide React

Handles resume upload, role selection, result polling, dashboard analytics, resume history, auth-aware flows, loaders, empty states, and final result rendering.

</td>
<td valign="top" width="50%">

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL / Supabase
- Firebase Authentication
- Zod validation
- PDF text extraction
- Rate limiting
- Redis caching
- BullMQ queues

Validates the upload, extracts raw text, validates the role, creates/updates the resume row, queues the job, and returns `202 Accepted`. No waiting on the AI call.

</td>
</tr>
<tr>
<td valign="top" width="50%">

### AI
- Groq API
- Llama 3.3 70B Versatile
- Structured JSON response format
- Role-specific scoring rules
- Score clamping + backend validation

Supported target roles: Frontend, Backend, Full Stack, AI/ML, Data Science, DevOps, Android, iOS, UI/UX. Each role has its own prompt rules so feedback is role-specific, not generic resume advice.

</td>
<td valign="top" width="50%">

### Queue System
- BullMQ
- Redis / Upstash
- Separate ATS analysis & email queues
- Retries with backoff
- Job chaining
- Worker concurrency
- Failed-job handling
- PM2 on EC2

Resume analysis is long-running, so the API route queues it and returns immediately rather than waiting on Groq.

</td>
</tr>
<tr>
<td valign="top" width="50%">

### Email
- Resend
- React Email
- Custom analysis email template
- Dedicated email worker
- Independent retry handling
- `isEmailSent` tracking

Emails only fire after the result is successfully saved, never for a result that doesn't actually exist yet.

</td>
<td valign="top" width="50%">

### Deployment
- **Vercel**: Next.js frontend + API routes
- **AWS EC2 (Ubuntu)**: long-running BullMQ workers
- **PM2**: keeps workers alive
- **Supabase PostgreSQL**: database
- **Upstash Redis**: queues + cache
- **Resend** / **Groq**: email / AI

Vercel is great for request/response routes but can't run long-lived processes, so workers live on EC2 instead.

</td>
</tr>
</table>

---

## High-Level Architecture

```txt
User
 |
 | Uploads Resume
 v
Next.js API Route (Vercel)
 |
 | Validate file, auth, role, rate limit
 | Create resume row → status PENDING
 | Add job to BullMQ
 v
Redis / Upstash Queue
 |
 | Job picked up by EC2 worker
 v
ATS Worker
 |
 | Fetch resume by resumeId
 | Mark status PROCESSING
 | Send raw text + target role to Groq
 | Save AI result to DB
 | Mark status COMPLETED
 | Update Redis cache
 | Add email job
 v
Email Queue
 |
 | Picked up by email worker
 v
Email Worker
 |
 | Fetch completed resume
 | Render React Email template
 | Send via Resend
 | Mark isEmailSent = true
```

---

## Request Flow (Step by Step)

### 1. User Uploads Resume

The user uploads a PDF and picks a target role. The API route:

- verifies authentication
- validates file existence + PDF MIME type + file size
- validates the target role
- extracts raw text from the PDF
- applies rate limiting
- creates or updates a resume row
- queues a BullMQ job
- returns `202 Accepted`

The route no longer analyzes the resume directly, it just hands the job off.

### 2. API Returns `202 Accepted`

```json
{
  "message": "Resume queued for analysis",
  "resumeId": "resume_id_here",
  "status": "PENDING"
}
```

> **`202 Accepted`** means the request was accepted, but processing is happening asynchronously in the background. That's different from `200 OK`, which usually implies the work is already done.

### 3. Frontend Redirects to Result Page

The frontend redirects to `/results/:id`. At this point the result may still be `PENDING` or `PROCESSING`.

### 4. Frontend Polling

Since the worker can't push anything back to the frontend, the frontend polls the result endpoint every few seconds until the status resolves:

```txt
GET /resume/:id -> PENDING
wait 3 seconds
GET /resume/:id -> PROCESSING
wait 3 seconds
GET /resume/:id -> COMPLETED
stop polling, show final result
```

### 5. ATS Worker Processes the Job

The worker receives **only the `resumeId`**, never the full resume text. This is intentional: instead of stuffing large payloads into Redis job data, the worker re-fetches the latest resume from PostgreSQL using the ID. Keeps queue payloads small and makes retries safer.

### 6. Worker Saves the Final Result

The worker calls Groq, parses the JSON response, validates/clamps the score breakdown, saves the score + strengths + weaknesses + suggestions + extracted text + improvement message, marks the resume `COMPLETED`, updates the Redis cache, and queues the email job.

### 7. Email Worker Sends the Email

The email worker gets a job with just the `resumeId`, fetches the completed resume, builds props for the React Email template, sends via Resend, and sets:

```ts
isEmailSent: true
```

If sending fails, the email job retries independently. It never touches the already-completed ATS analysis.

---

## Why Workers Don't Return Data to the Frontend

A common mistake when first learning queues: assuming the worker can hand data straight back to the frontend. **It can't.** The API route and the worker are separate processes entirely.

```txt
Frontend -> API Route -> Queue -> Worker
```

By the time the worker actually runs, the original HTTP request has already finished and closed. So the worker doesn't try to "respond". Instead it:

- updates the database
- updates the cache
- triggers another queue
- sends email
- updates status

The frontend gets its answer by polling the database-backed API route, not by waiting on the worker.

---

## Resume Status Lifecycle

```txt
PENDING → PROCESSING → COMPLETED
                     ↘ FAILED   (all retries exhausted)
```

## BullMQ Deep Dive

Everything below was a real lesson learned while building the queue layer. Click into whichever piece is relevant.

<details>
<summary><strong>Queue name vs. job name</strong>: they're not the same thing</summary>

<br>

There are two different identifiers in play:

1. **Queue name**: must match between the `Queue` and the `Worker`
2. **Job name**: just a label for that specific job within the queue

```ts
// Queue
export const emailQueue = new Queue("email-notification", { connection });

// Worker: must use the SAME queue name
const emailWorker = new Worker("email-notification", async (job) => {
  // process job
});
```

Both sides use `email-notification`, that's the queue name. But when *adding* a job:

```ts
await emailQueue.add("send-analysis-email", { resumeId });
```

`send-analysis-email` is only the job name, it doesn't need to match anything on the worker side. A single queue can carry many different job names:

```txt
email-notification queue
 ├── send-analysis-email
 ├── welcome-email
 ├── password-reset-email
 └── inactive-user-reminder
```

The worker listens to the **queue**, not to one specific job name.

</details>

<details>
<summary><strong>Queue configuration</strong>: attempts, backoff, cleanup</summary>

<br>

```ts
import { Queue } from "bullmq";
import client from "../client";

export const atsQueue = new Queue("ats-analysis", {
  connection: client,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});
```

- `attempts`: total tries allowed before the job is marked failed
- `backoff`: delay strategy between retries
- `removeOnComplete`: caps how many completed jobs Redis keeps
- `removeOnFail`: caps how many failed jobs are kept (for debugging)

</details>

<details>
<summary><strong>Retry mechanism</strong>: and why workers must throw</summary>

<br>

```ts
await atsQueue.add(
  "analyze-resume",
  { resumeId: resume.id },
  { attempts: 2, backoff: { type: "exponential", delay: 5000 } }
);
```

If the first attempt fails, BullMQ waits per the backoff strategy, then retries automatically. **The worker has to actually throw** for BullMQ to register the job as failed:

```ts
try {
  const result = await analyzeResume(resume.rawText, resume.targetRole);
} catch (error) {
  throw error; // don't swallow this
}
```

**`job.opts.attempts` vs `job.attemptsMade`:** the former is the configured ceiling, the latter is how many failed attempts have actually happened so far.

```txt
attempts = 4

Attempt 1 failed → attemptsMade = 1
Attempt 2 failed → attemptsMade = 2
Attempt 3 failed → attemptsMade = 3
Attempt 4 failed → attemptsMade = 4
```

Only mark the resume `FAILED` once retries are truly exhausted:

```ts
worker.on("failed", async (job, error) => {
  if (!job) return;

  const isFinalFailure = job.attemptsMade >= (job.opts.attempts ?? 1);

  if (isFinalFailure) {
    await prisma.resume.update({
      where: { id: job.data.resumeId },
      data: { status: "FAILED" },
    });
  }
});
```

This stops the resume from getting flagged `FAILED` while BullMQ still has retries left to try.

</details>

<details>
<summary><strong>Fixed vs. exponential backoff</strong></summary>

<br>

**Fixed**: every retry waits the same delay:

```ts
backoff: { type: "fixed", delay: 3000 }
```

```txt
Attempt 1 failed → wait 3s → Attempt 2 failed → wait 3s → Attempt 3 failed
```

**Exponential**: the wait grows each retry:

```ts
backoff: { type: "exponential", delay: 5000 }
```

```txt
Attempt 1 failed → wait 5s
Attempt 2 failed → wait 10s
Attempt 3 failed → wait 20s
```

Exponential is the better fit when the failure is likely a temporary outage on an external API (like Groq).

</details>

<details>
<summary><strong>Queue chaining</strong>: one job triggering another</summary>

<br>

Queue chaining means a job kicks off another job once its own work is done. Here, the ATS worker only adds the email job *after* the result is saved and cached:

```txt
ATS worker → analysis done → result saved → cache updated → adds email job
```

This is safer than firing the email straight from the API route, since the user should only get notified once the result genuinely exists in the system.

**Why this lives inside the worker function and not in `worker.on("completed")`:**

```ts
const updatedResume = await prisma.resume.update(/* ... */);
await client.setex(cacheKey, ttl, JSON.stringify(updatedResume));
await emailQueue.add("send-analysis-email", { resumeId: updatedResume.id });
```

- `worker.on("completed")` is better suited for logging/metrics, not business logic
- keeping it in the processor makes the workflow easier to reason about
- the email only queues after the DB + cache writes succeed
- a failure to enqueue email doesn't accidentally flag the ATS job as failed

</details>

<details>
<summary><strong>Idempotency</strong>: retries restart from the top, not where they crashed</summary>

<br>

```ts
await step1();
await step2();
await step3(); // crashes here
```

On retry, **all three steps run again**. BullMQ doesn't resume from the failure point:

```ts
await step1();
await step2();
await step3();
```

That means every side effect in the job needs to be safe to repeat. The classic failure mode:

```txt
Attempt 1 sends email, then crashes
Attempt 2 sends the email again
```

→ user gets duplicated emails. This is exactly why the project tracks `isEmailSent` and keeps the ATS job and the email job as two completely separate queues.

</details>

<details>
<summary><strong>Concurrency</strong>: how many jobs a worker runs in parallel</summary>

<br>

```ts
const worker = new Worker(
  "ats-analysis",
  async (job) => {
    // process job
  },
  { connection: client, concurrency: 2 }
);
```

This worker processes two jobs at once. Useful for I/O-heavy work (external API calls, DB queries), but cranking concurrency too high risks hitting:

- AI API rate limits
- Redis command limits
- DB connection limits
- memory / CPU limits

</details>

---

## Redis Caching

Redis does two jobs in this project:

1. BullMQ queue storage
2. Cache-aside result caching

### Cache-Aside Pattern

The result `GET` route follows cache-aside: check Redis first, fall back to the DB, then populate the cache.

```txt
GET /resume/:id
 |
 v
Build cache key
 |
 v
Check Redis
 ├── hit  → return cached result
 └── miss → query DB → write to Redis with TTL → return result
```

```ts
const cacheKey = `user:${userId}:resume:${resumeId}`;

const cachedData = await client.get(cacheKey);
if (cachedData) {
  return NextResponse.json(JSON.parse(cachedData));
}

const resume = await prisma.resume.findFirst({
  where: { userId, id: resumeId },
});

await client.setex(cacheKey, 60 * 60 * 24 * 7, JSON.stringify(resume));
return NextResponse.json(resume);
```

### The Bug: Caching `PENDING` Data

A real bug that happened here: caching the resume row *before* it was actually done:

```txt
Resume row created with PENDING status
 → GET /results/:id called too early
 → PENDING row gets cached
 → worker later completes the analysis
 → GET route still serves the stale PENDING cache
 → frontend loader spins forever
```

**Fix:** only cache completed results, or explicitly update the cache once the worker finishes:

```txt
Worker completes analysis → update DB → update Redis cache with the completed result
```

> **Lesson:** don't cache temporary/processing state unless you have a clear invalidation strategy for it.

### Upstash Free Tier Note

Upstash's free tier is limited primarily by Redis *command count*, not data size, and polling racks up commands fast since every poll calls `client.get(cacheKey)`.

For a learning project, keeping the cache is worth it since it demonstrates cache keys, TTL, hits/misses, invalidation, and the cache-aside pattern itself. But for a genuinely low-traffic or free-tier deployment, reading straight from Postgres during polling can actually be more efficient: the DB easily absorbs a handful of reads, while Redis command quota disappears quickly. This isn't an argument that caching is the wrong call architecturally, just that it has real trade-offs.

---

## Operational Concepts

Smaller pieces of the system worth knowing about individually.

<details>
<summary><strong>Cron jobs</strong></summary>

<br>

A cron job runs automatically on a schedule. Example use cases here: inactive-user reminders, nightly cache cleanup, weekly analytics, expired-token cleanup, weekly reports.

```txt
* * * * *
| | | | |
| | | | day of week
| | | month
| | day of month
| hour
minute
```

```txt
* * * * *         every minute
*/5 * * * *        every 5 minutes
0 * * * *          every hour
0 9 * * *          every day at 9 AM
0 0 * * 0          every Sunday at midnight
0 8 * * 1          every Monday at 8 AM
*/15 9-17 * * 1-5  every 15 min, office hours, Mon–Fri
```

`*` = every value · `,` = multiple values · `-` = range · `/` = step interval

</details>

<details>
<summary><strong>Dead letter queue</strong></summary>

<br>

A dead letter queue holds jobs that permanently failed after exhausting all retries, instead of just losing them.

```txt
ATS job fails all retries → moved to dead-letter queue → developer investigates later
```

Useful for: debugging failed AI jobs, manually retrying failed emails, inspecting bad payloads, preventing silent job loss.

</details>

<details>
<summary><strong>Job cleanup</strong></summary>

<br>

Without cleanup config, BullMQ keeps completed/failed jobs in Redis forever.

```ts
defaultJobOptions: {
  removeOnComplete: 100,
  removeOnFail: 50,
}
```

Keeps only the last 100 completed and 50 failed jobs, auto-removing the rest. Keeps Redis storage bounded.

</details>

<details>
<summary><strong>Priority jobs</strong></summary>

<br>

```ts
await atsQueue.add("analyze-resume", { resumeId }, { priority: 1 });
```

In BullMQ, **lower number = higher priority** (`priority: 1` beats `priority: 10`). Useful for premium users ahead of free users, urgent emails ahead of normal ones, or critical jobs ahead of analytics jobs.

</details>

<details>
<summary><strong>Rate limiting</strong></summary>

<br>

Resume analysis is rate-limited to prevent abuse and protect Groq quota, Redis usage, DB load, and the worker queue from overload, e.g. *"Limit exceeded. You can analyze 5 resumes per hour."*

</details>

<details>
<summary><strong>Bull Board</strong> (planned)</summary>

<br>

A future addition for visually monitoring queues: waiting, active, completed, failed, delayed, and retried jobs, instead of inspecting Redis manually.

</details>

---

## Deployment Architecture

```txt
Vercel
 ├── Next.js frontend
 └── API routes
       |
       v
Upstash Redis
 ├── BullMQ queue storage
 └── Redis cache
       |
       v
AWS EC2
 ├── ats-worker   (PM2)
 └── email-worker (PM2)
       |
       v
External services
 ├── Groq
 ├── Resend
 └── Supabase PostgreSQL
```

### Why Vercel Wasn't Used for the Workers

Vercel's serverless functions are request-based, they spin up, handle one request, and shut down. BullMQ workers need to stay alive continuously, waiting on Redis for new jobs. So the split is:

```txt
Vercel → frontend + API routes
EC2    → long-running workers
```

### PM2

PM2 keeps the Node worker processes alive on EC2 and restarts them if they crash.

```txt
Without PM2:  SSH session closes → worker process dies
With PM2:     EC2 keeps running → PM2 keeps workers alive → jobs keep processing
```

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 2. Install dependencies
npm install

# 3. Set up environment variables
touch .env
```

```env
DATABASE_URL=
REDIS_URL=
GROQ_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Also include any Firebase, Cloudinary, or other auth-related variables your setup uses.

```bash
# 4. Generate the Prisma client
npx prisma generate

# 5. Run migrations (if applicable)
npx prisma migrate dev
# (or, if the DB already exists and you just need the client:)
# npx prisma generate

# 6. Run the Next.js app
npm run dev
```

Then, in **separate terminals**:

```bash
# 7. ATS worker
npm run worker

# 8. Email worker
npm run worker:email
```

---

## Production Worker Deployment on EC2

```bash
# 1. Connect to the instance
ssh -i ats-worker-key-pair.pem ubuntu@YOUR_EC2_PUBLIC_IP

# 2. Update Ubuntu
sudo apt update

# 3. Install Git
sudo apt install -y git

# 4. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# check versions
node -v
npm -v

# 5. Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 6. Install dependencies
npm install

# 7. Create .env
nano .env
```

Paste in the production variables:

```env
DATABASE_URL=
REDIS_URL=
GROQ_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=https://ats-scorer-pearl.vercel.app
```

Save in nano: `CTRL + O` → `Enter` → `CTRL + X`

```bash
# 8. Generate Prisma client
npx prisma generate

# 9. Test the ATS worker
npm run worker
# Redis connected / stays running without crashing = alive. Stop with CTRL + C.

# 10. Test the email worker
npm run worker:email
# Stop with CTRL + C.
```

### PM2 Setup on EC2

```bash
# Install PM2
sudo npm install -g pm2
pm2 -v

# Make sure you're in the project folder
cd ~/YOUR_REPO_NAME

# Start both workers under PM2
pm2 start npm --name ats-worker -- run worker
pm2 start npm --name email-worker -- run worker:email

# Check status
pm2 list
```

Expected:

```txt
ats-worker      online
email-worker    online
```

```bash
# Persist the process list
pm2 save

# Enable PM2 on reboot
pm2 startup
# (copy and run the generated `sudo env PATH=...` command, then:)
pm2 save
```

**Useful PM2 commands:**

```bash
pm2 list
pm2 logs
pm2 logs ats-worker
pm2 logs email-worker
pm2 restart ats-worker
pm2 restart email-worker
pm2 stop ats-worker
pm2 stop email-worker
pm2 delete ats-worker
pm2 delete email-worker
```

---

## Updating Code on EC2

When new changes are pushed to GitHub:

```bash
ssh -i ats-worker-key-pair.pem ubuntu@YOUR_EC2_PUBLIC_IP
cd ~/YOUR_REPO_NAME
git pull
npm install
npx prisma generate
pm2 restart ats-worker
pm2 restart email-worker
pm2 save
```

- **Frontend-only changes** → Vercel redeploys automatically.
- **Worker code changes** → the EC2 workers need a manual restart, as above.

---

## Production Notes & Gotchas

| Rule | Why |
|---|---|
| **Keep workers separate** | ATS analysis and email sending fail independently. If email fails, the resume analysis should still stand as completed |
| **Don't cache `PENDING` data** | Only cache completed results, or update the cache once the worker finishes. See [the bug above](#the-bug-caching-pending-data) |
| **Workers must throw on error** | If a worker catches an error without re-throwing it, BullMQ thinks the job succeeded |
| **Pass IDs in job payloads, not data** | `{ resumeId }` ✅, not `{ hugeResumeText, fullUserData, fullAnalysisData }` ❌ |
| **Use PM2 for long-running workers** | Never rely on a bare SSH session to keep a worker alive |
| **Polling has to stop** | Stop once `status === COMPLETED` or `status === FAILED`, or it just burns API calls forever |

---

## Scalability Notes

The queue-based architecture lets resume analysis and email delivery scale horizontally just by adding more worker instances. Right now, the real ceilings are:

- AI API rate limits
- Redis throughput
- database connection limits
- worker CPU / memory
- PDF extraction time
- email provider limits
- file upload/storage limits

**To scale further:**

- increase worker concurrency / run multiple worker instances
- stronger Redis infrastructure
- connection pooling for PostgreSQL
- Bull Board for queue monitoring
- Dockerize the workers
- CI/CD
- observability and logging
- split worker types by responsibility
- Kafka or event streaming, *only* once scale genuinely demands it

BullMQ fits this project well because the work is job-based and task-oriented. Kafka would make more sense for large-scale event streaming, analytics pipelines, or systems processing continuous high-volume event streams, not this.

---

## Future Improvements

- Job description matching
- Resume version comparison
- Resume improvement history
- Bull Board dashboard
- Dockerized deployment
- CI/CD pipeline
- Admin analytics dashboard
- Better AI output validation
- Resume template recommendations
- More role-specific scoring systems
- WebSocket/SSE instead of polling
- Worker autoscaling
- Better monitoring and alerts

---

## Summary

ATS Scorer isn't just an AI wrapper, it's a full-stack system that demonstrates how production backends handle long-running work safely.

> **The core idea:** API routes stay fast. Heavy work moves to background workers. Workers update persistent state. The frontend polls or subscribes for status. Users get notified when the work is actually done.

**What this project covers, end to end:**

AI integration · file upload handling · authentication · validation · rate limiting · PostgreSQL schema design · Prisma ORM · Redis caching · the cache-aside pattern · BullMQ queues · background workers · retry handling · queue chaining · email notifications · deployment across Vercel + EC2 · PM2 process management · production-style asynchronous architecture.

Built as a learning project, but the architecture follows patterns used in real production systems.

<div align="center">

**[🔗 Live Demo](https://ats-scorer-pearl.vercel.app)**

</div>

