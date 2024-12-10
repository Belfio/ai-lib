import s3 from "@/lib/s3";
import { PitchEmailFormData } from "@/lib/types";
import oai from "@/lib/openai";

export const emailOpenAiSetup = async (
  emailData: PitchEmailFormData
): Promise<{
  threadId: string;
  assistantId: string;
  fileIds: string[];
} | null> => {
  const { email, attachments, subject, body } = emailData;
  console.log("email", email);
  console.log("attachments", attachments);
  console.log("subject", subject);
  console.log("body", body);

  const files = [];
  for (const attachment of attachments) {
    const attachmentFile = await s3.docStoring.get(attachment);
    const file = new File([attachmentFile], "pitchdeck.pdf", {
      type: "application/pdf",
    });
    files.push(file);
  }
  try {
    const { threadId, assistantId, fileIds } = await oai.filesThreadSetup(
      files
    );
    console.log("threadId", threadId);
    console.log("assistantId", assistantId);
    console.log("fileId", fileIds);
    return { threadId, assistantId, fileIds };
  } catch (error) {
    console.error("Error extracting data from PDF", error);
  }

  return null;
};
