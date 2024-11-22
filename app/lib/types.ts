export enum JobStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export type UploadFormData = {
  email: string;
  subject: string;
  body: string;
  attachments: string[];
  id: string;
  constIndex: "constIndex";
};

export type JobType = {
  id: string;
  emailId: string;
  status: JobStatus;
  constIndex: "constIndex";
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
