import db from "@/lib/db";
import { JobStatus, JobType } from "@/lib/types";

import oai from "@/lib/openai";
import s3 from "@/lib/s3";
import { rawToCompanyProfile } from "./rawToCompanyProfile.server";
import { CompanyRawData } from "@/lib/typesCompany";

export const fileAnalysis = async (job: JobType) => {
  console.log("File Analysis Handler event", job.id);
  const jobId = job.id;
  try {
    // Process each record (in case of batch)

    if (!job) {
      console.log("No Job");
      return;
    }
    const s3Key = job.files[0];
    // Extract data using OpenAI
    const rawData: CompanyRawData = {
      company: "Extract all information about the company",
      businessModel: "Extract all information about the business model",
      problem: "Extract all information about the problem being solved",
      solution: "Extract all information about the solution",
      product: "Extract all information about the product",
      market: "Extract all information about the market",
      team: "Extract all information about the team",
      raising: "Extract all information about fundraising",
      financials: "Extract all information about financials",
      milestones: "Extract all information about milestones",
      other: "Extract any other relevant information",
    };

    // Process each aspect of the company data
    for (const [key, prompt] of Object.entries(rawData)) {
      const result = await oai.pdfDataExtraction(prompt, {
        threadId: jobId,
        assistantId: jobId,
        fileId: s3Key,
      });

      if (result?.message) {
        rawData[key as keyof CompanyRawData] = result.message;
      }
    }

    // Save raw data to S3
    const data = JSON.stringify(rawData);
    const uint8Data = new TextEncoder().encode(data);
    const asyncIterable = (async function* () {
      yield uint8Data;
    })();
    await s3.docStoring.upload(asyncIterable, jobId, "application/json");

    // Convert raw data to company profile
    const companyProfile = await rawToCompanyProfile(rawData);
    if (!companyProfile) {
      await db.job.create({ ...job, status: JobStatus.FAILED });
      console.log("Failed to parse raw data into company profile");
      throw new Error("Failed to parse raw data into company profile");
    }

    // Save company profile
    await db.companyProfile.create({
      ...companyProfile,
      profileId: jobId,
    });

    // Update job status
    await db.job.create({
      ...job,
      status: JobStatus.COMPLETED,
      rawData,
    });

    console.log(`Successfully processed file: ${s3Key}`);
    return { statusCode: 200, body: "Processing complete" };
  } catch (error) {
    console.error("Error in file analysis handler:", error);
    throw error;
  }
};
