import s3 from "@/lib/s3";
import db from "@/lib/db";
import { analyzeWithAI } from "@/lib/ai";
import { CompanyProfile } from "@/lib/typesCompany";
import { UploadFormData } from "@/lib/types";

export const handler = async (event: UploadFormData) => {
  const { email, attachments, subject, body } = event;

  const domain = extractDomain(email);
  const emailName = extractNameFromEmail(email);
};
