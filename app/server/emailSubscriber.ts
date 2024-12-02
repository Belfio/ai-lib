import db from "@/lib/db";
import { JobStatus } from "@/lib/types";
import { DynamoDBStreamEvent } from "aws-lambda";
import { emailOpenAiSetup } from "./emailOpenAiSetup.server";
import { emailDataExtraction } from "./emailDataExtraction.server";
import { emailRawToCompanyProfile } from "./emailRawToCompanyProfile.server";
import { randomId } from "@/lib/utils";
import s3 from "@/lib/s3";

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
    console.log("Failed to get email");
    return;
  }

  // start processing the email
  console.log("Processing email", email);
  console.log("Creating a new thread");
  const openAiSettings = await emailOpenAiSetup(email);
  if (!openAiSettings) {
    await db.job.create({ ...job, status: JobStatus.FAILED });
    console.log("Failed to setup OpenAI settings");
    return;
  }
  await db.email.create({
    ...email,
    openAiSettings,
  });
  const companyRawData = await emailDataExtraction({
    ...email,
    openAiSettings,
  });

  console.log("Company Raw Data", companyRawData);
  if (!companyRawData) {
    await db.job.create({ ...job, status: JobStatus.FAILED });
    console.log("Failed to extract data from email");
    return;
  }
  console.log("Company Raw Data writing to S3", companyRawData);
  await db.job.create({ ...job, rawData: companyRawData });
  const data = JSON.stringify(companyRawData);
  const uint8Data = new TextEncoder().encode(data);
  const asyncIterable = (async function* () {
    yield uint8Data;
  })();
  await s3.docStoring.upload(asyncIterable, job.id, "application/json");
  const companyProfile = await emailRawToCompanyProfile(companyRawData);

  if (!companyProfile) {
    await db.job.create({ ...job, status: JobStatus.FAILED });
    console.log("Failed to parse raw data into company profile");
    return;
  }
  await db.companyProfile.create({
    ...companyProfile,
    emailId: email.id,
    companyId: randomId(),
  });
  await db.job.create({ ...job, status: JobStatus.COMPLETED });

  return;
};
