import { JobFileType } from "@/lib/types";
import { SQSEvent } from "aws-lambda";
import { fileAnalysis } from "../processing/jobs/fileAnalysisHandler";
import { emailAnalysis } from "../processing/jobs/emailAnalysisHandler";

export const handler = async (event: SQSEvent) => {
  console.log("Job Queue event");
  const message = JSON.parse(event.Records[0]?.body);
  switch (message.type) {
    case JobFileType.FILE:
      console.log("File job");
      fileAnalysis(message.jobId as string);
      break;
    case JobFileType.EMAIL:
      console.log("Email job");
      emailAnalysis(message.jobId as string);
      break;
  }
  return {
    statusCode: 200,
    body: "Job processed",
  };
};
