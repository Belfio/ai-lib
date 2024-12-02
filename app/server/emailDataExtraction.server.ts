import { CompanyRawData } from "@/lib/typesCompany";
import { PitchEmailFormData } from "@/lib/types";
import oai from "@/lib/openai";

export const emailDataExtraction = async (
  email: PitchEmailFormData
): Promise<CompanyRawData | null> => {
  const { email: emailAddress, openAiSettings } = email;
  if (!openAiSettings) {
    return null;
  }

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
  try {
    const results: Partial<CompanyRawData> = {} as Record<
      keyof CompanyRawData,
      string
    >;

    for (const [key, prompt] of Object.entries(prompts)) {
      try {
        const response = await oai.pdfDataExtraction(prompt, openAiSettings);
        if (response && response.message) {
          results[key as keyof CompanyRawData] = response.message;
          console.log(`message for ${key}:`, response.message);
        }
      } catch (error) {
        console.error(`Error extracting data from PDF for ${key}`, error);
      }
    }

    return results as CompanyRawData;
  } catch (error) {
    console.error("Error extracting data from PDF", error);
  }

  return null;
};
