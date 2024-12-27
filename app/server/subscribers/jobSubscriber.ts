import db from "@/lib/db";
import { JobFileType, JobStatus } from "@/lib/types";
import { DynamoDBStreamEvent } from "aws-lambda";
import { emailAnalysis } from "../processing/jobs/emailAnalysisHandler";
import { fileAnalysis } from "../processing/jobs/fileAnalysisHandler";
import { file2Analysis } from "../processing/jobs/file2AnalysisHandler";

export const handler = async (event: DynamoDBStreamEvent) => {
  console.log("Job Subscriber event", event);

  const createdAt = event.Records[0]?.dynamodb?.Keys?.createdAt?.S;
  const userCompanyId = event.Records[0]?.dynamodb?.Keys?.userCompanyId?.S;
  const eventName = event.Records[0]?.eventName;
  console.log("Event Name", eventName);
  if (eventName !== "INSERT") {
    return;
  }
  if (!createdAt || !userCompanyId) {
    console.log("No Job Id");
    return;
  }

  const job = await db.job.get(userCompanyId, createdAt);
  if (!job) {
    console.log("No Job");
    throw new Error("Job not found");
    return;
  }
  console.log("Job", job);
  if (job.status !== JobStatus.PENDING) {
    throw new Error("Job not pending");
    return;
  }

  switch (job.type) {
    case JobFileType.EMAIL:
      await emailAnalysis(job);
      break;
    case JobFileType.FILE:
      await file2Analysis(job);
      break;
  }
};
