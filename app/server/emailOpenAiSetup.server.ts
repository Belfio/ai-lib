import s3 from "@/lib/s3";
import { PitchEmailFormData } from "@/lib/types";
import oai from "@/lib/openai";

export const emailOpenAiSetup = async (
  emailData: PitchEmailFormData
): Promise<{
  threadId: string;
  assistantId: string;
  fileId: string;
} | null> => {
  const { email, attachments, subject, body } = emailData;
  console.log("email", email);
  console.log("attachments", attachments);
  console.log("subject", subject);
  console.log("body", body);

  const attachmentFile = await s3.docStoring.get(attachments[0]);
  const file = new File([attachmentFile], "pitchdeck.pdf", {
    type: "application/pdf",
  });
  try {
    const { threadId, assistantId, fileId } = await oai.pdfThreadSetup(file);
    console.log("threadId", threadId);
    console.log("assistantId", assistantId);
    console.log("fileId", fileId);
    return { threadId, assistantId, fileId };
  } catch (error) {
    console.error("Error extracting data from PDF", error);
  }

  return null;
};
