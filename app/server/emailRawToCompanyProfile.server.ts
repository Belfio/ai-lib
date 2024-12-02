import {
  CompanyProfile,
  CompanyProfileSchema,
  CompanyRawData,
} from "@/lib/typesCompany";

import oai from "@/lib/openai";

export const emailRawToCompanyProfile = async (
  rawData: CompanyRawData
): Promise<CompanyProfile | null> => {
  try {
    const instruction = `Parse this data into a JSON object`;
    const text = JSON.stringify(rawData);

    const companyProfile = await oai.textChat(
      instruction,
      text,
      undefined,
      CompanyProfileSchema,
      "CompanyProfile"
    );
    console.log("companyProfile", companyProfile);

    // const parsedCompanyProfile = CompanyProfileSchema.parse(companyProfile);
    if (!companyProfile) {
      return null;
    }
    return JSON.parse(companyProfile);
  } catch (error) {
    console.error("Error parsing raw data into company profile", error);
  }

  return null;
};
