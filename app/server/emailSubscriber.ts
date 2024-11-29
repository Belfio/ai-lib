import db from "@/lib/db";
import { JobStatus } from "@/lib/types";
import { DynamoDBStreamEvent } from "aws-lambda";
import { emailProcessing } from "./emailProcessing.server";

export const handler = async (event: DynamoDBStreamEvent) => {
  console.log("Email Subscriber event", event);
  console.log(
    "Email Subscriber event",
    event.Records[0]?.dynamodb?.Keys?.id?.S
  );

  const jobId = event.Records[0]?.dynamodb?.Keys?.id?.S;

  if (!jobId) {
    return;
  }

  const job = await db.job.get(jobId);

  if (!job) {
    return;
  }

  if (job.status !== JobStatus.PENDING) {
    return;
  }

  console.log("Job", job);

  const email = await db.email.get(job.emailId);

  console.log("Email", email);

  if (!email) {
    await db.job.create({ ...job, status: JobStatus.FAILED });
    return;
  }

  // start processing the email
  console.log("Processing email", email);

  await emailProcessing(email);
  return;
};
