export type FilesAnalyseData = {
  userId: string;
  folderId: string;
  fileUrls: string[];
  firmId: string;
  creator: {
    email: string;
    name: string;
    surname: string;
  };
};

export type EmailAnalyseData = {
  email: string;
  subject: string;
  body: string;
  attachments: string[];
  id: string;
  userId: string;
  firmId: string;
};

const primo = {
  analyseEmail: async ({
    attachments,
    id,
    email,
    firmId,
    userId,
    subject,
    body,
  }: EmailAnalyseData) => {
    const formData: EmailAnalyseData = {
      email,
      subject,
      body,
      attachments,
      id,
      firmId,
      userId,
    };

    const res = await fetch("/api/doc/upload/form", {
      method: "post",
      body: JSON.stringify(formData),
    });
    return res;
  },
  analyseFiles: async ({
    fileUrls,
    folderId,
    userId,
    firmId,
    creator,
  }: {
    fileUrls: string[];
    folderId: string;
    userId: string;
    firmId: string;
    creator: {
      email: string;
      name: string;
      surname: string;
    };
  }): Promise<string> => {
    console.log("analyseFiles", fileUrls, folderId, userId);
    const formData: FilesAnalyseData = {
      folderId,
      fileUrls,
      userId,
      firmId,
      creator,
    };

    const jobId: string = await fetch("/api/doc/upload/file", {
      method: "post",
      body: JSON.stringify(formData),
    }).then((res) => res.json() as Promise<string>);

    return jobId;
  },
  uploadFileToS3: async (file: File, folderId: string): Promise<string> => {
    try {
      const fileUrl =
        "attachments/" +
        folderId +
        "/" +
        file.name.replace(/\s+/g, "").replace(/[^\w-]/g, "");
      // 1. Get pre-signed URL
      const response = await fetch("/api/doc/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: fileUrl,
          contentType: file.type,
        }),
      });

      const signedUrl = await response.json();

      console.log("signedUrl", signedUrl);
      // 2. Upload directly to S3

      await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      return fileUrl;
    } catch (error) {
      console.error("error in uploadFileToS3", error);
      throw error;
    }
  },
};

export default primo;
