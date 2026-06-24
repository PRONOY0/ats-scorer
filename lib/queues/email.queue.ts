import { Queue } from "bullmq";
import client from "../client";
import { EmailJobData } from "@/types/email.job.types";

export const emailQueue = new Queue<EmailJobData>("email-notification", {
  connection: client,
});
