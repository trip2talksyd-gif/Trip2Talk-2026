/**
 * Vercel project config (replaces vercel.json).
 * Cron schedules limited to once daily on Hobby; see comments on each entry.
 */
export const config = {
  crons: [
    // originally hourly (0 * * * *) — upgrade to Vercel Pro to restore this
    {
      path: "/api/cron/expire-pending-slips",
      schedule: "0 3 * * *",
    },
    // originally every 15 min (*/15 * * * *) — upgrade to Vercel Pro to restore this
    {
      path: "/api/cron/expire-pending-cards",
      schedule: "3 3 * * *",
    },
    // originally daily at 04:00 UTC (0 4 * * *) — upgrade to Vercel Pro to restore 0 4 * * * if preferred
    {
      path: "/api/cron/document-expiry-alerts",
      schedule: "6 3 * * *",
    },
  ],
};
