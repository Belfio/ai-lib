import s3 from "@/lib/s3";
import db from "@/lib/db";
import { CompanyProfile } from "@/lib/newTypes";
import { analyzeWithAI } from "@/lib/ai";

export const handler = async (event: any) => {
  for (const record of event.Records) {
    if (record.eventName !== "INSERT") continue;

    const newItem = record.dynamodb.NewImage;
    const emailId = newItem.id.S;

    // Fetch email data
    const emailData = await db.email.get(emailId);
    const attachmentIds = emailData.attachments;

    // Fetch attachments from S3
    const attachments = await Promise.all(
      attachmentIds.map(async (key) => {
        const fileBuffer = await s3.docStoring.get(key);
        return fileBuffer.toString();
      })
    );
    // Analyze with AI to generate CompanyProfile
    const profile: CompanyProfile = await analyzeWithAI(
      emailData.body,
      attachments
    );

    // Save CompanyProfile to DynamoDB
    await db.companyProfile.create(profile);
  }
};
