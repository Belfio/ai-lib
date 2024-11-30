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
  const pdfPrompt = `Act as a document transcriber. Read all the presentation and report me back as much information as possible about the following topics:
  1 - What is the problem
  2 - What is the solution
  3 - What is the market size
  5 - What is the product
  6 - What is the business model and go to market strategy
  7 - What is the traction
  8 - What is the team
  9 - What is the financials
  10 - What is the valuation`;
  const attachmentFile = await s3.docStoring.get(attachments[0]);
  // turn Buffer into File
  const file = new File([attachmentFile], "pitchdeck.pdf", {
    type: "application/pdf",
  });
  try {
    const pdfData = await oai.pdfDataExtraction(file, pdfPrompt);
    console.log("pdfData", pdfData);
    const companyProfile: CompanyProfile = {
      ...pdfData,
    };
    return companyProfile;
  } catch (error) {
    console.error("Error extracting data from PDF", error);
  }

  return null;
};
