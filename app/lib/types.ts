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

export interface ModelType {
  name: string;
  modelId: string;
  createdAt: string;
  ranking: number;
  tConst: "metadata";
  diseaseIds: string;

  userId: string;
  author: string;
  size: string;
  description: string;
  website: string;
  test?: ModelTestingType;
  training?: ModelTrainingType;
  datasetIds?: string;
  diseaseCategory: string;
  statusTesting: "PENDING" | "APPROVED" | "REJECTED";
}

export interface ModelTestingType {
  generalScore: number;
  tests: ModelTestType[];
}

export interface ModelTrainingType extends ModelTestType {
  generalScore: number;
}

export interface ModelTestType {
  datasetId: string;
  datasetName: string;
  score: number;
  date: string;
}

export interface DatasetType {
  datasetId: string;
  types: string;
  createdAt: string;
  ranking: number;
  tConst: "metadata";
  diseaseIds: string;

  userId: string;
  description: string;
  downloadUrl: string;
  website: string;
  author: string;
  size: string;
  diseaseCategory: string;

  name: string;
  instructions: string;
  externalUrl?: string;
  internalUrl?: string;
}

export interface FiltersType {
  dataTypes: string[];
  bodyParts: string[];
  diseases: string[];
  datasets?: string[];
}

export interface DiseaseType {
  name: string;
  categoryId: string;
  description: string;
  diseaseId: string;
  approved: "true" | "false";
  createdAt: string;
  tConst: "metadata";
}

export interface CategoryType {
  categoryId: string;
  categoryName: string;
  ICDCode: string;
  description: string;
}
