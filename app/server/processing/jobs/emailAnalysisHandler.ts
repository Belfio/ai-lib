import db from "@/lib/db";
import { JobStatus } from "@/lib/types";
import { emailOpenAiSetup } from "./emailOpenAiSetup.server";
import { dataExtraction } from "./dataExtraction.server";
import { rawToCompanyProfile } from "./rawToCompanyProfile.server";
import s3 from "@/lib/s3";

export const emailAnalysis = async (jobId: string) => {
  console.log("emailAnalysis", jobId);
  const job = (await db.job.queryFromJobId(jobId))?.[0];
  if (!job) {
    console.log("No Job", jobId);
    return;
  }
  if (!job.emailId) {
    console.log("No Email Id", jobId);
    return;
  }
  if (job.status !== JobStatus.PENDING) {
    console.log("Job not pending", jobId);
    return;
  }
  try {
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
    const companyRawData = await dataExtraction({
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
    await s3.docStoring.upload(asyncIterable, job.jobId, "application/json");
    const companyProfile = await rawToCompanyProfile(companyRawData);

    if (!companyProfile) {
      await db.job.create({ ...job, status: JobStatus.FAILED });
      console.log("Failed to parse raw data into company profile");
      return;
    }
    await db.companyProfile.create({
      ...companyProfile,
      emailId: email.id,
      profileId: email.id,
    });
    await db.job.create({
      ...job,
      status: JobStatus.COMPLETED,
      rawData: companyRawData,
    });

    return;
  } catch (error) {
    console.error("Error in email subscriber", error);
    await db.job.create({ ...job, status: JobStatus.FAILED });

    return;
  }
};
