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
  firmId: string;
  createdAt: string;
  creator: {
    email: string;
    name: string;
    surname: string;
  };
  updatedAt?: string;
  companyDetails?: {
    companyName: string;
    companyId: string;
  };
  processPhase?: ProcessPhase;
};

export enum ProcessPhase {
  DATA_UPLOADING = 1,
  INFORMATION_EXTRACTION = 2,
  VECTOR_DATABASE_CREATION = 3,
  MODEL_TRAINING = 4,
  MODEL_EVALUATION = 5,
  MODEL_DEPLOYMENT = 6,
  PROFILE_EXTRACTION = 7,
}

export const ProcessPhaseSentence = {
  [ProcessPhase.DATA_UPLOADING]: "Data uploading",
  [ProcessPhase.INFORMATION_EXTRACTION]: "Information extraction",
  [ProcessPhase.VECTOR_DATABASE_CREATION]: "Vector database creation",
  [ProcessPhase.MODEL_TRAINING]: "Model training",
  [ProcessPhase.MODEL_EVALUATION]: "Model evaluation",
  [ProcessPhase.MODEL_DEPLOYMENT]: "Model deployment",
  [ProcessPhase.PROFILE_EXTRACTION]: "Profile extraction",
};

export interface ResponseType {
  isSuccess: boolean;
  msg: string;
}
