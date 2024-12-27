import db from "@/lib/db";
import { JobStatus, JobType } from "@/lib/types";
import { fileDataExtraction } from "./fileDataExtraction.server";
import { rawToCompanyProfile } from "./rawToCompanyProfile.server";
import s3 from "@/lib/s3";
import { fileOpenAiSetup } from "./fileOpenAiSetup.server";

export const file2Analysis = async (job: JobType) => {
  console.log("File 2 Analysis Handler", job.jobId);
  const jobId = job.jobId;
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

    // start processing the file
    console.log("Creating a new thread");
    if (!job.fileUrls) {
      await db.job.create({ ...job, status: JobStatus.FAILED });
      console.log("No file urls");
      return;
    }
    const openAiSettings = await fileOpenAiSetup(job.fileUrls);
    if (!openAiSettings) {
      await db.job.create({ ...job, status: JobStatus.FAILED });
      console.log("Failed to setup OpenAI settings");
      return;
    }
    console.log("Saving the new thread");

    console.log("Extracting data from the email");
    const companyRawData = await fileDataExtraction(openAiSettings);

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
      emailId: job.emailId,
      profileId: job.jobId,
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
