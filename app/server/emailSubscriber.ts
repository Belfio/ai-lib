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
  const eventName = event.Records[0]?.eventName;
  console.log("Event Name", eventName);
  if (!jobId) {
    console.log("No Job Id");
    return;
  }

  const job = await db.job.get(jobId);
  if (!job) {
    console.log("No Job", jobId);
    return;
  }
  try {
    if (job.status !== JobStatus.PENDING) {
      return;
    }
    await db.job.create({ ...job, status: JobStatus.PROCESSING });

    console.log("Job", job);

    const email = await db.email.get(job.emailId);

    console.log("Email", email);

    if (!email) {
      await db.job.create({ ...job, status: JobStatus.FAILED });
      console.log("Failed to get email");
      return;
    }

    // start processing the email
    console.log("Processing email", email.id);
    console.log("Creating a new thread");
    const openAiSettings = await emailOpenAiSetup(email);
    if (!openAiSettings) {
      await db.job.create({ ...job, status: JobStatus.FAILED });
      console.log("Failed to setup OpenAI settings");
      return;
    }
    console.log("Saving the new thread");

    await db.email.create({
      ...email,
      openAiSettings,
    });
    console.log("Extracting data from the email");
    const companyRawData = await emailDataExtraction({
      ...email,
      openAiSettings,
    });

    console.log("Company Raw Data");
    if (!companyRawData) {
      await db.job.create({ ...job, status: JobStatus.FAILED });
      console.log("Failed to extract data from email");
      return;
    }
    console.log("Company Raw Data writing to S3");
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
      companyId: email.id,
    });
    await db.job.create({ ...job, status: JobStatus.COMPLETED });

    return;
  } catch (error) {
    console.error("Error in email subscriber", error);
    await db.job.create({ ...job, status: JobStatus.FAILED });

    return;
  }
};
