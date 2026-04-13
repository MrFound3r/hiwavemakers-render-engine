// src/packages/queue/index.ts
import { db } from "@hiwave/db";
import { QueueJob } from "./types";

export async function enqueueJob(job: QueueJob) {
  await db.query(
    `INSERT INTO renders 
     (id, composition_id, status, input)
     VALUES (?, ?, 'pending', ?)`,
    [job.id, job.compositionId, job.inputProps ? JSON.stringify(job.inputProps) : null],
  );

  return {
    id: job.id,
    status: "pending",
  };
}

export async function enqueueJobs(jobs: QueueJob[]) {
  for (const job of jobs) {
    await enqueueJob(job);
  }

  return jobs.map((j) => ({
    id: j.id,
    status: "pending",
  }));
}

export async function updateJobStatus(id: string, status: string, error?: string, videoUrl?: string, thumbnailUrl?: string | null) {
  await db.query(
    `UPDATE renders
     SET status = ?, error = ?, output_path = ?, thumbnail_path = ?
     WHERE id = ?`,
    [status, error || null, videoUrl || null, thumbnailUrl || null, id],
  );
}

export async function getNextJob() {
  const [rows]: any = await db.query(
    `SELECT * FROM renders 
     WHERE status = 'pending' AND attempts < max_attempts
     LIMIT 1`,
  );

  return rows[0];
}

export async function claimNextJob() {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows]: any = await connection.query(
      `SELECT * FROM renders
       WHERE status = 'pending'
       AND attempts < max_attempts
       AND cancelled = FALSE
       ORDER BY created_at ASC
       LIMIT 1
       FOR UPDATE`,
    );

    if (!rows.length) {
      await connection.commit();
      return null;
    }

    const job = rows[0];

    await connection.query(
      `UPDATE renders
       SET status = 'processing',
           attempts = attempts + 1
       WHERE id = ?`,
      [job.id],
    );

    await connection.commit();

    return {
      ...job,
      attempts: job.attempts + 1,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function incrementAttempts(id: string) {
  await db.query(`UPDATE renders SET attempts = attempts + 1 WHERE id = ?`, [id]);
}

// Old implementation using In memory queue
type Job = {
  id: string;
  compositionId: string;
  inputProps: any;
  status: "pending" | "processing" | "done" | "failed";
};

let jobs: Job[] = [];

export async function enqueueJobInMem(data: any): Promise<Job> {
  const job: Job = {
    id: Date.now().toString(),
    compositionId: data.compositionId,
    inputProps: data.inputProps,
    status: "pending",
  };

  jobs.push(job);
  return job;
}

export async function getNextJobInMem(): Promise<Job | null> {
  return jobs.find((j) => j.status === "pending") || null;
}

export async function markProcessing(id: string) {
  const job = jobs.find((j) => j.id === id);
  if (job) job.status = "processing";
}

export async function markCompleted(id: string) {
  const job = jobs.find((j) => j.id === id);
  if (job) job.status = "done";
}

export async function markFailed(id: string, error: any) {
  const job = jobs.find((j) => j.id === id);
  if (job) job.status = "failed";
}
