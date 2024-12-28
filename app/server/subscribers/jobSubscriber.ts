import db from "@/lib/db";
import { JobFileType, JobStatus } from "@/lib/types";
import { DynamoDBStreamEvent } from "aws-lambda";

import { Resource } from "sst";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({});

export const handler = async (event: DynamoDBStreamEvent) => {
  console.log("Job Subscriber event");
  for (const record of event.Records) {
    const createdAt = record?.dynamodb?.Keys?.createdAt?.S;
    const firmId = record?.dynamodb?.Keys?.firmId?.S;
    const eventName = record?.eventName;
    console.log("Event Name", eventName);
    if (eventName !== "INSERT") {
      console.log("Event not INSERT");
      return;
    }
    console.log("Keys", record?.dynamodb?.Keys);
    if (!createdAt || !firmId) {
      console.log("No Job Id");
      return;
    }

    const job = await db.job.get(firmId, createdAt);
    if (!job) {
      console.log("No Job");
      return;
      throw new Error("Job not found");
    }
    console.log("Job", job);
    if (job.status !== JobStatus.PENDING) {
      console.log("Job not pending");
      return;
      throw new Error("Job not pending");
    }

    switch (job.type) {
      case JobFileType.EMAIL:
        console.log("Sending email job to queue");
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: Resource.DataProcessingQueue.url,
            MessageBody: JSON.stringify({
              type: JobFileType.EMAIL,
              jobId: job.jobId,
            }),
          })
        );
        break;
      case JobFileType.FILE:
        console.log("Sending file job to queue");
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: Resource.DataProcessingQueue.url,
            MessageBody: JSON.stringify({
              type: JobFileType.FILE,
              jobId: job.jobId,
            }),
          })
        );
        break;
    }
  }
};
