import db from "@/lib/db";
import { emailRawToCompanyProfile } from "./emailRawToCompanyProfile.server";
import { JobStatus } from "@/lib/types";
import { randomId } from "@/lib/utils";
import s3 from "@/lib/s3";

export const parseCompany = async (emailId: string): Promise<string | null> => {
  const email = await db.email.get(emailId);

  const jobs = await db.job.queryFromEmailId(email.id);
  if (!jobs || jobs.length === 0) {
    console.log("No jobs found for email", email.id);
    return null;
  }
  // if (!jobs[0].rawData) {
  //   console.log("No raw data found for job", jobs[0].id);
  //   console.log("jobs", jobs);
  //   return null;
  // }

  console.log("jobs", jobs[0].id);
  const companyRawData = await s3.docStoring.get(jobs[0].id);
  console.log("companyRawData", JSON.parse(companyRawData.toString()));
  const companyProfile = await emailRawToCompanyProfile(
    JSON.parse(companyRawData.toString())
  );

  if (!companyProfile) {
    await db.job.create({ ...jobs[0], status: JobStatus.FAILED });
    console.log("Failed to parse raw data into company profile");
    return null;
  }
  // await db.companyProfile.create({
  //   ...companyProfile,
  //   emailId: email.id,
  //   companyId: randomId(),
  // });

  return companyProfile;
};