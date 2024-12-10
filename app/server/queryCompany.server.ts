import db from "@/lib/db";
import oai from "@/lib/openai";

export const queryCompany = async (
  emailId: string,
  prompt: string
): Promise<string | null> => {
  const email = await db.email.get(emailId);
  console.log("email", email);
  console.log("attachments", email.attachments);
  console.log("subject", email.subject);
  console.log("body", email.body);
  const companyProfile = await db.companyProfile.get(emailId);
  try {
    const result = await oai.textChat(prompt, JSON.stringify(companyProfile));
    console.log("message", result);
    return result ?? null;
  } catch (error) {
    console.error("Error extracting data from PDF", error);
  }

  return null;
};
