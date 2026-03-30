// apps/renderer/src/worker.ts
import pLimit from "p-limit";
import {
  getNextJob,
  markProcessing,
  markCompleted,
  markFailed,
  updateJobStatus,
  incrementAttempts,
  claimNextJob,
} from "@queue/index";
import { renderJob } from "./render";
import { db } from "packages/db";
import * as dotenv from "dotenv";

dotenv.config();

const VIDEO_RENDER_JOB_CONCURRENCY = parseInt(process.env.VIDEO_RENDER_JOB_CONCURRENCY ?? "1", 10);

const limit = pLimit(VIDEO_RENDER_JOB_CONCURRENCY);

export function startWorker() {
  setInterval(async () => {
    const job = await getNextJob();
    if (!job) return;

    await markProcessing(job.id);

    limit(async () => {
      try {
        await renderJob(job);
        await markCompleted(job.id);
      } catch (err) {
        await markFailed(job.id, err);
      }
    });
  }, 2000);
}

export async function recoverStuckJobs() {
  console.log("recoverStuckJobs being called once");
  await db.query(
    `UPDATE renders
     SET status = 'pending'
     WHERE status = 'processing'`,
  );

  console.log("Recovered stuck jobs");
}

export async function workerLoop() {
  while (true) {
    const job = await claimNextJob();

    if (!job) {
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }

    if (job.cancelled) {
      await updateJobStatus(job.id, "failed", "Cancelled");
      return;
    }

    limit(async () => {
      try {
        // await updateJobStatus(job.id, "processing");
        await incrementAttempts(job.id);

        const renderRes = await renderJob({
          id: job.id,
          compositionId: job.composition_id,
          inputProps: JSON.parse(job.input),
        });

        await updateJobStatus(job.id, "done", undefined, renderRes?.output);
      } catch (err: any) {
        console.log("🚀 ~ workerLoop ~ err:", err);
        if (err.message?.includes("cancel")) {
          await updateJobStatus(job.id, "failed", "Cancelled");
          return;
        }

        if (job.attempts >= job.max_attempts) {
          await updateJobStatus(job.id, "failed", err.message);
        } else {
          await updateJobStatus(job.id, "pending", err.message);
        }
      }
    });
  }
}
