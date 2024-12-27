import s3 from "@/lib/s3";
import oai from "@/lib/openai";

export type OpenAiFileSettings = {
  threadId: string;
  assistantId: string;
  fileIds: string[];
};
export const fileOpenAiSetup = async (
  fileUrls: string[]
): Promise<OpenAiFileSettings | null> => {
  const oaiSettings: OpenAiFileSettings = {
    threadId: "",
    assistantId: "",
    fileIds: [],
  };
  try {
    const thread = await oai.createThread();
    const assistant = await oai.createAssistant(
      "Information Extraction Assistant",
      "Read the document thoroughly and extract the information I am going to ask you",
      [{ type: "file_search" }]
    );

    oaiSettings.assistantId = assistant.id;
    oaiSettings.threadId = thread.id;

    for (const fileUrl of fileUrls) {
      const attachmentFile = await s3.docStoring.get(fileUrl);

      const file = new File([attachmentFile], "pitchdeck.pdf", {
        type: "application/pdf",
      });
      const fileId = await oai.uploadFile(file);
      console.log("fileId", fileId);
      if (typeof fileId === "string") {
        oaiSettings.fileIds.push(fileId);
      }
    }
    return oaiSettings;
  } catch (error) {
    console.error("Error extracting data from PDF", error);
  }
  return null;
};
