import { CompanyRawData } from "@/lib/typesCompany";
import oai from "@/lib/openai";
import { OpenAiFileSettings } from "./fileOpenAiSetup.server";

export const fileDataExtraction = async (
  openAiSettings: OpenAiFileSettings
): Promise<CompanyRawData | null> => {
  if (!openAiSettings) {
    return null;
  }

  const prompts: CompanyRawData = {
    company: `Extract all the information you can about this company`,
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
  try {
    const results: Partial<CompanyRawData> = {} as Record<
      keyof CompanyRawData,
      string
    >;
    for (const fileId of openAiSettings.fileIds) {
      await oai.addMessageToThread(openAiSettings.threadId, "", fileId);
    }

    for (const [key, prompt] of Object.entries(prompts)) {
      try {
        await oai.addMessageToThread(openAiSettings.threadId, prompt);

        const run = await oai.runAssistant(
          openAiSettings.threadId,
          openAiSettings.assistantId
        );
        const messages = await oai.runPollingOneMinute(
          openAiSettings.threadId,
          run.id
        );

        const response =
          messages !== "error" && messages?.data[0].content[0].type === "text"
            ? messages.data[0].content[0].text.value
            : null;

        if (response) {
          results[key as keyof CompanyRawData] = response;
          console.log(`message for ${key}:`, response.slice(0, 20));
        }
      } catch (error) {
        console.error(`Error extracting data from PDF for ${key}`, error);
        results[key as keyof CompanyRawData] = "error";
      }
    }

    return results as CompanyRawData;
  } catch (error) {
    console.error("Error extracting data from PDF", error);
  }

  return null;
};
