import { CompanyRawData } from "./typesCompany";
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()),
  createdAt: z.string(),
  name: z.string(),
  avatar: z.string(),
  surname: z.string(),
});

export type User = z.infer<typeof UserSchema>;

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
    fileId: string;
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
