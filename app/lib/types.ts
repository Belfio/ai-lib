import { CompanyRawData } from "./typesCompany";

export enum JobStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  PROCESSING = "processing",
}

export type UploadFormData = {
  email: string;
  subject: string;
  body: string;
  attachments: string[];
  id: string;
};

export type PitchEmailFormData = {
  email: string;
  subject: string;
  body: string;
  attachments: string[];
  id: string;
  constIndex: "constIndex";
  openAiSettings?: {
    threadId: string;
    assistantId: string;
    fileIds: string[];
  };
};

export type JobType = {
  id: string;
  emailId: string;
  status: JobStatus;
  constIndex: "constIndex";
  rawData?: CompanyRawData;
};
export interface ResponseType {
  isSuccess: boolean;
  msg: string;
}

export interface UserType {
  userId: string;
  email: string;
  name: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
}
