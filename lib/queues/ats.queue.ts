import { Queue } from "bullmq";
import client from "../client";
import { AtsJobData } from "@/types/ats.job.types";

export const atsQueue = new Queue<AtsJobData>("ats-analysis", {
  connection: client,
});
