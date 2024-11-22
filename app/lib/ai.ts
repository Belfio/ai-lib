import { CompanyProfile } from "@/lib/newTypes";

export async function analyzeWithAI(
  emailContent: string,
  attachments: string[]
): Promise<CompanyProfile> {
  // Example using OpenAI's GPT-3
  const prompt = `
    Analyze the following email content and attachments to generate a detailed CompanyProfile.

    Email Content:
    ${emailContent}

    Attachments:
    ${attachments.join("\n\n")}
  `;

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt,
      max_tokens: 3000,
    }),
  });

  const data = await response.json();
  const generatedProfile: CompanyProfile = JSON.parse(data.choices[0].text);
  return generatedProfile;
}
