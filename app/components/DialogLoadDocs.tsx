import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  //   DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Upload from "./Upload";
import { useState } from "react";
import { useFetcher } from "@remix-run/react";

export function DialogLoadDocs() {
  const [files, setFiles] = useState<FileList | null>(null);
  const fetcher = useFetcher();
  const uploadToS3 = async (file: File) => {
    const folderId = randomId();
    const fileUrl =
      "attachments/" +
      folderId +
      "/" +
      file.name.replace(/\s+/g, "").replace(/[^\w\-]/g, "");
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
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    if (!files) return;

    // Upload files first and get their URLs/keys
    const fileUrls = await Promise.all(
      Array.from(files).map((f) => uploadToS3(f))
    );

    console.log("fileUrls", fileUrls);
    // Add file URLs to formData
    formData.append("attachments", JSON.stringify(fileUrls));
    formData.append("folderId", fileUrls[0].split("/")[1]);

    await fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
      action: "/api/doc/upload/form",
    });
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Load Documents</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        <fetcher.Form
          method="post"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="flex flex-col gap-4 mt-4"
        >
          <Upload files={files} setFiles={setFiles} />
          <div className="flex justify-end">
            <Button type="submit" disabled={fetcher.state === "submitting"}>
              {fetcher.state === "submitting" ? "Sending..." : "Upload"}
            </Button>
          </div>
        </fetcher.Form>
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button> */}
        {/* </DialogFooter>  */}
      </DialogContent>
    </Dialog>
  );
}
