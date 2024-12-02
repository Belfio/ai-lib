import s3 from "@/lib/s3";
import db from "@/lib/db";
import { analyzeWithAI } from "@/lib/ai";
import { CompanyProfile } from "@/lib/typesCompany";
import { UploadFormData } from "@/lib/types";
import oai from "@/lib/openai";

export const emailProcessing = async (
  event: UploadFormData
): Promise<CompanyProfile | null> => {
  const { email, attachments, subject, body } = event;
  console.log("email", email);
  console.log("attachments", attachments);
  console.log("subject", subject);
  console.log("body", body);
  // const domain = extractDomain(email);
  // const emailName = extractNameFromEmail(email);
  const pdfPrompt = `Extract all the information you cana bout the team`;
  const attachmentFile = await s3.docStoring.get(attachments[0]);
  // turn Buffer into File
  const file = new File([attachmentFile], "pitchdeck.pdf", {
    type: "application/pdf",
  });
  try {
    const { message, askMore } = await oai.pdfDataExtraction(file, pdfPrompt);
    console.log("message", message);
    // const companyProfile: CompanyProfile = {
    //   ...message,
    // };
    return message;
  } catch (error) {
    console.error("Error extracting data from PDF", error);
  }

  return null;
};
