import { CompanyRawData } from "./typesCompany";
import { z } from "zod";

export const UserSchema = z.object({
  PK: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()).optional(),
  createdAt: z.string(),
  name: z.string(),
  profileImageUrl: z.string().optional(),
  surname: z.string(),
  passwordHash: z.string(),
  companyName: z.string(),
  companyId: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const UserCompanyProfileSchema = z.object({
  PK: z.string(),
  company: z.string(),
  profileImageUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserCompanyProfile = z.infer<typeof UserCompanyProfileSchema>;

export const LoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  companyName: z.string(),
  name: z.string().optional(),
  surname: z.string().optional(),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;

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

export enum JobFileType {
  EMAIL = "email",
  FILE = "file",
}

export type JobType = {
  jobId: string;
  type: JobFileType;
  emailId?: string;
  status: JobStatus;
  constIndex: "constIndex";
  rawData?: CompanyRawData;
  fileUrls?: string[];
  userCompanyId: string;
  createdAt: string;
  creator: {
    email: string;
    name: string;
    surname: string;
  };
};

export interface ResponseType {
  isSuccess: boolean;
  msg: string;
}
