import oai from "@/lib/openai";
import { emailOpenAiSetup } from "./emailOpenAiSetup.server";
import { CompanyRawData } from "@/lib/typesCompany";
import { PitchEmailFormData } from "@/lib/types";

export const docDataExtraction = async (
  email: PitchEmailFormData
): Promise<CompanyRawData[] | null> => {
  const openAiSettings = await emailOpenAiSetup(email);
  if (!openAiSettings) {
    return null;
  }

  console.log("Saving the new thread");

  console.log("Extracting raw data from email and attachments");
  const attachment = [];
  const fileIds = openAiSettings.fileIds;
  for (const fileId of fileIds) {
    try {
      const results: Partial<CompanyRawData> = {} as Record<
        keyof CompanyRawData,
        string
      >;
      const emailAddress = email.email;
      const prompts: CompanyRawData = {
        company: `Extract all the information you can about the company ${emailAddress}`,
        team: `Extract all the information you can about the team`,
        product: `Extract all the information you can about the product`,
        market: `Extract all the information you can about the market`,
        businessModel: `Extract all the information you can about the business model`,
        problem: `Extract all the information you can about the problem`,
        solution: `Extract all the information you can about the solution`,
        raising: `Extract all the information you can about the raising`,
        financials: `Extract all the information you can about the financials`,
        milestones: `Extract all the information you can about the milestones`,
        other: `Extract all the information you can about the other`,
      };

      for (const [key, prompt] of Object.entries(prompts)) {
        try {
          const response = await oai.talkToThread(prompt, {
            threadId: openAiSettings.threadId,
            assistantId: openAiSettings.assistantId,
            fileId,
          });
          if (response && response.message) {
            results[key as keyof CompanyRawData] = response.message;
            console.log(`message for ${key}:`, response.message.slice(0, 20));
          }
        } catch (error) {
          console.error(`Error extracting data from PDF for ${key}`, error);
          results[key as keyof CompanyRawData] = "error";
        }
      }

      attachment.push(results as CompanyRawData);
    } catch (error) {
      console.error("Error extracting data from PDF", error);
    }
  }
  return null;
};
