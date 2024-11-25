import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  project: process.env.OPENAI_PROJECT,
  apiKey: process.env.OPENAI_API_KEY,
});

const audioTranscription = async (audioStream: File) =>
  await openai.audio.transcriptions.create({
    file: audioStream,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

const audioTranslation = async (audioStream: File) =>
  await openai.audio.translations.create({
    file: audioStream,
    model: "whisper-1",
  });

const audioCreateSpeech = async (
  text: string,
  filePath: string
): Promise<{ speechFile: string; path: string; text: string }> => {
  const speechFile = path.resolve(filePath);

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
  return {
    speechFile,
    path: speechFile,
    text: text,
  };
};

const textChat = async (
  instruction: string,
  text: string,
  name?: string,
  responseFormat?: z.ZodType<any, z.ZodTypeDef, any>,
  nameFormat?: string
) => {
  const res = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `${instruction}. ${name ? "Call me " + name : ""}`,
      },
      { role: "user", content: text },
    ],
    model: "gpt-4o-mini",
    response_format: responseFormat
      ? zodResponseFormat(responseFormat, nameFormat || "obj")
      : undefined,
  });
  try {
    return res.choices[0].message.content;
  } catch (error) {
    console.log("error", error);
    console.log("res", JSON.stringify(res, null, 2));
    return "error";
  }
};

const imageChat = async (
  instruction: string,
  text: string,
  imageUrl: string,
  responseFormat?: z.ZodType<any, z.ZodTypeDef, any>,
  nameFormat?: string
) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: instruction,
      },
      {
        role: "user",
        content: [
          { type: "text", text: text },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    response_format: responseFormat
      ? zodResponseFormat(responseFormat, nameFormat || "obj")
      : undefined,
  });
  return response.choices[0];
};

const chatWithFunction = async (
  textToParse: string,
  functionInstruction: string,
  functionName: string,
  params: {
    paramKey: string;
    paramType: string;
    paramDescription: string;
    paramEnum?: string[];
    isRequired: boolean;
  }[]
) => {
  const messages: ChatCompletionMessageParam[] = [
    { role: "user", content: textToParse },
  ];
  const tools = [
    {
      type: "function",
      function: {
        name: functionName,
        description: functionInstruction,
        parameters: {
          type: "object",
          properties: params.reduce((acc, param) => {
            acc[param.paramKey] = {
              type: param.paramType,
              description: param.paramDescription,
              enum: param.paramEnum,
            };
            return acc;
          }, {}),
          required: params
            .filter((param) => param.isRequired)
            .map((param) => param.paramKey),
        },
      },
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    tools: tools.map((tool) => ({
      ...tool,
      type: "function", // Ensure type is explicitly "function"
    })),
    tool_choice: "auto",
  });

  console.log(response);
};

const createAssistant = async (
  name: string,
  instruction: string,
  tools: OpenAI.Beta.Assistants.AssistantTool[]
) => {
  const assistant = await openai.beta.assistants.create({
    name,
    instructions: instruction,
    tools: tools,
    model: "gpt-4o",
  });

  return assistant;
};

const createThread = async () => {
  const thread = await openai.beta.threads.create();
  return thread;
};

const addMessageToThread = async (
  threadId: string,
  message: string,
  fileId?: string
) => {
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
    attachments: fileId
      ? [
          {
            file_id: fileId,
            tools: [
              {
                type: "file_search",
              },
            ],
          },
        ]
      : undefined,
  });
};

const runAssistant = async (threadId: string, assistantId: string) => {
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
  });
  return run;
};

const uploadFile = async (file: File): Promise<string> => {
  const uploadedFile = await openai.files.create({
    file: file,
    purpose: "assistants",
  });
  return uploadedFile.id;
};

const deleteFile = async (fileId: string) => {
  await openai.files.del(fileId);
};

const runPollingOneMinute = async (threadId: string, runId: string) => {
  let counter = 0;
  while (counter < 60) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      console.log(messages);
      return messages;
    }
    if (run.status === "requires_action") {
      console.log("requires_action");
      await openai.beta.threads.runs.submitToolOutputs(run.thread_id, run.id, {
        tool_outputs: [
          {
            tool_call_id:
              run?.required_action?.submit_tool_outputs?.tool_calls[0].id,
            output:
              "Please continue the conversation based on the previous context.",
          },
        ],
      });
    }
    counter = counter + 3;
    console.log(`Elapsed seconds: ${counter}`);
    console.log(run.status);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  console.log("Error: run did not complete");
  return "error";
};

const pdfDataExtraction = async (
  file: File,
  prompt: string,
  tools: OpenAI.Beta.Assistants.AssistantTool[] = [{ type: "file_search" }]
) => {
  const assistant = await createAssistant(
    "Information Extraction Assistant",
    "Read the document thoroughly and extract the information I am going to ask you",
    tools
  );
  // console.log(assistant);
  // console.log("file", file.name);
  const fileId = await uploadFile(file);

  const thread = await createThread();

  await addMessageToThread(thread.id, prompt, fileId);
  // console.log("thread", thread);
  const run = await runAssistant(thread.id, assistant.id);
  const messages = await runPollingOneMinute(thread.id, run.id);
  //   console.log(messages);
  try {
    return messages?.data[0].content[0].text.value;
  } catch (error) {
    console.log("error", error);
    console.log("messages", JSON.stringify(messages, null, 2));
    return "error";
  }
};

const oai = {
  audioTranscription,
  audioTranslation,
  audioCreateSpeech,
  textChat,
  imageChat,
  chatWithFunction,
  createAssistant,
  createThread,
  addMessageToThread,
  runAssistant,
  uploadFile,
  deleteFile,
  runPollingOneMinute,
  pdfDataExtraction,
};

export default oai;
