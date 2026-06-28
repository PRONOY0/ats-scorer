import "dotenv/config";

import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queues/email.queue";

const seven_days = 7 * 24 * 60 * 60 * 1000;

cron.schedule("30 9 * * *", async () => {
  try {
    console.log("Running inactive user reminder cron...");

    const sevenDaysAgo = new Date(Date.now() - seven_days);

    const inactiveUsers = await prisma.user.findMany({
      where: {
        OR: [
          {
            lastSeenAt: null,
          },
          {
            lastSeenAt: {
              lt: sevenDaysAgo,
            },
          },
        ],
        AND: [
          {
            OR: [
              {
                lastReminderSentAt: null,
              },
              {
                lastReminderSentAt: {
                  lt: sevenDaysAgo,
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
      },
    });

    console.log("Inactive users:", inactiveUsers);
    console.log("Count:", inactiveUsers.length);

    for (const user of inactiveUsers) {
      await emailQueue.add(
        "send-reminder-email",
        {
          userId: user.id,
          resumeId: "",
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 3000,
          },
          removeOnComplete: true,
          removeOnFail: false,
          jobId: `last-seen-reminder-${user.id}-${new Date().toString().slice(0, 10)}`,
        },
      );
    }
  } catch (error) {
    console.error(`Inactive reminder cron failed:${error}`);
  }
});
